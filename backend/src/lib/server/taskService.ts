import type { Prisma } from '@prisma/client';
import type { TaskCreate, TaskStatus, TaskUpdate } from '@anm/types';
import { prisma } from '../../db.js';
import { emitActivity } from '../data/activity.js';
import { mostRecentSundayMidnight } from '../domain/sunday.js';
import { shiftRecurrence } from '../domain/task.js';
import { logger } from '../../logger.js';
import type { ActorContext } from './vehicleService.js';

/**
 * Weekly purge: every Sunday, wipe all DONE tasks regardless of how long
 * they've been there. `lastPurgeAt` is a module-level guard so the delete
 * only fires once per Sunday across all requests in this process. On
 * backend restart the guard resets — that's safe because the delete is
 * idempotent (only DONE tasks get deleted, and after the first run there
 * won't be any until the next status change).
 */
let lastPurgeAt = 0;

/**
 * Opportunistic cleanup: wipes every task in DONE if we haven't already
 * wiped since the most recent Sunday 00:00. Called from the list endpoint
 * with fire-and-forget semantics. Failures are logged and swallowed.
 */
export async function purgeStaleCompletedTasks(): Promise<number> {
  const sunday = mostRecentSundayMidnight();
  if (lastPurgeAt >= sunday.getTime()) return 0;

  try {
    const result = await prisma.task.deleteMany({ where: { status: 'DONE' } });
    lastPurgeAt = Date.now();
    if (result.count > 0) {
      logger.info(
        { deletedTasks: result.count, runFor: sunday.toISOString() },
        'Weekly Sunday purge of DONE tasks',
      );
    }
    return result.count;
  } catch (err) {
    logger.warn({ err }, 'Failed to purge DONE tasks (will retry next list call)');
    return 0;
  }
}

export class TaskNotFound extends Error {
  constructor(public readonly id: string) {
    super(`Task ${id} not found`);
    this.name = 'TaskNotFound';
  }
}

export async function createTask(
  data: TaskCreate,
  actor: ActorContext,
): Promise<{ id: string }> {
  const created = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'TODO',
        priority: data.priority ?? 'MEDIUM',
        assigneeId: data.assigneeId ?? null,
        startDate: data.startDate ?? null,
        dueDate: data.dueDate ?? null,
        reminderDate: data.reminderDate ?? null,
        recurrence: data.recurrence ?? 'NONE',
      },
    });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'TASK_CREATED',
      entityType: 'task',
      entityId: task.id,
      message: `Tarefa criada: ${task.title}`,
    });
    return task;
  });
  return { id: created.id };
}

export async function updateTask(
  id: string,
  data: Omit<TaskUpdate, 'id'>,
  actor: ActorContext,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({ where: { id } });
    if (!existing) throw new TaskNotFound(id);

    const update: Prisma.TaskUpdateInput = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description ?? null;
    if (data.priority !== undefined) update.priority = data.priority;
    if (data.assigneeId !== undefined) {
      update.assignee = data.assigneeId
        ? { connect: { id: data.assigneeId } }
        : { disconnect: true };
    }
    if (data.startDate !== undefined) update.startDate = data.startDate ?? null;
    if (data.dueDate !== undefined) update.dueDate = data.dueDate ?? null;
    if (data.reminderDate !== undefined) update.reminderDate = data.reminderDate ?? null;
    if (data.recurrence !== undefined) update.recurrence = data.recurrence;

    const updated = await tx.task.update({ where: { id }, data: update });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'TASK_STATUS_CHANGED',
      entityType: 'task',
      entityId: id,
      message: `Tarefa editada: ${updated.title}`,
    });
  });
}

/**
 * Status change handler — when a recurring task flips to DONE, transactionally
 * spawn the next occurrence with shifted dates and recurrenceParentId set.
 */
export async function changeTaskStatus(
  id: string,
  nextStatus: TaskStatus,
  actor: ActorContext,
): Promise<{ spawnedTaskId: string | null }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({ where: { id } });
    if (!existing) throw new TaskNotFound(id);

    if (existing.status === nextStatus) {
      return { spawnedTaskId: null };
    }

    // Track when a task became DONE so the auto-purge can find it.
    // Clear when moving away from DONE so the 7-day clock resets if it
    // ever lands back in DONE.
    const completedAt =
      nextStatus === 'DONE' && existing.status !== 'DONE'
        ? new Date()
        : nextStatus !== 'DONE' && existing.status === 'DONE'
          ? null
          : existing.completedAt;

    const updated = await tx.task.update({
      where: { id },
      data: { status: nextStatus, completedAt },
    });

    let spawnedTaskId: string | null = null;

    const flippedToDone = nextStatus === 'DONE' && existing.status !== 'DONE';
    if (flippedToDone && existing.recurrence !== 'NONE') {
      const newDueDate = existing.dueDate
        ? shiftRecurrence(existing.dueDate, existing.recurrence)
        : null;
      const newReminderDate = existing.reminderDate
        ? shiftRecurrence(existing.reminderDate, existing.recurrence)
        : null;
      const newStartDate = existing.startDate
        ? shiftRecurrence(existing.startDate, existing.recurrence)
        : null;

      const spawned = await tx.task.create({
        data: {
          title: existing.title,
          description: existing.description,
          status: 'TODO',
          priority: existing.priority,
          assigneeId: existing.assigneeId,
          startDate: newStartDate,
          dueDate: newDueDate,
          reminderDate: newReminderDate,
          recurrence: existing.recurrence,
          recurrenceParentId: existing.id,
        },
      });
      spawnedTaskId = spawned.id;

      await emitActivity(tx, {
        actorId: actor.actorId,
        type: 'TASK_CREATED',
        entityType: 'task',
        entityId: spawned.id,
        message: `Recorrência criada: ${spawned.title}`,
        metadata: { parentId: existing.id },
      });
    }

    await emitActivity(tx, {
      actorId: actor.actorId,
      type: flippedToDone ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED',
      entityType: 'task',
      entityId: id,
      message: flippedToDone
        ? `Tarefa concluída: ${updated.title}`
        : `Estado alterado: ${existing.status} → ${nextStatus} (${updated.title})`,
      metadata: { from: existing.status, to: nextStatus },
    });

    return { spawnedTaskId };
  });
}

export async function deleteTask(id: string, actor: ActorContext): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.task.findUnique({ where: { id } });
    if (!existing) throw new TaskNotFound(id);
    await tx.task.delete({ where: { id } });
    await emitActivity(tx, {
      actorId: actor.actorId,
      type: 'TASK_STATUS_CHANGED',
      entityType: 'task',
      entityId: id,
      message: `Tarefa eliminada: ${existing.title}`,
      metadata: { deleted: true },
    });
  });
}
