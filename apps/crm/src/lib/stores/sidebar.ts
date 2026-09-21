import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type SidebarState = 'expanded' | 'collapsed';

const STORAGE_KEY = 'app-sidebar';
const DEFAULT: SidebarState = 'expanded';

function readInitial(): SidebarState {
  if (!browser) return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'expanded' || raw === 'collapsed') return raw;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT;
}

function apply(state: SidebarState): void {
  if (!browser) return;
  document.documentElement.setAttribute('data-sidebar', state);
  try {
    localStorage.setItem(STORAGE_KEY, state);
  } catch {
    /* localStorage unavailable */
  }
}

function create() {
  const { subscribe, set, update } = writable<SidebarState>(readInitial());
  return {
    subscribe,
    set: (s: SidebarState) => {
      apply(s);
      set(s);
    },
    toggle: () =>
      update((cur) => {
        const next: SidebarState = cur === 'expanded' ? 'collapsed' : 'expanded';
        apply(next);
        return next;
      }),
    hydrate: () => {
      if (!browser) return;
      const s = readInitial();
      apply(s);
      set(s);
    },
  };
}

export const sidebar = create();

/*
  Mobile drawer state — independent of the desktop expanded/collapsed
  persistence. Transient: never saved to localStorage; resets to closed on
  every load. The topbar hamburger toggles it, the backdrop and Escape close
  it, and route changes auto-close in the layout.
*/
function createMobileDrawer() {
  const { subscribe, set, update } = writable<boolean>(false);
  return {
    subscribe,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((v) => !v),
  };
}

export const mobileDrawer = createMobileDrawer();
