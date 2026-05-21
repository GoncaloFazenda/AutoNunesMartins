import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface ActivityRow {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string } | null;
}

export interface ActivityListResult {
  items: ActivityRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ActivityListParams {
  actorId?: string;
  /** Comma-separated ActivityType keys (e.g. "VEHICLE_ADDED,SALE_CREATED") */
  type?: string;
  entityType?: 'vehicle' | 'sale' | 'task' | 'customer' | 'expense';
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

function toQuery(params: ActivityListParams): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const activityApi = {
  list(event: Ev, params: ActivityListParams = {}): Promise<ActivityListResult> {
    return apiJson<ActivityListResult>(event, `/api/activity${toQuery(params)}`);
  },
};
