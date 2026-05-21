import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

/**
 * Proxy to the backend's filtered today-tasks endpoint. Used by the dashboard
 * TodayTasks panel to refetch when the user changes the assignee filter without
 * reloading the whole page.
 *
 * Forwards `scope` and `assigneeId` query params verbatim.
 */
export const GET: RequestHandler = async (event) => {
  const scope = event.url.searchParams.get('scope') ?? 'mine';
  const assigneeId = event.url.searchParams.get('assigneeId') ?? '';
  const qs = new URLSearchParams({ scope });
  if (assigneeId) qs.set('assigneeId', assigneeId);
  const res = await apiFetch(event, `/api/dashboard/today-tasks?${qs.toString()}`, {
    method: 'GET',
  });
  return json(await res.json().catch(() => ({ items: [] })), { status: res.status });
};
