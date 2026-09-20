import type { PageServerLoad } from './$types';
import { tasksApi, usersApi, type TaskListParams } from '$lib/server/tasks';
import { activityApi } from '$lib/server/activity';

export const load: PageServerLoad = async (event) => {
  const sp = event.url.searchParams;
  const scopeRaw = sp.get('scope');
  const scope: TaskListParams['scope'] =
    scopeRaw === 'mine' || scopeRaw === 'general' ? scopeRaw : 'all';

  const params: TaskListParams = {
    priority: (sp.get('priority') as TaskListParams['priority']) ?? undefined,
    q: sp.get('q') ?? undefined,
    scope,
    showScheduled: sp.get('showScheduled') === 'true' || undefined,
  };
  try {
    // Latest task events for the bottom feed — created, status changed,
    // completed. Filters by entityType too so backend can use its index.
    const [tasks, users, activity] = await Promise.all([
      tasksApi.list(event, params),
      usersApi.list(event),
      activityApi.list(event, {
        type: 'TASK_CREATED,TASK_STATUS_CHANGED,TASK_COMPLETED',
        entityType: 'task',
        pageSize: 20,
      }),
    ]);
    return {
      tasks: tasks.items,
      users: users.items,
      filters: params,
      taskActivity: activity.items,
    };
  } catch (err) {
    return {
      tasks: [],
      users: [],
      filters: params,
      taskActivity: [],
      error: (err as Error).message,
    };
  }
};
