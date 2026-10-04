import type { RequestHandler } from './$types';
import { publicSitemap } from '$lib/server/publicSitemap';

export const GET: RequestHandler = async ({ url }) => {
  try {
    return new Response(await publicSitemap(url.origin), {
      headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return new Response('Sitemap temporariamente indisponível.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '120' },
    });
  }
};
