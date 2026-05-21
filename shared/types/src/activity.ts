import { z } from 'zod';
import { ActivityTypeEnum } from './enums.js';

export const activityLogSchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  type: ActivityTypeEnum,
  entityType: z.enum(['vehicle', 'sale', 'task', 'customer', 'expense']),
  entityId: z.string(),
  message: z.string(),
  metadata: z.unknown().optional(),
  createdAt: z.coerce.date(),
});
export type ActivityLog = z.infer<typeof activityLogSchema>;
