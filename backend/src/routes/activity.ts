import { Router, type Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const ACTIVITY_TYPES = [
  'VEHICLE_ADDED',
  'VEHICLE_UPDATED',
  'VEHICLE_STATUS_CHANGED',
  'VEHICLE_DELETED',
  'SALE_CREATED',
  'SALE_UPDATED',
  'CUSTOMER_ADDED',
  'CUSTOMER_UPDATED',
  'TASK_CREATED',
  'TASK_STATUS_CHANGED',
  'TASK_COMPLETED',
  'EXPENSE_ADDED',
  'EXPENSE_UPDATED',
] as const;

const ENTITY_TYPES = ['vehicle', 'sale', 'task', 'customer', 'expense'] as const;

const listQuerySchema = z.object({
  actorId: z.string().optional(),
  /** Comma-separated list of ActivityType keys */
  type: z.string().optional(),
  entityType: z.enum(ENTITY_TYPES).optional(),
  /** ISO date — inclusive lower bound on createdAt */
  from: z.string().optional(),
  /** ISO date — inclusive upper bound on createdAt (interpreted as end-of-day) */
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

type ListQuery = z.infer<typeof listQuerySchema>;

interface ActivityRow {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string } | null;
}

interface ListPayload {
  items: ActivityRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

function parseTypes(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const set = new Set(raw.split(',').map((t) => t.trim()).filter(Boolean));
  // Only accept known ActivityType keys; ignore unknowns rather than 400ing.
  const valid = Array.from(set).filter((t): t is (typeof ACTIVITY_TYPES)[number] =>
    (ACTIVITY_TYPES as readonly string[]).includes(t),
  );
  return valid.length > 0 ? valid : undefined;
}

function buildWhere(params: ListQuery): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {};

  if (params.actorId) where.actorId = params.actorId;

  const types = parseTypes(params.type);
  if (types) where.type = { in: types as Prisma.ActivityLogWhereInput['type'] extends infer T ? T : never } as Prisma.ActivityLogWhereInput['type'];

  if (params.entityType) where.entityType = params.entityType;

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) {
      const d = new Date(params.from);
      if (!Number.isNaN(d.getTime())) where.createdAt.gte = d;
    }
    if (params.to) {
      const d = new Date(params.to);
      if (!Number.isNaN(d.getTime())) {
        // Interpret "to" as end-of-day so a same-day from/to includes it.
        d.setHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }
  }

  if (params.q && params.q.trim().length > 0) {
    where.message = { contains: params.q.trim(), mode: 'insensitive' };
  }

  return where;
}

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const params = parsed.data;
  const where = buildWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  // Cache key includes every filter dimension so different filter combinations
  // get independent cache slots. 10s TTL — the feed is read-heavy.
  const cacheKey = `activity:list:${JSON.stringify({
    actorId: params.actorId ?? '',
    type: params.type ?? '',
    entityType: params.entityType ?? '',
    from: params.from ?? '',
    to: params.to ?? '',
    q: params.q ?? '',
    page: params.page,
    pageSize: params.pageSize,
  })}`;

  const payload = await cache.wrap<ListPayload>(cacheKey, 10_000, async () => {
    const [rows, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.pageSize,
        include: { actor: { select: { id: true, name: true } } },
      }),
      prisma.activityLog.count({ where }),
    ]);
    return {
      items: rows.map((r) => ({
        id: r.id,
        type: r.type,
        entityType: r.entityType,
        entityId: r.entityId,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
        actor: r.actor ? { id: r.actor.id, name: r.actor.name } : null,
      })),
      total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.max(1, Math.ceil(total / params.pageSize)),
    };
  });

  res.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=15');
  res.json(payload);
});

export default router;
