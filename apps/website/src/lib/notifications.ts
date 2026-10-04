import { writable } from 'svelte/store';
import { getContext } from 'svelte';

export type NotificationAction = { label: string; href: string };
export type NotificationInput = { message: string; channel?: string; action?: NotificationAction };
export type Notification = NotificationInput & { id: number };
export const notificationContext = Symbol('notifications');
export const NOTIFICATION_DURATION = 5500;
export const MAX_NOTIFICATIONS = 20;

/** One lifecycle for all site notices. Timers belong to the root layout, not a page. */
export function createNotifications() {
  type Running = Notification & { timer?: ReturnType<typeof setTimeout>; remaining: number; deadline: number; pauses: Set<string> };
  const notices = writable<Notification[]>([]);
  const running = new Map<number, Running>();
  let nextId = 0;
  const publish = () => {
    const items = [...running.values()].reverse();
    // Keep the notice being read or operated in front during a burst.
    const held = items.filter(item => item.pauses.size);
    for (const item of held) items.splice(items.indexOf(item), 1);
    items.unshift(...held);
    notices.set(items.map(({ id, message, channel, action }) => ({ id, message, channel, action })));
  };
  function dismiss(id: number) {
    const item = running.get(id);
    if (!item) return;
    clearTimeout(item.timer);
    running.delete(id);
    publish();
  }
  function start(item: Running) {
    if (item.timer !== undefined || item.pauses.size) return;
    item.deadline = Date.now() + item.remaining;
    item.timer = setTimeout(() => dismiss(item.id), item.remaining);
  }
  return {
    notices: { subscribe: notices.subscribe },
    push(input: NotificationInput) {
      const item: Running = { ...input, id: ++nextId, remaining: NOTIFICATION_DURATION, deadline: 0, pauses: new Set() };
      running.set(item.id, item);
      if (running.size > MAX_NOTIFICATIONS) {
        const oldest = [...running.values()].find(candidate => !candidate.pauses.size) ?? item;
        clearTimeout(oldest.timer); running.delete(oldest.id);
      }
      start(item); publish(); return item.id;
    },
    dismiss,
    pause(id: number, reason: 'pointer' | 'focus') {
      const item = running.get(id); if (!item) return;
      if (!item.pauses.size) {
        item.remaining = Math.max(0, item.deadline - Date.now());
        clearTimeout(item.timer); item.timer = undefined;
      }
      item.pauses.add(reason);
    },
    resume(id: number, reason: 'pointer' | 'focus') {
      const item = running.get(id); if (!item) return;
      item.pauses.delete(reason); start(item); publish();
    },
    resumeAfterNavigation() {
      for (const item of running.values()) { item.pauses.clear(); start(item); }
      publish();
    },
    invalidateActions(channel: string, fallback: NotificationAction) {
      // Presence is an event snapshot. A stale action may fall back to a safe
      // destination, but later events never add or restore actions on old notices.
      let changed = false;
      for (const item of running.values()) {
        if (item.channel !== channel || !item.action) continue;
        if (item.action.label === fallback.label && item.action.href === fallback.href) continue;
        item.action = { ...fallback }; changed = true;
      }
      if (changed) publish();
    },
    destroy() {
      for (const item of running.values()) clearTimeout(item.timer);
      running.clear(); publish();
    },
  };
}
export const useNotifications = () => getContext<ReturnType<typeof createNotifications>>(notificationContext);
