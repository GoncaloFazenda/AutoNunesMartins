import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

export const POST: RequestHandler = async (event) => {
  const body = await event.request.text();
  const res = await apiFetch(event, `/api/vehicles/${event.params.id}/photos/reorder`, {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
  });
  return json(await res.json().catch(() => ({})), { status: res.status });
};
