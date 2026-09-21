import type { RequestEvent } from '@sveltejs/kit';
import type { VehicleExpenseCreate, VehicleExpenseUpdate } from '@anm/types';
import { apiJson } from './api.js';

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const expensesApi = {
  create(
    event: Ev,
    body: VehicleExpenseCreate,
    confirmedOnSold = false,
  ): Promise<{ id: string; saleRecomputed: boolean }> {
    return apiJson(event, `/api/vehicle-expenses?confirmedOnSold=${confirmedOnSold}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update(
    event: Ev,
    id: string,
    body: Omit<VehicleExpenseUpdate, 'id'>,
    confirmedOnSold = false,
  ): Promise<{ saleRecomputed: boolean }> {
    return apiJson(event, `/api/vehicle-expenses/${id}?confirmedOnSold=${confirmedOnSold}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete(event: Ev, id: string, confirmedOnSold = false): Promise<{ saleRecomputed: boolean }> {
    return apiJson(event, `/api/vehicle-expenses/${id}?confirmedOnSold=${confirmedOnSold}`, {
      method: 'DELETE',
    });
  },
};
