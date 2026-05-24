import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface SaleFiguresInput {
  salePrice: Decimal.Value;
  purchasePrice: Decimal.Value;
  expensesTotal: Decimal.Value;
  /**
   * Manual extra income (e.g. financing-referral commission paid by a
   * credit institution). Added on top of the vehicle's net margin and is
   * NOT subject to the dealer-margin VAT regime — these are intermediation
   * services with a separate VAT treatment, and the user enters the net
   * amount they actually pocket. Optional; defaults to 0.
   */
  commission?: Decimal.Value;
}

export interface SaleFigures {
  margin: Decimal;
  vatAmount: Decimal;
  /** Echoed back so callers can render it as its own breakdown line. */
  commission: Decimal;
  realProfit: Decimal;
}

/**
 * Portuguese used-car dealer margin scheme + per-sale commission:
 *   margin     = salePrice − purchasePrice − expensesTotal      (VAT-inclusive)
 *   vatAmount  = margin × 23 / 123     (extracted from positive margin)
 *   realProfit = (margin − vatAmount) + commission
 *
 * When margin <= 0 there is no VAT to collect; commission can still
 * offset (or compound) the loss.
 */
export function computeSaleFigures(input: SaleFiguresInput): SaleFigures {
  const salePrice = new Decimal(input.salePrice);
  const purchasePrice = new Decimal(input.purchasePrice);
  const expensesTotal = new Decimal(input.expensesTotal);
  const commission = new Decimal(input.commission ?? 0).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP,
  );

  const margin = salePrice.minus(purchasePrice).minus(expensesTotal);

  if (margin.lte(0)) {
    const realProfit = margin
      .plus(commission)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    return {
      margin: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      vatAmount: new Decimal(0).toDecimalPlaces(2),
      commission,
      realProfit,
    };
  }

  const vatAmount = margin.mul(23).div(123).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const realProfit = margin
    .minus(vatAmount)
    .plus(commission)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    margin: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    vatAmount,
    commission,
    realProfit,
  };
}
