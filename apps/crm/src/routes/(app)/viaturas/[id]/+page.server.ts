import { error, fail } from '@sveltejs/kit';
import { vehicleExpenseCreateSchema, vehicleExpenseUpdateSchema } from '@anm/types';
import { vehiclesApi } from '$lib/server/vehicles';
import { expensesApi } from '$lib/server/vehicleExpenses';
import { dashboardApi } from '$lib/server/dashboard';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const vehicle = await vehiclesApi.get(event, event.params.id);

    let signedPhotos: { path: string; url: string }[] = [];
    if (vehicle.photos.length > 0) {
      try {
        const { photos } = await vehiclesApi.signedPhotos(event, event.params.id);
        signedPhotos = photos;
      } catch {
        // Surface as empty gallery rather than break the page.
        signedPhotos = [];
      }
    }

    // Whether THIS vehicle is the one currently pinned as Dashboard hero.
    let isFeatured = false;
    try {
      const { vehicle: featured } = await dashboardApi.featuredVehicle(event);
      isFeatured = featured?.id === vehicle.id;
    } catch {
      // Non-blocking: if the featured lookup fails we just hide the badge.
      isFeatured = false;
    }

    return { vehicle, signedPhotos, isFeatured };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Viatura não encontrada');
    }
    throw err;
  }
};

export const actions: Actions = {
  toggleFeatured: async (event) => {
    // "current=true" → pin this vehicle. "current=false" → unpin (clear).
    const fd = await event.request.formData();
    const make = (fd.get('current') ?? '').toString() === 'false';
    try {
      await dashboardApi.setFeaturedVehicle(event, make ? event.params.id : null);
      return { ok: true, featured: make };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao atualizar destaque.',
        });
      }
      throw err;
    }
  },
  addExpense: async (event) => {
    const fd = await event.request.formData();
    const get = (k: string) => (fd.get(k) ?? '').toString();
    const raw = {
      vehicleId: event.params.id,
      category: get('category'),
      description: get('description'),
      amount: get('amount'),
      date: get('date'),
      confirmedOnSold: fd.get('confirmedOnSold') === 'true',
    };
    const parsed = vehicleExpenseCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      });
    }
    try {
      await expensesApi.create(event, parsed.data, raw.confirmedOnSold);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const body = err.body as { error?: string; message?: string } | null;
        if (body?.error === 'SaleExistsConfirmationRequired') {
          return fail(409, {
            error: body.message ?? 'Esta viatura já está vendida.',
            soldConfirmRequired: true,
          });
        }
      }
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
  updateExpense: async (event) => {
    const fd = await event.request.formData();
    const get = (k: string) => (fd.get(k) ?? '').toString();
    const expenseId = get('expenseId');
    if (!expenseId) return fail(400, { error: 'expenseId em falta' });
    const confirmedOnSold = fd.get('confirmedOnSold') === 'true';
    const raw = {
      id: expenseId,
      category: get('category'),
      description: get('description'),
      amount: get('amount'),
      date: get('date'),
      confirmedOnSold,
    };
    const parsed = vehicleExpenseUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        expenseId,
      });
    }
    const { id: _id, ...patch } = parsed.data;
    try {
      await expensesApi.update(event, expenseId, patch, confirmedOnSold);
      return { ok: true, expenseId };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return fail(409, {
          error:
            (err.body as { message?: string } | null)?.message ??
            'Esta viatura já está vendida.',
          soldConfirmRequired: true,
          expenseId,
        });
      }
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
          expenseId,
        });
      }
      throw err;
    }
  },
  deleteExpense: async (event) => {
    const fd = await event.request.formData();
    const expenseId = (fd.get('expenseId') ?? '').toString();
    const confirmedOnSold = fd.get('confirmedOnSold') === 'true';
    if (!expenseId) return fail(400, { error: 'expenseId em falta' });
    try {
      await expensesApi.delete(event, expenseId, confirmedOnSold);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return fail(409, {
          error:
            (err.body as { message?: string } | null)?.message ??
            'Esta viatura já está vendida.',
          soldConfirmRequired: true,
        });
      }
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
};
