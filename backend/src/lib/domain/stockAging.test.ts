import { describe, expect, it } from 'vitest';
import { daysInStock, isStockAged } from './stockAging.js';

const NOW = new Date('2026-05-20T12:00:00Z');

describe('isStockAged', () => {
  it('returns false for non-AVAILABLE vehicles', () => {
    expect(
      isStockAged({
        status: 'SOLD',
        acquisitionDate: new Date('2020-01-01'),
        thresholdDays: 60,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('returns false when below threshold', () => {
    expect(
      isStockAged({
        status: 'AVAILABLE',
        acquisitionDate: new Date('2026-05-01T12:00:00Z'),
        thresholdDays: 60,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('returns true when above threshold', () => {
    expect(
      isStockAged({
        status: 'AVAILABLE',
        acquisitionDate: new Date('2026-01-01T12:00:00Z'),
        thresholdDays: 60,
        now: NOW,
      }),
    ).toBe(true);
  });
});

describe('daysInStock', () => {
  it('reports correct day count', () => {
    expect(daysInStock(new Date('2026-04-20T12:00:00Z'), NOW)).toBe(30);
  });
});
