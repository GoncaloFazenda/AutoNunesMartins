import { fail } from '@sveltejs/kit';
import { taskCreateSchema } from '@anm/types';
import { tasksApi, usersApi } from '$lib/server/tasks';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const users = await usersApi.list(event);
  return { users: users.items };
};

function parseForm(fd: FormData) {
  const get = (k: string) => (fd.get(k) ?? '').toString().trim();
  const opt = (k: string) => {
    const v = get(k);
    return v === '' ? undefined : v;
  };
  return {
    title: get('title'),
    description: opt('description'),
    status: get('status') || 'TODO',
    priority: get('priority') || 'MEDIUM',
    assigneeId: opt('assigneeId'),
    startDate: opt('startDate'),
    dueDate: opt('dueDate'),
    reminderDate: opt('reminderDate'),
    recurrence: get('recurrence') || 'NONE',
  };
}

export const actions: Actions = {
  submit: async (event) => {
    const fd = await event.request.formData();
    const parsed = taskCreateSchema.safeParse(parseForm(fd));
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      });
    }
    try {
      const { id } = await tasksApi.create(event, parsed.data);
      return { id };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha ao criar tarefa.',
        });
      }
      throw err;
    }
  },
};
