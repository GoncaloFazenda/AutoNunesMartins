import type { PageServerLoad } from './$types';
import { loadPublicBrands } from '$lib/server/publicBrands';

export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  return { brandDirectory: await loadPublicBrands() };
};
