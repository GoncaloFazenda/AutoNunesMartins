import { Router, type Response } from 'express';
import { z } from 'zod';
import { DeliveryStatusEnum, saleCreateSchema } from '@anm/types';
import {
  SaleNotFound,
  TradeInVehicleConflict,
  VehicleAlreadySold,
  VehicleNotSellable,
  createSale,
  getSaleById,
  listSales,
  updateSaleDelivery,
} from '../lib/server/saleService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

const deliveryUpdateSchema = z.object({
  deliveryStatus: DeliveryStatusEnum,
  deliveryDate: z.coerce.date().optional().nullable(),
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  deliveryStatus: DeliveryStatusEnum.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  // Cap is generous so the desktop /vendas export can pull the whole filtered
  // set in a single call. Listing pages still default to 25.
  pageSize: z.coerce.number().int().min(1).max(10000).default(25),
  sortBy: z.enum(['saleDate', 'salePrice', 'realProfit', 'marginPct']).default('saleDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const result = await listSales(parsed.data);
  res.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=15');
  res.json(result);
});

router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = saleCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const result = await createSale(parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof VehicleAlreadySold) {
      res.status(409).json({ error: 'Esta viatura já tem uma venda registada.' });
      return;
    }
    if (err instanceof VehicleNotSellable) {
      res.status(409).json({
        error: `Viatura em estado "${err.status}" não pode ser vendida.`,
      });
      return;
    }
    // Trade-in vehicle collided with an existing inventory row. The body
    // carries `field` so the form can paint the offending input red without
    // losing the dealer's typed data (they fix it inline and resubmit).
    if (err instanceof TradeInVehicleConflict) {
      res.status(409).json({
        error:
          err.field === 'vin'
            ? `Já existe uma viatura no sistema com este VIN (${err.value}).`
            : `Já existe uma viatura no sistema com esta matrícula (${err.value}).`,
        field: `tradeIn.${err.field}`,
      });
      return;
    }
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'Conflict (unique constraint).' });
      return;
    }
    throw err;
  }
});

router.get('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const sale = await getSaleById(param(req, 'id'));
  if (!sale) {
    res.status(404).json({ error: 'Sale not found' });
    return;
  }
  res.json(sale);
});

router.patch('/:id/delivery', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = deliveryUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    await updateSaleDelivery(
      param(req, 'id'),
      {
        deliveryStatus: parsed.data.deliveryStatus,
        deliveryDate: parsed.data.deliveryDate ?? null,
      },
      { actorId: req.user.id, actorName: req.user.name },
    );
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof SaleNotFound) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    throw err;
  }
});

export default router;
