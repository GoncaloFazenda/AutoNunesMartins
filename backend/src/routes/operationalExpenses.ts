import { Router, type Response } from 'express';
import { z } from 'zod';
import {
  OpExpenseCategoryEnum,
  operationalExpenseCreateSchema,
  operationalExpenseUpdateSchema,
} from '@anm/types';
import {
  OperationalExpenseNotFound,
  createOperationalExpense,
  deleteOperationalExpense,
  listOperationalExpenses,
  updateOperationalExpense,
} from '../lib/server/operationalExpenseService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

const listQuerySchema = z.object({
  category: OpExpenseCategoryEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
  sortBy: z.enum(['date', 'amount', 'category']).default('date'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const result = await listOperationalExpenses(parsed.data);
  res.json(result);
});

router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = operationalExpenseCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const created = await createOperationalExpense(parsed.data, {
    actorId: req.user.id,
    actorName: req.user.name,
  });
  res.status(201).json(created);
});

router.patch('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = operationalExpenseUpdateSchema.omit({ id: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    await updateOperationalExpense(param(req, 'id'), parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof OperationalExpenseNotFound) {
      res.status(404).json({ error: 'Expense not found' });
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
    await deleteOperationalExpense(param(req, 'id'), {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof OperationalExpenseNotFound) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    throw err;
  }
});

export default router;
