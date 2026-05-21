import type { Prisma } from '@prisma/client';
import type {
  OpExpenseCategory,
  OperationalExpenseCreate,
  OperationalExpenseUpdate,
} from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import type { ActorContext } from './vehicleService.js';

export class OperationalExpenseNotFound extends Error {
  constructor(public readonly id: string) {
    super(`OperationalExpense ${id} not found`);
    this.name = 'OperationalExpenseNotFound';
  }
}

export interface ListOperationalExpensesParams {
  category?: OpExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'amount' | 'category';
  sortDir?: 'asc' | 'desc';
}

export async function listOperationalExpenses(params: ListOperationalExpensesParams) {
  const where: Prisma.OperationalExpenseWhereInput = {};
  if (params.category) where.category = params.category;
  if (params.dateFrom || params.dateTo) {
    where.date = {};
    if (params.dateFrom) where.date.gte = params.dateFrom;
    if (params.dateTo) where.date.lte = params.dateTo;
  }
  if (params.q) {
    where.description = { contains: params.q, mode: 'insensitive' };
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(500, Math.max(1, params.pageSize ?? 50));
  const sortBy = params.sortBy ?? 'date';
  const sortDir = params.sortDir ?? 'desc';

  const [items, total, totalSumAgg] = await Promise.all([
    prisma.operationalExpense.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.operationalExpense.count({ where }),
    prisma.operationalExpense.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  return {
    items: items.map((e) => ({ ...e, amount: e.amount.toString() })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    totalSum: totalSumAgg._sum.amount?.toString() ?? '0',
  };
}

export async function createOperationalExpense(
  data: OperationalExpenseCreate,
  actor: ActorContext,
): Promise<{ id: string }> {
  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.operationalExpense.create({
      data: {
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date,
      },
    });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'EXPENSE_ADDED',
      entityType: 'expense',
      entityId: row.id,
      message: `Despesa operacional: ${data.description} (${data.category})`,
      metadata: { amount: data.amount, category: data.category, operational: true },
    });
    return row;
  });
  return { id: created.id };
}

export async function updateOperationalExpense(
  id: string,
  data: Omit<OperationalExpenseUpdate, 'id'>,
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.operationalExpense.findUnique({ where: { id } });
    if (!existing) throw new OperationalExpenseNotFound(id);

    const update: Prisma.OperationalExpenseUpdateInput = {};
    if (data.category !== undefined) update.category = data.category;
    if (data.description !== undefined) update.description = data.description;
    if (data.amount !== undefined) update.amount = data.amount;
    if (data.date !== undefined) update.date = data.date;

    const updated = await tx.operationalExpense.update({ where: { id }, data: update });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'EXPENSE_UPDATED',
      entityType: 'expense',
      entityId: id,
      message: `Despesa operacional editada: ${updated.description}`,
      metadata: { operational: true },
    });
  });
}

export async function deleteOperationalExpense(
  id: string,
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.operationalExpense.findUnique({ where: { id } });
    if (!existing) throw new OperationalExpenseNotFound(id);

    await tx.operationalExpense.delete({ where: { id } });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'EXPENSE_UPDATED',
      entityType: 'expense',
      entityId: id,
      message: `Despesa operacional eliminada: ${existing.description}`,
      metadata: { operational: true, deleted: true },
    });
  });
}
