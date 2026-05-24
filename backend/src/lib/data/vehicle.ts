import type { Prisma, PrismaClient } from '@prisma/client';
import type { VehicleFilter } from '@anm/types';

type TxClient = PrismaClient | Prisma.TransactionClient;

export interface ListVehiclesParams extends VehicleFilter {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'acquisitionDate' | 'salePrice' | 'purchasePrice' | 'mileage' | 'year';
  sortDir?: 'asc' | 'desc';
}

export function buildVehicleWhere(filter: VehicleFilter): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};
  if (filter.brand) where.brand = { contains: filter.brand, mode: 'insensitive' };
  if (filter.model) where.model = { contains: filter.model, mode: 'insensitive' };
  if (filter.fuel) where.fuel = filter.fuel;
  if (filter.status) where.status = filter.status;
  if (filter.yearMin !== undefined || filter.yearMax !== undefined) {
    where.year = {};
    if (filter.yearMin !== undefined) where.year.gte = filter.yearMin;
    if (filter.yearMax !== undefined) where.year.lte = filter.yearMax;
  }
  if (filter.mileageMin !== undefined || filter.mileageMax !== undefined) {
    where.mileage = {};
    if (filter.mileageMin !== undefined) where.mileage.gte = filter.mileageMin;
    if (filter.mileageMax !== undefined) where.mileage.lte = filter.mileageMax;
  }
  if (filter.q) {
    // We store the plate canonically as "XX-XX-XX". Users typically type
    // it without dashes, so we also try the dash-injected form of the
    // query: every two characters → group → "AA-00-AA". Both forms get
    // OR'd in so "12AB34", "12-AB-34", or even "12AB" all match.
    const compact = filter.q.replace(/[\s-]/g, '').toUpperCase();
    const dashed =
      compact.length >= 3 && compact.length <= 6
        ? compact.replace(/(.{2})/g, '$1-').replace(/-$/, '')
        : null;
    where.OR = [
      { brand: { contains: filter.q, mode: 'insensitive' } },
      { model: { contains: filter.q, mode: 'insensitive' } },
      { vin: { contains: filter.q, mode: 'insensitive' } },
      { licensePlate: { contains: filter.q, mode: 'insensitive' } },
      ...(dashed
        ? [{ licensePlate: { contains: dashed, mode: 'insensitive' as const } }]
        : []),
    ];
  }
  return where;
}

export async function listVehicles(tx: TxClient, params: ListVehiclesParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? 'createdAt';
  const sortDir = params.sortDir ?? 'desc';

  const where = buildVehicleWhere(params);
  // Bare-minimum select: only what VehicleTable + thumbnail logic actually use.
  // No `_count` subquery, no Sale join — both were unused by the UI.
  const [items, total] = await Promise.all([
    tx.vehicle.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        fuel: true,
        mileage: true,
        vin: true,
        licensePlate: true,
        purchasePrice: true,
        salePrice: true,
        status: true,
        acquisitionDate: true,
        soldDate: true,
        photos: true,
        pendingDocFlags: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    tx.vehicle.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getVehicleById(tx: TxClient, id: string) {
  return tx.vehicle.findUnique({
    where: { id },
    include: {
      expenses: { orderBy: { date: 'desc' } },
      sale: {
        include: {
          customer: { select: { id: true, name: true, nif: true } },
        },
      },
    },
  });
}

export async function sumVehicleExpenses(tx: TxClient, vehicleId: string): Promise<string> {
  const result = await tx.vehicleExpense.aggregate({
    where: { vehicleId },
    _sum: { amount: true },
  });
  return result._sum.amount?.toString() ?? '0';
}
