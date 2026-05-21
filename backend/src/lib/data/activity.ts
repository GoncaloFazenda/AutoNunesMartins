import type { Prisma, PrismaClient } from '@prisma/client';
import type { ActivityType } from '@anm/types';
import { cache } from './cache.js';

export interface EmitActivityInput {
  actorId: string | null;
  type: ActivityType;
  entityType: 'vehicle' | 'sale' | 'task' | 'customer' | 'expense';
  entityId: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

type TxClient = PrismaClient | Prisma.TransactionClient;

export async function emitActivity(tx: TxClient, input: EmitActivityInput): Promise<void> {
  await tx.activityLog.create({
    data: {
      actorId: input.actorId,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      message: input.message,
      metadata: input.metadata ?? undefined,
    },
  });

  // Any successful mutation invalidates the per-actor dashboard + notification
  // caches so the UI never shows stale "Recent Activity" or alert counts after
  // an action the user just performed.
  cache.clearPrefix('dashboard:');
  cache.clearPrefix('notifications:');
}
