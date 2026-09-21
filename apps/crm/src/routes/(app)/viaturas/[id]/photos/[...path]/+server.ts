import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

export const DELETE: RequestHandler = async (event) => {
  const target = `/api/vehicles/${event.params.id}/photos/${event.params.path}`;
  const res = await apiFetch(event, target, { method: 'DELETE' });
  return json(await res.json().catch(() => ({})), { status: res.status });
};
