import { Router, type Response } from 'express';
import { z } from 'zod';
import {
  vehicleCreateSchema,
  vehicleFilterSchema,
  vehicleUpdateSchema,
} from '@anm/types';
import { prisma } from '../db.js';
import { listVehicles } from '../lib/data/vehicle.js';
import { createSignedReadUrls } from '../lib/data/storage.js';
import { logger } from '../logger.js';
import {
  VehicleHasSale,
  VehicleNotFound,
  createVehicle,
  deleteVehicle,
  getVehicleWithProfit,
  updateVehicle,
} from '../lib/server/vehicleService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

const listQuerySchema = vehicleFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z
    .enum(['createdAt', 'acquisitionDate', 'salePrice', 'purchasePrice', 'mileage', 'year'])
    .default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const result = await listVehicles(prisma, parsed.data);

  // Batch-sign primary photos (index 0) so the list can show thumbnails.
  // A single Supabase call handles all rows on the current page.
  const primaryPaths = result.items
    .map((v) => v.photos[0])
    .filter((p): p is string => typeof p === 'string' && p.length > 0);

  let signed: Map<string, string> = new Map();
  if (primaryPaths.length > 0) {
    try {
      signed = await createSignedReadUrls(primaryPaths, 3600);
    } catch (err) {
      logger.warn({ err }, 'Failed to batch-sign vehicle thumbnails (list still works)');
    }
  }

  res.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=15');
  res.json({
    ...result,
    items: result.items.map((v) => {
      const primary = v.photos[0];
      return {
        ...v,
        purchasePrice: v.purchasePrice.toString(),
        salePrice: v.salePrice?.toString() ?? null,
        thumbnailUrl: primary ? (signed.get(primary) ?? null) : null,
      };
    }),
  });
});

router.get('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const result = await getVehicleWithProfit(param(req, 'id'));
  if (!result) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  res.json(result);
});

router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = vehicleCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const created = await createVehicle(parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.status(201).json({ id: created.id });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'VIN already exists' });
      return;
    }
    throw err;
  }
});

router.patch('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = vehicleUpdateSchema
    .omit({ id: true })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    await updateVehicle(param(req, 'id'), parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof VehicleNotFound) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    throw err;
  }
});

router.delete('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    await deleteVehicle(param(req, 'id'), {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof VehicleNotFound) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    if (err instanceof VehicleHasSale) {
      res.status(409).json({
        error: 'Cannot delete vehicle with an existing sale. Delete the sale first.',
      });
      return;
    }
    throw err;
  }
});

export default router;
