import { Prisma } from '@prisma/client';
import { prisma } from '../../db.js';
import { appSettings } from '../data/appSettings.js';
import { createSignedReadUrls } from '../data/storage.js';
import { logger } from '../../logger.js';

interface MonthlyKpi {
  current: string;
  previous: string;
  deltaPct: number | null;
}

export interface DashboardKpis {
  vendasMes: { count: number; previousCount: number; deltaPct: number | null };
  faturacaoMes: MonthlyKpi;
  lucroMes: MonthlyKpi;
  /**
   * Sum of intermediation commissions (e.g. financing referrals) booked on
   * sales in the period. VAT-exempt under art. 9.º, 27.º, a) CIVA — already
   * folded into `lucroMes`, surfaced separately so the dashboard can show
   * how much of the bottom line depends on credit referrals.
   */
  comissoesMes: MonthlyKpi;
  margemMedia: { current: number | null; previous: number | null; deltaPct: number | null };
  /** 6-point sparkline trends for the last 6 months (oldest first). */
  sparklines: {
    vendas: number[];
    faturacao: number[];
    lucro: number[];
    comissoes: number[];
    margem: number[];
  };
}

export interface SalesChartData {
  months: string[];
  sold: number[];
  revenue: number[];
  ytdSold: number;
  ytdRevenue: string;
  ytdAvgMarginPct: number | null;
}

export interface BestSeller {
  rank: number;
  brand: string;
  model: string;
  count: number;
}

export interface StockAgedRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string | null;
  mileage: number;
  salePrice: string | null;
  thumbnailUrl: string | null;
  daysInStock: number;
}

export interface TodayTaskRow {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  isOverdue: boolean;
}

export interface RecentActivityRow {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string } | null;
}

export interface SmartAlerts {
  stockAged: number;
  tasksDueOrOverdue: number;
  remindersToday: number;
}

