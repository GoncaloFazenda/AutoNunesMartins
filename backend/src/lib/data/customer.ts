import type { Prisma, PrismaClient } from '@prisma/client';

type TxClient = PrismaClient | Prisma.TransactionClient;

export interface ListCustomersParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'lastContactDate';
  sortDir?: 'asc' | 'desc';
}

export function buildCustomerWhere(filter: Pick<ListCustomersParams, 'q'>): Prisma.CustomerWhereInput {
  if (!filter.q) return {};
  return {
    OR: [
      { name: { contains: filter.q, mode: 'insensitive' } },
      { phone: { contains: filter.q, mode: 'insensitive' } },
      { email: { contains: filter.q, mode: 'insensitive' } },
      { nif: { contains: filter.q } },
    ],
  };
}

export async function listCustomers(tx: TxClient, params: ListCustomersParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(500, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? 'createdAt';
  const sortDir = params.sortDir ?? 'desc';
  const where = buildCustomerWhere(params);

  const [items, total] = await Promise.all([
    tx.customer.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { sales: true } } },
    }),
    tx.customer.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getCustomerById(tx: TxClient, id: string) {
  return tx.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { saleDate: 'desc' },
        include: {
          vehicle: {
            select: { id: true, brand: true, model: true, year: true, vin: true, photos: true },
          },
        },
      },
    },
  });
}
