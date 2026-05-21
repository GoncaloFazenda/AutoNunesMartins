import type { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import type { SaleCreate, DeliveryStatus } from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { sumVehicleExpenses } from '../data/vehicle.js';
import { computeSaleFigures } from '../domain/sale.js';

export class VehicleNotSellable extends Error {
  constructor(public readonly id: string, public readonly status: string) {
    super(`Vehicle ${id} is in status ${status} and cannot be sold`);
    this.name = 'VehicleNotSellable';
  }
}

export class VehicleAlreadySold extends Error {
  constructor(public readonly id: string) {
    super(`Vehicle ${id} already has a sale`);
    this.name = 'VehicleAlreadySold';
  }
}

export class SaleNotFound extends Error {
  constructor(public readonly id: string) {
    super(`Sale ${id} not found`);
    this.name = 'SaleNotFound';
  }
}

const SELLABLE_STATUSES = new Set(['AVAILABLE', 'RESERVED', 'DOCS_PENDING']);

interface ActorContext {
  actorId: string;
  actorName: string;
}

export async function createSale(
  data: SaleCreate,
  actor: ActorContext,
): Promise<{ id: string; figures: { margin: string; vatAmount: string; realProfit: string } }> {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { sale: { select: { id: true } } },
    });
    if (!vehicle) throw new Error(`Vehicle ${data.vehicleId} not found`);
    if (vehicle.sale) throw new VehicleAlreadySold(vehicle.id);
    if (!SELLABLE_STATUSES.has(vehicle.status)) {
      throw new VehicleNotSellable(vehicle.id, vehicle.status);
    }

    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error(`Customer ${data.customerId} not found`);

    const expensesTotal = await sumVehicleExpenses(tx, vehicle.id);
    const figures = computeSaleFigures({
      salePrice: data.salePrice,
      purchasePrice: vehicle.purchasePrice.toString(),
      expensesTotal,
    });

    const sale = await tx.sale.create({
      data: {
        vehicleId: vehicle.id,
        customerId: customer.id,
        salePrice: new Decimal(data.salePrice as string),
        vatAmount: new Decimal(figures.vatAmount.toString()),
        realProfit: new Decimal(figures.realProfit.toString()),
        saleDate: data.saleDate,
        deliveryDate: data.deliveryDate ?? null,
        deliveryStatus: data.deliveryStatus ?? 'PENDING',
      },
    });

    // Flip vehicle to SOLD (or DELIVERED if delivery already done at creation time)
    const nextVehicleStatus =
      data.deliveryStatus === 'DELIVERED' ? 'DELIVERED' : 'SOLD';
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: {
        status: nextVehicleStatus,
        soldDate: data.saleDate,
        salePrice: new Decimal(data.salePrice as string),
      },
    });

    // Touch customer's lastContactDate
    await tx.customer.update({
      where: { id: customer.id },
      data: { lastContactDate: data.saleDate },
    });

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'SALE_CREATED',
      entityType: 'sale',
      entityId: sale.id,
      message: `Venda registada: ${vehicle.brand} ${vehicle.model} → ${customer.name}`,
      metadata: {
        vehicleId: vehicle.id,
        customerId: customer.id,
        salePrice: data.salePrice,
        realProfit: figures.realProfit.toString(),
      },
    });

    return {
      id: sale.id,
      figures: {
        margin: figures.margin.toString(),
        vatAmount: figures.vatAmount.toString(),
        realProfit: figures.realProfit.toString(),
      },
    };
  });
}

export async function updateSaleDelivery(
  saleId: string,
  payload: { deliveryStatus: DeliveryStatus; deliveryDate?: Date | null },
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUnique({
      where: { id: saleId },
      include: { vehicle: { select: { id: true, brand: true, model: true, status: true } } },
    });
    if (!existing) throw new SaleNotFound(saleId);

    const updateData: Prisma.SaleUpdateInput = {
      deliveryStatus: payload.deliveryStatus,
    };
    if (payload.deliveryDate !== undefined) {
      updateData.deliveryDate = payload.deliveryDate;
    }

    await tx.sale.update({ where: { id: saleId }, data: updateData });

    // Flip the Vehicle status to DELIVERED when the sale gets delivered
    if (payload.deliveryStatus === 'DELIVERED' && existing.vehicle.status !== 'DELIVERED') {
      await tx.vehicle.update({
        where: { id: existing.vehicle.id },
        data: { status: 'DELIVERED' },
      });
    }

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'SALE_UPDATED',
      entityType: 'sale',
      entityId: saleId,
      message: `Entrega actualizada: ${existing.vehicle.brand} ${existing.vehicle.model} → ${payload.deliveryStatus}`,
      metadata: { from: existing.deliveryStatus, to: payload.deliveryStatus },
    });
  });
}

export async function getSaleById(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
          mileage: true,
          fuel: true,
          purchasePrice: true,
          photos: true,
          status: true,
        },
      },
      customer: {
        select: { id: true, name: true, nif: true, phone: true, email: true },
      },
    },
  });
  if (!sale) return null;
  return {
    ...sale,
    salePrice: sale.salePrice.toString(),
    vatAmount: sale.vatAmount.toString(),
    realProfit: sale.realProfit.toString(),
    vehicle: {
      ...sale.vehicle,
      purchasePrice: sale.vehicle.purchasePrice.toString(),
    },
  };
}
