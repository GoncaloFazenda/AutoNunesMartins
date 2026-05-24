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
  /**
   * Manual extra income for the sale. Typical use: a referral commission
   * paid by a credit institution when the customer financed the purchase
   * through them. Optional; defaults to "0" so existing callers keep
   * working without change.
   */
  commission: moneySchema.optional().default('0'),
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
  /**
   * Same `commission` value persisted on the Sale row, surfaced in figures
   * so callers can render it as its own line in the profit breakdown.
   */
  commission: moneySchema,
  realProfit: moneySchema,
});
export type SaleFigures = z.infer<typeof saleFiguresSchema>;
