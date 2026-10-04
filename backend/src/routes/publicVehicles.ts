import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import {
  getPublicPhotoPath,
  getPublicVehicle,
  listPublicVehicles,
  listAvailablePublicBrands,
  relatedPublicVehicles,
} from '../lib/data/publicVehicle.js';
import { getBucketName, getSupabase } from '../lib/data/storage.js';
import { publicSlugSchema, publicVehicleQuerySchema } from '../lib/domain/publicVehicle.js';

const router = Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/', async (req, res) => {
  const query = publicVehicleQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: 'Invalid public filters' });
    return;
  }
  try {
    res.json(await listPublicVehicles(prisma, query.data));
  } catch {
    logger.error('Public vehicle listing unavailable');
    res.status(503).json({ error: 'Public catalogue temporarily unavailable' });
  }
});

router.get('/brands', async (req, res) => {
  if (Object.keys(req.query).length) { res.status(400).json({ error: 'Brand directory does not accept filters' }); return; }
  try {
    res.json(await listAvailablePublicBrands(prisma));
  } catch {
    logger.error('Public brand directory unavailable');
    res.status(503).json({ error: 'Public brand directory temporarily unavailable' });
  }
});

router.get('/:slug/related', async (req, res) => {
  const slug = publicSlugSchema.safeParse(req.params.slug);
  if (!slug.success) { res.status(404).json({ error: 'Vehicle not found' }); return; }
  try {
    const items = await relatedPublicVehicles(prisma, slug.data);
    if (items === null) { res.status(404).json({ error: 'Vehicle not found' }); return; }
    res.json(items);
  } catch {
    logger.error('Related public vehicles unavailable');
    res.status(503).json({ error: 'Related vehicles temporarily unavailable' });
  }
});

router.get('/:slug', async (req, res) => {
  const slug = publicSlugSchema.safeParse(req.params.slug);
  if (!slug.success) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  try {
    const vehicle = await getPublicVehicle(prisma, slug.data);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json(vehicle);
  } catch {
    logger.error('Public vehicle detail unavailable');
    res.status(503).json({ error: 'Public catalogue temporarily unavailable' });
  }
});

router.get('/:slug/photos/:index', async (req, res) => {
  const slug = publicSlugSchema.safeParse(req.params.slug);
  const index = z
    .string()
    .regex(/^(?:[0-9]|1[0-9])$/)
    .transform(Number)
    .safeParse(req.params.index);
  if (!slug.success || !index.success) {
    res.status(404).json({ error: 'Photo not found' });
    return;
  }
  try {
    const path = await getPublicPhotoPath(prisma, slug.data, index.data);
    if (!path) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    const { data, error } = await getSupabase().storage.from(getBucketName()).download(path);
    if (
      error ||
      !data ||
      data.size > 10 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(data.type)
    ) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    res.set({
      'Content-Type': data.type,
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(Buffer.from(await data.arrayBuffer()));
  } catch {
    logger.error('Public vehicle photo unavailable');
    res.status(503).json({ error: 'Photo temporarily unavailable' });
  }
});

// No mutations and no fall-through into authenticated CRM routes.
router.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
export default router;
