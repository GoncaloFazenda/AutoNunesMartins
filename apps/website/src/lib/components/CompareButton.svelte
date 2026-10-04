<script lang="ts">
  import { Check, Plus } from 'lucide-svelte';
  import { useComparison } from '$lib/comparison';
  let { id, name }: { id: string; name: string } = $props();
  const comparison = useComparison();
  const { ids, ready } = comparison;
  const selected = $derived($ids.includes(id));
</script>

<button type="button" class:selected disabled={!$ready} aria-pressed={selected}
  aria-label={`${selected ? 'Remover' : 'Comparar'} ${name}${selected ? ' da comparação' : ''}`}
  onclick={event => { event.stopPropagation(); comparison.toggle(id, name); }}>
  {selected ? 'Na comparação' : 'Comparar'}
  {#if selected}<Check size={15} strokeWidth={1.6} aria-hidden="true" />{:else}<Plus size={15} strokeWidth={1.6} aria-hidden="true" />{/if}
</button>

<style>
  button { display: inline-flex; align-items: center; justify-content: center; gap: 18px; min-height: 44px; padding: 11px 20px; border: 1px solid transparent; border-radius: 999px; background: color-mix(in srgb, var(--text) 7%, var(--bg)); color: var(--text); font: inherit; font-size: 12px; cursor: pointer; }
  button.selected { background: color-mix(in srgb, var(--red) 9%, var(--bg)); border-color: color-mix(in srgb, var(--red) 35%, transparent); }
  button.selected :global(svg) { color: var(--red); }
  button:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  button:disabled { opacity: .5; cursor: wait; }
  @media (hover: hover) { button:hover { background: var(--text); color: var(--bg); } button.selected:hover :global(svg) { color: inherit; } }
  @media (prefers-reduced-motion: no-preference) { button { transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease; } }
</style>
