import { writable } from 'svelte/store';

/*
 * Open/closed state of the Quick Task panel — lives in a store so any
 * surface can drive it. Desktop opens via the floating bubble in
 * QuickTaskBubble; mobile opens via the "+" affordance on the Tarefas
 * item in MobileBottomNav.
 */
function createQuickTask() {
  const { subscribe, set, update } = writable<boolean>(false);
  return {
    subscribe,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((v) => !v),
  };
}

export const quickTask = createQuickTask();
