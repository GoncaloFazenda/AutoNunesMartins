import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

/**
 * Proxy to the backend user list. Used by the QuickTaskBubble for the
 * assignee picker. Backend already caches; widget only fetches once per
 * panel-open lifecycle, so this stays cheap.
 */
export const GET: RequestHandler = async (event) => {
  const res = await apiFetch(event, '/api/users', { method: 'GET' });
  return json(await res.json().catch(() => ({ items: [] })), { status: res.status });
};
