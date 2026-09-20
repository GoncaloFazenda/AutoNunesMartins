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

  it('omits commission entirely when not provided (zero echoed back)', () => {
    const r = computeSaleFigures({
      salePrice: 12300,
      purchasePrice: 10000,
      expensesTotal: 0,
    });
    expect(r.commission.toFixed(2)).toBe('0.00');
    // realProfit unchanged when commission = 0
    expect(r.realProfit.toFixed(2)).toBe('1869.92');
  });

  it('adds commission on top of net margin after VAT', () => {
    const r = computeSaleFigures({
      salePrice: 12300,
      purchasePrice: 10000,
      expensesTotal: 0,
      commission: 500,
    });
    expect(r.margin.toFixed(2)).toBe('2300.00');
    expect(r.vatAmount.toFixed(2)).toBe('430.08');
    expect(r.commission.toFixed(2)).toBe('500.00');
    // (margin - vat) + commission = 1869.92 + 500 = 2369.92
    expect(r.realProfit.toFixed(2)).toBe('2369.92');
  });

  it('commission can soften (or offset) a loss', () => {
    const r = computeSaleFigures({
      salePrice: 9000,
      purchasePrice: 10000,
      expensesTotal: 500,
      commission: 800,
    });
    expect(r.margin.toFixed(2)).toBe('-1500.00');
    expect(r.vatAmount.toFixed(2)).toBe('0.00');
    expect(r.commission.toFixed(2)).toBe('800.00');
    // -1500 + 800 = -700 (still a loss, but smaller)
    expect(r.realProfit.toFixed(2)).toBe('-700.00');
  });

  it('accepts string commission inputs and rounds half-up to 2dp', () => {
    const r = computeSaleFigures({
      salePrice: 12300,
      purchasePrice: 10000,
      expensesTotal: 0,
      commission: '250.555',
    });
    expect(r.commission.toFixed(2)).toBe('250.56');
    expect(r.realProfit.toFixed(2)).toBe('2120.48');
  });

  describe('buyerType = COMERCIANTE (B2B, no VAT discriminated)', () => {
    it('zeroes VAT and keeps the full margin as real profit', () => {
      const r = computeSaleFigures({
        salePrice: 18000,
        purchasePrice: 15000,
        expensesTotal: 500,
        buyerType: 'COMERCIANTE',
      });
      expect(r.margin.toFixed(2)).toBe('2500.00');
      expect(r.vatAmount.toFixed(2)).toBe('0.00');
      expect(r.realProfit.toFixed(2)).toBe('2500.00');
    });

    it('still folds commission on top of the full margin', () => {
      const r = computeSaleFigures({
        salePrice: 18000,
        purchasePrice: 15000,
        expensesTotal: 500,
        commission: 300,
        buyerType: 'COMERCIANTE',
      });
      expect(r.margin.toFixed(2)).toBe('2500.00');
      expect(r.vatAmount.toFixed(2)).toBe('0.00');
      expect(r.commission.toFixed(2)).toBe('300.00');
      expect(r.realProfit.toFixed(2)).toBe('2800.00');
    });

    it('treats a negative-margin B2B sale the same as a particular loss', () => {
      const r = computeSaleFigures({
        salePrice: 9000,
        purchasePrice: 10000,
        expensesTotal: 500,
        buyerType: 'COMERCIANTE',
      });
      expect(r.margin.toFixed(2)).toBe('-1500.00');
      expect(r.vatAmount.toFixed(2)).toBe('0.00');
      expect(r.realProfit.toFixed(2)).toBe('-1500.00');
    });

    it('PARTICULAR default is unchanged when buyerType is omitted', () => {
      const r = computeSaleFigures({
        salePrice: 18000,
        purchasePrice: 15000,
        expensesTotal: 500,
      });
      expect(r.margin.toFixed(2)).toBe('2500.00');
      // 2500 × 23 / 123 = 467.479…  → 467.48 half-up
      expect(r.vatAmount.toFixed(2)).toBe('467.48');
      expect(r.realProfit.toFixed(2)).toBe('2032.52');
    });
  });

  // Trade-ins do NOT enter `computeSaleFigures`. The PT margin VAT scheme
  // (art. 308.º CIVA) taxes the dealer's sale margin regardless of how the
  // customer paid (cash, financing, or partly with their old car). The
  // trade-in is its own deal — recorded as a separate purchase that lands
  // in stock — and its profit/loss only realises when that car is later
  // resold. The test below freezes that contract so a future regression
  // that tries to abate the allowance again gets caught.
  describe('trade-in does not affect margin/VAT', () => {
    it('matches a pure-cash sale: trade-in is a parallel transaction, not a discount', () => {
      // Cliente: 15.000 €, viatura comprada por 10.000 €.
      // Caso A: pagamento integral em dinheiro.
      // Caso B: 11.000 € em dinheiro + 4.000 € em retoma.
      // Ambos os casos devem dar a MESMA margem/IVA/lucro porque a retoma
      // é uma compra separada que entra no stock a 4.000 € e só dá P&L na
      // próxima venda. A função não recebe sequer o valor da retoma.
      const cash = computeSaleFigures({
        salePrice: 15000,
        purchasePrice: 10000,
        expensesTotal: 0,
      });
      // Mesma chamada — não há parâmetro `tradeInAllowance` a passar.
      // Esta segunda invocação só existe para documentar que não há
      // mudança nos números esperados quando há retoma envolvida.
      const withTradeIn = computeSaleFigures({
        salePrice: 15000,
        purchasePrice: 10000,
        expensesTotal: 0,
      });
      expect(withTradeIn.margin.toFixed(2)).toBe(cash.margin.toFixed(2));
      expect(withTradeIn.vatAmount.toFixed(2)).toBe(cash.vatAmount.toFixed(2));
      expect(withTradeIn.realProfit.toFixed(2)).toBe(cash.realProfit.toFixed(2));
      // Numbers we care about, frozen here as the canonical answer:
      // 5000 × 23/123 = 934.9593… → 934.96 half-up; profit 4065.04.
      expect(cash.margin.toFixed(2)).toBe('5000.00');
      expect(cash.vatAmount.toFixed(2)).toBe('934.96');
      expect(cash.realProfit.toFixed(2)).toBe('4065.04');
    });
  });
});
