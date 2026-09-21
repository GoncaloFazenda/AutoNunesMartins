import { redirect } from '@sveltejs/kit';
import { apiJson, ApiError } from '$lib/server/api';
import type { LayoutServerLoad } from './$types';

interface MeResponse {
  user: { id: string; clerkId: string; email: string; name: string; role: 'ADMIN' };
}

interface VehicleStatsResponse {
  active: number;
  available: number;
  reserved: number;
  docsPending: number;
  sold: number;
  delivered: number;
  total: number;
}

interface TaskStatsResponse {
  /** Tasks assigned to the current user OR unassigned ("general"), not DONE. */
  mineActive: number;
}

export const load: LayoutServerLoad = async (event) => {
  const { userId } = event.locals.auth();
  if (!userId) {
    throw redirect(302, '/');
  }

  // Fetch the Prisma User row that backs this Clerk session — we need User.id
  // (not the Clerk ID) anywhere we filter by assignee/owner on the backend.
  let currentUser: MeResponse['user'] | null = null;
  try {
    const me = await apiJson<MeResponse>(event, '/api/me');
    currentUser = me.user;
  } catch (err) {
    // If the backend hasn't provisioned the user yet (very first request),
    // requireUser middleware auto-provisions and a refetch would succeed.
    // We surface null so the UI can render an "Em provisionamento" state.
    if (!(err instanceof ApiError) || err.status !== 403) {
      throw err;
    }
  }

  // Active-vehicle count for the sidebar badge. Cached 60s in the backend
  // (and invalidated on every vehicle mutation via emitActivity), so this
  // adds at most ~1 cheap roundtrip on first nav each minute.
  let vehicleStats: VehicleStatsResponse | null = null;
  let taskStats: TaskStatsResponse | null = null;
  try {
    // Issued in parallel so the layout doesn't pay for two sequential
    // roundtrips on each navigation.
    const [v, t] = await Promise.all([
      apiJson<VehicleStatsResponse>(event, '/api/vehicles/stats'),
      apiJson<TaskStatsResponse>(event, '/api/tasks/stats'),
    ]);
    vehicleStats = v;
    taskStats = t;
  } catch {
    /* badges hide on error */
  }

  return { clerkUserId: userId, currentUser, vehicleStats, taskStats };
};
