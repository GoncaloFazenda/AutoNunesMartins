import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { createNotifications, MAX_NOTIFICATIONS, NOTIFICATION_DURATION } from './notifications';
import { createComparison } from './comparison';
import { createFavorites } from './favorites';
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
describe('Global notification lifecycle', () => {
  it('auto-dismisses without interaction and disposes its timer', () => {
    const host = createNotifications(); host.push({ message: 'Removed' });
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 1); expect(get(host.notices)).toHaveLength(1);
    vi.advanceTimersByTime(1); expect(get(host.notices)).toEqual([]); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps consecutive messages and expires them independently', () => {
    const host = createNotifications(); host.push({ message: 'First' }); vi.advanceTimersByTime(1000); host.push({ message: 'Second' });
    expect(get(host.notices).map(item => item.message)).toEqual(['Second', 'First']);
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 1000); expect(get(host.notices).map(item => item.message)).toEqual(['Second']);
    vi.advanceTimersByTime(1000); expect(get(host.notices)).toEqual([]);
  });
  it('resumes the remaining time only when pointer AND focus pauses have ended', () => {
    const host = createNotifications(), id = host.push({ message: 'Paused' });
    vi.advanceTimersByTime(1000); host.pause(id, 'pointer'); host.pause(id, 'focus');
    vi.advanceTimersByTime(20000); host.resume(id, 'pointer'); vi.advanceTimersByTime(20000);
    expect(get(host.notices)).toHaveLength(1); host.resume(id, 'focus');
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 1000); expect(get(host.notices)).toEqual([]);
  });
  it('repeated pause/resume events do not extend or duplicate timers', () => {
    const host = createNotifications(), id = host.push({ message: 'Repeated events' });
    vi.advanceTimersByTime(1000); host.pause(id, 'pointer'); host.pause(id, 'pointer');
    host.resume(id, 'pointer'); host.resume(id, 'pointer');
    expect(vi.getTimerCount()).toBe(1); vi.advanceTimersByTime(NOTIFICATION_DURATION - 1000); expect(get(host.notices)).toEqual([]);
  });
  it('navigation clears obsolete interaction pauses without restarting active notices', () => {
    const host = createNotifications(), id = host.push({ message: 'Navigating' });
    vi.advanceTimersByTime(1000); host.pause(id, 'focus'); host.pause(id, 'pointer'); host.resumeAfterNavigation();
    vi.advanceTimersByTime(1000); host.resumeAfterNavigation();
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 2000); expect(get(host.notices)).toEqual([]);
  });
  it('manual dismissal and root cleanup cancel all timers', () => {
    const host = createNotifications(), id = host.push({ message: 'Close me' });
    host.dismiss(id); host.resume(id, 'pointer'); expect(vi.getTimerCount()).toBe(0);
    host.push({ message: 'Pending' }); host.push({ message: 'Also pending' }); host.destroy();
    expect(vi.getTimerCount()).toBe(0); expect(get(host.notices)).toEqual([]);
  });
  it('uses the same expiry for comparison addition/removal/limit and favorites', () => {
    const host = createNotifications(); const comparison = createComparison(host.push); const favorites = createFavorites(host.push);
    const ids = ['audi-012345abcdef', 'bmw-012345abcdef', 'dacia-012345abcdef', 'tesla-012345abcdef'];
    ids.forEach(id => comparison.toggle(id, id)); comparison.remove(ids[0]!); favorites.toggle(ids[0]!, 'Audi'); favorites.remove(ids[0]!);
    expect(get(host.notices)).toHaveLength(7);
    expect(get(host.notices).some(item => item.message.includes('até 3'))).toBe(true);
    vi.advanceTimersByTime(NOTIFICATION_DURATION); expect(get(host.notices)).toEqual([]);
  });
  it('falls back only existing actions without adding buttons or resetting lifecycle', () => {
    const host = createNotifications();
    const without = host.push({ message: 'One selected', channel: 'comparison' });
    const withAction = host.push({ message: 'Two selected', channel: 'comparison', action: { label: 'Ver comparação', href: '/comparar' } });
    vi.advanceTimersByTime(2000);
    host.invalidateActions('comparison', { label: 'Ver seleção', href: '/comparar' });
    expect(get(host.notices).find(item => item.id === without)?.action).toBeUndefined();
    expect(get(host.notices).find(item => item.id === withAction)?.action).toEqual({ label: 'Ver seleção', href: '/comparar' });
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 2000); expect(get(host.notices)).toEqual([]);
  });
  it('keeps each CTA presence stable through ten one/two selection toggles, including hidden notices', () => {
    const host = createNotifications(); const comparison = createComparison(host.push);
    const unsubscribe = comparison.ids.subscribe(ids => {
      if (ids.length < 2) host.invalidateActions('comparison', { label: 'Ver seleção', href: '/comparar' });
    });
    comparison.toggle('audi-012345abcdef', 'Audi');
    const firstId = get(host.notices)[0]!.id;
    const snapshots = new Map<number, boolean>([[firstId, false]]);
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(100);
      comparison.toggle('bmw-012345abcdef', 'BMW');
      const items = get(host.notices);
      snapshots.set(items[0]!.id, get(comparison.ids).length >= 2);
      expect(items.map(item => !!item.action)).toEqual(items.map(item => snapshots.get(item.id)));
      if (get(comparison.ids).length < 2) expect(items.some(item => item.action?.label === 'Ver comparação')).toBe(false);
      else expect(items.slice(1).some(item => item.action?.label === 'Ver comparação')).toBe(false);
    }
    expect(snapshots.size).toBe(11);
    for (let i = 0; i < 7; i++) host.dismiss(get(host.notices)[0]!.id);
    expect(get(host.notices).map(item => !!item.action)).toEqual(get(host.notices).map(item => snapshots.get(item.id)));
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 1000);
    expect(get(host.notices).some(item => item.id === firstId)).toBe(false);
    vi.advanceTimersByTime(1000); expect(get(host.notices)).toEqual([]);
    unsubscribe();
  });
  it('keeps valid CTAs at two/three/limit and downgrades once on external selection changes', () => {
    const host = createNotifications(); const comparison = createComparison(host.push);
    const unsubscribe = comparison.ids.subscribe(ids => {
      if (ids.length < 2) host.invalidateActions('comparison', { label: 'Ver seleção', href: '/comparar' });
    });
    const ids = ['audi-012345abcdef', 'bmw-012345abcdef', 'dacia-012345abcdef', 'tesla-012345abcdef'];
    ids.forEach(id => comparison.toggle(id, id));
    comparison.remove(ids[2]!);
    const before = get(host.notices);
    expect(before.slice(0, 4).every(item => item.action?.label === 'Ver comparação')).toBe(true);
    expect(before.at(-1)?.action).toBeUndefined();
    comparison.sync(JSON.stringify([ids[0]]));
    const invalidated = get(host.notices);
    expect(invalidated.slice(0, 4).every(item => item.action?.label === 'Ver seleção')).toBe(true);
    comparison.sync(JSON.stringify(ids.slice(0, 3)));
    expect(get(host.notices)).toEqual(invalidated);
    expect(get(host.notices).map(item => item.id)).toEqual(before.map(item => item.id));
    expect(vi.getTimerCount()).toBe(before.length);
    comparison.clear();
    expect(get(host.notices)[0]?.action).toBeUndefined();
    vi.advanceTimersByTime(NOTIFICATION_DURATION); expect(get(host.notices)).toEqual([]);
    unsubscribe();
  });
  it('bounds a burst and cancels discarded timers, retaining only the latest messages', () => {
    const host = createNotifications();
    for (let i = 0; i < 1000; i++) host.push({ message: `Event ${i}` });
    expect(get(host.notices).map(item => item.message)).toEqual(Array.from({ length: MAX_NOTIFICATIONS }, (_, index) => `Event ${999 - index}`));
    expect(vi.getTimerCount()).toBe(MAX_NOTIFICATIONS);
    host.dismiss(get(host.notices)[0]!.id);
    expect(get(host.notices)[0]?.message).toBe('Event 998');
    vi.advanceTimersByTime(NOTIFICATION_DURATION);
    expect(get(host.notices)).toEqual([]); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps a focused front card operable while a burst replaces the background queue', () => {
    const host = createNotifications(); const id = host.push({ message: 'Reading' });
    vi.advanceTimersByTime(1000); host.pause(id, 'focus');
    for (let i = 0; i < 50; i++) host.push({ message: `Event ${i}` });
    expect(get(host.notices)[0]?.id).toBe(id); expect(get(host.notices)).toHaveLength(MAX_NOTIFICATIONS);
    expect(vi.getTimerCount()).toBe(MAX_NOTIFICATIONS - 1);
    vi.advanceTimersByTime(NOTIFICATION_DURATION);
    expect(get(host.notices).map(item => item.message)).toEqual(['Reading']);
    host.resumeAfterNavigation(); vi.advanceTimersByTime(NOTIFICATION_DURATION - 1000);
    expect(get(host.notices)).toEqual([]);
  });
  it('keeps all seven ordinary burst events in newest-first order with original individual deadlines', () => {
    const host = createNotifications();
    for (let i = 1; i <= 7; i++) { host.push({ message: `Event ${i}` }); vi.advanceTimersByTime(100); }
    expect(get(host.notices).map(item => item.message)).toEqual(['Event 7', 'Event 6', 'Event 5', 'Event 4', 'Event 3', 'Event 2', 'Event 1']);
    vi.advanceTimersByTime(NOTIFICATION_DURATION - 700);
    expect(get(host.notices)).toHaveLength(6);
    expect(get(host.notices).at(-1)?.message).toBe('Event 2');
    host.dismiss(get(host.notices)[0]!.id);
    expect(get(host.notices).slice(0, 4).map(item => item.message)).toEqual(['Event 6', 'Event 5', 'Event 4', 'Event 3']);
    vi.advanceTimersByTime(100); expect(get(host.notices).at(-1)?.message).toBe('Event 3');
    vi.advanceTimersByTime(500); expect(get(host.notices)).toEqual([]);
  });
});
