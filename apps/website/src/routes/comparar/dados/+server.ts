import { json } from '@sveltejs/kit';
import { loadPublicVehicle } from '$lib/server/publicVehicles';
import { slugPattern } from '$lib/publicVehicles';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const ids = url.searchParams.getAll('id');
  const headers = { 'cache-control': 'no-store' };
  if ([...url.searchParams.keys()].some(key => key !== 'id') || ids.length > 3 ||
      new Set(ids).size !== ids.length || ids.some(id => id.length > 180 || !slugPattern.test(id))) {
    return json({ error: 'Seleção inválida.' }, { status: 400, headers });
  }
  const items = await Promise.all(ids.map(async id => ({ id, ...await loadPublicVehicle(id) })));
  return json({ items }, { headers });
};
