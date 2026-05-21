import { Router, type Response } from 'express';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

/**
 * GET /api/tasks/stats
 *
 * Per-user task counters used by the sidebar nav badge ("Tarefas · N").
 *
 *   mineActive = tasks (assigneeId = actor OR assigneeId IS NULL)
 *                AND status IN (TODO, IN_PROGRESS)
 *
 *   Includes "general" (unassigned) tasks because those are visible to
 *   the whole team. Excludes DONE per spec.
 *
 * Cached 60s per actor. The cache key sits under the `dashboard:` prefix
 * so every task mutation that flows through emitActivity also clears
 * this — the badge bumps the moment a task is created, moved, or
 * completed.
 */
interface TaskStatsPayload {
  mineActive: number;
}

const TTL_MS = 60_000;

router.get('/stats', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const actorId = req.user.id;
  const cacheKey = `dashboard:taskStats:${actorId}`;

  const payload = await cache.wrap<TaskStatsPayload>(cacheKey, TTL_MS, async () => {
    const mineActive = await prisma.task.count({
      where: {
        status: { not: 'DONE' },
        OR: [{ assigneeId: actorId }, { assigneeId: null }],
      },
    });
    return { mineActive };
  });

  res.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  res.json(payload);
});

export default router;
