import type { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import type { SaleCreate, DeliveryStatus } from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { sumVehicleExpenses } from '../data/vehicle.js';
import { computeSaleFigures } from '../domain/sale.js';

export interface ListSalesParams {
  q?: string;
  deliveryStatus?: DeliveryStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'saleDate' | 'salePrice' | 'realProfit' | 'marginPct';
  sortDir?: 'asc' | 'desc';
}

export interface SaleListRow {
  id: string;
  saleDate: string;
  salePrice: string;
  purchasePrice: string;
  expensesTotal: string;
  vatAmount: string;
  commission: string;
  realProfit: string;
  marginPct: number;
  deliveryStatus: DeliveryStatus;
  deliveryDate: string | null;
  /** True when this sale captured a trade-in. Drives the `↔` chip on /vendas. */
  hasTradeIn: boolean;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string | null;
  };
  customer: {
    id: string;
    name: string;
    nif: string;
  };
}

export interface SaleListTotals {
  count: number;
  revenue: string;
  vat: string;
  expenses: string;
  commission: string;
  profit: string;
  avgMarginPct: number;
}

export interface ListSalesResult {
  items: SaleListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: SaleListTotals;
}

export async function listSales(params: ListSalesParams): Promise<ListSalesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? 'saleDate';
  const sortDir = params.sortDir ?? 'desc';

  const where: Prisma.SaleWhereInput = {};

  if (params.deliveryStatus) where.deliveryStatus = params.deliveryStatus;

  if (params.dateFrom || params.dateTo) {
    where.saleDate = {};
    if (params.dateFrom) {
      const d = new Date(params.dateFrom);
      if (!Number.isNaN(d.getTime())) where.saleDate.gte = d;
    }
    if (params.dateTo) {
      const d = new Date(params.dateTo);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        where.saleDate.lte = d;
      }
    }
  }

  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim();
    // Search across the most useful fields of the joined vehicle + customer:
    // brand, model, VIN, plate (both compact and dashed forms), and the
    // customer's name + NIF. Plate normalisation matches the vehicle list.
    const compact = q.replace(/[\s-]/g, '').toUpperCase();
    const dashed =
      compact.length >= 3 && compact.length <= 6
        ? compact.replace(/(.{2})/g, '$1-').replace(/-$/, '')
        : null;
    where.OR = [
      { vehicle: { brand: { contains: q, mode: 'insensitive' } } },
      { vehicle: { model: { contains: q, mode: 'insensitive' } } },
      { vehicle: { vin: { contains: q, mode: 'insensitive' } } },
      { vehicle: { licensePlate: { contains: q, mode: 'insensitive' } } },
      ...(dashed
        ? [{ vehicle: { licensePlate: { contains: dashed, mode: 'insensitive' as const } } }]
        : []),
      { customer: { name: { contains: q, mode: 'insensitive' } } },
      { customer: { nif: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Fetch the entire filtered set so totals (returned alongside `items`)
  // reflect ALL matching sales — not just the current page — and so that
  // sortBy='marginPct' can order rows before slicing. marginPct isn't a
  // stored column, so it can only be sorted after the per-row calculation.
  const allRows = await prisma.sale.findMany({
    where,
    select: {
      id: true,
      saleDate: true,
      salePrice: true,
      vatAmount: true,
      commission: true,
      realProfit: true,
      deliveryStatus: true,
      deliveryDate: true,
      // Just need to know IF a trade-in exists — no fields needed. Prisma
      // returns `null` when absent, so the row's hasTradeIn is `!!row.tradeIn`.
      tradeIn: { select: { id: true } },
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
          licensePlate: true,
          purchasePrice: true,
          expenses: { select: { amount: true } },
        },
      },
      customer: { select: { id: true, name: true, nif: true } },
    },
  });

  const enriched: SaleListRow[] = allRows.map((r) => {
    const expensesTotal = r.vehicle.expenses.reduce(
      (acc, e) => acc.plus(e.amount.toString()),
      new Decimal(0),
    );
    const salePriceNum = Number(r.salePrice.toString());
    const realProfitNum = Number(r.realProfit.toString());
    const marginPct = salePriceNum > 0 ? (realProfitNum / salePriceNum) * 100 : 0;
    return {
      id: r.id,
      saleDate: r.saleDate.toISOString(),
      salePrice: r.salePrice.toString(),
      purchasePrice: r.vehicle.purchasePrice.toString(),
      expensesTotal: expensesTotal.toFixed(2),
      vatAmount: r.vatAmount.toString(),
      commission: r.commission.toString(),
      realProfit: r.realProfit.toString(),
      marginPct,
      deliveryStatus: r.deliveryStatus as DeliveryStatus,
      deliveryDate: r.deliveryDate ? r.deliveryDate.toISOString() : null,
      hasTradeIn: r.tradeIn !== null,
      vehicle: {
        id: r.vehicle.id,
        brand: r.vehicle.brand,
        model: r.vehicle.model,
        year: r.vehicle.year,
        vin: r.vehicle.vin,
        licensePlate: r.vehicle.licensePlate,
      },
      customer: r.customer,
    };
  });

  // Totals are computed before sort/paginate — order doesn't affect sums.
  let totalRevenue = new Decimal(0);
  let totalVat = new Decimal(0);
  let totalExpenses = new Decimal(0);
  let totalCommission = new Decimal(0);
  let totalProfit = new Decimal(0);
  for (const r of enriched) {
    totalRevenue = totalRevenue.plus(r.salePrice);
    totalVat = totalVat.plus(r.vatAmount);
    totalExpenses = totalExpenses.plus(r.expensesTotal);
    totalCommission = totalCommission.plus(r.commission);
    totalProfit = totalProfit.plus(r.realProfit);
  }
  const totalRevenueNum = Number(totalRevenue.toString());
  const totalProfitNum = Number(totalProfit.toString());
  const avgMarginPct = totalRevenueNum > 0 ? (totalProfitNum / totalRevenueNum) * 100 : 0;

  enriched.sort((a, b) => {
    let av: number;
    let bv: number;
    switch (sortBy) {
      case 'saleDate':
        av = new Date(a.saleDate).getTime();
        bv = new Date(b.saleDate).getTime();
        break;
      case 'salePrice':
        av = Number(a.salePrice);
        bv = Number(b.salePrice);
        break;
      case 'realProfit':
        av = Number(a.realProfit);
        bv = Number(b.realProfit);
        break;
      case 'marginPct':
        av = a.marginPct;
        bv = b.marginPct;
        break;
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const total = enriched.length;
  const items = enriched.slice((page - 1) * pageSize, page * pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    totals: {
      count: total,
      revenue: totalRevenue.toFixed(2),
      vat: totalVat.toFixed(2),
      expenses: totalExpenses.toFixed(2),
      commission: totalCommission.toFixed(2),
      profit: totalProfit.toFixed(2),
      avgMarginPct,
    },
  };
}

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

/**
 * Raised when the trade-in's STOCK vehicle creation collides with an
 * existing Vehicle on a unique field (vin or licensePlate). The route
 * handler turns this into a 409 with `{ field }` so the form can paint
 * the offending input red without losing the dealer's typed data.
 */
export class TradeInVehicleConflict extends Error {
  constructor(
    public readonly field: 'vin' | 'licensePlate',
    public readonly value: string,
  ) {
    super(`Trade-in vehicle conflict on ${field} (${value})`);
    this.name = 'TradeInVehicleConflict';
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
): Promise<{
  id: string;
  figures: { margin: string; vatAmount: string; commission: string; realProfit: string };
}> {
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
    // Zod default ensures `commission` is always a string here; if a caller
    // bypasses the schema we fall back to "0" defensively.
    const commission = (data.commission as string | undefined) ?? '0';
    const buyerType = data.buyerType ?? 'PARTICULAR';
    // Trade-in (if any) is a SEPARATE transaction — the dealer "buys" the
    // customer's car at the allowance. It does NOT abate this sale's margin
    // or VAT (PT margin scheme taxes the sale margin regardless of payment
    // form). The allowance only becomes a P&L line when the trade-in car
    // itself is later resold and its own margin is computed there.
    const figures = computeSaleFigures({
      salePrice: data.salePrice,
      purchasePrice: vehicle.purchasePrice.toString(),
      expensesTotal,
      commission,
      buyerType,
    });

    const sale = await tx.sale.create({
      data: {
        vehicleId: vehicle.id,
        customerId: customer.id,
        salePrice: new Decimal(data.salePrice as string),
        vatAmount: new Decimal(figures.vatAmount.toString()),
        commission: new Decimal(figures.commission.toString()),
        buyerType,
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

    // Trade-in: when present, persist a TradeIn row tied to the sale, and
    // (STOCK disposition only) create a new Vehicle in inventory whose
    // purchasePrice equals the allowance. Both happen inside this same
    // transaction so the sale is either fully recorded or not at all.
    if (data.tradeIn) {
      const ti = data.tradeIn;
      let resultingVehicleId: string | null = null;
      let newVehicle: { id: string; brand: string; model: string; year: number } | null = null;

      if (ti.disposition === 'STOCK') {
        // VIN is guaranteed to be present here by the Zod superRefine on
        // tradeInCreateSchema (STOCK ⇒ vin required). Cast for the Prisma
        // type which doesn't know about that refinement.
        // Enters as DRAFT — the dealer hasn't decided the resale price yet.
        // Stays out of "Marcar como Vendida" and the public listing until
        // explicitly published via publishVehicle().
        // We catch P2002 inline here so the route handler can surface a
        // FIELD-LEVEL error in the UI ("VIN duplicado" on the VIN input)
        // rather than a generic 409. The whole transaction rolls back, so
        // the original sale is NOT recorded — the dealer fixes the input
        // (form state preserved) and resubmits.
        try {
          newVehicle = await tx.vehicle.create({
            data: {
              brand: ti.brand,
              model: ti.model,
              year: ti.year,
              fuel: ti.fuel,
              mileage: ti.mileage,
              vin: ti.vin as string,
              licensePlate: ti.licensePlate ?? null,
              purchasePrice: new Decimal(ti.allowanceValue as string),
              status: 'DRAFT',
              acquisitionDate: data.saleDate,
              description: ti.notes ?? `Retoma da venda ${sale.id}`,
            },
          });
        } catch (err) {
          const e = err as { code?: string; meta?: { target?: string[] | string } };
          if (e.code === 'P2002') {
            const targets = Array.isArray(e.meta?.target)
              ? e.meta!.target!
              : typeof e.meta?.target === 'string'
                ? [e.meta!.target!]
                : [];
            if (targets.includes('vin')) {
              throw new TradeInVehicleConflict('vin', ti.vin as string);
            }
            if (targets.includes('licensePlate')) {
              throw new TradeInVehicleConflict('licensePlate', ti.licensePlate as string);
            }
          }
          throw err;
        }
        resultingVehicleId = newVehicle.id;
      }

      await tx.tradeIn.create({
        data: {
          saleId: sale.id,
          brand: ti.brand,
          model: ti.model,
          year: ti.year,
          fuel: ti.fuel,
          mileage: ti.mileage,
          licensePlate: ti.licensePlate ?? null,
          vin: ti.vin ?? null,
          allowanceValue: new Decimal(ti.allowanceValue as string),
          disposition: ti.disposition,
          resultingVehicleId,
          notes: ti.notes ?? null,
        },
      });

      // Emit TRADE_IN_RECEIVED before VEHICLE_ADDED so the feed reads
      // "venda → retoma recebida → viatura adicionada", matching the
      // dealer's mental model (the retoma is the *cause*, the new stock
      // vehicle is the *consequence*). All three rows share the same
      // transaction timestamp, so emission order is what the feed uses.
      const dispositionLabel =
        ti.disposition === 'STOCK' ? 'entrou no stock' : 'para abate';
      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'TRADE_IN_RECEIVED',
        entityType: 'sale',
        entityId: sale.id,
        message: `Retoma recebida (${dispositionLabel}): ${ti.brand} ${ti.model} (${ti.year})`,
        metadata: {
          saleId: sale.id,
          allowanceValue: ti.allowanceValue,
          disposition: ti.disposition,
          resultingVehicleId,
        },
      });

      if (newVehicle) {
        await emitActivity(tx, {
          actorId: actor.actorId,
          type: 'VEHICLE_ADDED',
          entityType: 'vehicle',
          entityId: newVehicle.id,
          message: `Viatura adicionada por retoma (rascunho): ${newVehicle.brand} ${newVehicle.model} (${newVehicle.year})`,
          metadata: { source: 'TRADE_IN', saleId: sale.id, status: 'DRAFT' },
        });
      }
    }

    return {
      id: sale.id,
      figures: {
        margin: figures.margin.toString(),
        vatAmount: figures.vatAmount.toString(),
        commission: figures.commission.toString(),
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
          licensePlate: true,
          mileage: true,
          fuel: true,
          purchasePrice: true,
          photos: true,
          status: true,
          // When the sold vehicle came into stock as a trade-in itself,
          // expose the originating sale's realProfit so the UI can render
          // the consolidated profit ("este negócio + venda original").
          sourceTradeIn: {
            select: {
              id: true,
              allowanceValue: true,
              sale: {
                select: {
                  id: true,
                  saleDate: true,
                  realProfit: true,
                  customer: { select: { id: true, name: true } },
                  vehicle: {
                    select: { id: true, brand: true, model: true, year: true },
                  },
                },
              },
            },
          },
        },
      },
      customer: {
        select: { id: true, name: true, nif: true, phone: true, email: true },
      },
      // Include the trade-in (if any) so the detail page can render the
      // "Retoma" section and link to the resulting stock vehicle.
      tradeIn: true,
    },
  });
  if (!sale) return null;
  return {
    ...sale,
    salePrice: sale.salePrice.toString(),
    vatAmount: sale.vatAmount.toString(),
    commission: sale.commission.toString(),
    realProfit: sale.realProfit.toString(),
    vehicle: {
      ...sale.vehicle,
      purchasePrice: sale.vehicle.purchasePrice.toString(),
      sourceTradeIn: sale.vehicle.sourceTradeIn
        ? {
            id: sale.vehicle.sourceTradeIn.id,
            allowanceValue: sale.vehicle.sourceTradeIn.allowanceValue.toString(),
            sale: {
              id: sale.vehicle.sourceTradeIn.sale.id,
              saleDate: sale.vehicle.sourceTradeIn.sale.saleDate,
              realProfit: sale.vehicle.sourceTradeIn.sale.realProfit.toString(),
              customer: sale.vehicle.sourceTradeIn.sale.customer,
              vehicle: sale.vehicle.sourceTradeIn.sale.vehicle,
            },
          }
        : null,
    },
    tradeIn: sale.tradeIn
      ? {
          ...sale.tradeIn,
          allowanceValue: sale.tradeIn.allowanceValue.toString(),
        }
      : null,
  };
}
