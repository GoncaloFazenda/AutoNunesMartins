import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const ScopeEnum = z.enum(['mine', 'general', 'all', 'byUser']);

const querySchema = z.object({
  scope: ScopeEnum.optional().default('mine'),
  assigneeId: z.string().optional(),
});

interface TaskRow {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  isOverdue: boolean;
}

function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
function endOfToday(): Date {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  return t;
}

const TTL_MS = 45_000;
const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

/**
 * Top 8 tasks for the dashboard widget, filtered by chosen scope.
 * Sorted: URGENT first, then by priority, then due date.
 *
 * Phase 1 single ADMIN role → no per-user visibility restriction here.
 * The filter is purely a convenience: pick whose tasks to look at.
 */
async function buildTodayTasks(
  actorId: string,
  scope: 'mine' | 'general' | 'all' | 'byUser',
  assigneeId: string | undefined,
): Promise<TaskRow[]> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const baseWhere = {
    status: { not: 'DONE' as const },
    OR: [
      { status: 'IN_PROGRESS' as const },
      { dueDate: { gte: todayStart, lte: todayEnd } },
      { dueDate: { lt: todayStart } },
      { reminderDate: { gte: todayStart, lte: todayEnd } },
    ],
  };

  let scopeClause: { assigneeId?: string | null } = {};
  if (scope === 'mine') scopeClause = { assigneeId: actorId };
  else if (scope === 'general') scopeClause = { assigneeId: null };
  else if (scope === 'byUser' && assigneeId) scopeClause = { assigneeId };
  // 'all' → no narrowing

  const rows = await prisma.task.findMany({
    where: { AND: [baseWhere, scopeClause] },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    take: 30,
    include: { assignee: { select: { id: true, name: true } } },
  });

  rows.sort((a, b) => {
    const aIp = a.status === 'IN_PROGRESS' ? 0 : 1;
    const bIp = b.status === 'IN_PROGRESS' ? 0 : 1;
    if (aIp !== bIp) return aIp - bIp;
    const pa = PRIORITY_RANK[a.priority] ?? 99;
    const pb = PRIORITY_RANK[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    const da = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const db = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return da - db;
  });

  return rows.slice(0, 8).map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate?.toISOString() ?? null,
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
    isOverdue: Boolean(t.dueDate && t.dueDate < todayStart),
  }));
}

router.get('/today-tasks', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const { scope, assigneeId } = parsed.data;
  const cacheKey = `dashboardTasks:${req.user.id}:${scope}:${assigneeId ?? ''}`;
  const items = await cache.wrap(cacheKey, TTL_MS, () =>
    buildTodayTasks(req.user!.id, scope, assigneeId),
  );
  res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
  res.json({ items });
});

export default router;
