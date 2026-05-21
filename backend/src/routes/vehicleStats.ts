import { Router, type Response } from 'express';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

/**
 * GET /api/vehicles/stats
 *
 * Lightweight counts used by the sidebar nav badge ("Viaturas · N") and any
 * other UI that needs an inventory snapshot.
 *
 *   active = AVAILABLE + RESERVED + DOCS_PENDING   ("in stock")
 *   sold   = SOLD + DELIVERED                       (out of inventory)
 *
 * Cached for 60s; every vehicle mutation goes through emitActivity which
 * calls cache.clearPrefix('dashboard:') — we live under the same prefix
 * so the count busts on every status change, sale registered, or
 * vehicle added/deleted.
 */
interface VehicleStatsPayload {
  active: number;
  available: number;
  reserved: number;
  docsPending: number;
  sold: number;
  delivered: number;
  total: number;
}

const CACHE_KEY = 'dashboard:vehicleStats';
const TTL_MS = 60_000;

router.get('/stats', requireUser, async (_req: AuthedRequest, res: Response) => {
  const payload = await cache.wrap<VehicleStatsPayload>(CACHE_KEY, TTL_MS, async () => {
    const groups = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const map = Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
    const available = map.AVAILABLE ?? 0;
    const reserved = map.RESERVED ?? 0;
    const docsPending = map.DOCS_PENDING ?? 0;
    const sold = map.SOLD ?? 0;
    const delivered = map.DELIVERED ?? 0;
    return {
      active: available + reserved + docsPending,
      available,
      reserved,
      docsPending,
      sold,
      delivered,
      total: available + reserved + docsPending + sold + delivered,
    };
  });

  res.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  res.json(payload);
});

export default router;
