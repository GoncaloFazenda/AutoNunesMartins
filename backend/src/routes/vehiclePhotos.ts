import { randomUUID } from 'node:crypto';
import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import {
  createSignedReadUrl,
  createSignedUploadUrl,
  deleteObjects,
} from '../lib/data/storage.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router({ mergeParams: true });

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

function sanitizeExt(filename: string): string {
  const m = filename.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m?.[1] ?? '';
}

const uploadUrlSchema = z.object({
  filename: z.string().min(1).max(180),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

const persistSchema = z.object({
  path: z.string().min(1),
});

const reorderSchema = z.object({
  photos: z.array(z.string().min(1)).min(1).max(20),
});

const MAX_PHOTOS = 20;

/** Step 1: request a presigned upload URL. */
router.post('/upload-url', requireUser, async (req: AuthedRequest, res: Response) => {
  const vehicleId = param(req, 'vehicleId');
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { photos: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  if (vehicle.photos.length >= MAX_PHOTOS) {
    res.status(400).json({ error: `Máximo de ${MAX_PHOTOS} fotos por viatura.` });
    return;
  }

  const parsed = uploadUrlSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }

  const ext = sanitizeExt(parsed.data.filename);
  if (!ALLOWED_EXT.has(ext)) {
    res.status(400).json({ error: 'Apenas ficheiros .jpg/.jpeg/.png/.webp são aceites.' });
    return;
  }

  const path = `${vehicleId}/${randomUUID()}.${ext}`;
  try {
    const upload = await createSignedUploadUrl(path);
    res.json({
      path,
      uploadUrl: upload.signedUrl,
      token: upload.token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create upload URL', detail: (err as Error).message });
  }
});

/** Step 2: persist the uploaded path on the Vehicle.photos array. */
router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const vehicleId = param(req, 'vehicleId');
  const parsed = persistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }

  if (!parsed.data.path.startsWith(`${vehicleId}/`)) {
    res.status(400).json({ error: 'Path must belong to this vehicle.' });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { photos: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  if (vehicle.photos.includes(parsed.data.path)) {
    res.status(200).json({ photos: vehicle.photos });
    return;
  }
  if (vehicle.photos.length >= MAX_PHOTOS) {
    res.status(400).json({ error: `Máximo de ${MAX_PHOTOS} fotos por viatura.` });
    return;
  }

  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { photos: { set: [...vehicle.photos, parsed.data.path] } },
    select: { photos: true },
  });

  res.status(201).json({ photos: updated.photos });
});

/** Reorder photos (also used to set primary by putting it at index 0). */
router.post('/reorder', requireUser, async (req: AuthedRequest, res: Response) => {
  const vehicleId = param(req, 'vehicleId');
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { photos: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  const currentSet = new Set(vehicle.photos);
  const nextSet = new Set(parsed.data.photos);
  if (currentSet.size !== nextSet.size || [...currentSet].some((p) => !nextSet.has(p))) {
    res.status(400).json({ error: 'Reorder list must contain exactly the existing photos.' });
    return;
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { photos: { set: parsed.data.photos } },
  });
  res.json({ photos: parsed.data.photos });
});

/** Delete a photo by storage path. */
router.delete('/:photoPath(*)', requireUser, async (req: AuthedRequest, res: Response) => {
  const vehicleId = param(req, 'vehicleId');
  const photoPath = decodeURIComponent(param(req, 'photoPath'));

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { photos: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }
  if (!vehicle.photos.includes(photoPath)) {
    res.status(404).json({ error: 'Photo not found' });
    return;
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { photos: { set: vehicle.photos.filter((p) => p !== photoPath) } },
  });

  try {
    await deleteObjects([photoPath]);
  } catch (err) {
    // Storage delete failed but DB is updated — log and continue. Orphaned objects
    // are tolerable; we never reference them again.
    // eslint-disable-next-line no-console
    console.warn('Storage delete failed:', (err as Error).message);
  }

  res.json({ ok: true });
});

/** Return signed read URLs for the current photos (1h TTL). */
router.get('/signed', requireUser, async (req: AuthedRequest, res: Response) => {
  const vehicleId = param(req, 'vehicleId');
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { photos: true },
  });
  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  const signed = await Promise.all(
    vehicle.photos.map(async (path) => ({
      path,
      url: await createSignedReadUrl(path, 3600),
    })),
  );
  res.json({ photos: signed });
});

export default router;
