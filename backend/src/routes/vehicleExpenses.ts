import { Router, type Response } from 'express';
import { vehicleExpenseCreateSchema, vehicleExpenseUpdateSchema } from '@anm/types';
import {
  SaleExistsConfirmationRequired,
  VehicleExpenseNotFound,
  createVehicleExpense,
  deleteVehicleExpense,
  updateVehicleExpense,
} from '../lib/server/vehicleExpenseService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = vehicleExpenseCreateSchema.safeParse({
    ...req.body,
    confirmedOnSold: req.query.confirmedOnSold === 'true' || req.body?.confirmedOnSold === true,
  });
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const result = await createVehicleExpense(parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof SaleExistsConfirmationRequired) {
      res.status(409).json({
        error: 'SaleExistsConfirmationRequired',
        message: 'Esta viatura já está vendida. Confirme para continuar.',
        vehicleId: err.vehicleId,
      });
      return;
    }
    throw err;
  }
});

router.patch('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = vehicleExpenseUpdateSchema
    .omit({ id: true })
    .safeParse({
      ...req.body,
      confirmedOnSold: req.query.confirmedOnSold === 'true' || req.body?.confirmedOnSold === true,
    });
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const result = await updateVehicleExpense(param(req, 'id'), parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof VehicleExpenseNotFound) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    if (err instanceof SaleExistsConfirmationRequired) {
      res.status(409).json({
        error: 'SaleExistsConfirmationRequired',
        message: 'Esta viatura já está vendida. Confirme para continuar.',
        vehicleId: err.vehicleId,
      });
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
  const confirmedOnSold = req.query.confirmedOnSold === 'true';
  try {
    const result = await deleteVehicleExpense(param(req, 'id'), confirmedOnSold, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof VehicleExpenseNotFound) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    if (err instanceof SaleExistsConfirmationRequired) {
      res.status(409).json({
        error: 'SaleExistsConfirmationRequired',
        message: 'Esta viatura já está vendida. Confirme para continuar.',
        vehicleId: err.vehicleId,
      });
      return;
    }
    throw err;
  }
});

export default router;
