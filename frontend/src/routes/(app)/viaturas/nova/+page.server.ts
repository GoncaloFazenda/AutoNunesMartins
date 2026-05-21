import { fail } from '@sveltejs/kit';
import { vehicleCreateSchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};

function parseFormToVehicleCreate(formData: FormData) {
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
    purchasePrice: get('purchasePrice'),
    salePrice: getOptional('salePrice'),
    status: get('status') || 'AVAILABLE',
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
    const raw = parseFormToVehicleCreate(formData);

    const parsed = vehicleCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        issues: parsed.error.issues,
      });
    }

    try {
      const { id } = await vehiclesApi.create(event, parsed.data);
      return { id };
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { error?: string } | null;
        return fail(err.status, { error: body?.error ?? 'Falha ao criar viatura.' });
      }
      throw err;
    }
  },
};
