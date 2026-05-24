import type { Prisma } from '@prisma/client';
import type { VehicleExpenseCreate, VehicleExpenseUpdate } from '@anm/types';
import Decimal from 'decimal.js';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { sumVehicleExpenses } from '../data/vehicle.js';
import { computeSaleFigures } from '../domain/sale.js';
import type { ActorContext } from './vehicleService.js';

export class SaleExistsConfirmationRequired extends Error {
  constructor(public readonly vehicleId: string) {
    super('Vehicle is already SOLD/DELIVERED. Confirmation required to modify expenses.');
    this.name = 'SaleExistsConfirmationRequired';
  }
}

export class VehicleExpenseNotFound extends Error {
  constructor(public readonly id: string) {
    super(`VehicleExpense ${id} not found`);
    this.name = 'VehicleExpenseNotFound';
  }
}

const SOLD_STATUSES = new Set(['SOLD', 'DELIVERED']);

async function recomputeSaleIfExists(
  tx: Prisma.TransactionClient,
  vehicleId: string,
): Promise<void> {
  const sale = await tx.sale.findUnique({ where: { vehicleId } });
  if (!sale) return;

  const vehicle = await tx.vehicle.findUnique({
    where: { id: vehicleId },
    select: { purchasePrice: true },
  });
  if (!vehicle) return;

  const expensesTotal = await sumVehicleExpenses(tx, vehicleId);
  const figures = computeSaleFigures({
    salePrice: sale.salePrice.toString(),
    purchasePrice: vehicle.purchasePrice.toString(),
    expensesTotal,
    // Preserve the manually-entered commission across expense edits — the
    // commission is independent of the dealer-margin scheme and shouldn't
    // get wiped just because someone added/removed a vehicle expense.
    commission: sale.commission.toString(),
  });

  await tx.sale.update({
    where: { id: sale.id },
    data: {
      vatAmount: new Decimal(figures.vatAmount.toString()),
      realProfit: new Decimal(figures.realProfit.toString()),
    },
  });
}

export async function createVehicleExpense(
  data: VehicleExpenseCreate,
  actor: ActorContext,
): Promise<{ id: string; saleRecomputed: boolean }> {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { status: true, brand: true, model: true, year: true },
    });
    if (!vehicle) throw new Error('Vehicle not found');

    if (SOLD_STATUSES.has(vehicle.status) && !data.confirmedOnSold) {
      throw new SaleExistsConfirmationRequired(data.vehicleId);
    }

    const created = await tx.vehicleExpense.create({
      data: {
        vehicleId: data.vehicleId,
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
      entityId: created.id,
      message: `Despesa adicionada: ${data.description} — ${vehicle.brand} ${vehicle.model}`,
      metadata: { vehicleId: data.vehicleId, amount: data.amount },
    });

    let saleRecomputed = false;
    if (SOLD_STATUSES.has(vehicle.status)) {
      await recomputeSaleIfExists(tx, data.vehicleId);
      saleRecomputed = true;
    }

    return { id: created.id, saleRecomputed };
  });
}

export async function updateVehicleExpense(
  id: string,
  data: Omit<VehicleExpenseUpdate, 'id'>,
  actor: ActorContext,
): Promise<{ saleRecomputed: boolean }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.vehicleExpense.findUnique({
      where: { id },
      include: {
        vehicle: { select: { status: true, brand: true, model: true } },
      },
    });
    if (!existing) throw new VehicleExpenseNotFound(id);

    if (SOLD_STATUSES.has(existing.vehicle.status) && !data.confirmedOnSold) {
      throw new SaleExistsConfirmationRequired(existing.vehicleId);
    }

    const updateData: Prisma.VehicleExpenseUpdateInput = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = data.date;

    await tx.vehicleExpense.update({ where: { id }, data: updateData });

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'EXPENSE_UPDATED',
      entityType: 'expense',
      entityId: id,
      message: `Despesa editada: ${data.description ?? existing.description}`,
      metadata: { vehicleId: existing.vehicleId },
    });

    let saleRecomputed = false;
    if (SOLD_STATUSES.has(existing.vehicle.status)) {
      await recomputeSaleIfExists(tx, existing.vehicleId);
      saleRecomputed = true;
    }

    return { saleRecomputed };
  });
}

export async function deleteVehicleExpense(
  id: string,
  confirmedOnSold: boolean,
  actor: ActorContext,
): Promise<{ saleRecomputed: boolean }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.vehicleExpense.findUnique({
      where: { id },
      include: { vehicle: { select: { status: true } } },
    });
    if (!existing) throw new VehicleExpenseNotFound(id);

    if (SOLD_STATUSES.has(existing.vehicle.status) && !confirmedOnSold) {
      throw new SaleExistsConfirmationRequired(existing.vehicleId);
    }

    await tx.vehicleExpense.delete({ where: { id } });

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'EXPENSE_UPDATED',
      entityType: 'expense',
      entityId: id,
      message: `Despesa eliminada: ${existing.description}`,
      metadata: { vehicleId: existing.vehicleId, deleted: true },
    });

    let saleRecomputed = false;
    if (SOLD_STATUSES.has(existing.vehicle.status)) {
      await recomputeSaleIfExists(tx, existing.vehicleId);
      saleRecomputed = true;
    }

    return { saleRecomputed };
  });
}
