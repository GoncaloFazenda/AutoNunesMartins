import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface AppSettingItem {
  key: string;
  label: string;
  description: string;
  value: number | string | boolean;
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const settingsApi = {
  list(event: Ev): Promise<{ items: AppSettingItem[] }> {
    return apiJson(event, '/api/settings');
  },
  update(event: Ev, key: string, value: unknown): Promise<{ ok: true; value: unknown }> {
    return apiJson(event, `/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },
};
