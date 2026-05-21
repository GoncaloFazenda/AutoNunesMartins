import type { PageServerLoad } from './$types';
import { tasksApi, usersApi, type TaskListParams } from '$lib/server/tasks';

export const load: PageServerLoad = async (event) => {
  const sp = event.url.searchParams;
  const scopeRaw = sp.get('scope');
  const scope: TaskListParams['scope'] =
    scopeRaw === 'mine' || scopeRaw === 'general' ? scopeRaw : 'all';

  const params: TaskListParams = {
    priority: (sp.get('priority') as TaskListParams['priority']) ?? undefined,
    q: sp.get('q') ?? undefined,
    scope,
  };
  try {
    const [tasks, users] = await Promise.all([
      tasksApi.list(event, params),
      usersApi.list(event),
    ]);
    return { tasks: tasks.items, users: users.items, filters: params };
  } catch (err) {
    return {
      tasks: [],
      users: [],
      filters: params,
      error: (err as Error).message,
    };
  }
};
