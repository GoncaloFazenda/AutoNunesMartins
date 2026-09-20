import { fail, error, redirect } from '@sveltejs/kit';
import { vehicleCreateSchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { ApiError } from '$lib/server/api';
import { webPublicationAction } from '$lib/server/webPublication';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const id = event.url.searchParams.get('viatura');
  if (!id) return { vehicle: null, signedPhotos: [] };
  if (!/^c[a-z0-9]{24}$/.test(id)) error(400, 'Viatura inválida.');
  const vehicle = await vehiclesApi.get(event, id);
  const signedPhotos = await vehiclesApi
    .signedPhotos(event, id)
    .then((result) => result.photos)
    .catch(() => []);
  return { vehicle, signedPhotos };
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
    // Matrícula is optional — the schema's preprocess maps "" → undefined
    // so we only need to forward the raw value as-is. Backend Zod handles
    // canonicalization to "XX-XX-XX".
    licensePlate: getOptional('licensePlate'),
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
  webPublication: (event) =>
    webPublicationAction(event, event.url.searchParams.get('viatura') ?? ''),
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
      redirect(303, `/viaturas/nova?viatura=${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { error?: string } | null;
        return fail(err.status, { error: body?.error ?? 'Falha ao criar viatura.' });
      }
      throw err;
    }
  },
};
