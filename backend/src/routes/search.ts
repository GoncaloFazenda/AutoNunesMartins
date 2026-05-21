import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const querySchema = z.object({
  q: z.string().min(1).max(80),
  /** Hits-per-group cap (1-10). The total result count is at most 3 × limit. */
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

interface SearchHit {
  id: string;
  primary: string;
  secondary: string | null;
  href: string;
}

interface SearchPayload {
  q: string;
  vehicles: SearchHit[];
  customers: SearchHit[];
  tasks: SearchHit[];
  total: number;
}

// 60s in-process cache — search hits are read-only and small, so a generous
// TTL is fine. The frontend has its own LRU cache on top of this so the
// hot path for typing/backspacing within the same session never even
// touches the backend.
const SEARCH_TTL_MS = 60_000;

/**
 * Global cross-entity search. Hits the three most-searched-for surfaces
 * (vehicles, customers, tasks). Case-insensitive substring match using
 * Postgres `contains, mode: 'insensitive'`. Returns up to `limit` hits per
 * group, sorted by most-recently-updated to surface fresh items first.
 */
router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const { q, limit } = parsed.data;
  const needle = q.trim();
  if (needle.length === 0) {
    res.json({ q, vehicles: [], customers: [], tasks: [], total: 0 } satisfies SearchPayload);
    return;
  }

  const cacheKey = `search:${needle.toLowerCase()}:${limit}`;
  const payload = await cache.wrap<SearchPayload>(cacheKey, SEARCH_TTL_MS, async () => {
    const [vehicles, customers, tasks] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          OR: [
            { brand: { contains: needle, mode: 'insensitive' } },
            { model: { contains: needle, mode: 'insensitive' } },
            { vin: { contains: needle, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, brand: true, model: true, year: true, vin: true, status: true },
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: needle, mode: 'insensitive' } },
            { nif: { contains: needle } }, // NIF is digits-only — no case mode
            { phone: { contains: needle } },
            { email: { contains: needle, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, name: true, nif: true, phone: true },
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: needle, mode: 'insensitive' } },
            { description: { contains: needle, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: { id: true, title: true, status: true, priority: true },
      }),
    ]);

    const vHits: SearchHit[] = vehicles.map((v) => ({
      id: v.id,
      primary: `${v.brand} ${v.model}`,
      secondary: `${v.year} · VIN ${v.vin} · ${v.status}`,
      href: `/viaturas/${v.id}`,
    }));
    const cHits: SearchHit[] = customers.map((c) => ({
      id: c.id,
      primary: c.name,
      secondary: `NIF ${c.nif} · ${c.phone}`,
      href: `/clientes/${c.id}`,
    }));
    const tHits: SearchHit[] = tasks.map((t) => ({
      id: t.id,
      primary: t.title,
      secondary: `${t.priority} · ${t.status.replace('_', ' ')}`,
      href: `/tarefas/${t.id}/editar`,
    }));

    return {
      q: needle,
      vehicles: vHits,
      customers: cHits,
      tasks: tHits,
      total: vHits.length + cHits.length + tHits.length,
    };
  });

  res.set('Cache-Control', 'private, max-age=4, stale-while-revalidate=10');
  res.json(payload);
});

export default router;
