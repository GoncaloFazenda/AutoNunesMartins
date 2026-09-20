import { z } from 'zod';
import { PriorityEnum, RecurrenceEnum, TaskStatusEnum } from './enums.js';

export const taskCreateSchema = z
  .object({
    title: z.string().min(1, 'Título obrigatório').max(160),
    description: z.string().max(4000).optional(),
    status: TaskStatusEnum.default('TODO'),
    priority: PriorityEnum.default('MEDIUM'),
    assigneeId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    reminderDate: z.coerce.date().optional(),
    recurrence: RecurrenceEnum.default('NONE'),
  })
  .superRefine((data, ctx) => {
    // Recurring tasks need a dueDate — the day-of-month of that date is
    // what we shift forward each cycle, so without it we can't reschedule.
    if (data.recurrence !== 'NONE' && !data.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'Tarefas recorrentes precisam de uma data de prazo.',
      });
    }
  });
export type TaskCreate = z.infer<typeof taskCreateSchema>;

// `.partial()` doesn't exist on ZodEffects, so we rebuild the base shape
// as partial here. The recurrence-needs-dueDate invariant is enforced in
// the service layer for updates, since it requires the existing task's
// state to know whether the resulting record will be valid.
const taskBaseShape = z.object({
  title: z.string().min(1, 'Título obrigatório').max(160),
  description: z.string().max(4000).optional(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  assigneeId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  reminderDate: z.coerce.date().optional(),
  recurrence: RecurrenceEnum.optional(),
});

export const taskUpdateSchema = taskBaseShape
  .partial()
  .extend({ id: z.string().min(1) });
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;

export const taskStatusChangeSchema = z.object({
  id: z.string().min(1),
  status: TaskStatusEnum,
});
export type TaskStatusChange = z.infer<typeof taskStatusChangeSchema>;
