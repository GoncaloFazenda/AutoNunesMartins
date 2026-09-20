import { z } from 'zod';
import { BuyerTypeEnum, DeliveryStatusEnum, FuelEnum, TradeInDispositionEnum } from './enums.js';
import { moneySchema } from './decimal.js';
import { licensePlatePtSchema } from './vehicle.js';

const CURRENT_YEAR = new Date().getFullYear();

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

/**
 * A car the customer hands over as partial payment, recorded inline on the
 * sale-creation request. The backend persists it as a `TradeIn` row tied to
 * the new `Sale`, abates `allowanceValue` from the sale price before margin
 * is computed, and (when `disposition === 'STOCK'`) creates a fresh `Vehicle`
 * row in the dealer's inventory so the car can be re-sold later.
 *
 * VIN/plate are optional here (unlike a regular vehicle add) because the
 * dealer often takes the car in on paper before all docs are checked.
 */
export const tradeInCreateSchema = z
  .object({
    brand: z.string().trim().min(1, 'Marca obrigatória').max(60),
    model: z.string().trim().min(1, 'Modelo obrigatório').max(80),
    year: z.coerce
      .number()
      .int()
      .min(1950, 'Ano mínimo: 1950')
      .max(CURRENT_YEAR + 1, `Ano máximo: ${CURRENT_YEAR + 1}`),
    fuel: FuelEnum,
    mileage: z.coerce
      .number()
      .int()
      .min(0, 'Quilometragem não pode ser negativa')
      .max(2_000_000),
    licensePlate: z.preprocess(emptyToUndefined, licensePlatePtSchema.optional()),
    vin: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .length(17, 'VIN deve ter 17 caracteres')
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN inválido (sem I, O, Q)')
        .optional(),
    ),
    allowanceValue: moneySchema,
    disposition: TradeInDispositionEnum,
    notes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  })
  .superRefine((val, ctx) => {
    // VIN is required when the car enters stock — without it we can't create
    // a unique Vehicle row. For SCRAP the car never enters the inventory, so
    // VIN can stay blank (the dealer doesn't always copy it for cars that go
    // straight to the dismantler).
    if (val.disposition === 'STOCK' && !val.vin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vin'],
        message: 'VIN obrigatório quando a viatura entra no stock.',
      });
    }
  });
export type TradeInCreate = z.infer<typeof tradeInCreateSchema>;

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
  /**
   * Tax regime selector. PARTICULAR (default) applies the 23/123 margin
   * scheme; COMERCIANTE marks a B2B sale with no VAT discriminated by
   * the seller, so the full margin lands in `realProfit`.
   */
  buyerType: BuyerTypeEnum.default('PARTICULAR'),
  /**
   * Optional trade-in. When present, the allowance is subtracted from
   * `salePrice` for margin/VAT computation, and (STOCK disposition) a
   * new Vehicle row is auto-created tied back to this trade-in.
   */
  tradeIn: tradeInCreateSchema.optional(),
});
export type SaleCreate = z.infer<typeof saleCreateSchema>;

/** Shape returned by the API for an existing trade-in on a sale. */
export const tradeInSchema = z.object({
  id: z.string(),
  saleId: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  fuel: FuelEnum,
  mileage: z.number().int(),
  licensePlate: z.string().nullable(),
  vin: z.string().nullable(),
  allowanceValue: moneySchema,
  disposition: TradeInDispositionEnum,
  resultingVehicleId: z.string().nullable(),
  notes: z.string().nullable(),
});
export type TradeIn = z.infer<typeof tradeInSchema>;

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
