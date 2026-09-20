import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { DeliveryStatusEnum } from '@anm/types';
import { salesApi } from '$lib/server/sales';
import { activityApi, type ActivityListResult } from '$lib/server/activity';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const sale = await salesApi.get(event, event.params.id);

    // Build the timeline by asking the activity log for every event whose
    // entity is either *this sale* or *the vehicle linked to the sale*. The
    // vehicle half is what surfaces things like "documento marcado em falta"
    // or "viatura adicionada", since the doc-checklist lives on the Vehicle
    // model (pendingDocFlags), not on the Sale. Streamed so the rest of the
    // page renders immediately.
    const timeline: Promise<ActivityListResult> = activityApi
      .list(event, {
        scope: [
          { type: 'sale', id: sale.id },
          { type: 'vehicle', id: sale.vehicle.id },
        ],
        pageSize: 100,
      })
      .catch(
        (): ActivityListResult => ({
          items: [],
          total: 0,
          page: 1,
          pageSize: 100,
          pageCount: 1,
        }),
      );

    return { sale, timeline };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Venda não encontrada');
    }
    throw err;
  }
};

const deliverySchema = z.object({
  deliveryStatus: DeliveryStatusEnum,
  deliveryDate: z.string().optional(),
});

export const actions: Actions = {
  delivery: async (event) => {
    const fd = await event.request.formData();
    const parsed = deliverySchema.safeParse({
      deliveryStatus: (fd.get('deliveryStatus') ?? '').toString(),
      deliveryDate: (fd.get('deliveryDate') ?? '').toString() || undefined,
    });
    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' });
    }
    try {
      await salesApi.updateDelivery(event, event.params.id, {
        deliveryStatus: parsed.data.deliveryStatus,
        deliveryDate: parsed.data.deliveryDate ?? null,
      });
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
};
