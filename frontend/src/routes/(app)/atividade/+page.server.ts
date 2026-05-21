import type { PageServerLoad } from './$types';
import { activityApi, type ActivityListParams, type ActivityListResult } from '$lib/server/activity';
import { usersApi, type TaskAssignee } from '$lib/server/tasks';

const ENTITY_TYPES = ['vehicle', 'sale', 'task', 'customer', 'expense'] as const;

function parseEntityType(v: string | null): ActivityListParams['entityType'] | undefined {
  if (!v) return undefined;
  return (ENTITY_TYPES as readonly string[]).includes(v)
    ? (v as ActivityListParams['entityType'])
    : undefined;
}

export const load: PageServerLoad = async (event) => {
  const url = event.url;
  const params: ActivityListParams = {
    actorId: url.searchParams.get('actorId') ?? undefined,
    type: url.searchParams.get('type') ?? undefined,
    entityType: parseEntityType(url.searchParams.get('entityType')),
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    q: url.searchParams.get('q') ?? undefined,
    page: Number(url.searchParams.get('page') ?? '1') || 1,
    pageSize: Number(url.searchParams.get('pageSize') ?? '50') || 50,
  };

  let users: TaskAssignee[] = [];
  let result: ActivityListResult = {
    items: [],
    total: 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
    pageCount: 1,
  };

  try {
    const [usersResp, list] = await Promise.all([
      usersApi.list(event),
      activityApi.list(event, params),
    ]);
    users = usersResp.items;
    result = list;
  } catch {
    /* errors surface as empty list */
  }

  return { result, users, params };
};
