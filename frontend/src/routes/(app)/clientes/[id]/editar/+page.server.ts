import { error, fail, redirect } from '@sveltejs/kit';
import { customerCreateSchema } from '@anm/types';
import { customersApi } from '$lib/server/customers';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

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

function parseForm(fd: FormData) {
  const get = (k: string) => (fd.get(k) ?? '').toString().trim();
  const opt = (k: string) => {
    const v = get(k);
    return v === '' ? undefined : v;
  };
  return {
    name: get('name'),
    phone: get('phone'),
    email: opt('email'),
    address: opt('address'),
    nif: get('nif'),
    notes: opt('notes'),
  };
}

export const actions: Actions = {
  submit: async (event) => {
    const fd = await event.request.formData();
    const parsed = customerCreateSchema.safeParse(parseForm(fd));
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      });
    }
    try {
      await customersApi.update(event, event.params.id, parsed.data);
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
      await customersApi.delete(event, event.params.id);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao eliminar.',
        });
      }
      throw err;
    }
    throw redirect(302, '/clientes');
  },
};
