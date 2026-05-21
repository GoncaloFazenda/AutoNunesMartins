import { Router, type Response } from 'express';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const USERS_TTL_MS = 60_000;
const USERS_CACHE_KEY = 'users:list';

/** List users that can be assigned to tasks. Phase 1: every User row (single role ADMIN). */
router.get('/', requireUser, async (_req: AuthedRequest, res: Response) => {
  const items = await cache.wrap(USERS_CACHE_KEY, USERS_TTL_MS, () =>
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    }),
  );
  res.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  res.json({ items });
});

/** Call from the Clerk webhook handler after creating/updating a user row. */
export function invalidateUsersCache(): void {
  cache.invalidate(USERS_CACHE_KEY);
}

export default router;
