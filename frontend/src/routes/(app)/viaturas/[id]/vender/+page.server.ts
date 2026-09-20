import { error, fail, redirect } from '@sveltejs/kit';
import { saleCreateSchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { customersApi } from '$lib/server/customers';
import { salesApi } from '$lib/server/sales';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const vehicle = await vehiclesApi.get(event, event.params.id);
    if (vehicle.sale) {
      throw redirect(302, `/viaturas/${event.params.id}`);
    }
    if (!['AVAILABLE', 'RESERVED', 'DOCS_PENDING'].includes(vehicle.status)) {
      throw redirect(302, `/viaturas/${event.params.id}`);
    }
    // Pre-load customers for the picker. Cap at 200 — fine for a small dealership.
    const customers = await customersApi.list(event, { page: 1, pageSize: 200, sortBy: 'name', sortDir: 'asc' });
    return { vehicle, customers: customers.items };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Viatura não encontrada');
    }
    throw err;
  }
};

function parseForm(fd: FormData) {
  const get = (k: string) => (fd.get(k) ?? '').toString().trim();
  // Trade-in is only assembled when the user explicitly toggled it on. Each
  // `tradeIn.*` field is read raw and let the Zod schema coerce/validate.
  // Omitting the field entirely (rather than sending an empty object) keeps
  // the API contract clean — saleCreateSchema treats `tradeIn` as optional.
  const tradeInEnabled = get('hasTradeIn') === 'true';
  const tradeIn = tradeInEnabled
    ? {
        brand: get('tradeIn.brand'),
        model: get('tradeIn.model'),
        year: get('tradeIn.year'),
        fuel: get('tradeIn.fuel'),
        mileage: get('tradeIn.mileage'),
        licensePlate: get('tradeIn.licensePlate') || undefined,
        vin: get('tradeIn.vin') || undefined,
        allowanceValue: get('tradeIn.allowanceValue') || '0',
        disposition: get('tradeIn.disposition'),
        notes: get('tradeIn.notes') || undefined,
      }
    : undefined;
  return {
    vehicleId: get('vehicleId'),
    customerId: get('customerId'),
    salePrice: get('salePrice'),
    saleDate: get('saleDate'),
    deliveryDate: get('deliveryDate') || undefined,
    deliveryStatus: get('deliveryStatus') || 'PENDING',
    // Empty field → "0" so the schema's default kicks in cleanly and the
    // resulting sale row stores 0 rather than NULL or a stray string.
    commission: get('commission') || '0',
    buyerType: get('buyerType') || 'PARTICULAR',
    ...(tradeIn ? { tradeIn } : {}),
  };
}

export const actions: Actions = {
  submit: async (event) => {
    const fd = await event.request.formData();
    const raw = parseForm(fd);
    if (raw.vehicleId !== event.params.id) {
      return fail(400, { error: 'Veículo inconsistente.' });
    }
    const parsed = saleCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      });
    }
    try {
      const { id } = await salesApi.create(event, parsed.data);
      return { id };
    } catch (err) {
      if (err instanceof ApiError) {
        // Propaga o `field` quando o backend identifica uma colisão num
        // input específico da retoma (VIN ou matrícula). A UI usa isto
        // para pintar o input vermelho sem limpar o resto do formulário.
        const body = err.body as { error?: string; field?: string } | null;
        return fail(err.status, {
          error: body?.error ?? 'Falha ao registar venda.',
          field: body?.field ?? null,
        });
      }
      throw err;
    }
  },
};
