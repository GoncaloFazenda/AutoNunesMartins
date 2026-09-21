import { error } from '@sveltejs/kit';
import { loadPublicVehicle } from '$lib/server/publicVehicles';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  const result = await loadPublicVehicle(params.slug);
  if (!result.vehicle)
    error(
      result.status === 404 ? 404 : 503,
      result.status === 404
        ? 'Esta viatura não está publicada.'
        : 'A ficha está temporariamente indisponível.',
    );
  return { vehicle: result.vehicle };
};
