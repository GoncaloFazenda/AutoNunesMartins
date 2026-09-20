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

export type EntityType = 'vehicle' | 'sale' | 'task' | 'customer' | 'expense';

export interface EntityScopePair {
  type: EntityType;
  id: string;
}

export interface ActivityListParams {
  actorId?: string;
  /** Comma-separated ActivityType keys (e.g. "VEHICLE_ADDED,SALE_CREATED") */
  type?: string;
  /**
   * Single entity type, or a comma-separated list. Used together with
   * `entityId` to scope to one instance, or with `scope` for multi-entity
   * timelines (e.g. a sale + its associated vehicle).
   */
  entityType?: EntityType | string;
  entityId?: string;
  /**
   * Multi-entity scope. When set, takes precedence over entityType+entityId
   * — the backend ORs the listed (type, id) pairs.
   */
  scope?: EntityScopePair[];
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
    // `scope` is JSON-encoded so the backend can rehydrate the array of pairs.
    if (k === 'scope' && Array.isArray(v)) {
      usp.set(k, JSON.stringify(v));
      continue;
    }
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
