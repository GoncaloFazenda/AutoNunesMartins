import type { VehicleCreate, VehicleFilter, VehicleStatus, Fuel } from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface VehicleListItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuel: Fuel;
  mileage: number;
  vin: string;
  purchasePrice: string;
  salePrice: string | null;
  status: VehicleStatus;
  acquisitionDate: string;
  soldDate: string | null;
  photos: string[];
  pendingDocFlags: Record<string, boolean>;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  items: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VehicleExpenseDto {
  id: string;
  vehicleId: string;
  category: string;
  description: string;
  amount: string;
  date: string;
  createdAt: string;
}

export interface VehicleDetailResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuel: Fuel;
  mileage: number;
  vin: string;
  purchasePrice: string;
  salePrice: string | null;
  status: VehicleStatus;
  acquisitionDate: string;
  soldDate: string | null;
  description: string | null;
  photos: string[];
  pendingDocFlags: { financing: boolean; imt: boolean; registration: boolean; docs: boolean };
  createdAt: string;
  updatedAt: string;
  expenses: VehicleExpenseDto[];
  expensesTotal: string;
  figures: { margin: string; vatAmount: string; realProfit: string } | null;
  sale: {
    id: string;
    salePrice: string;
    vatAmount: string;
    realProfit: string;
    saleDate: string;
    deliveryStatus: string;
    customer: { id: string; name: string; nif: string };
  } | null;
}

export type VehicleListParams = VehicleFilter & {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'acquisitionDate' | 'salePrice' | 'purchasePrice' | 'mileage' | 'year';
  sortDir?: 'asc' | 'desc';
};

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

export const vehiclesApi = {
  list(event: Ev, params: VehicleListParams = {}): Promise<VehicleListResponse> {
    return apiJson<VehicleListResponse>(event, `/api/vehicles${toQuery(params)}`);
  },
  get(event: Ev, id: string): Promise<VehicleDetailResponse> {
    return apiJson<VehicleDetailResponse>(event, `/api/vehicles/${id}`);
  },
  create(event: Ev, body: VehicleCreate): Promise<{ id: string }> {
    return apiJson<{ id: string }>(event, '/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update(event: Ev, id: string, body: Partial<VehicleCreate>): Promise<{ ok: true }> {
    return apiJson(event, `/api/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete(event: Ev, id: string): Promise<{ ok: true }> {
    return apiJson(event, `/api/vehicles/${id}`, { method: 'DELETE' });
  },
  signedPhotos(event: Ev, id: string): Promise<{ photos: { path: string; url: string }[] }> {
    return apiJson(event, `/api/vehicles/${id}/photos/signed`);
  },
};
