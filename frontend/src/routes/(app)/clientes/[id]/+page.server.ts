import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { customersApi } from '$lib/server/customers';
import { ApiError } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
  try {
    const customer = await customersApi.get(event, event.params.id);
    return { customer };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Cliente não encontrado');
    }
    throw err;
  }
};
