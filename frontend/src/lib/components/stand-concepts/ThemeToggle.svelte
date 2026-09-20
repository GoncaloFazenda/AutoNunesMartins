<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte';
  let { dark, onchange }: { dark: boolean; onchange: () => void } = $props();
</script>

<button type="button" role="switch" aria-checked={dark} aria-label="Tema escuro"
  title={dark ? 'Ativar tema claro' : 'Ativar tema escuro'} onclick={onchange}>
  {#if dark}<Moon size={17} strokeWidth={1.5} aria-hidden="true" />{:else}<Sun size={17} strokeWidth={1.5} aria-hidden="true" />{/if}
  <span aria-hidden="true">{dark ? 'Escuro' : 'Claro'}</span>
</button>

<style>
  button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-width: 82px; min-height: 40px; padding: 8px 6px; background: transparent; border: 0; border-radius: 3px; color: var(--text); cursor: pointer; flex-shrink: 0; }
  span { font: inherit; font-size: 11px; letter-spacing: .015em; }
  button:hover { background: color-mix(in srgb,var(--text) 5%,transparent); }
  button:focus-visible { outline: 2px solid var(--text); outline-offset: 3px; }
  @media (prefers-reduced-motion: no-preference) { button { transition: background 180ms ease; } }
</style>