export interface DashboardPayload {
  kpis: DashboardKpis;
  salesChart: SalesChartData;
  bestSellers: BestSeller[];
  stockAged: StockAgedRow[];
  todayTasks: TodayTaskRow[];
  recentActivity: RecentActivityRow[];
  alerts: SmartAlerts;
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MS_PER_DAY = 86_400_000;

function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
function endOfToday(): Date {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  return t;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

interface MonthlyBucket {
  count: number;
  revenue: number;
  profit: number;
  commission: number;
}

/**
 * Single SQL roundtrip that returns aggregates for the last 12 months.
 * Replaces what used to be ~18 separate Prisma queries (12 for the chart,
 * 6 for sparklines, 2 KPI period queries).
 */
async function loadMonthlyBuckets(now: Date): Promise<MonthlyBucket[]> {
  const earliestMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  interface Row {
    month: Date;
    sold: bigint;
    revenue: Prisma.Decimal | null;
    profit: Prisma.Decimal | null;
    commission: Prisma.Decimal | null;
  }

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      date_trunc('month', "saleDate")::timestamp AS month,
      COUNT(*)::bigint                            AS sold,
      SUM("salePrice")                            AS revenue,
      SUM("realProfit")                           AS profit,
      SUM("commission")                           AS commission
    FROM "Sale"
    WHERE "saleDate" >= ${earliestMonth}
    GROUP BY date_trunc('month', "saleDate")
    ORDER BY month ASC
  `;

  const byKey = new Map<string, MonthlyBucket>();
  for (const r of rows) {
    const k = `${r.month.getFullYear()}-${String(r.month.getMonth()).padStart(2, '0')}`;
    byKey.set(k, {
      count: Number(r.sold),
      revenue: r.revenue ? Number(r.revenue.toString()) : 0,
      profit: r.profit ? Number(r.profit.toString()) : 0,
      commission: r.commission ? Number(r.commission.toString()) : 0,
    });
  }

  // Materialise 12 contiguous months with zeros where no rows existed
  const buckets: MonthlyBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    buckets.push(byKey.get(k) ?? { count: 0, revenue: 0, profit: 0, commission: 0 });
  }
  return buckets;
}

function buildKpis(buckets: MonthlyBucket[]): DashboardKpis {
  const empty = { count: 0, revenue: 0, profit: 0, commission: 0 };
  const cur = buckets[11] ?? empty;
  const prev = buckets[10] ?? empty;

  const curMargin =
    cur.revenue > 0 ? (cur.profit / cur.revenue) * 100 : cur.count > 0 ? 0 : null;
  const prevMargin =
    prev.revenue > 0 ? (prev.profit / prev.revenue) * 100 : prev.count > 0 ? 0 : null;

  const last6 = buckets.slice(6); // oldest → newest

  return {
    vendasMes: {
      count: cur.count,
      previousCount: prev.count,
      deltaPct: pctDelta(cur.count, prev.count),
    },
    faturacaoMes: {
      current: cur.revenue.toFixed(2),
      previous: prev.revenue.toFixed(2),
      deltaPct: pctDelta(cur.revenue, prev.revenue),
    },
    lucroMes: {
      current: cur.profit.toFixed(2),
      previous: prev.profit.toFixed(2),
      deltaPct: pctDelta(cur.profit, prev.profit),
    },
    comissoesMes: {
      current: cur.commission.toFixed(2),
      previous: prev.commission.toFixed(2),
      deltaPct: pctDelta(cur.commission, prev.commission),
    },
    margemMedia: {
      current: curMargin,
      previous: prevMargin,
      deltaPct:
        curMargin !== null && prevMargin !== null && prevMargin !== 0
          ? curMargin - prevMargin
          : null,
    },
    sparklines: {
      vendas: last6.map((b) => b.count),
      faturacao: last6.map((b) => b.revenue),
      lucro: last6.map((b) => b.profit),
      comissoes: last6.map((b) => b.commission),
      margem: last6.map((b) => (b.revenue > 0 ? (b.profit / b.revenue) * 100 : 0)),
    },
  };
}

function buildSalesChart(buckets: MonthlyBucket[], now: Date): SalesChartData {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return MONTHS_PT[d.getMonth()] ?? '';
  });
  const sold = buckets.map((b) => b.count);
  const revenue = buckets.map((b) => b.revenue);
  const ytdSold = sold.reduce((a, b) => a + b, 0);
  const ytdRevenue = revenue.reduce((a, b) => a + b, 0);
  const ytdProfit = buckets.reduce((a, b) => a + b.profit, 0);
  return {
    months,
    sold,
    revenue,
    ytdSold,
    ytdRevenue: ytdRevenue.toFixed(2),
    ytdAvgMarginPct: ytdRevenue > 0 ? (ytdProfit / ytdRevenue) * 100 : null,
  };
}

async function loadBestSellers(now: Date): Promise<BestSeller[]> {
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  interface Row {
    brand: string;
    model: string;
    count: bigint;
  }

  // Single SQL groupBy — replaces the previous fetch-all-then-tally pattern.
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT v."brand", v."model", COUNT(*)::bigint AS count
    FROM "Sale" s
    JOIN "Vehicle" v ON v."id" = s."vehicleId"
    WHERE s."saleDate" >= ${twelveMonthsAgo}
    GROUP BY v."brand", v."model"
    ORDER BY count DESC
    LIMIT 4
  `;

  return rows.map((r, i) => ({
    rank: i + 1,
    brand: r.brand,
    model: r.model,
    count: Number(r.count),
  }));
}

async function loadStockAged(now: Date): Promise<StockAgedRow[]> {
  const thresholdDays = await appSettings.stockAgingDays();
  const cutoff = new Date(now.getTime() - thresholdDays * MS_PER_DAY);
  const rows = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE', acquisitionDate: { lt: cutoff } },
    orderBy: { acquisitionDate: 'asc' },
    take: 6,
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      vin: true,
      licensePlate: true,
      mileage: true,
      salePrice: true,
      acquisitionDate: true,
      photos: true,
    },
  });

  const paths = rows.map((r) => r.photos[0]).filter((p): p is string => Boolean(p));
  let signed = new Map<string, string>();
  if (paths.length > 0) {
    try {
      signed = await createSignedReadUrls(paths, 3600);
    } catch (err) {
      logger.warn({ err }, 'Failed to batch-sign stock-aged thumbnails');
    }
  }

  return rows.map((r) => ({
    id: r.id,
    brand: r.brand,
    model: r.model,
    year: r.year,
    vin: r.vin,
    licensePlate: r.licensePlate,
    mileage: r.mileage,
    salePrice: r.salePrice?.toString() ?? null,
    thumbnailUrl: r.photos[0] ? (signed.get(r.photos[0]) ?? null) : null,
    daysInStock: Math.floor((now.getTime() - r.acquisitionDate.getTime()) / MS_PER_DAY),
  }));
}

