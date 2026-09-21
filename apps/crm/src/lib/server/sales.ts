import type { BuyerType, DeliveryStatus, Fuel, SaleCreate, TradeInDisposition } from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface SaleListItem {
  id: string;
  saleDate: string;
  salePrice: string;
  purchasePrice: string;
  expensesTotal: string;
  vatAmount: string;
  commission: string;
  realProfit: string;
  marginPct: number;
  deliveryStatus: DeliveryStatus;
  deliveryDate: string | null;
  /** True when this sale captured a trade-in; drives the `↔` chip on /vendas. */
  hasTradeIn: boolean;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string | null;
  };
  customer: {
    id: string;
    name: string;
    nif: string;
  };
}

export interface SaleListTotals {
  count: number;
  revenue: string;
  vat: string;
  expenses: string;
  commission: string;
  profit: string;
  avgMarginPct: number;
}

export interface SaleListResponse {
  items: SaleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: SaleListTotals;
}

export interface SaleListParams {
  q?: string;
  deliveryStatus?: DeliveryStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'saleDate' | 'salePrice' | 'realProfit' | 'marginPct';
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

export interface SaleDetailResponse {
  id: string;
  vehicleId: string;
  customerId: string;
  salePrice: string;
  vatAmount: string;
  commission: string;
  buyerType: BuyerType;
  realProfit: string;
  saleDate: string;
  deliveryDate: string | null;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string | null;
    mileage: number;
    fuel: string;
    purchasePrice: string;
    photos: string[];
    status: string;
    /**
     * Set when the sold vehicle ITSELF entered the dealer's stock as a
     * customer trade-in earlier. Carries the originating sale's realProfit
     * so the page can show "lucro consolidado" = this sale + the parent.
     */
    sourceTradeIn: {
      id: string;
      allowanceValue: string;
      sale: {
        id: string;
        saleDate: string;
        realProfit: string;
        customer: { id: string; name: string };
        vehicle: { id: string; brand: string; model: string; year: number };
      };
    } | null;
  };
  customer: {
    id: string;
    name: string;
    nif: string;
    phone: string;
    email: string | null;
  };
  /**
   * Present when the customer handed over a car as partial payment. When
   * `disposition === 'STOCK'`, `resultingVehicleId` points at the newly-
   * created Vehicle row in inventory; SCRAP keeps it null.
   */
  tradeIn: {
    id: string;
    brand: string;
    model: string;
    year: number;
    fuel: Fuel;
    mileage: number;
    vin: string | null;
    licensePlate: string | null;
    allowanceValue: string;
    disposition: TradeInDisposition;
    resultingVehicleId: string | null;
    notes: string | null;
  } | null;
}

export interface CreateSaleResponse {
  id: string;
  figures: { margin: string; vatAmount: string; commission: string; realProfit: string };
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const salesApi = {
  list(event: Ev, params: SaleListParams = {}): Promise<SaleListResponse> {
    return apiJson<SaleListResponse>(
      event,
      `/api/sales${toQuery(params as Record<string, unknown>)}`,
    );
  },
  create(event: Ev, body: SaleCreate): Promise<CreateSaleResponse> {
    return apiJson(event, '/api/sales', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  get(event: Ev, id: string): Promise<SaleDetailResponse> {
    return apiJson(event, `/api/sales/${id}`);
  },
  updateDelivery(
    event: Ev,
    id: string,
    body: { deliveryStatus: DeliveryStatus; deliveryDate?: string | null },
  ): Promise<{ ok: true }> {
    return apiJson(event, `/api/sales/${id}/delivery`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};
