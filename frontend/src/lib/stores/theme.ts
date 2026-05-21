import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'dark';

function readInitial(): Theme {
  if (!browser) return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_THEME;
}

function apply(theme: Theme): void {
  if (!browser) return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable */
  }
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(readInitial());

  return {
    subscribe,
    set: (t: Theme) => {
      apply(t);
      set(t);
    },
    toggle: () =>
      update((current) => {
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        apply(next);
        return next;
      }),
    hydrate: () => {
      if (!browser) return;
      const t = readInitial();
      apply(t);
      set(t);
    },
  };
}

export const theme = createThemeStore();
