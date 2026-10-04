<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { ArrowUpRight, ArrowLeft, Plus, X, RotateCcw } from 'lucide-svelte';
  import { useComparison, comparisonRows } from '$lib/comparison';
  import { publicHref, publicPhoto, publicPrice } from '$lib/publicVehicles';
  import { loadSelectedVehicles, type SelectedVehicle as Entry } from '$lib/selectedVehicles';
  const comparison = useComparison();
  const { ids, ready } = comparison;
  let entries = $state<Entry[]>([]);
  let loading = $state(false);
  let reload = $state(0);
  let heading: HTMLHeadingElement;
  let compact = $state(false);
  let pair = $state('0-1');
  const pairs = [[0, 1], [0, 2], [1, 2]] as const;
  const visible = $derived(compact && entries.length === 3
    ? pair.split('-').map(index => entries[Number(index)]!).filter(Boolean)
    : entries);
  const facts = comparisonRows.filter(row => row.label !== 'Preço');
  onMount(() => {
    const media = matchMedia('(max-width: 700px)');
    const update = () => { compact = media.matches; };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  const name = (entry: Entry) => entry.vehicle ? `${entry.vehicle.brand} ${entry.vehicle.model}` : 'Viatura indisponível';
  $effect(() => {
    const selected = [...$ids];
    reload;
    if (!$ready || !selected.length) { entries = []; loading = false; return; }
    const controller = new AbortController();
    entries = [];
    loading = true;
    void (async () => {
      try {
        const fresh = await loadSelectedVehicles(selected, controller.signal);
        if (!controller.signal.aborted) entries = fresh;
      } catch {
        if (!controller.signal.aborted) entries = selected.map(id => ({ id, status: 503, vehicle: null }));
      } finally { if (!controller.signal.aborted) loading = false; }
    })();
    return () => controller.abort();
  });
  async function remove(entry?: Entry) {
    if (entry) comparison.remove(entry.id, name(entry));
    else comparison.clear();
    await tick();
    heading?.focus({ preventScroll: true });
  }
</script>

<svelte:head>
  <title>Comparar viaturas — Auto Nunes Martins</title>
  <meta name="description" content="Compare até três viaturas lado a lado: preço, quilometragem e características publicadas." />
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<main class="comparison-page">
  <a class="back" href="/viaturas"><ArrowLeft size={16} aria-hidden="true" /> Viaturas</a>
  <header class="page-heading">
    <h1 bind:this={heading} tabindex="-1">Comparar viaturas<span>.</span></h1>
    {#if $ready && $ids.length}
      <div class="actions">
        <a class="add" href="/viaturas">{$ids.length < 3 ? 'Adicionar viatura' : 'Ver catálogo'} <Plus size={17} aria-hidden="true" /></a>
        <button class="clear" type="button" onclick={() => remove()}>Limpar</button>
      </div>
    {/if}
  </header>

  {#if !$ready || loading}
    <p role="status" class="loading">A carregar as viaturas…</p>
  {:else if !$ids.length}
    <section class="empty" aria-labelledby="empty-title">
      <div class="empty-slots" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
      <h2 id="empty-title">Quais são as suas opções?</h2>
      <p>Escolha até três viaturas e veja os detalhes lado a lado.</p>
      <a class="primary" href="/viaturas">Escolher viaturas <ArrowUpRight size={18} aria-hidden="true" /></a>
    </section>
  {:else}
    {#if entries.some(entry => entry.status === 503)}
      <div class="retry" role="status"><p>Alguns dados estão temporariamente indisponíveis.</p><button type="button" onclick={() => reload += 1}><RotateCcw size={16} aria-hidden="true" /> Tentar novamente</button></div>
    {/if}
    {#if compact && entries.length === 3}
      <div class="pair-picker">
        <label for="comparison-pair">Comparar lado a lado</label>
        <select id="comparison-pair" bind:value={pair}>
          {#each pairs as indexes}
            <option value={indexes.join('-')}>{name(entries[indexes[0]]!)} + {name(entries[indexes[1]]!)}</option>
          {/each}
        </select>
      </div>
    {/if}
    <div class="comparison-board" class:single={visible.length === 1}>
      <table>
        <caption class="sr-only">Comparação de {visible.map(name).join(' e ')}</caption>
        <thead>
          <tr class="photo-row">
            {#each visible as entry (entry.id)}
              <td>
                <div class="vehicle-photo">
                  {#if entry.vehicle}
                    <a href={publicHref(entry.id)} aria-label={`Ver ${name(entry)}`}><img src={entry.vehicle.photos.length ? publicPhoto(entry.id, 0) : '/catalog-placeholder.svg'} alt={entry.vehicle.photos.length ? name(entry) : `Fotografia indisponível: ${name(entry)}`} width="480" height="320" /></a>
                  {:else}<div class="missing-photo"><img src="/catalog-placeholder.svg" alt="Fotografia indisponível" width="480" height="320" /></div>{/if}
                  <button class="remove" type="button" aria-label={`Remover ${name(entry)} da comparação`} onclick={() => remove(entry)}><X size={18} aria-hidden="true" /></button>
                </div>
              </td>
            {/each}
          </tr>
          <tr class="summary-row">
            {#each visible as entry (entry.id)}
              <th scope="col" id={`vehicle-${entry.id}`}>
                {#if entry.vehicle}
                  <span class="brand">{entry.vehicle.brand}</span>
                  <h2><a href={publicHref(entry.id)}>{entry.vehicle.model}</a></h2>
                  <strong class="price">{entry.vehicle.price === null ? 'Preço não indicado' : publicPrice(entry.vehicle.price)}</strong>
                  <a class="detail-link" href={publicHref(entry.id)}>Ver viatura <ArrowUpRight size={16} aria-hidden="true" /></a>
                {:else}
                  <h2>{entry.status === 404 ? 'Já não disponível' : 'Dados por atualizar'}</h2>
                  <p class="unavailable">{entry.status === 404 ? 'Esta viatura deixou de estar publicada.' : 'Tente novamente dentro de instantes.'}</p>
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
        {#each facts as row, index}
          <tbody class="fact-group">
            <tr><th class="fact-label" id={`fact-${index}`} colspan={visible.length}>{row.label}</th></tr>
            <tr>
              {#each visible as entry (entry.id)}
                <td class="fact-value" class:missing={!entry.vehicle || row.value(entry.vehicle) === 'Não indicado'} headers={`vehicle-${entry.id} fact-${index}`}>{entry.vehicle ? row.value(entry.vehicle) : 'Indisponível'}</td>
              {/each}
            </tr>
          </tbody>
        {/each}
      </table>
      {#if visible.length === 1}
        <a class="second-option" href="/viaturas"><Plus size={26} strokeWidth={1.3} aria-hidden="true" /><span>Adicionar outra viatura</span></a>
      {/if}
    </div>
    <p class="data-note">“Não indicado”: informação não publicada na ficha.</p>
  {/if}
  <p class="storage-note">As suas escolhas ficam guardadas neste navegador, sem criar conta. Pode removê-las a qualquer momento. <a href="/politica-de-privacidade#escolhas">Política de privacidade</a></p>
</main>

<style>
  .comparison-page { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin: auto; padding: 30px 0 88px; color: var(--text); }
  a { color: inherit; text-decoration: none; }
  button, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  a:focus-visible, button:focus-visible, select:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  h1:focus { outline: none; }
  .back { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font-size: 14px; color: var(--muted); }
  .page-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin: 20px 0 40px; }
  h1 { font-size: clamp(36px, 4.3vw, 62px); font-weight: 500; letter-spacing: -.055em; line-height: 1.06; margin: 0; }
  h1 > span { color: var(--red); }
  .actions { display: flex; align-items: center; gap: 20px; }
  .add, .primary { display: inline-flex; align-items: center; justify-content: center; gap: 20px; min-height: 46px; padding: 12px 22px; border-radius: 30px; font-size: 14px; background: var(--text); color: var(--bg); }
  .clear { border: 0; background: none; min-height: 44px; padding: 8px; font-size: 14px; color: var(--muted); }
  .clear:hover { color: var(--text); }
  .comparison-board { position: relative; }
  table { width: calc(100% + 32px); margin-inline: -16px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
  td, th { min-width: 0; text-align: left; vertical-align: top; font-weight: 400; }
  .photo-row td, .summary-row th, .fact-value { padding-inline: 16px; }
  .vehicle-photo { position: relative; overflow: hidden; border-radius: 5px; background: var(--surface); }
  .vehicle-photo a { display: block; }
  .vehicle-photo img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover; }
  .remove { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border: 1px solid var(--line); background: var(--bg); color: var(--text); display: grid; place-items: center; border-radius: 50%; }
  .summary-row th { padding-block: 22px 28px; position: sticky; top: 0; z-index: 2; background: var(--bg); border-bottom: 1px solid var(--line); }
  .brand { display: block; color: var(--muted); font-size: 14px; margin-bottom: 7px; }
  h2 { margin: 0; font-size: clamp(23px, 2.5vw, 36px); line-height: 1.15; font-weight: 500; letter-spacing: -.045em; overflow-wrap: anywhere; }
  .summary-row h2 { min-height: 2.3em; }
  .price { display: block; margin-top: 18px; font-size: clamp(21px, 2vw, 28px); font-weight: 500; letter-spacing: -.035em; }
  .detail-link { display: inline-flex; align-items: center; gap: 12px; font-size: 14px; min-height: 44px; margin-top: 10px; }
  .fact-label { padding: 20px 0 8px; color: var(--muted); font-size: 14px; text-align: center; }
  .fact-value { padding-block: 0 22px; border-bottom: 1px solid var(--line); font-size: 18px; line-height: 1.55; text-align: center; overflow-wrap: anywhere; }
  .fact-value + .fact-value { border-left: 1px solid var(--line); }
  .fact-value.missing { color: var(--muted); font-size: 15px; }
  .single { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .second-option { align-self: start; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; aspect-ratio: 3 / 2; min-height: 160px; border: 1px dashed var(--line); border-radius: 5px; color: var(--muted); font-size: 16px; }
  .second-option :global(svg) { color: var(--red); }
  .pair-picker { display: grid; gap: 8px; margin-bottom: 22px; }
  .pair-picker label { color: var(--muted); font-size: 14px; }
  .pair-picker select { width: 100%; min-width: 0; min-height: 46px; padding: 10px 32px 10px 12px; border: 1px solid var(--line); border-radius: 4px; background: var(--bg); font-size: 14px; text-overflow: ellipsis; }
  .empty { padding: 44px 0 54px; border-top: 1px solid var(--line); }
  .empty-slots { display: flex; gap: 14px; margin-bottom: 32px; }
  .empty-slots span { display: grid; place-items: center; width: 76px; height: 58px; border: 1px solid var(--line); border-radius: 4px; color: var(--muted); font-size: 20px; font-variant-numeric: tabular-nums; }
  .empty-slots span:first-child { border-color: var(--red); color: var(--red); }
  .empty h2 { font-size: clamp(28px, 3vw, 42px); }
  .empty p { color: var(--muted); line-height: 1.7; font-size: 16px; margin: 18px 0 28px; }
  .loading { padding: 60px 0; border-block: 1px solid var(--line); font-size: 16px; color: var(--muted); }
  .retry { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 24px; margin-bottom: 26px; font-size: 14px; }
  .retry p { margin: 0; color: var(--muted); }
  .retry button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; border: 0; background: none; text-decoration: underline; text-underline-offset: 4px; }
  .unavailable { color: var(--muted); font-size: 15px; line-height: 1.6; }
  .data-note, .storage-note { color: var(--muted); line-height: 1.7; font-size: 13px; margin: 24px 0 0; max-width: 82ch; }
  .storage-note { margin-top: 36px; }
  .storage-note a { text-decoration: underline; text-underline-offset: 3px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @media (hover: hover) { .add:hover, .primary:hover { background: var(--red); color: white; } .detail-link:hover { text-decoration: underline; text-underline-offset: 4px; } .remove:hover { background: var(--text); color: var(--bg); } }
  @media (prefers-reduced-motion: no-preference) { .add, .primary, .remove { transition: background-color 180ms ease, color 180ms ease; } }
  @media (max-width: 700px) {
    .comparison-page { padding: 14px 0 64px; }
    .page-heading { margin: 14px 0 26px; gap: 20px; }
    h1 { font-size: clamp(34px, 8.5vw, 44px); }
    .actions { width: 100%; justify-content: space-between; gap: 12px; }
    .add { min-height: 44px; padding: 10px 18px; }
    .photo-row td, .summary-row th, .fact-value { padding-inline: 8px; }
    table { width: calc(100% + 16px); margin-inline: -8px; }
    .vehicle-photo { border-radius: 3px; }
    .remove { top: 5px; right: 5px; width: 36px; height: 36px; }
    .remove::before { content: ''; position: absolute; inset: -4px; }
    .summary-row th { padding-block: 16px 18px; }
    .brand { font-size: 13px; margin-bottom: 6px; }
    h2 { font-size: clamp(18px, 4.8vw, 23px); line-height: 1.15; }
    .price { font-size: clamp(18px, 4.8vw, 23px); margin-top: 14px; }
    .detail-link { gap: 8px; font-size: 13px; margin-top: 4px; }
    .fact-label { font-size: 14px; padding-top: 18px; }
    .fact-value { font-size: 16px; padding-bottom: 18px; line-height: 1.5; }
    .fact-value.missing { font-size: 14px; }
    .single { display: flex; flex-direction: column; gap: 24px; }
    .single table { max-width: none; }
    .single .vehicle-photo { max-width: 440px; }
    .single .second-option { order: -1; flex-direction: row; aspect-ratio: auto; min-height: 60px; width: 100%; font-size: 14px; gap: 12px; }
    .empty { padding-block: 24px 36px; }
    .empty h2 { font-size: 28px; }
    .data-note, .storage-note { font-size: 13px; }
  }
</style>
