import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

/**
 * Browser-callable proxy for the backend /api/search endpoint. Forwards the
 * `q` and `limit` query params and attaches the Clerk session token via
 * apiFetch so the request authenticates the same way our server loads do.
 */
export const GET: RequestHandler = async (event) => {
  const q = event.url.searchParams.get('q') ?? '';
  const limit = event.url.searchParams.get('limit') ?? '5';
  const qs = new URLSearchParams({ q, limit }).toString();
  const res = await apiFetch(event, `/api/search?${qs}`, { method: 'GET' });
  return json(
    await res.json().catch(() => ({ q, vehicles: [], customers: [], tasks: [], total: 0 })),
    { status: res.status },
  );
};
