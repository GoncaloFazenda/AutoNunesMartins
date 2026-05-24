import type { Prisma } from '@prisma/client';
import type { VehicleCreate, VehicleUpdate } from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { getVehicleById, sumVehicleExpenses } from '../data/vehicle.js';
import { computeSaleFigures } from '../domain/sale.js';

export interface ActorContext {
  actorId: string;
  actorName: string;
}

function vehicleLabel(brand: string, model: string, year: number): string {
  return `${brand} ${model} (${year})`;
}

export async function createVehicle(
  data: VehicleCreate,
  actor: ActorContext,
): Promise<{ id: string }> {
  const vehicle = await prisma.$transaction(async (tx) => {
    const created = await tx.vehicle.create({
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        fuel: data.fuel,
        mileage: data.mileage,
        vin: data.vin,
        // Matrícula already canonicalized by `licensePlatePtSchema` to
        // "XX-XX-XX" form; null when the user didn't enter one.
        licensePlate: data.licensePlate ?? null,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice ?? null,
        status: data.status ?? 'AVAILABLE',
        acquisitionDate: data.acquisitionDate,
        description: data.description ?? null,
        pendingDocFlags: data.pendingDocFlags as unknown as Prisma.InputJsonValue,
      },
    });

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'VEHICLE_ADDED',
      entityType: 'vehicle',
      entityId: created.id,
      message: `Viatura adicionada: ${vehicleLabel(created.brand, created.model, created.year)}`,
    });

    return created;
  });

  return { id: vehicle.id };
}

export async function updateVehicle(
  id: string,
  data: Omit<VehicleUpdate, 'id'>,
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.vehicle.findUnique({ where: { id } });
    if (!existing) throw new VehicleNotFound(id);

    const statusChanged = data.status !== undefined && data.status !== existing.status;

    const updateData: Prisma.VehicleUpdateInput = {};
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.fuel !== undefined) updateData.fuel = data.fuel;
    if (data.mileage !== undefined) updateData.mileage = data.mileage;
    if (data.vin !== undefined) updateData.vin = data.vin;
    // Pass null through explicitly so "clear matrícula" is possible — but
    // only when the caller submits an explicit empty string. The schema's
    // preprocess maps "" → undefined, so this branch is reached only with
    // an actual value (already canonicalized by Zod).
    if (data.licensePlate !== undefined) updateData.licensePlate = data.licensePlate ?? null;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.acquisitionDate !== undefined) updateData.acquisitionDate = data.acquisitionDate;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.pendingDocFlags !== undefined) {
      updateData.pendingDocFlags = data.pendingDocFlags as unknown as Prisma.InputJsonValue;
    }

    const updated = await tx.vehicle.update({ where: { id }, data: updateData });

    if (statusChanged) {
      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'VEHICLE_STATUS_CHANGED',
        entityType: 'vehicle',
        entityId: id,
        message: `Estado alterado: ${existing.status} → ${updated.status} (${vehicleLabel(updated.brand, updated.model, updated.year)})`,
        metadata: { from: existing.status, to: updated.status },
      });
    } else {
      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'VEHICLE_UPDATED',
        entityType: 'vehicle',
        entityId: id,
        message: `Viatura editada: ${vehicleLabel(updated.brand, updated.model, updated.year)}`,
      });
    }
  });
}

export async function deleteVehicle(id: string, actor: ActorContext): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.vehicle.findUnique({
      where: { id },
      include: { sale: true },
    });
    if (!existing) throw new VehicleNotFound(id);
    if (existing.sale) {
      throw new VehicleHasSale(id);
    }

    await tx.vehicle.delete({ where: { id } });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'VEHICLE_DELETED',
      entityType: 'vehicle',
      entityId: id,
      message: `Viatura eliminada: ${vehicleLabel(existing.brand, existing.model, existing.year)}`,
    });
  });
}

export async function getVehicleWithProfit(id: string) {
  const vehicle = await getVehicleById(prisma, id);
  if (!vehicle) return null;

  const expensesTotal = await sumVehicleExpenses(prisma, id);
  // If a Sale row exists, project figures using its persisted commission
  // so the "projeção" view matches what the sale actually pays out. If
  // there's no sale yet, commission is unknown — projection uses 0.
  const figures =
    vehicle.salePrice !== null
      ? computeSaleFigures({
          salePrice: vehicle.salePrice.toString(),
          purchasePrice: vehicle.purchasePrice.toString(),
          expensesTotal,
          commission: vehicle.sale?.commission.toString() ?? '0',
        })
      : null;

  return {
    ...vehicle,
    purchasePrice: vehicle.purchasePrice.toString(),
    salePrice: vehicle.salePrice?.toString() ?? null,
    expenses: vehicle.expenses.map((e) => ({ ...e, amount: e.amount.toString() })),
    sale: vehicle.sale
      ? {
          ...vehicle.sale,
          salePrice: vehicle.sale.salePrice.toString(),
          vatAmount: vehicle.sale.vatAmount.toString(),
          commission: vehicle.sale.commission.toString(),
          realProfit: vehicle.sale.realProfit.toString(),
        }
      : null,
    expensesTotal,
    figures: figures
      ? {
          margin: figures.margin.toString(),
          vatAmount: figures.vatAmount.toString(),
          commission: figures.commission.toString(),
          realProfit: figures.realProfit.toString(),
        }
      : null,
  };
}

export class VehicleNotFound extends Error {
  constructor(public readonly id: string) {
    super(`Vehicle ${id} not found`);
    this.name = 'VehicleNotFound';
  }
}

export class VehicleHasSale extends Error {
  constructor(public readonly id: string) {
    super(`Vehicle ${id} has a Sale record and cannot be deleted`);
    this.name = 'VehicleHasSale';
  }
}
