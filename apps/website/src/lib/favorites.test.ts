import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { createFavorites, FAVORITES_KEY } from './favorites';
import { createComparison, COMPARISON_KEY } from './comparison';
const ids = ['audi-012345abcdef', 'bmw-012345abcdef', 'dacia-012345abcdef', 'tesla-012345abcdef'];
const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } }; };
describe('Persistent favorites', () => {
  it('supports more than three favorites, persists IDs only, toggles and clears', () => {
    const local = storage(); const first = createFavorites(); first.initialize(() => local);
    ids.forEach(id => first.toggle(id, 'Vehicle name'));
    expect(get(first.ids)).toEqual(ids);
    expect(local.getItem(FAVORITES_KEY)).toBe(JSON.stringify(ids));
    const revisit = createFavorites(); revisit.initialize(() => local);
    expect(get(revisit.ids)).toEqual(ids);
    revisit.toggle(ids[1]!, 'BMW'); expect(get(revisit.ids)).toEqual([ids[0], ids[2], ids[3]]);
    revisit.clear(); expect(local.getItem(FAVORITES_KEY)).toBe('[]');
  });
  it('migrates only real public identifiers from legacy saved cards', () => {
    const local = storage(); local.setItem('anm-design-saved', JSON.stringify(['porsche-911', ids[0], ids[0], null]));
    const favorites = createFavorites(); favorites.initialize(() => local);
    expect(get(favorites.ids)).toEqual([ids[0]]);
    expect(local.getItem(FAVORITES_KEY)).toBe(JSON.stringify([ids[0]]));
  });
  it('handles invalid storage, invalid IDs, and failed reads/writes', () => {
    const favorites = createFavorites();
    favorites.initialize(() => ({ getItem: () => '{invalid', setItem: () => { throw new Error('blocked'); } }));
    favorites.toggle('../private', 'Invalid'); expect(get(favorites.ids)).toEqual([]);
    favorites.toggle(ids[0]!, 'Audi'); expect(get(favorites.ids)).toEqual([ids[0]]);
    const blocked = createFavorites(); blocked.initialize(() => { throw new Error('blocked'); });
    expect(get(blocked.ready)).toBe(true); blocked.toggle(ids[1]!, 'BMW'); expect(get(blocked.ids)).toEqual([ids[1]]);
  });
  it('synchronizes browser-tab changes and clear events without persisting again', () => {
    const favorites = createFavorites(); favorites.sync(JSON.stringify(ids)); expect(get(favorites.ids)).toEqual(ids);
    favorites.sync(null); expect(get(favorites.ids)).toEqual([]);
    favorites.sync('{}'); expect(get(favorites.ids)).toEqual([]);
  });
  it('keeps favorites and comparison independent and migrates the old comparison session', () => {
    const local = storage(), session = storage(); session.setItem(COMPARISON_KEY, JSON.stringify(ids));
    const comparison = createComparison(); comparison.initialize(() => local, () => session);
    expect(get(comparison.ids)).toEqual(ids.slice(0, 3));
    expect(local.getItem(COMPARISON_KEY)).toBe(JSON.stringify(ids.slice(0, 3)));
    const favorites = createFavorites(); favorites.initialize(() => local); expect(get(favorites.ids)).toEqual([]);
    comparison.clear(); const revisit = createComparison(); revisit.initialize(() => local, () => session); expect(get(revisit.ids)).toEqual([]);
  });
  it('does not trigger addition feedback when synchronized or removed', () => {
    const comparison = createComparison(); comparison.sync(JSON.stringify(ids));
    expect(get(comparison.ids)).toEqual(ids.slice(0, 3)); expect(get(comparison.additions)).toBe(0);
    comparison.remove(ids[0]!); expect(get(comparison.additions)).toBe(0);
  });
});
