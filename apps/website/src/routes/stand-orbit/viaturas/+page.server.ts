import { loadPublicStock } from '$lib/server/publicVehicles';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ url, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  return { stock: await loadPublicStock(url.searchParams) };
};
