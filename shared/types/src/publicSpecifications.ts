import { z } from 'zod';

/** Explicitly approved technical/editorial details; never derived from internal notes. */
export const publicSpecificationsSchema = z.object({
  powerHp: z.number().int().min(1).max(3000).nullable().optional(),
  engineCc: z.number().int().min(1).max(20000).nullable().optional(),
  doors: z.number().int().min(1).max(8).nullable().optional(),
  seats: z.number().int().min(1).max(20).nullable().optional(),
  category: z.string().trim().max(80).optional(),
  color: z.string().trim().max(80).optional(),
  equipment: z.array(z.string().trim().min(1).max(160)).max(80).optional(),
}).strict();
export type PublicSpecifications = z.infer<typeof publicSpecificationsSchema>;
