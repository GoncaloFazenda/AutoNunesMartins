import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

/**
 * Inline task list for the QuickTaskBubble. Forwards `status`, `scope`, and
 * `q` verbatim to the backend's /api/tasks list endpoint. We don't proxy the
 * full filter surface — the widget only needs status + scope today.
 */
export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const qs = new URLSearchParams();
  for (const key of ['status', 'scope', 'q'] as const) {
    const v = sp.get(key);
    if (v) qs.set(key, v);
  }
  const path = `/api/tasks${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await apiFetch(event, path, { method: 'GET' });
  return json(await res.json().catch(() => ({ items: [] })), { status: res.status });
};

/**
 * Used by the QuickTaskBubble for inline task creation from any page. Mirrors
 * the proxy shape of /api/notifications and /api/today-tasks: forward the JSON
 * body verbatim, let the backend's Zod schema validate.
 */
export const POST: RequestHandler = async (event) => {
  const body = await event.request.text();
  const res = await apiFetch(event, '/api/tasks', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
  });
  return json(await res.json().catch(() => ({})), { status: res.status });
};
