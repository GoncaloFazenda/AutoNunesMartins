import type {
  Priority,
  Recurrence,
  TaskCreate,
  TaskStatus,
  TaskUpdate,
} from '@anm/types';
import type { RequestEvent } from '@sveltejs/kit';
import { apiJson } from './api.js';

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  /** Profile picture mirrored from Clerk. Null when the user uses Clerk's
   *  auto-generated avatar — the UI falls back to a red-gradient monogram. */
  imageUrl: string | null;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  startDate: string | null;
  dueDate: string | null;
  reminderDate: string | null;
  recurrence: Recurrence;
  recurrenceParentId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: TaskAssignee | null;
}

export type TaskScope = 'all' | 'mine' | 'general';

export interface TaskListParams {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  dueBefore?: string;
  dueAfter?: string;
  q?: string;
  scope?: TaskScope;
  /**
   * When true, include recurring tasks currently in DONE-standby (their
   * next dueDate is still in the future). Defaults to false.
   */
  showScheduled?: boolean;
}

function toQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

type Ev = Pick<RequestEvent, 'locals' | 'fetch'>;

export const tasksApi = {
  list(event: Ev, params: TaskListParams = {}): Promise<{ items: TaskDto[] }> {
    return apiJson(event, `/api/tasks${toQuery(params as Record<string, unknown>)}`);
  },
  get(event: Ev, id: string): Promise<TaskDto> {
    return apiJson(event, `/api/tasks/${id}`);
  },
  create(event: Ev, body: TaskCreate): Promise<{ id: string }> {
    return apiJson(event, '/api/tasks', { method: 'POST', body: JSON.stringify(body) });
  },
  update(event: Ev, id: string, body: Omit<TaskUpdate, 'id'>): Promise<{ ok: true }> {
    return apiJson(event, `/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  changeStatus(
    event: Ev,
    id: string,
    status: TaskStatus,
  ): Promise<{ spawnedTaskId: string | null; nextOccurrenceDate: string | null }> {
    return apiJson(event, `/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  delete(event: Ev, id: string): Promise<{ ok: true }> {
    return apiJson(event, `/api/tasks/${id}`, { method: 'DELETE' });
  },
};

export const usersApi = {
  list(event: Ev): Promise<{ items: TaskAssignee[] }> {
    return apiJson(event, '/api/users');
  },
};
