import { fail } from '@sveltejs/kit';
import { settingsApi } from '$lib/server/settings';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const settings = await settingsApi.list(event);
    return { settings: settings.items };
  } catch (err) {
    return {
      settings: [],
      error: (err as Error).message,
    };
  }
};

export const actions: Actions = {
  updateSetting: async (event) => {
    const fd = await event.request.formData();
    const key = (fd.get('key') ?? '').toString();
    const rawValue = (fd.get('value') ?? '').toString();
    if (!key) return fail(400, { error: 'key em falta' });

    // Coerce numeric values when the form submits a digit-only string.
    const parsedNum = Number(rawValue);
    const value: unknown =
      /^-?\d+$/.test(rawValue) && Number.isFinite(parsedNum) ? parsedNum : rawValue;

    try {
      await settingsApi.update(event, key, value);
      return { ok: true, key };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
          key,
        });
      }
      throw err;
    }
  },
};
