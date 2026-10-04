import { publicCatalogSeo, publicHref, type PublicStock } from '$lib/publicVehicles';
import { loadPublicStock } from './publicVehicles';

const escapeXml = (value: string) => value.replace(/[<>&"']/g, character => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[character]!);

/** Use only the public projection. Never publish an incomplete sitemap after an API failure. */
export async function publicSitemap(origin: string, loadStock = loadPublicStock) {
  const first = await loadStock(new URLSearchParams());
  if (first.status !== 'ready' || first.catalog.totalPages > 1000) throw new Error('Sitemap unavailable');
  const pages: PublicStock[] = [first];
  // Bound concurrency while including stock beyond the first catalogue page.
  for (let start = 2; start <= first.catalog.totalPages; start += 5) {
    const batch = await Promise.all(Array.from(
      { length: Math.min(5, first.catalog.totalPages - start + 1) },
      (_, index) => loadStock(new URLSearchParams({ pagina: String(start + index) })),
    ));
    if (batch.some((page, index) => page.status !== 'ready' || page.catalog.page !== start + index || page.catalog.total !== first.catalog.total)) {
      throw new Error('Sitemap unavailable');
    }
    pages.push(...batch);
  }
  const slugs = new Set(pages.flatMap(page => page.catalog.items.map(vehicle => vehicle.slug)));
  if (slugs.size !== first.catalog.total) throw new Error('Stock changed while building sitemap');
  const locations = new Set(['/', '/quem-somos'].map(path => new URL(path, origin).href));
  for (const page of pages) {
    const params = page.catalog.page === 1 ? new URLSearchParams() : new URLSearchParams({ pagina: String(page.catalog.page) });
    const seo = publicCatalogSeo(params, origin, page);
    if (!seo.noindex) locations.add(seo.canonical);
  }
  for (const brand of first.catalog.facets.brands.filter(brand => brand.count > 0)) {
    locations.add(publicCatalogSeo(new URLSearchParams({ marca: brand.value }), origin, first).canonical);
  }
  for (const slug of slugs) locations.add(new URL(publicHref(slug), origin).href);
  // Demo/legal/favourites/comparison pages carry noindex and are deliberately omitted.
  // No invented lastmod: the public projection does not expose a modification date.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...locations].map(location => `  <url><loc>${escapeXml(location)}</loc></url>`).join('\n')}\n</urlset>`;
}
