import { z } from 'zod';
import { PriorityEnum, RecurrenceEnum, TaskStatusEnum } from './enums.js';

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(160),
  description: z.string().max(4000).optional(),
  status: TaskStatusEnum.default('TODO'),
  priority: PriorityEnum.default('MEDIUM'),
  assigneeId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  reminderDate: z.coerce.date().optional(),
  recurrence: RecurrenceEnum.default('NONE'),
});
export type TaskCreate = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;

export const taskStatusChangeSchema = z.object({
  id: z.string().min(1),
  status: TaskStatusEnum,
});
export type TaskStatusChange = z.infer<typeof taskStatusChangeSchema>;
