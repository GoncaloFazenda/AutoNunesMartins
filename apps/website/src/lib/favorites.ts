import { get, writable } from 'svelte/store';
import { getContext } from 'svelte';
import { parseSelection } from './comparison';
import type { NotificationInput } from './notifications';

export const FAVORITES_KEY = 'anm-favorites-v1';
export const favoritesContext = Symbol('favorites');
export function createFavorites(notify?: (input: NotificationInput) => unknown) {
  const ids = writable<string[]>([]);
  const ready = writable(false);
  const announcement = writable('');
  const announce = (message: string) => { announcement.set(message); notify?.({ message, channel: 'favorites' }); };
  let storage: Pick<Storage, 'getItem' | 'setItem'> | undefined;
  let initialized = false;
  const parse = (raw: string | null) => parseSelection(raw, Infinity);
  function save(next: string[]) {
    ids.set(next);
    try { storage?.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* The current visit remains usable. */ }
  }
  return {
    ids: { subscribe: ids.subscribe }, ready: { subscribe: ready.subscribe }, announcement: { subscribe: announcement.subscribe },
    initialize(getStorage: () => Pick<Storage, 'getItem' | 'setItem'>) {
      if (initialized) return;
      initialized = true;
      try {
        storage = getStorage();
        const raw = storage.getItem(FAVORITES_KEY);
        ids.set(parse(raw ?? storage.getItem('anm-design-saved')));
        if (raw === null && get(ids).length) save(get(ids));
      } catch { /* Storage may be unavailable. */ }
      ready.set(true);
    },
    sync(raw: string | null) { ids.set(parse(raw)); },
    toggle(id: string, name: string) {
      if (!parse(JSON.stringify([id])).length) return;
      if (get(ids).includes(id)) { this.remove(id, name); return; }
      save([...get(ids), id]);
      announce(`${name} guardado nos favoritos.`);
    },
    remove(id: string, name = 'Viatura') {
      if (!get(ids).includes(id)) return;
      save(get(ids).filter(value => value !== id));
      announce(`${name} removido dos favoritos.`);
    },
    clear() { save([]); announce('Favoritos limpos.'); },
  };
}
export const useFavorites = () => getContext<ReturnType<typeof createFavorites>>(favoritesContext);
