import type {
  OpExpenseCategory,
  OperationalExpenseCreate,
  OperationalExpenseUpdate,
} from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface OperationalExpenseDto {
  id: string;
  category: OpExpenseCategory;
  description: string;
  amount: string;
  date: string;
  createdAt: string;
}

export interface OperationalExpenseListResponse {
  items: OperationalExpenseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalSum: string;
}

export interface OperationalExpenseListParams {
  category?: OpExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'amount' | 'category';
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

export const opExpensesApi = {
  list(event: Ev, params: OperationalExpenseListParams = {}): Promise<OperationalExpenseListResponse> {
    return apiJson(
      event,
      `/api/operational-expenses${toQuery(params as Record<string, unknown>)}`,
    );
  },
  create(event: Ev, body: OperationalExpenseCreate): Promise<{ id: string }> {
    return apiJson(event, '/api/operational-expenses', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  update(
    event: Ev,
    id: string,
    body: Omit<OperationalExpenseUpdate, 'id'>,
  ): Promise<{ ok: true }> {
    return apiJson(event, `/api/operational-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete(event: Ev, id: string): Promise<{ ok: true }> {
    return apiJson(event, `/api/operational-expenses/${id}`, { method: 'DELETE' });
  },
};
