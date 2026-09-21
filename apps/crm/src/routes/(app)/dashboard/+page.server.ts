import type { PageServerLoad } from './$types';
import {
  dashboardApi,
  type DashboardPayload,
  type FeaturedVehicleDto,
} from '$lib/server/dashboard';
import { usersApi, type TaskAssignee } from '$lib/server/tasks';

export type DashboardStream =
  | { kind: 'ok'; payload: DashboardPayload }
  | { kind: 'error'; message: string };

export const load: PageServerLoad = async (event) => {
  // Streamed: returning a promise lets SvelteKit render the shell + skeleton
  // immediately, then stream the widget data in as it arrives.
  const dashboard: Promise<DashboardStream> = dashboardApi
    .get(event)
    .then((payload): DashboardStream => ({ kind: 'ok', payload }))
    .catch((err): DashboardStream => ({ kind: 'error', message: (err as Error).message }));

  // Users list — small (cached server-side for 60s) and needed for the
  // TodayTasks panel filter dropdown. Awaited so the dropdown is populated
  // on first paint; this is the same data the kanban page already loads.
  let users: TaskAssignee[] = [];
  try {
    const u = await usersApi.list(event);
    users = u.items;
  } catch {
    users = [];
  }

  // Featured vehicle is small (one AppSetting + one Vehicle lookup, plus
  // a signed-URL fetch that's already memoized in the backend), and lives
  // at the very TOP of the dashboard. Streaming it as a separate promise
  // caused a visible layout shift when it resolved after the rest of the
  // dashboard payload, so we await it here instead — it ships with the
  // initial HTML, no shift.
  let featuredVehicle: FeaturedVehicleDto | null = null;
  try {
    const r = await dashboardApi.featuredVehicle(event);
    featuredVehicle = r.vehicle;
  } catch {
    featuredVehicle = null;
  }

  return { dashboard, users, featuredVehicle };
};
