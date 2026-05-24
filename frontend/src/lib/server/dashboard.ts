import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface DashboardKpis {
  vendasMes: { count: number; previousCount: number; deltaPct: number | null };
  faturacaoMes: { current: string; previous: string; deltaPct: number | null };
  lucroMes: { current: string; previous: string; deltaPct: number | null };
  /**
   * Mirrors backend `comissoesMes` — sum of financing-referral commissions
   * booked on sales this month, vs. the previous month. Already part of
   * `lucroMes`; surfaced separately so the dashboard can show the share.
   */
  comissoesMes: { current: string; previous: string; deltaPct: number | null };
  margemMedia: { current: number | null; previous: number | null; deltaPct: number | null };
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

export interface FeaturedVehicleDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  mileage: number;
  vin: string;
  licensePlate: string | null;
  status: string;
  salePrice: string | null;
  purchasePrice: string;
  description: string | null;
  photoUrl: string | null;
  photoCount: number;
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const dashboardApi = {
  get(event: Ev): Promise<DashboardPayload> {
    return apiJson<DashboardPayload>(event, '/api/dashboard');
  },
  featuredVehicle(event: Ev): Promise<{ vehicle: FeaturedVehicleDto | null }> {
    return apiJson(event, '/api/dashboard/featured-vehicle');
  },
  setFeaturedVehicle(event: Ev, vehicleId: string | null): Promise<{ ok: true }> {
    return apiJson(event, '/api/dashboard/featured-vehicle', {
      method: 'PUT',
      body: JSON.stringify({ vehicleId }),
    });
  },
};
