import { Router, type Response } from 'express';
import { cache } from '../lib/data/cache.js';
import { loadDashboard } from '../lib/server/dashboardService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

// Dashboard values move on the scale of minutes/hours, and any mutation
// (sale, expense, vehicle status change) invalidates this cache via
// `cache.clearPrefix('dashboard:')` inside emitActivity. So we can afford
// a generous TTL — 90s keeps tab-switching genuinely instant.
const DASHBOARD_TTL_MS = 90_000;

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const actorId = req.user.id;
  const payload = await cache.wrap(`dashboard:${actorId}`, DASHBOARD_TTL_MS, () =>
    loadDashboard(actorId),
  );

  // Browser-level cache hint so the browser/SvelteKit can short-circuit
  // duplicate hits inside the same TTL window.
  // Browser-level cache: short max-age, long stale-while-revalidate so the
  // browser can serve from cache on back/forward + tab returns instantly
  // and refresh in the background.
  res.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
  res.json(payload);
});

export default router;
