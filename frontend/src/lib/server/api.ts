import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
    this.name = 'ApiError';
  }
}

/**
 * Authenticated server-side fetch from a SvelteKit load function or form action.
 * Pulls the Clerk session token via `locals.auth()` and attaches it as Bearer.
 */
export async function apiFetch(
  event: Pick<RequestEvent, 'locals' | 'fetch'>,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const session = event.locals.auth();
  const token = await session.getToken();

  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const url = `${PUBLIC_BACKEND_URL}${path}`;
  return event.fetch(url, { ...init, headers });
}

export async function apiJson<T>(
  event: Pick<RequestEvent, 'locals' | 'fetch'>,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(event, path, init);
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, body, `${init.method ?? 'GET'} ${path} → ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
