import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { moneySchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const vehicle = await vehiclesApi.get(event, event.params.id);
    // Defensive guard: only DRAFT vehicles enter this flow. Anything else
    // bounces back to the detail page (treated as a no-op the user just
    // happened to URL-hack into).
    if (vehicle.status !== 'DRAFT') {
      throw redirect(302, `/viaturas/${event.params.id}`);
    }
    return { vehicle };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Viatura não encontrada');
    }
    throw err;
  }
};

const publishSchema = z.object({
  salePrice: moneySchema,
  description: z
    .string()
    .trim()
    .min(1, 'Descrição obrigatória para publicar.')
    .max(2000, 'Descrição com mais de 2000 caracteres.'),
});

export const actions: Actions = {
  publish: async (event) => {
    const fd = await event.request.formData();
    const parsed = publishSchema.safeParse({
      salePrice: (fd.get('salePrice') ?? '').toString().trim(),
      description: (fd.get('description') ?? '').toString(),
    });
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
      });
    }
    try {
      await vehiclesApi.publish(event, event.params.id, parsed.data);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao publicar.',
        });
      }
      throw err;
    }
    // Volta ao detalhe da viatura — agora já AVAILABLE.
    throw redirect(303, `/viaturas/${event.params.id}`);
  },
};
