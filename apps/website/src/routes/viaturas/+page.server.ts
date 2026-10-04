import { loadPublicStock } from '$lib/server/publicVehicles';
import { loadPublicBrands } from '$lib/server/publicBrands';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { normalizeCatalogUi } from '$lib/catalogUiFilters';
export const load: PageServerLoad = async ({ url, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  const params = normalizeCatalogUi(url.searchParams);
  if (params.toString() !== url.searchParams.toString()) {
    redirect(307, url.pathname + (params.size ? `?${params}` : ''));
  }
  const yearParams = new URLSearchParams(params);
  yearParams.delete('ano_min'); yearParams.delete('ano_max'); yearParams.delete('pagina');
  const [stock, yearStock, brandDirectory] = await Promise.all([
    loadPublicStock(params),
    params.has('ano_min') ? loadPublicStock(yearParams) : Promise.resolve(null),
    loadPublicBrands(),
  ]);
  // An API outage is temporary, not an empty catalogue to remove from search.
  if (stock.status === 'unavailable') {
    setHeaders({ 'retry-after': '120' });
    error(503, 'Catálogo temporariamente indisponível.');
  }
  // Shared/outdated URLs must not land on an empty page beyond the current stock.
  if (stock.status === 'ready' && stock.catalog.totalPages > 0 && stock.catalog.page > stock.catalog.totalPages) {
    const next = new URL(url);
    next.searchParams.set('pagina', String(stock.catalog.totalPages));
    redirect(307, next.pathname + next.search);
  }
  return { stock, catalogYearRange: (yearStock ?? stock).catalog.facets.year, brandDirectory };
};
