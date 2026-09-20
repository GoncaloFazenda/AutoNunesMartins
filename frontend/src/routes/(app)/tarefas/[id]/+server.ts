import { json, type RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

/**
 * Used by the board to delete a single task directly (e.g. the X button on
 * a scheduled standby card). Editing-page deletion goes through the form
 * action; this is the bare REST endpoint for inline UI.
 */
export const DELETE: RequestHandler = async (event) => {
  const res = await apiFetch(event, `/api/tasks/${event.params.id}`, {
    method: 'DELETE',
  });
  return json(await res.json().catch(() => ({})), { status: res.status });
};
