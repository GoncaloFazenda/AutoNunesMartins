import type { CustomerCreate } from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  nif: string;
  notes: string | null;
  lastContactDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { sales: number };
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerDetailSale {
  id: string;
  salePrice: string;
  vatAmount: string;
  realProfit: string;
  saleDate: string;
  deliveryDate: string | null;
  deliveryStatus: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string | null;
    photos: string[];
  };
}

export interface CustomerDetailResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  nif: string;
  notes: string | null;
  lastContactDate: string | null;
  createdAt: string;
  updatedAt: string;
  sales: CustomerDetailSale[];
}

export interface CustomerListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'lastContactDate';
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

export const customersApi = {
  list(event: Ev, params: CustomerListParams = {}): Promise<CustomerListResponse> {
    return apiJson<CustomerListResponse>(
      event,
      `/api/customers${toQuery(params as Record<string, unknown>)}`,
    );
  },
  get(event: Ev, id: string): Promise<CustomerDetailResponse> {
    return apiJson<CustomerDetailResponse>(event, `/api/customers/${id}`);
  },
  create(event: Ev, body: CustomerCreate): Promise<{ id: string }> {
    return apiJson(event, '/api/customers', { method: 'POST', body: JSON.stringify(body) });
  },
  update(event: Ev, id: string, body: Partial<CustomerCreate>): Promise<{ ok: true }> {
    return apiJson(event, `/api/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete(event: Ev, id: string): Promise<{ ok: true }> {
    return apiJson(event, `/api/customers/${id}`, { method: 'DELETE' });
  },
};
