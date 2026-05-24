import { error, fail, redirect } from '@sveltejs/kit';
import { vehicleCreateSchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const vehicle = await vehiclesApi.get(event, event.params.id);
    return { vehicle };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Viatura não encontrada');
    }
    throw err;
  }
};

function parseForm(formData: FormData) {
  const get = (k: string) => (formData.get(k) ?? '').toString();
  const getOptional = (k: string) => {
    const v = get(k);
    return v === '' ? undefined : v;
  };
  return {
    brand: get('brand'),
    model: get('model'),
    year: get('year'),
    fuel: get('fuel'),
    mileage: get('mileage'),
    vin: get('vin').toUpperCase(),
    licensePlate: getOptional('licensePlate'),
    purchasePrice: get('purchasePrice'),
    salePrice: getOptional('salePrice'),
    status: get('status'),
    acquisitionDate: get('acquisitionDate'),
    description: getOptional('description'),
    pendingDocFlags: {
      financing: formData.get('pendingDocFlags.financing') === 'true',
      imt: formData.get('pendingDocFlags.imt') === 'true',
      registration: formData.get('pendingDocFlags.registration') === 'true',
      docs: formData.get('pendingDocFlags.docs') === 'true',
    },
  };
}

export const actions: Actions = {
  submit: async (event) => {
    const formData = await event.request.formData();
    const parsed = vehicleCreateSchema.safeParse(parseForm(formData));
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        issues: parsed.error.issues,
      });
    }
    try {
      await vehiclesApi.update(event, event.params.id, parsed.data);
      return { id: event.params.id };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao actualizar.',
        });
      }
      throw err;
    }
  },
  delete: async (event) => {
    try {
      await vehiclesApi.delete(event, event.params.id);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao eliminar.',
        });
      }
      throw err;
    }
    throw redirect(302, '/viaturas');
  },
};
