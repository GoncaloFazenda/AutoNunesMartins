import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface ProfitByVehicleRow {
  saleId: string;
  saleDate: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string | null;
  };
  customer: { id: string; name: string; nif: string };
  purchasePrice: string;
  salePrice: string;
  expensesTotal: string;
  vatAmount: string;
  commission: string;
  realProfit: string;
  marginPct: number;
}

export interface ProfitByVehicleResponse {
  items: ProfitByVehicleRow[];
  totals: {
    count: number;
    revenue: string;
    vat: string;
    expenses: string;
    commission: string;
    profit: string;
    avgMarginPct: number;
  };
}

export interface ProfitByVehicleParams {
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'saleDate' | 'realProfit' | 'salePrice' | 'marginPct';
  sortDir?: 'asc' | 'desc';
}

function toQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const financialApi = {
  profitByVehicle(event: Ev, params: ProfitByVehicleParams = {}): Promise<ProfitByVehicleResponse> {
    return apiJson(
      event,
      `/api/financial/profit-by-vehicle${toQuery(params as Record<string, unknown>)}`,
    );
  },
};
