import { z } from 'zod';
import { OpExpenseCategoryEnum, VehicleExpenseCategoryEnum } from './enums.js';
import { moneySchema } from './decimal.js';

export const vehicleExpenseCreateSchema = z.object({
  vehicleId: z.string().min(1),
  category: VehicleExpenseCategoryEnum,
  description: z.string().min(1, 'Descrição obrigatória').max(240),
  amount: moneySchema,
  date: z.coerce.date(),
  confirmedOnSold: z.boolean().optional(),
});
export type VehicleExpenseCreate = z.infer<typeof vehicleExpenseCreateSchema>;

export const vehicleExpenseUpdateSchema = vehicleExpenseCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type VehicleExpenseUpdate = z.infer<typeof vehicleExpenseUpdateSchema>;

export const operationalExpenseCreateSchema = z.object({
  category: OpExpenseCategoryEnum,
  description: z.string().min(1, 'Descrição obrigatória').max(240),
  amount: moneySchema,
  date: z.coerce.date(),
});
export type OperationalExpenseCreate = z.infer<typeof operationalExpenseCreateSchema>;

export const operationalExpenseUpdateSchema = operationalExpenseCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type OperationalExpenseUpdate = z.infer<typeof operationalExpenseUpdateSchema>;
