import { error, fail, redirect } from '@sveltejs/kit';
import { taskCreateSchema } from '@anm/types';
import { tasksApi, usersApi } from '$lib/server/tasks';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const [task, users] = await Promise.all([
      tasksApi.get(event, event.params.id),
      usersApi.list(event),
    ]);
    return { task, users: users.items };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw error(404, 'Tarefa não encontrada');
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
      await tasksApi.update(event, event.params.id, parsed.data);
      return { id: event.params.id };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
  delete: async (event) => {
    try {
      await tasksApi.delete(event, event.params.id);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
    throw redirect(302, '/tarefas');
  },
};
