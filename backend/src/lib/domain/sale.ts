import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type BuyerType = 'PARTICULAR' | 'COMERCIANTE';

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
  /**
   * Who is buying the car. Drives the VAT treatment:
   *   PARTICULAR  → margin VAT scheme 23/123 (default, historical behaviour)
   *   COMERCIANTE → B2B sale to a reseller; no VAT is withheld by the
   *                 dealer, so the full margin lands in `realProfit`.
   */
  buyerType?: BuyerType;
}

// NOTE on trade-ins: the trade-in allowance is intentionally NOT part of
// this calculation. A trade-in is a *separate* transaction — the dealer
// "buys" the customer's car at the allowance value (creating a new stock
// row at that cost) and "sells" their own car at the full price. The PT
// margin scheme (art. 308.º CIVA) taxes the dealer's sale margin
// (salePrice − purchasePrice), regardless of how the customer paid. Abating
// the allowance here would under-report IVA owed AND understate per-deal
// profit (the dealer didn't lose value — they swapped cash for inventory).
// The consolidated profit of the two-deal cycle is shown on the resale
// page of the trade-in car, which links back to this original sale via
// `Vehicle.sourceTradeIn`.

export interface SaleFigures {
  margin: Decimal;
  vatAmount: Decimal;
  /** Echoed back so callers can render it as its own breakdown line. */
  commission: Decimal;
  realProfit: Decimal;
}

/**
 * Two VAT regimes, picked per sale via `buyerType`:
 *
 *   margin     = salePrice − purchasePrice − expensesTotal   (VAT-inclusive)
 *
 *   PARTICULAR (default — Portuguese used-car dealer margin scheme):
 *     vatAmount  = margin × 23 / 123     (extracted from positive margin)
 *     realProfit = (margin − vatAmount) + commission
 *
 *   COMERCIANTE (B2B sale to another dealer — no VAT discriminated by the
 *   seller, the full margin is kept):
 *     vatAmount  = 0
 *     realProfit = margin + commission
 *
 * When margin <= 0 there is no VAT to collect regardless of regime;
 * commission can still offset (or compound) the loss.
 */
export function computeSaleFigures(input: SaleFiguresInput): SaleFigures {
  const salePrice = new Decimal(input.salePrice);
  const purchasePrice = new Decimal(input.purchasePrice);
  const expensesTotal = new Decimal(input.expensesTotal);
  const commission = new Decimal(input.commission ?? 0).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP,
  );
  const buyerType: BuyerType = input.buyerType ?? 'PARTICULAR';

  const margin = salePrice.minus(purchasePrice).minus(expensesTotal);

  if (margin.lte(0) || buyerType === 'COMERCIANTE') {
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
