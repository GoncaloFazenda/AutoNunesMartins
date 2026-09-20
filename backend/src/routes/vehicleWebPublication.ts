import { Router } from 'express';
import { prisma } from '../db.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { vehicleIdSchema, webPublicationSchema } from '../lib/domain/publicVehicle.js';
import { setWebPublication, WebPublicationError } from '../lib/server/webPublicationService.js';
import { logger } from '../logger.js';

const router = Router();
router.patch('/:id/web-publication', requireUser, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const id = vehicleIdSchema.safeParse(req.params.id);
  const input = webPublicationSchema.safeParse(req.body);
  const user = (req as AuthedRequest).user;
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (!id.success || !input.success) {
    res.status(400).json({ error: 'Invalid web publication' });
    return;
  }
  try {
    res.json(await setWebPublication(prisma, id.data, input.data, user.id));
  } catch (error) {
    if (error instanceof WebPublicationError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    logger.error('Web publication update failed');
    res.status(503).json({ error: 'Web publication temporarily unavailable' });
  }
});
export default router;
