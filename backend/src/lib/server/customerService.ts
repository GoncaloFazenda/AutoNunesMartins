import type { Prisma } from '@prisma/client';
import type { CustomerCreate, CustomerUpdate } from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { getCustomerById } from '../data/customer.js';
import type { ActorContext } from './vehicleService.js';

export class CustomerNotFound extends Error {
  constructor(public readonly id: string) {
    super(`Customer ${id} not found`);
    this.name = 'CustomerNotFound';
  }
}

export class CustomerHasSales extends Error {
  constructor(public readonly id: string) {
    super(`Customer ${id} has sale records and cannot be deleted`);
    this.name = 'CustomerHasSales';
  }
}

export class DuplicateNif extends Error {
  constructor(public readonly nif: string) {
    super(`NIF ${nif} already exists`);
    this.name = 'DuplicateNif';
  }
}

export async function createCustomer(
  data: CustomerCreate,
  actor: ActorContext,
): Promise<{ id: string }> {
  try {
    const created = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email ?? null,
          address: data.address ?? null,
          nif: data.nif,
          notes: data.notes ?? null,
        },
      });
      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'CUSTOMER_ADDED',
        entityType: 'customer',
        entityId: customer.id,
        message: `Cliente adicionado: ${customer.name}`,
      });
      return customer;
    });
    return { id: created.id };
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') {
      throw new DuplicateNif(data.nif);
    }
    throw err;
  }
}

export async function updateCustomer(
  id: string,
  data: Omit<CustomerUpdate, 'id'>,
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.customer.findUnique({ where: { id } });
    if (!existing) throw new CustomerNotFound(id);

    const updateData: Prisma.CustomerUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email ?? null;
    if (data.address !== undefined) updateData.address = data.address ?? null;
    if (data.nif !== undefined) updateData.nif = data.nif;
    if (data.notes !== undefined) updateData.notes = data.notes ?? null;

    try {
      const updated = await tx.customer.update({ where: { id }, data: updateData });
      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'CUSTOMER_UPDATED',
        entityType: 'customer',
        entityId: id,
        message: `Cliente editado: ${updated.name}`,
      });
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new DuplicateNif(data.nif ?? '');
      }
      throw err;
    }
  });
}

export async function deleteCustomer(id: string, actor: ActorContext): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.customer.findUnique({
      where: { id },
      include: { _count: { select: { sales: true } } },
    });
    if (!existing) throw new CustomerNotFound(id);
    if (existing._count.sales > 0) throw new CustomerHasSales(id);

    await tx.customer.delete({ where: { id } });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'CUSTOMER_UPDATED',
      entityType: 'customer',
      entityId: id,
      message: `Cliente eliminado: ${existing.name}`,
      metadata: { deleted: true },
    });
  });
}

export async function touchLastContact(id: string): Promise<void> {
  await prisma.customer.update({
    where: { id },
    data: { lastContactDate: new Date() },
  });
}

export async function getCustomerForDetail(id: string) {
  const c = await getCustomerById(prisma, id);
  if (!c) return null;
  return {
    ...c,
    sales: c.sales.map((s) => ({
      ...s,
      salePrice: s.salePrice.toString(),
      vatAmount: s.vatAmount.toString(),
      commission: s.commission.toString(),
      realProfit: s.realProfit.toString(),
    })),
  };
}
