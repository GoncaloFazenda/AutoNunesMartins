import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

export const GET: RequestHandler = async (event) => {
  const res = await apiFetch(event, '/api/notifications', { method: 'GET' });
  return json(await res.json().catch(() => ({})), { status: res.status });
};
