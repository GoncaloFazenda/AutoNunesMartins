import { describe, expect, it } from 'vitest';
import { computeSaleFigures } from './sale.js';

describe('computeSaleFigures (PT margin scheme)', () => {
  it('extracts 23/123 VAT from a positive gross margin', () => {
    const r = computeSaleFigures({
      salePrice: 12300,
      purchasePrice: 10000,
      expensesTotal: 0,
    });
    expect(r.margin.toFixed(2)).toBe('2300.00');
    expect(r.vatAmount.toFixed(2)).toBe('430.08');
    expect(r.realProfit.toFixed(2)).toBe('1869.92');
    expect(r.vatAmount.plus(r.realProfit).toFixed(2)).toBe('2300.00');
  });

  it('subtracts vehicle expenses from the margin before VAT', () => {
    const r = computeSaleFigures({
      salePrice: 17950,
      purchasePrice: 14000,
      expensesTotal: 800,
    });
    expect(r.margin.toFixed(2)).toBe('3150.00');
    // 3150 × 23 / 123 = 589.0243…  → 589.02 half-up
    expect(r.vatAmount.toFixed(2)).toBe('589.02');
    expect(r.realProfit.toFixed(2)).toBe('2560.98');
    expect(r.vatAmount.plus(r.realProfit).toFixed(2)).toBe('3150.00');
  });

  it('returns zero VAT and negative profit when margin is negative', () => {
    const r = computeSaleFigures({
      salePrice: 9000,
      purchasePrice: 10000,
      expensesTotal: 500,
    });
    expect(r.margin.toFixed(2)).toBe('-1500.00');
    expect(r.vatAmount.toFixed(2)).toBe('0.00');
    expect(r.realProfit.toFixed(2)).toBe('-1500.00');
  });

  it('returns zero VAT and zero profit when margin is exactly zero', () => {
    const r = computeSaleFigures({
      salePrice: 10000,
      purchasePrice: 9500,
      expensesTotal: 500,
    });
    expect(r.margin.toFixed(2)).toBe('0.00');
    expect(r.vatAmount.toFixed(2)).toBe('0.00');
    expect(r.realProfit.toFixed(2)).toBe('0.00');
  });

  it('rounds VAT to 2dp half-up', () => {
    const r = computeSaleFigures({
      salePrice: 100,
      purchasePrice: 0,
      expensesTotal: 0,
    });
    expect(r.margin.toFixed(2)).toBe('100.00');
    expect(r.vatAmount.toFixed(2)).toBe('18.70');
    expect(r.realProfit.toFixed(2)).toBe('81.30');
  });

  it('accepts string decimal inputs (from Prisma Decimal)', () => {
    const r = computeSaleFigures({
      salePrice: '15500.50',
      purchasePrice: '12000.00',
      expensesTotal: '350.75',
    });
    expect(r.margin.toFixed(2)).toBe('3149.75');
    // 3149.75 × 23 / 123 = 588.9776…  → 588.98 half-up
    expect(r.vatAmount.toFixed(2)).toBe('588.98');
    expect(r.realProfit.toFixed(2)).toBe('2560.77');
  });
});
