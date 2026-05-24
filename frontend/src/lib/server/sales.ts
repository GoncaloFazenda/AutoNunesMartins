import type { DeliveryStatus, SaleCreate } from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface SaleDetailResponse {
  id: string;
  vehicleId: string;
  customerId: string;
  salePrice: string;
  vatAmount: string;
  commission: string;
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
  };
  customer: {
    id: string;
    name: string;
    nif: string;
    phone: string;
    email: string | null;
  };
}

export interface CreateSaleResponse {
  id: string;
  figures: { margin: string; vatAmount: string; commission: string; realProfit: string };
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const salesApi = {
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
