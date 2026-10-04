import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => new Response(
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', url.origin).href}\n`,
  { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } },
);
