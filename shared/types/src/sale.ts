import { z } from 'zod';
import { DeliveryStatusEnum } from './enums.js';
import { moneySchema } from './decimal.js';

export const saleCreateSchema = z.object({
  vehicleId: z.string().min(1),
  customerId: z.string().min(1),
  salePrice: moneySchema,
  saleDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
  deliveryStatus: DeliveryStatusEnum.default('PENDING'),
});
export type SaleCreate = z.infer<typeof saleCreateSchema>;

export const saleUpdateSchema = saleCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type SaleUpdate = z.infer<typeof saleUpdateSchema>;

export const saleFiguresSchema = z.object({
  salePrice: moneySchema,
  purchasePrice: moneySchema,
  expensesTotal: moneySchema,
  margin: moneySchema,
  vatAmount: moneySchema,
  realProfit: moneySchema,
});
export type SaleFigures = z.infer<typeof saleFiguresSchema>;
