import { z } from 'zod';
import { FuelEnum, VehicleStatusEnum } from './enums.js';
import { moneySchema } from './decimal.js';

export const pendingDocFlagsSchema = z.object({
  financing: z.boolean().default(false),
  imt: z.boolean().default(false),
  registration: z.boolean().default(false),
  docs: z.boolean().default(false),
});
export type PendingDocFlags = z.infer<typeof pendingDocFlagsSchema>;

const CURRENT_YEAR = new Date().getFullYear();

export const vehicleCreateSchema = z.object({
  brand: z.string().min(1, 'Marca obrigatória').max(60),
  model: z.string().min(1, 'Modelo obrigatório').max(80),
  year: z.coerce
    .number()
    .int()
    .min(1950, 'Ano mínimo: 1950')
    .max(CURRENT_YEAR + 1, `Ano máximo: ${CURRENT_YEAR + 1}`),
  fuel: FuelEnum,
  mileage: z.coerce.number().int().min(0, 'Quilometragem não pode ser negativa').max(2_000_000),
  vin: z
    .string()
    .trim()
    .length(17, 'VIN deve ter 17 caracteres')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN inválido (sem I, O, Q)'),
  purchasePrice: moneySchema,
  salePrice: moneySchema.optional(),
  status: VehicleStatusEnum.default('AVAILABLE'),
  acquisitionDate: z.coerce.date(),
  description: z.string().max(2000).optional(),
  pendingDocFlags: pendingDocFlagsSchema.default({
    financing: false,
    imt: false,
    registration: false,
    docs: false,
  }),
});
export type VehicleCreate = z.infer<typeof vehicleCreateSchema>;

export const vehicleUpdateSchema = vehicleCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type VehicleUpdate = z.infer<typeof vehicleUpdateSchema>;

export const vehicleFilterSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  fuel: FuelEnum.optional(),
  yearMin: z.coerce.number().int().optional(),
  yearMax: z.coerce.number().int().optional(),
  mileageMin: z.coerce.number().int().optional(),
  mileageMax: z.coerce.number().int().optional(),
  status: VehicleStatusEnum.optional(),
  q: z.string().optional(),
});
export type VehicleFilter = z.infer<typeof vehicleFilterSchema>;
