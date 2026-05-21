import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface SaleFiguresInput {
  salePrice: Decimal.Value;
  purchasePrice: Decimal.Value;
  expensesTotal: Decimal.Value;
}

export interface SaleFigures {
  margin: Decimal;
  vatAmount: Decimal;
  realProfit: Decimal;
}

/**
 * Portuguese used-car dealer margin scheme:
 *   margin = salePrice − purchasePrice − expensesTotal      (VAT-inclusive)
 *   vatAmount = margin × 23 / 123     (extracted from gross margin)
 *   realProfit = margin − vatAmount
 *
 * When margin <= 0 there is no VAT to collect; the loss is the realProfit.
 */
export function computeSaleFigures(input: SaleFiguresInput): SaleFigures {
  const salePrice = new Decimal(input.salePrice);
  const purchasePrice = new Decimal(input.purchasePrice);
  const expensesTotal = new Decimal(input.expensesTotal);

  const margin = salePrice.minus(purchasePrice).minus(expensesTotal);

  if (margin.lte(0)) {
    return {
      margin: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      vatAmount: new Decimal(0).toDecimalPlaces(2),
      realProfit: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    };
  }

  const vatAmount = margin.mul(23).div(123).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const realProfit = margin.minus(vatAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    margin: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    vatAmount,
    realProfit,
  };
}
