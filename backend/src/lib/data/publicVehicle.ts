import type { Prisma, PrismaClient } from '@prisma/client';
import { publicSpecificationsSchema } from '@anm/types';
import { isApprovedPhotoPath, type PublicVehicleQuery } from '../domain/publicVehicle.js';

// Never reuse the CRM's Vehicle select, filter builder, or serializer here.
export const publicVehicleSelect = {
  id: true,
  brand: true,
  model: true,
  year: true,
  fuel: true,
  mileage: true,
  status: true,
  webPublished: true,
  publicSlug: true,
  publicPrice: true,
  publicDescription: true,
  publicPhotoPaths: true,
  publicTransmission: true,
  publicSpecifications: true,
  photos: true,
} satisfies Prisma.VehicleSelect;
type PublicRow = Prisma.VehicleGetPayload<{ select: typeof publicVehicleSelect }>;

export function publicVehicleWhere(query?: PublicVehicleQuery): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {
    webPublished: true,
    publicSlug: { not: null },
    status: { in: ['AVAILABLE', 'RESERVED'] },
    soldDate: null,
    sale: { is: null },
  };
  if (!query) return where;
  if (query.marca) where.brand = { equals: query.marca, mode: 'insensitive' };
  if (query.modelo) where.model = { equals: query.modelo, mode: 'insensitive' };
  if (query.combustivel) where.fuel = query.combustivel;
  if (query.transmissao) where.publicTransmission = query.transmissao;
  if (query.ano_min !== undefined || query.ano_max !== undefined) {
    where.year = { gte: query.ano_min, lte: query.ano_max };
  }
  if (query.km_min !== undefined || query.km_max !== undefined) {
    where.mileage = { gte: query.km_min, lte: query.km_max };
  }
  if (query.preco_min !== undefined || query.preco_max !== undefined) {
    where.publicPrice = { gt: 0, gte: query.preco_min, lte: query.preco_max };
  }
  if (query.q) {
    // PostgreSQL LIKE treats %/_ as wildcards; public search treats them literally.
    const q = query.q.replace(/[\\%_]/g, '\\$&');
    where.OR = [
      { brand: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
      { publicDescription: { contains: q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export function publicVehicleOrder(
  order: PublicVehicleQuery['ordem'],
): Prisma.VehicleOrderByWithRelationInput[] {
  const orders: Record<typeof order, Prisma.VehicleOrderByWithRelationInput> = {
    relevancia: { publicSlug: 'asc' },
    preco_asc: { publicPrice: { sort: 'asc', nulls: 'last' } },
    preco_desc: { publicPrice: { sort: 'desc', nulls: 'last' } },
    ano: { year: 'desc' },
    km: { mileage: 'asc' },
  };
  return [orders[order], { id: 'asc' }];
}

function approvedPaths(row: PublicRow): string[] {
  return [...new Set(row.publicPhotoPaths)]
    .filter((path) => row.photos.includes(path) && isApprovedPhotoPath(row.id, path))
    .slice(0, 20);
}

/** Explicit JSON allowlist, even if a future query accidentally over-selects. */
export function publicVehicleDto(row: PublicRow) {
  if (
    !row.webPublished ||
    !row.publicSlug ||
    (row.publicPrice !== null && !row.publicPrice.gt(0)) ||
    (row.status !== 'AVAILABLE' && row.status !== 'RESERVED')
  ) {
    throw new Error('Invalid public vehicle projection');
  }
  return {
    slug: row.publicSlug,
    brand: row.brand,
    model: row.model,
    year: row.year,
    fuel: row.fuel,
    mileage: row.mileage,
    price: row.publicPrice?.toFixed(2) ?? null,
    currency: 'EUR' as const,
    description: row.publicDescription,
    transmission: row.publicTransmission,
    specifications: publicSpecificationsSchema.safeParse(row.publicSpecifications ?? {}).data ?? {},
    availability: row.status,
    // Storage paths/tokens/URLs stay on the server. Each request checks approval.
    photos: approvedPaths(row).map(
      (_, index) => `/api/public/vehicles/${row.publicSlug}/photos/${index}`,
    ),
  };
}

export async function listPublicVehicles(db: PrismaClient, query: PublicVehicleQuery) {
  const where = publicVehicleWhere(query);
  return db.$transaction(
    async (tx) => {
      const [rows, total, brands, models, fuels, transmissions, ranges] = await Promise.all([
        tx.vehicle.findMany({
          where,
          select: publicVehicleSelect,
          orderBy: publicVehicleOrder(query.ordem),
          skip: (query.pagina - 1) * query.pageSize,
          take: query.pageSize,
        }),
        tx.vehicle.count({ where }),
        tx.vehicle.groupBy({
          by: ['brand'],
          where: publicVehicleWhere({ ...query, marca: undefined, modelo: undefined }),
          _count: { _all: true },
          orderBy: { brand: 'asc' },
          take: 100,
        }),
        tx.vehicle.groupBy({
          by: ['brand', 'model'],
          where: publicVehicleWhere({ ...query, modelo: undefined }),
          _count: { _all: true },
          orderBy: [{ brand: 'asc' }, { model: 'asc' }],
          take: 100,
        }),
        tx.vehicle.groupBy({
          by: ['fuel'],
          where: publicVehicleWhere({ ...query, combustivel: undefined }),
          _count: { _all: true },
          orderBy: { fuel: 'asc' },
        }),
        tx.vehicle.groupBy({
          by: ['publicTransmission'],
          where: publicVehicleWhere({ ...query, transmissao: undefined }),
          _count: { _all: true },
          orderBy: { publicTransmission: 'asc' },
        }),
        tx.vehicle.aggregate({
          where,
          _min: { year: true, mileage: true, publicPrice: true },
          _max: { year: true, mileage: true, publicPrice: true },
        }),
      ]);
      return {
        items: rows.map(publicVehicleDto),
        total,
        page: query.pagina,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
        facets: {
          brands: brands.map((v) => ({ value: v.brand, count: v._count._all })),
          models: models.map((v) => ({ brand: v.brand, value: v.model, count: v._count._all })),
          fuels: fuels.map((v) => ({ value: v.fuel, count: v._count._all })),
          transmissions: transmissions
            .filter((v) => v.publicTransmission !== null)
            .map((v) => ({ value: v.publicTransmission, count: v._count._all })),
          year: { min: ranges._min.year, max: ranges._max.year },
          mileage: { min: ranges._min.mileage, max: ranges._max.mileage },
          price: {
            min: ranges._min.publicPrice?.toFixed(2) ?? null,
            max: ranges._max.publicPrice?.toFixed(2) ?? null,
          },
        },
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

export async function getPublicVehicle(db: PrismaClient, slug: string) {
  const row = await db.vehicle.findFirst({
    where: { ...publicVehicleWhere(), publicSlug: slug },
    select: publicVehicleSelect,
  });
  return row ? publicVehicleDto(row) : null;
}

/** The nearest three must be among the nearest three on either side of the price. */
export async function relatedPublicVehicles(db: PrismaClient, slug: string) {
  return db.$transaction(async (tx) => {
    const current = await tx.vehicle.findFirst({
      where: { ...publicVehicleWhere(), publicSlug: slug },
      select: publicVehicleSelect,
    });
    if (!current) return null;
    const price = current.publicPrice;
    if (!price || !price.isFinite() || !price.gt(0)) return [];
    const where = { ...publicVehicleWhere(), id: { not: current.id } };
    const [below, above] = await Promise.all([
      tx.vehicle.findMany({
        where: { ...where, publicPrice: { gt: 0, lte: price } },
        select: publicVehicleSelect,
        orderBy: [{ publicPrice: 'desc' }, { publicSlug: 'asc' }], take: 3,
      }),
      tx.vehicle.findMany({
        where: { ...where, publicPrice: { gt: price } },
        select: publicVehicleSelect,
        orderBy: [{ publicPrice: 'asc' }, { publicSlug: 'asc' }], take: 3,
      }),
    ]);
    return [...new Map([...below, ...above]
      .filter(row => row.id !== current.id && row.publicPrice?.isFinite() && row.publicPrice.gt(0))
      .map(row => [row.publicSlug, row])).values()]
      .sort((a, b) => a.publicPrice!.minus(price).abs().comparedTo(b.publicPrice!.minus(price).abs())
        || a.publicSlug!.localeCompare(b.publicSlug!))
      .slice(0, 3).map(publicVehicleDto);
  }, { isolationLevel: 'RepeatableRead' });
}

export async function getPublicPhotoPath(db: PrismaClient, slug: string, index: number) {
  const row = await db.vehicle.findFirst({
    where: { ...publicVehicleWhere(), publicSlug: slug },
    select: publicVehicleSelect,
  });
  return row ? (approvedPaths(row)[index] ?? null) : null;
}
