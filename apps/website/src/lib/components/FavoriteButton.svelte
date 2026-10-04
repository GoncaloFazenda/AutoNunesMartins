<script lang="ts">
  import { Heart } from 'lucide-svelte';
  import { tick } from 'svelte';
  import { useFavorites } from '$lib/favorites';
  let { id, name, text = false }: { id: string; name: string; text?: boolean } = $props();
  const favorites = useFavorites();
  const { ids, ready } = favorites;
  const selected = $derived($ids.includes(id));
</script>
<button type="button" class:with-text={text} class:selected disabled={!$ready} aria-pressed={selected}
  aria-label={`${selected ? 'Remover' : 'Guardar'} ${name}${selected ? ' dos favoritos' : ' nos favoritos'}`}
  onclick={async event => {
    event.stopPropagation();
    const button = event.currentTarget;
    favorites.toggle(id, name);
    await tick();
    if (!button.isConnected) document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }}>
  <Heart size={18} strokeWidth={1.5} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
  {#if text}{selected ? 'Guardada' : 'Guardar'}{/if}
</button>
<style>
  button { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 9px; min-width: 44px; min-height: 44px; padding: 10px; background: none; border: none; border-radius: 50%; color: var(--muted); font: inherit; font-size: 12px; cursor: pointer; }
  button.with-text { border-radius: 30px; }
  button.selected { color: var(--red); }
  button:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }
  button:disabled { opacity: .5; cursor: wait; }
  @media (hover: hover) { button:hover { color: var(--red); background: color-mix(in srgb, var(--text) 5%, transparent); } }
</style>
