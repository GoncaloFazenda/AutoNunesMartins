import { Router, type Response } from 'express';
import { z } from 'zod';
import {
  PriorityEnum,
  TaskStatusEnum,
  taskCreateSchema,
  taskUpdateSchema,
} from '@anm/types';
import { prisma } from '../db.js';
import {
  getTaskByIdForActor,
  listAllTasks,
  type TaskScope,
} from '../lib/data/task.js';
import {
  TaskNotFound,
  TaskValidationError,
  changeTaskStatus,
  createTask,
  deleteTask,
  purgeStaleCompletedTasks,
  updateTask,
} from '../lib/server/taskService.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

const ScopeEnum = z.enum(['all', 'mine', 'general']);

const listQuerySchema = z.object({
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  assigneeId: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  q: z.string().optional(),
  scope: ScopeEnum.optional(),
  /**
   * When true, include recurring tasks currently in DONE-standby
   * (waiting for their next occurrence date). Default false hides them.
   */
  showScheduled: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true')
    .optional(),
});

const statusChangeSchema = z.object({
  status: TaskStatusEnum,
});

/**
 * Fetch a task only if it's visible to `actorId`. Returns null when the task
 * either doesn't exist OR exists but isn't accessible — we don't differentiate
 * to avoid leaking the existence of other users' tasks.
 */
async function loadVisibleTask(taskId: string, actorId: string) {
  return getTaskByIdForActor(prisma, taskId, actorId);
}

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Weekly Sunday purge of DONE tasks. Fire-and-forget — never blocks the
  // response. Recurring tasks have already spawned their next occurrence in
  // TODO before being completed, so deleting the DONE parent is safe.
  void purgeStaleCompletedTasks();

  const items = await listAllTasks(prisma, {
    ...parsed.data,
    scope: (parsed.data.scope as TaskScope | undefined) ?? 'all',
    actorId: req.user.id,
  });
  res.json({ items });
});

router.get('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const task = await loadVisibleTask(param(req, 'id'), req.user.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

router.post('/', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = taskCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const created = await createTask(parsed.data, {
    actorId: req.user.id,
    actorName: req.user.name,
  });
  res.status(201).json(created);
});

router.patch('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = taskUpdateSchema.omit({ id: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const existing = await loadVisibleTask(param(req, 'id'), req.user.id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  try {
    await updateTask(param(req, 'id'), parsed.data, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof TaskNotFound) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (err instanceof TaskValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.patch('/:id/status', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = statusChangeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const existing = await loadVisibleTask(param(req, 'id'), req.user.id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  try {
    const result = await changeTaskStatus(param(req, 'id'), parsed.data.status, {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof TaskNotFound) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    throw err;
  }
});

router.delete('/:id', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const existing = await loadVisibleTask(param(req, 'id'), req.user.id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  try {
    await deleteTask(param(req, 'id'), {
      actorId: req.user.id,
      actorName: req.user.name,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof TaskNotFound) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    throw err;
  }
});

export default router;
