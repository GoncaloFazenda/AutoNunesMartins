import { publicRequest } from '$lib/server/publicVehicles';
import { slugPattern } from '$lib/publicVehicles';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ params }) => {
  const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
  if (
    !slugPattern.test(params.slug) ||
    params.slug.length > 180 ||
    !/^(?:[0-9]|1[0-9])$/.test(params.index)
  )
    return new Response(null, { status: 404, headers });
  try {
    const response = await publicRequest(`/${params.slug}/photos/${params.index}`);
    if (!response.ok)
      return new Response(null, { status: response.status === 404 ? 404 : 503, headers });
    const contentType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType))
      return new Response(null, { status: 503, headers });
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 10 * 1024 * 1024) return new Response(null, { status: 503, headers });
    return new Response(bytes, { headers: { ...headers, 'content-type': contentType } });
  } catch {
    return new Response(null, { status: 503, headers });
  }
};
