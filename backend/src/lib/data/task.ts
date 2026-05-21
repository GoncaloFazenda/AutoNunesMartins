import type { Prisma, PrismaClient } from '@prisma/client';
import type { Priority, TaskStatus } from '@anm/types';

type TxClient = PrismaClient | Prisma.TransactionClient;

export type TaskScope = 'all' | 'mine' | 'general';

export interface ListTasksParams {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  q?: string;
  /** Prisma User.id of the requesting user. When set, enforces visibility. */
  actorId?: string;
  /** Narrow further within the actor's visible set. */
  scope?: TaskScope;
}

/**
 * Tasks are visible to a user when:
 *   - they have no assignee (Geral — shared inbox), OR
 *   - they are assigned to that user
 */
function visibilityFilter(
  actorId: string,
  scope: TaskScope = 'all',
): Prisma.TaskWhereInput {
  if (scope === 'mine') return { assigneeId: actorId };
  if (scope === 'general') return { assigneeId: null };
  return { OR: [{ assigneeId: null }, { assigneeId: actorId }] };
}

export function buildTaskWhere(filter: ListTasksParams): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.priority) where.priority = filter.priority;
  if (filter.assigneeId) where.assigneeId = filter.assigneeId;
  if (filter.dueBefore || filter.dueAfter) {
    where.dueDate = {};
    if (filter.dueAfter) where.dueDate.gte = filter.dueAfter;
    if (filter.dueBefore) where.dueDate.lte = filter.dueBefore;
  }
  if (filter.q) {
    where.OR = [
      { title: { contains: filter.q, mode: 'insensitive' } },
      { description: { contains: filter.q, mode: 'insensitive' } },
    ];
  }

  if (filter.actorId) {
    return { AND: [where, visibilityFilter(filter.actorId, filter.scope)] };
  }
  return where;
}

export async function listAllTasks(tx: TxClient, params: ListTasksParams = {}) {
  return tx.task.findMany({
    where: buildTaskWhere(params),
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getTaskById(tx: TxClient, id: string) {
  return tx.task.findUnique({
    where: { id },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });
}

/** Returns the task only if visible to `actorId` (own or unassigned), else null. */
export async function getTaskByIdForActor(tx: TxClient, id: string, actorId: string) {
  return tx.task.findFirst({
    where: {
      id,
      OR: [{ assigneeId: null }, { assigneeId: actorId }],
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });
}
