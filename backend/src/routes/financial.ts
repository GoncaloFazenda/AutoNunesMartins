import Decimal from 'decimal.js';
import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const profitQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z
    .enum(['saleDate', 'realProfit', 'salePrice', 'marginPct'])
    .default('saleDate'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

router.get('/profit-by-vehicle', requireUser, async (req: AuthedRequest, res: Response) => {
  const parsed = profitQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    return;
  }
  const { dateFrom, dateTo, sortBy, sortDir } = parsed.data;

  const sales = await prisma.sale.findMany({
    where: {
      ...(dateFrom || dateTo
        ? {
            saleDate: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    },
    include: {
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
          purchasePrice: true,
          expenses: { select: { amount: true } },
        },
      },
      customer: { select: { id: true, name: true, nif: true } },
    },
  });

  const rows = sales.map((s) => {
    const expensesTotal = s.vehicle.expenses.reduce(
      (acc, e) => acc.plus(e.amount.toString()),
      new Decimal(0),
    );
    const salePriceNum = Number(s.salePrice.toString());
    const realProfitNum = Number(s.realProfit.toString());
    const marginPct = salePriceNum > 0 ? (realProfitNum / salePriceNum) * 100 : 0;

    return {
      saleId: s.id,
      saleDate: s.saleDate.toISOString(),
      vehicle: {
        id: s.vehicle.id,
        brand: s.vehicle.brand,
        model: s.vehicle.model,
        year: s.vehicle.year,
        vin: s.vehicle.vin,
      },
      customer: { id: s.customer.id, name: s.customer.name, nif: s.customer.nif },
      purchasePrice: s.vehicle.purchasePrice.toString(),
      salePrice: s.salePrice.toString(),
      expensesTotal: expensesTotal.toFixed(2),
      vatAmount: s.vatAmount.toString(),
      realProfit: s.realProfit.toString(),
      marginPct,
    };
  });

  rows.sort((a, b) => {
    let av: number;
    let bv: number;
    switch (sortBy) {
      case 'saleDate':
        av = new Date(a.saleDate).getTime();
        bv = new Date(b.saleDate).getTime();
        break;
      case 'realProfit':
        av = Number(a.realProfit);
        bv = Number(b.realProfit);
        break;
      case 'salePrice':
        av = Number(a.salePrice);
        bv = Number(b.salePrice);
        break;
      case 'marginPct':
        av = a.marginPct;
        bv = b.marginPct;
        break;
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  // Totals (across the filtered set)
  let totalRevenue = new Decimal(0);
  let totalProfit = new Decimal(0);
  let totalVat = new Decimal(0);
  let totalExpenses = new Decimal(0);
  for (const r of rows) {
    totalRevenue = totalRevenue.plus(r.salePrice);
    totalProfit = totalProfit.plus(r.realProfit);
    totalVat = totalVat.plus(r.vatAmount);
    totalExpenses = totalExpenses.plus(r.expensesTotal);
  }
  const totalRevenueNum = Number(totalRevenue.toString());
  const totalProfitNum = Number(totalProfit.toString());
  const avgMarginPct = totalRevenueNum > 0 ? (totalProfitNum / totalRevenueNum) * 100 : 0;

  res.json({
    items: rows,
    totals: {
      count: rows.length,
      revenue: totalRevenue.toFixed(2),
      vat: totalVat.toFixed(2),
      expenses: totalExpenses.toFixed(2),
      profit: totalProfit.toFixed(2),
      avgMarginPct,
    },
  });
});

export default router;