async function loadTodayTasks(actorId: string): Promise<TodayTaskRow[]> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  // Surface anything the user can act on today:
  //   - In progress (always, regardless of dates)
  //   - To do with due today, overdue, or a reminder today
  // Same visibility rule as the rest of the task system: own or unassigned.
  const rows = await prisma.task.findMany({
    where: {
      status: { not: 'DONE' },
      AND: [
        { OR: [{ assigneeId: null }, { assigneeId: actorId }] },
        {
          OR: [
            { status: 'IN_PROGRESS' },
            { dueDate: { gte: todayStart, lte: todayEnd } },
            { dueDate: { lt: todayStart } },
            { reminderDate: { gte: todayStart, lte: todayEnd } },
          ],
        },
      ],
    },
    // Over-fetch then sort in-memory: status enum doesn't have a natural order
    // suitable for "in-progress first" in Prisma; doing it client-side is cheap.
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    take: 15,
    include: { assignee: { select: { id: true, name: true } } },
  });

  const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  rows.sort((a, b) => {
    // IN_PROGRESS first
    const aIp = a.status === 'IN_PROGRESS' ? 0 : 1;
    const bIp = b.status === 'IN_PROGRESS' ? 0 : 1;
    if (aIp !== bIp) return aIp - bIp;
    // Then by priority
    const pa = PRIORITY_RANK[a.priority] ?? 99;
    const pb = PRIORITY_RANK[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    // Then by due date (overdue / earliest first)
    const da = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const db = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
  const top = rows.slice(0, 5);

  return top.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate?.toISOString() ?? null,
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
    isOverdue: Boolean(t.dueDate && t.dueDate < todayStart),
  }));
}

async function loadRecentActivity(): Promise<RecentActivityRow[]> {
  const rows = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { actor: { select: { id: true, name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    entityType: r.entityType,
    entityId: r.entityId,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    actor: r.actor ? { id: r.actor.id, name: r.actor.name } : null,
  }));
}

async function loadAlerts(actorId: string, now: Date): Promise<SmartAlerts> {
  const thresholdDays = await appSettings.stockAgingDays();
  const cutoff = new Date(now.getTime() - thresholdDays * MS_PER_DAY);
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const [stockAged, tasksDueOrOverdue, remindersToday] = await Promise.all([
    prisma.vehicle.count({
      where: { status: 'AVAILABLE', acquisitionDate: { lt: cutoff } },
    }),
    prisma.task.count({
      where: {
        status: { not: 'DONE' },
        OR: [{ assigneeId: null }, { assigneeId: actorId }],
        AND: [
          {
            OR: [
              { dueDate: { gte: todayStart, lte: todayEnd } },
              { dueDate: { lt: todayStart } },
            ],
          },
        ],
      },
    }),
    prisma.task.count({
      where: {
        status: { not: 'DONE' },
        OR: [{ assigneeId: null }, { assigneeId: actorId }],
        reminderDate: { gte: todayStart, lte: todayEnd },
      },
    }),
  ]);
  return { stockAged, tasksDueOrOverdue, remindersToday };
}

export async function loadDashboard(actorId: string): Promise<DashboardPayload> {
  const now = new Date();

  // Parallel fan-out — about 6 queries total instead of the previous ~25.
  const [buckets, bestSellers, stockAged, todayTasks, recentActivity, alerts] = await Promise.all([
    loadMonthlyBuckets(now),
    loadBestSellers(now),
    loadStockAged(now),
    loadTodayTasks(actorId),
    loadRecentActivity(),
    loadAlerts(actorId, now),
  ]);

  const kpis = buildKpis(buckets);
  const salesChart = buildSalesChart(buckets, now);

  return { kpis, salesChart, bestSellers, stockAged, todayTasks, recentActivity, alerts };
}
