import { z } from 'zod';

const MONEY_REGEX = /^-?\d+(\.\d{1,2})?$/;

export const moneySchema = z
  .union([
    z.string().regex(MONEY_REGEX, 'Invalid money format'),
    z.number().refine((n) => Number.isFinite(n), 'Money must be finite'),
  ])
  .transform((v) => {
    if (typeof v === 'number') return v.toFixed(2);
    return v;
  });

export type MoneyString = z.infer<typeof moneySchema>;

export function formatMoneyEUR(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
