import { loadPublicStock } from '$lib/server/publicVehicles';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
export const load: PageServerLoad = async ({ url, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  if (url.searchParams.has('modelo') && !url.searchParams.get('marca')?.trim()) {
    const next = new URL(url);
    next.searchParams.delete('modelo');
    next.searchParams.delete('pagina');
    redirect(307, next.pathname + next.search);
  }
  const stock = await loadPublicStock(url.searchParams);
  // Shared/outdated URLs must not land on an empty page beyond the current stock.
  if (stock.status === 'ready' && stock.catalog.totalPages > 0 && stock.catalog.page > stock.catalog.totalPages) {
    const next = new URL(url);
    next.searchParams.set('pagina', String(stock.catalog.totalPages));
    redirect(307, next.pathname + next.search);
  }
  return { stock };
};
