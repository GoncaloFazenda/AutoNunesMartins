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
  /**
   * When true, include scheduled recurring tasks — those that have been
   * spawned in TODO ahead of time but whose dueDate is still in the future.
   * Defaults to false, hiding them from the board until their day arrives.
   */
  showScheduled?: boolean;
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

  const clauses: Prisma.TaskWhereInput[] = [where];

  // Hide scheduled recurring tasks (spawned in TODO ahead of their dueDate)
  // unless the caller explicitly asked to see them.
  if (!filter.showScheduled) {
    clauses.push({
      NOT: {
        AND: [
          { status: 'TODO' },
          { recurrence: { not: 'NONE' } },
          { dueDate: { gt: new Date() } },
        ],
      },
    });
  }

  if (filter.actorId) {
    clauses.push(visibilityFilter(filter.actorId, filter.scope));
  }

  return clauses.length === 1 ? clauses[0]! : { AND: clauses };
}

export async function listAllTasks(tx: TxClient, params: ListTasksParams = {}) {
  return tx.task.findMany({
    where: buildTaskWhere(params),
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      assignee: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
  });
}

export async function getTaskById(tx: TxClient, id: string) {
  return tx.task.findUnique({
    where: { id },
    include: { assignee: { select: { id: true, name: true, email: true, imageUrl: true } } },
  });
}

/** Returns the task only if visible to `actorId` (own or unassigned), else null. */
export async function getTaskByIdForActor(tx: TxClient, id: string, actorId: string) {
  return tx.task.findFirst({
    where: {
      id,
      OR: [{ assigneeId: null }, { assigneeId: actorId }],
    },
    include: { assignee: { select: { id: true, name: true, email: true, imageUrl: true } } },
  });
}
