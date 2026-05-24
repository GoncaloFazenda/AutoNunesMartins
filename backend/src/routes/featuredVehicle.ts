import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { cache } from '../lib/data/cache.js';
import { createSignedReadUrl } from '../lib/data/storage.js';
import { emitActivity } from '../lib/data/activity.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const SETTING_KEY = 'featuredVehicleId';
const CACHE_KEY = 'dashboard:featuredVehicle';
const TTL_MS = 120_000;

export interface FeaturedVehiclePayload {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  mileage: number;
  vin: string;
  licensePlate: string | null;
  status: string;
  salePrice: string | null;
  purchasePrice: string;
  description: string | null;
  photoUrl: string | null;
  photoCount: number;
}

async function readFeaturedId(): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row) return null;
  const v = row.value;
  if (typeof v === 'string') return v;
  // Stored as { id: "..." }? Be defensive.
  if (v && typeof v === 'object' && 'id' in (v as Record<string, unknown>)) {
    const id = (v as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

async function loadFeaturedVehicle(): Promise<FeaturedVehiclePayload | null> {
  const id = await readFeaturedId();
  if (!id) return null;
  const v = await prisma.vehicle.findUnique({ where: { id } });
  if (!v) return null;
  let photoUrl: string | null = null;
  if (v.photos[0]) {
    try {
      photoUrl = await createSignedReadUrl(v.photos[0]);
    } catch {
      photoUrl = null;
    }
  }
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    fuel: v.fuel,
    mileage: v.mileage,
    vin: v.vin,
    licensePlate: v.licensePlate,
    status: v.status,
    salePrice: v.salePrice?.toString() ?? null,
    purchasePrice: v.purchasePrice.toString(),
    description: v.description,
    photoUrl,
    photoCount: v.photos.length,
  };
}

/**
 * GET /api/dashboard/featured-vehicle
 * Returns the currently highlighted vehicle (with a signed thumbnail URL), or
 * null if no vehicle has been pinned.
 */
router.get('/featured-vehicle', requireUser, async (_req: AuthedRequest, res: Response) => {
  const payload = await cache.wrap(CACHE_KEY, TTL_MS, () => loadFeaturedVehicle());
  res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
  res.json({ vehicle: payload });
});

const putSchema = z.object({
  vehicleId: z.string().min(1).nullable(),
});

/**
 * PUT /api/dashboard/featured-vehicle
 * Body: { vehicleId: string | null } — pass null to clear the highlight.
 */
router.put('/featured-vehicle', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  const { vehicleId } = parsed.data;

  if (vehicleId) {
    // Verify the vehicle exists so we never pin a dangling ID.
    const exists = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, brand: true, model: true },
    });
    if (!exists) {
      res.status(404).json({ error: 'Viatura não encontrada' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.appSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: vehicleId },
        create: { key: SETTING_KEY, value: vehicleId },
      });
      await emitActivity(tx, {
        actorId: req.user!.id,
        type: 'VEHICLE_UPDATED',
        entityType: 'vehicle',
        entityId: vehicleId,
        message: `Viatura em destaque: ${exists.brand} ${exists.model}`,
        metadata: { setting: SETTING_KEY, value: vehicleId },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.appSetting.deleteMany({ where: { key: SETTING_KEY } });
      await emitActivity(tx, {
        actorId: req.user!.id,
        type: 'VEHICLE_UPDATED',
        entityType: 'vehicle',
        entityId: '-',
        message: 'Destaque removido do painel',
        metadata: { setting: SETTING_KEY, value: null },
      });
    });
  }

  // Bust caches so the dashboard reflects the change on next load.
  cache.invalidate(CACHE_KEY);
  cache.clearPrefix('dashboard:');

  res.json({ ok: true, vehicleId });
});

export default router;
