import { PUBLIC_BACKEND_URL } from '$env/static/public';
import {
  emptyStock,
  publicCatalogSchema,
  publicVehicleSchema,
  slugPattern,
  type PublicStock,
} from '../publicVehicles';

// Native server fetch intentionally avoids SvelteKit credential forwarding and CRM auth helpers.
export async function publicRequest(path: string) {
  return fetch(new URL(`/api/public/vehicles${path}`, PUBLIC_BACKEND_URL), {
    headers: { accept: 'application/json' },
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  });
}
export async function loadPublicStock(params: URLSearchParams): Promise<PublicStock> {
  // Enforce the dependency even if the public API is deployed independently.
  if (params.has('modelo') && !params.get('marca')?.trim()) return emptyStock('invalid');
  const query = new URLSearchParams(params);
  // Preserve unknown/repeated keys so the backend rejects them instead of silently broadening a search.
  try {
    const response = await publicRequest(`?${query}`);
    if (!response.ok) return emptyStock(response.status === 400 ? 'invalid' : 'unavailable');
    return { status: 'ready', catalog: publicCatalogSchema.parse(await response.json()) };
  } catch {
    return emptyStock('unavailable');
  }
}
export async function loadPublicVehicle(slug: string) {
  if (!slugPattern.test(slug) || slug.length > 180) return { status: 404 as const, vehicle: null };
  try {
    const response = await publicRequest(`/${slug}`);
    if (!response.ok)
      return { status: response.status === 404 ? (404 as const) : (503 as const), vehicle: null };
    const vehicle = publicVehicleSchema.parse(await response.json());
    if (vehicle.slug !== slug) return { status: 503 as const, vehicle: null };
    return { status: 200 as const, vehicle };
  } catch {
    return { status: 503 as const, vehicle: null };
  }
}

export async function loadRelatedVehicles(slug: string) {
  if (!slugPattern.test(slug) || slug.length > 180) return [];
  try {
    const response = await publicRequest(`/${slug}/related`);
    if (!response.ok) return [];
    return publicVehicleSchema.array().max(3).parse(await response.json());
  } catch { return []; }
}
