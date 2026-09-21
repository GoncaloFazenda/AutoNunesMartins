import type { Component, ComponentType, SvelteComponent } from 'svelte';

/**
 * Slot for any icon-shaped component. Covers two shapes we use:
 *   1. Legacy `ComponentType<SvelteComponent>` — lucide-svelte 0.460 still
 *      exports icons in this Svelte 4 form (works in Svelte 5 runtime via
 *      the compat layer).
 *   2. Modern Svelte 5 `Component<Props>` — used by our hand-rolled
 *      brand icons in `$lib/components/brand/icons/*` that match the
 *      index.html prototype's SVG paths exactly.
 *
 * Either shape can be rendered as `<Icon class="..." />`, so consumers
 * (KPICard, PanelHeader, etc.) accept this union and don't care which
 * library the icon came from.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IconComponent =
  | ComponentType<SvelteComponent<any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Component<any>;
