<script lang="ts">
  import { tick, untrack, type Snippet } from 'svelte';
  import { Heart, ArrowUpRight, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-svelte';
  import { useFavorites } from '$lib/favorites';
  import { publicCard, type PublicCard } from '$lib/publicVehicles';
  import { loadSelectedVehicles, type SelectedVehicle } from '$lib/selectedVehicles';
  let { card }: { card: Snippet<[PublicCard, number]> } = $props();
  const favorites = useFavorites();
  const { ids, ready } = favorites;
  const pageSize = 12;
  let requestedPage = $state(1);
  let refresh = $state(0);
  let entries = $state<SelectedVehicle[]>([]);
  let loading = $state(false);
  let heading: HTMLHeadingElement;
  const pages = $derived(Math.max(1, Math.ceil($ids.length / pageSize)));
  const currentPage = $derived(Math.min(requestedPage, pages));
  $effect(() => {
    const selected = $ids.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    refresh;
    if (!$ready || !selected.length) { entries = []; loading = false; return; }
    const controller = new AbortController();
    loading = true;
    // Keep remaining cards mounted during removal so keyboard focus can be restored.
    entries = untrack(() => entries.filter(entry => selected.includes(entry.id)));
    void loadSelectedVehicles(selected, controller.signal).then(fresh => {
      if (!controller.signal.aborted) { entries = fresh; loading = false; }
    });
    return () => controller.abort();
  });
  async function remove(id?: string) {
    if (id) favorites.remove(id); else favorites.clear();
    await tick(); heading?.focus({ preventScroll: true });
  }
  async function changePage(value: number) {
    requestedPage = value;
    await tick(); heading?.focus();
  }
</script>

<svelte:head><title>Favoritos — Auto Nunes Martins</title><meta name="robots" content="noindex, follow" /><meta name="description" content="Retome as viaturas que guardou e compare as suas opções ao seu ritmo." /></svelte:head>
<main class="favorites-page">
  <a class="back" href="/viaturas"><ArrowLeft size={15} aria-hidden="true" /> Explorar viaturas</a>
  <div class="intro"><div><p class="eyebrow">AS ESCOLHAS QUE FICAM</p><h1 bind:this={heading} tabindex="-1">Chamaram-lhe<br /><span>a atenção.</span></h1><p class="lead">Guarde o que faz sentido. Volte aos detalhes quando quiser.</p></div><Heart class="intro-heart" size={66} strokeWidth={1} aria-hidden="true" /></div>
  {#if !$ready}<p role="status">A preparar os seus favoritos…</p>
  {:else if !$ids.length}
    <section class="empty"><Heart size={38} strokeWidth={1.2} aria-hidden="true" /><h2>A sua seleção começa aqui.</h2><p>Use o coração nas viaturas que lhe despertam interesse. Ficam guardadas neste navegador, sem precisar de criar uma conta.</p><a class="primary" href="/viaturas">Descobrir viaturas <ArrowUpRight size={18} aria-hidden="true" /></a></section>
  {:else}
    <div class="toolbar"><p>{$ids.length} {$ids.length === 1 ? 'viatura guardada' : 'viaturas guardadas'}</p><button type="button" onclick={() => remove()}>Limpar favoritos</button></div>
    {#if loading}<p role="status" class="loading">A consultar os dados atuais…</p>{/if}
    {#if entries.some(entry => entry.status === 503)}<div class="retry"><p>Alguns dados estão temporariamente indisponíveis.</p><button type="button" onclick={() => refresh += 1}><RotateCcw size={16} /> Tentar novamente</button></div>{/if}
    <div class="favorites-grid">
      {#each entries as entry, index (entry.id)}
        {#if entry.vehicle}{@render card(publicCard(entry.vehicle), index)}
        {:else}<article class="unavailable"><Heart size={28} strokeWidth={1.2} aria-hidden="true" /><h2>{entry.status === 404 ? 'Já não está publicada.' : 'Dados por atualizar.'}</h2><p>{entry.status === 404 ? 'Esta viatura deixou de estar disponível no catálogo. Pode removê-la dos favoritos.' : 'O favorito está guardado. Tente consultar os dados novamente.'}</p><button type="button" onclick={() => remove(entry.id)}>Remover dos favoritos</button></article>{/if}
      {/each}
    </div>
    {#if pages > 1}<nav class="pagination" aria-label="Paginação de favoritos"><button type="button" disabled={currentPage === 1} onclick={() => changePage(currentPage - 1)}><ArrowLeft size={16} /> Anterior</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage === pages} onclick={() => changePage(currentPage + 1)}>Seguinte <ArrowRight size={16} /></button></nav>{/if}
    <p class="note">Guardados apenas neste navegador. Limpar os dados do navegador remove a seleção. Os detalhes são consultados no catálogo atual.</p>
  {/if}
  <p class="storage-note">As suas escolhas ficam guardadas neste navegador, sem criar conta. Pode removê-las a qualquer momento. <a href="/politica-de-privacidade#escolhas">Política de privacidade</a></p>
</main>
<style>
  .favorites-page { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin: auto; padding: 46px 0 104px; color: var(--text); }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; color: inherit; cursor: pointer; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  h1:focus { outline: none; }
  .back { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font-size: 12px; color: var(--muted); }
  .intro { display: flex; align-items: center; justify-content: space-between; gap: 30px; padding: 38px 0 48px; }
  .intro :global(.intro-heart) { color: var(--red); flex-shrink: 0; margin-right: 3%; }
  .eyebrow { margin: 0 0 20px; font-size: 10px; color: var(--muted); letter-spacing: .12em; }
  h1 { font-size: clamp(42px, 5.5vw, 80px); font-weight: 500; letter-spacing: -.06em; line-height: 1.04; margin: 0; }
  h1 span { color: var(--muted); }
  .lead { color: var(--muted); line-height: 1.8; font-size: 15px; margin: 24px 0 0; }
  .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-top: 1px solid var(--line); padding: 22px 0; font-size: 13px; }
  .toolbar button, .unavailable button, .retry button { border: none; background: none; min-height: 44px; font-size: 12px; text-decoration: underline; text-underline-offset: 4px; }
  .toolbar p, .loading, .note { color: var(--muted); }
  .favorites-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px; }
  .empty { border-block: 1px solid var(--line); padding: 60px 8%; background: color-mix(in srgb, var(--text) 2%, var(--bg)); }
  .empty > :global(svg) { color: var(--red); }
  h2 { font-size: clamp(26px, 3vw, 40px); font-weight: 500; letter-spacing: -.04em; line-height: 1.15; }
  .empty p { max-width: 52ch; color: var(--muted); font-size: 15px; line-height: 1.8; }
  .primary { display: inline-flex; align-items: center; gap: 24px; background: var(--text); color: var(--bg); border-radius: 30px; padding: 15px 24px; min-height: 48px; margin-top: 18px; font-size: 13px; }
  .unavailable { border: 1px solid var(--line); padding: 38px 28px; min-height: 290px; }
  .unavailable h2 { font-size: 30px; }
  .unavailable p { color: var(--muted); font-size: 14px; line-height: 1.8; }
  .pagination { display: flex; align-items: center; justify-content: center; gap: 30px; margin-top: 36px; font-size: 13px; }
  .pagination button, .retry button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; border: none; background: none; }
  .pagination button:disabled { opacity: .35; cursor: default; }
  .retry { display: flex; align-items: center; gap: 20px; font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .note { margin: 28px 0 0; line-height: 1.8; font-size: 12px; }
  .storage-note { margin: 28px 0 0; max-width: 90ch; font-size: 12px; line-height: 1.8; color: var(--muted); }
  .storage-note a { text-decoration: underline; text-underline-offset: 3px; }
  @media (hover: hover) { .primary:hover { background: var(--red); color: white; } }
  @media (max-width: 1000px) { .favorites-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; } }
  @media (max-width: 700px) { .favorites-page { padding: 20px 0 72px; } .intro { padding: 26px 0 32px; gap: 12px; } h1 { font-size: clamp(34px, 8vw, 52px); } .intro :global(.intro-heart) { width: 40px; } .lead { font-size: 13px; } .favorites-grid { grid-template-columns: 1fr; gap: 24px; } .empty { padding: 36px 22px; } .retry { align-items: flex-start; flex-direction: column; gap: 0; } }
</style>
