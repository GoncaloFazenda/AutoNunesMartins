<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick, onDestroy } from 'svelte';
  import { page, navigating } from '$app/stores';
  import { goto, beforeNavigate } from '$app/navigation';
  import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from 'lucide-svelte';
  import {
    publicCard,
    publicCatalogSeo,
    fuelLabels,
    type PublicCard,
    type PublicStock,
  } from '$lib/publicVehicles';
  import OrbitSelect from './OrbitSelect.svelte';
  import OrbitCatalogEditorial from './OrbitCatalogEditorial.svelte';
  import type { PublicBrandDirectory } from '$lib/catalogBrandLinks';
  import { catalogSticky } from './catalogSticky';
  import { catalogInputErrors } from './catalogFilters';
  import { sortOptions, catalogUrl } from './catalog';
  import { catalogUiLabels as filterLabels, catalogUiParams, catalogYearOptions } from '$lib/catalogUiFilters';
  type FilterKey = keyof typeof filterLabels;

  let { card, stock, brandDirectory = { status: 'unavailable', brands: [] } }: { card: Snippet<[PublicCard, number]>; stock: PublicStock; brandDirectory?: PublicBrandDirectory } = $props();
  const params = $derived($page.url.searchParams);
  let draftQuery = $state<string | null>(null);
  let updating = $state(false);
  let paging = $state(false);
  let resultsGrid: HTMLDivElement;
  let pageAnimation: Animation | undefined;
  let navigationError = $state('');
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let requestVersion = 0;
  const formParams = $derived(new URLSearchParams(draftQuery ?? params.toString()));
  const inputErrors = $derived(catalogInputErrors(formParams));
  const busy = $derived(updating || paging || !!$navigating);
  const results = $derived({
    ...stock.catalog,
    pages: stock.catalog.totalPages,
    items: stock.catalog.items.map(publicCard),
  });
  const brands = $derived(stock.catalog.facets.brands.map((item) => item.value));
  const fuels = $derived(
    stock.catalog.facets.fuels.map((item) => ({
      value: item.value,
      label: fuelLabels[item.value as keyof typeof fuelLabels] ?? item.value,
    })),
  );
  const brand = $derived(formParams.get('marca') ?? '');
  const years = $derived(catalogYearOptions($page.data.catalogYearRange ?? stock.catalog.facets.year, formParams.get('ano_min') ?? ''));
  const active = $derived(
    (Object.keys(filterLabels) as FilterKey[]).filter((key) => formParams.get(key)),
  );
  const seo = $derived(publicCatalogSeo(params, $page.url.origin, stock));
  const pageNumbers = $derived(
    Array.from(
      { length: Math.min(7, results.pages) },
      (_, i) => Math.max(1, Math.min(results.page - 3, results.pages - 6)) + i,
    ),
  );
  let filtersOpen = $state(false);
  let resultsHeading: HTMLHeadingElement;
  let filterToggle: HTMLButtonElement;
  function filterValue(key: FilterKey) {
    const value = formParams.get(key) ?? '';
    if (key === 'combustivel') return fuelLabels[value as keyof typeof fuelLabels] ?? value;
    return value;
  }
  function resetDraft() {
    pageAnimation?.cancel();
    paging = false;
    clearTimeout(debounce);
    requestVersion += 1;
    draftQuery = null;
    updating = false;
    navigationError = '';
  }
  beforeNavigate(navigation => {
    // Back/forward and actual links win over unfinished typing; never replay a stale timer.
    if (navigation.type !== 'goto' || navigation.to?.url.pathname !== $page.url.pathname) resetDraft();
  });
  onDestroy(() => { clearTimeout(debounce); pageAnimation?.cancel(); requestVersion += 1; });
  async function applyDraft() {
    clearTimeout(debounce);
    if (catalogInputErrors(formParams).length) { updating = false; return false; }
    if (draftQuery === null) return true;
    const query = draftQuery;
    if (catalogInputErrors(new URLSearchParams(query)).length) { updating = false; return false; }
    const version = ++requestVersion;
    updating = true;
    try {
      // Push committed searches so browser history can restore a previous selection.
      await goto(`/viaturas${query ? `?${query}` : ''}`, { noScroll: true, keepFocus: true });
      if (version === requestVersion && draftQuery === query) { draftQuery = null; updating = false; }
      return version === requestVersion;
    } catch {
      if (version === requestVersion) { updating = false; navigationError = 'Não foi possível atualizar a pesquisa. Tente novamente.'; }
      return false;
    }
  }
  function update(key: string, value: string, delay = 0) {
    pageAnimation?.cancel();
    paging = false;
    clearTimeout(debounce);
    requestVersion += 1;
    navigationError = '';
    const next = catalogUiParams(formParams, key, value);
    draftQuery = next.toString();
    updating = !catalogInputErrors(next).length;
    if (!updating) return;
    if (delay) debounce = setTimeout(() => { void applyDraft(); }, delay);
    else void applyDraft();
  }
  function clear() {
    resetDraft();
    draftQuery = '';
    void applyDraft();
  }
  async function showResults(smooth = false) {
    filtersOpen = false;
    await tick();
    resultsHeading.focus({ preventScroll: true });
    resultsHeading.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'instant' });
  }
  function closeFilters(event: KeyboardEvent) {
    if (event.key === 'Escape' && filtersOpen) {
      filtersOpen = false;
      filterToggle.focus();
    }
  }
  async function changePage(event: MouseEvent) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    if (busy || inputErrors.length) return;
    resetDraft();
    const href = (event.currentTarget as HTMLAnchorElement).href;
    if (href === $page.url.href) return;
    const version = requestVersion;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    paging = true;
    try {
      if (!reduced) {
        pageAnimation = resultsGrid.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 140, easing: 'ease-out', fill: 'forwards' });
        await pageAnimation.finished;
      }
      if (version !== requestVersion) return;
      await goto(href, { noScroll: true, keepFocus: true });
      if (version !== requestVersion) return;
      await showResults(!reduced);
      if (version !== requestVersion) return;
      pageAnimation?.cancel();
      if (!reduced) {
        pageAnimation = resultsGrid.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
        await pageAnimation.finished;
      }
    } catch {
      if (version === requestVersion) navigationError = 'Não foi possível mudar de página. Tente novamente.';
    } finally {
      if (version === requestVersion) { pageAnimation?.cancel(); paging = false; }
    }
  }
</script>

<svelte:window onkeydown={closeFilters} />

<svelte:head>
  <title>{seo.heading} — Auto Nunes Martins</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonical} />
  <meta property="og:url" content={seo.canonical} />
  <meta name="robots" content={seo.noindex ? 'noindex, follow' : 'index, follow'} />
</svelte:head>

<main class="catalog" id="inicio">
  <div class="catalog-intro">
    <div>
      <p class="eyebrow">A SELEÇÃO · AO SEU RITMO</p>
      <h1>{seo.heading}<span aria-hidden="true">.</span></h1>
      <p class="intro-count">
        {#if stock.status === 'unavailable'}Estamos a tentar recuperar a seleção.
        {:else if stock.status === 'invalid'}Ajuste os filtros para explorar a seleção.
        {:else}
        {results.total}
        {results.total === 1 ? 'possibilidade para descobrir' : 'possibilidades para descobrir'}.
        {/if}
      </p>
    </div>
    <p>
      Comece pelo que importa para si.<br />Compare os detalhes. Guarde os favoritos.
    </p>
  </div>
  <div class="catalog-layout">
    <aside class="catalog-filters" aria-label="Filtros de viaturas">
      <div class="filter-sticky" use:catalogSticky>
      <button
        class="filter-toggle"
        bind:this={filterToggle}
        aria-expanded={filtersOpen}
        aria-controls="catalog-filter-panel"
        onclick={() => (filtersOpen = !filtersOpen)}
      >
        <SlidersHorizontal size={17} /> Filtros {active.length ? `(${active.length})` : ''}<span
          >{filtersOpen ? 'Fechar −' : 'Abrir +'}</span
        >
      </button>
      <div id="catalog-filter-panel" class:expanded={filtersOpen}>
        <form
          action="/viaturas"
          method="GET"
          onsubmit={async (event) => {
            event.preventDefault();
            if (await applyDraft()) await showResults();
          }}
        >
          <div class="filter-heading">
            <h2>O que procura?</h2>
            <button
              type="button"
              class="clear"
              onclick={clear}
              disabled={!active.length && !formParams.size}>Limpar</button
            >
          </div>
          <label
            >Pesquisar<input
              name="q"
              type="search"
              placeholder="Marca, modelo ou versão"
              maxlength="120"
              value={formParams.get('q') ?? ''}
              oninput={(event) => update('q', event.currentTarget.value, 300)}
            /></label
          >
          <OrbitSelect
            id="catalog-brand"
            label="Marca"
            name="marca"
            value={brand}
            disabled={busy}
            options={[
              { value: '', label: brands.length ? 'Todas as marcas' : 'Sem marcas para estes filtros' },
              ...brands.map((value) => ({ value, label: value })),
            ]}
            onChange={(value) => update('marca', value)}
          />
          <label>Preço máximo (€)<input name="preco_max" type="number" inputmode="decimal" min="0" max="9999999999.99" step="0.01" placeholder="Sem limite" value={formParams.get('preco_max') ?? ''} aria-describedby={inputErrors.length ? 'catalog-input-errors' : undefined} oninput={(event) => update('preco_max', event.currentTarget.value, 300)} /></label>
          <OrbitSelect id="catalog-year" label="Ano" name="ano_min" value={formParams.get('ano_min') ?? ''} disabled={busy} options={[{ value: '', label: 'Todos os anos' }, ...years]} onChange={(value) => update('ano_min', value)} />
          {#if formParams.get('ano_min')}<input type="hidden" name="ano_max" value={formParams.get('ano_min')} />{/if}
          {#if inputErrors.length}<div id="catalog-input-errors" class="range-note" role="alert">
              {#each inputErrors as error}<p>{error}</p>{/each}
              <p>Corrija os campos para atualizar os resultados.</p>
            </div>{/if}
          {#if navigationError}<p class="range-note" role="alert">{navigationError}</p>{/if}
          <OrbitSelect
            id="catalog-fuel"
            label="Combustível"
            name="combustivel"
            value={formParams.get('combustivel') ?? ''}
            disabled={busy}
            options={[{ value: '', label: 'Todos' }, ...fuels]}
            onChange={(value) => update('combustivel', value)}
          />
          <button class="apply-filters" type="submit" disabled={busy || inputErrors.length > 0}
            >{busy ? 'A atualizar…' : `Ver ${results.total} ${results.total === 1 ? 'viatura' : 'viaturas'}`}<ArrowRight size={16} /></button
          >
        </form>
      </div>
      </div>
    </aside>
    <section
      class="catalog-results"
      aria-labelledby="catalog-results-heading"
      aria-busy={busy}
    >
      <div class="results-toolbar">
        <div>
          <h2 id="catalog-results-heading" bind:this={resultsHeading} tabindex="-1">
            As suas possibilidades<span>.</span>
          </h2>
          <p role="status" aria-live="polite" aria-atomic="true">
            {#if busy}A atualizar resultados…{:else if stock.status === 'unavailable'}Não foi possível consultar os resultados.{:else if stock.status === 'invalid'}Os filtros precisam de ser corrigidos.{:else}
            {results.total}
            {results.total === 1
              ? 'viatura encontrada'
              : 'viaturas encontradas'}{#if results.items.length}
              {' · '}{(results.page - 1) * results.pageSize + 1}–{Math.min(
                results.page * results.pageSize,
                results.total,
              )} de {results.total}{/if}
            {/if}
          </p>
        </div>
        <div class="sort-label">
          <OrbitSelect
            id="catalog-sort"
            label="Ordenar por"
            name="ordem"
            value={formParams.get('ordem') ?? 'relevancia'}
            disabled={busy}
            options={Object.entries(sortOptions).map(([value, label]) => ({ value, label }))}
            onChange={(value) => update('ordem', value)}
            subtle
          />
        </div>
      </div>
      {#if active.length}<div class="active-filters" aria-label="Filtros selecionados">
          {#each active as key}<button
              onclick={() => update(key, '')}
              aria-label={`Remover filtro ${filterLabels[key]}: ${filterValue(key)}`}
              >{filterLabels[key]}: {filterValue(key)}<X size={13} aria-hidden="true" /></button
            >{/each}<button class="clear-all" onclick={clear}>Limpar filtros</button>
        </div>{/if}
      <div class="catalog-grid" bind:this={resultsGrid}>
        {#each results.items as vehicle, index (vehicle.id)}{@render card(
            vehicle,
            index,
          )}{:else}<div class="empty-state">
            <span aria-hidden="true">↗</span>
            <h3>
              {stock.status === 'unavailable'
                ? 'Catálogo temporariamente indisponível.'
                : stock.status === 'invalid'
                  ? 'Verifique os filtros da pesquisa.'
                  : active.length
                    ? 'Ainda não encontrámos essa combinação.'
                    : results.total
                      ? 'Esta página não tem viaturas.'
                      : 'Ainda não há viaturas publicadas.'}
            </h3>
            <p>
              {stock.status === 'unavailable'
                ? 'Não foi possível consultar o stock. Tente novamente mais tarde.'
                : stock.status === 'invalid'
                  ? 'Use valores válidos e intervalos em que o mínimo não excede o máximo.'
                  : active.length
                    ? 'Experimente alargar o preço, o ano ou escolher outra marca.'
                    : 'A seleção aparece aqui após aprovação para o website.'}
            </p>
            <button onclick={clear}>Limpar filtros <ArrowRight size={16} /></button>
          </div>{/each}
      </div>
    </section>
    <div class="catalog-tail">
      {#if results.total}<nav class="pagination" aria-label="Paginação de viaturas">
          {#if results.page > 1}<a
              href={catalogUrl(params, 'pagina', String(results.page - 1))}
              aria-label="Página anterior"
              onclick={changePage}><ArrowLeft size={16} /><span>Anterior</span></a
            >{:else}<span class="disabled" aria-disabled="true"
              ><ArrowLeft size={16} /><span>Anterior</span></span
            >{/if}
          <div>
            {#each pageNumbers as number}<a
                href={catalogUrl(params, 'pagina', String(number))}
                aria-label={`Página ${number}`}
                aria-current={number === results.page ? 'page' : undefined}
                onclick={changePage}>{number}</a
              >{/each}
          </div>
          {#if results.page < results.pages}<a
              href={catalogUrl(params, 'pagina', String(results.page + 1))}
              aria-label="Página seguinte"
              onclick={changePage}><span>Seguinte</span><ArrowRight size={16} /></a
            >{:else}<span class="disabled" aria-disabled="true"
              ><span>Seguinte</span><ArrowRight size={16} /></span
            >{/if}
        </nav>{/if}
    </div>
  </div>
  <OrbitCatalogEditorial {params} {stock} {brandDirectory} />
</main>

<style>
  .catalog {
    --catalog-heading-gap: 14px;
    width: var(--orbit-frame);
    max-width: var(--orbit-frame-max);
    margin: auto;
    padding: var(--orbit-space-half) 0 var(--orbit-space-section);
  }
  * {
    box-sizing: border-box;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  button,
  input {
    font: inherit;
    color: inherit;
  }
  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }
  button {
    cursor: pointer;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 4px;
  }
  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .eyebrow {
    font-size: var(--orbit-type-label);
    letter-spacing: 0.13em;
    color: var(--muted);
  }
  .catalog-intro {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 32px;
    padding-bottom: var(--orbit-space-heading);
    border-bottom: 1px solid var(--line);
  }
  h1 {
    font-family: inherit;
    /* A page title keeps a continuous scale across the stacked-filter breakpoint. */
    font-size: clamp(36px, 4.1vw, 64px);
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.045em;
    margin-top: 18px;
    max-width: 15ch;
  }
  h1 span {
    color: var(--red);
  }
  .intro-count {
    margin-top: 16px;
    color: var(--muted);
    font-size: 13px;
  }
  .catalog-intro > p {
    color: var(--muted);
    font-size: var(--orbit-type-reading);
    line-height: var(--orbit-leading-reading);
    max-width: 35ch;
  }
  .catalog-layout {
    display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
    gap: 0 48px;
    padding-top: 36px;
  }
  .catalog-filters {
    min-width: 0;
    min-height: 0;
  }
  .filter-sticky {
    min-width: 0;
    position: relative;
    top: var(--catalog-filter-shift, 0px);
    transition: none;
  }
  .filter-sticky:global(.native-sticky) {
    position: sticky;
    top: calc(var(--nav-visible-height, 0px) + 24px);
    transform: none;
  }
  .catalog-tail {
    grid-column: 2;
    min-width: 0;
  }
  .filter-toggle {
    display: none;
  }
  form {
    display: grid;
    gap: 18px;
  }
  .filter-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .filter-heading h2 {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.035em;
  }
  .clear {
    border: 0;
    background: none;
    color: var(--muted);
    font-size: 12px;
    min-height: 44px;
    text-decoration: underline;
  }
  label {
    display: grid;
    gap: 8px;
    font-size: 12px;
    min-width: 0;
  }
  input {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 10px 11px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 3px;
    font-size: var(--orbit-type-control, 16px);
  }
  input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  .catalog-filters :global(.orbit-select .select-trigger),
  .catalog-filters :global(.orbit-select .select-list button) {
    font-size: var(--orbit-type-control);
  }
  .catalog input:focus,
  .catalog :global(.orbit-select .select-trigger:focus),
  .catalog :global(.orbit-select.open .select-trigger) {
    outline: none;
    border-color: var(--red);
    box-shadow: inset 0 0 0 .35px var(--red);
  }
  .range-note {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.7;
  }
  .range-note {
    color: var(--text);
    border-left: 2px solid var(--red);
    padding-left: 10px;
  }
  .apply-filters {
    min-height: 46px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--text);
    color: var(--bg);
    border: 0;
    border-radius: 3px;
    padding: 12px 16px;
    font-size: var(--orbit-type-body);
  }
  .results-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
  }
  .results-toolbar h2 {
    font-size: clamp(23px, 2.2vw, 32px);
    letter-spacing: -0.04em;
    font-weight: 500;
    scroll-margin-top: 24px;
  }
  .results-toolbar h2 span {
    color: var(--red);
  }
  .results-toolbar p {
    font-size: 12px;
    color: var(--muted);
    margin-top: 7px;
  }
  .sort-label {
    width: 200px;
    flex-shrink: 0;
    font-size: 11px;
    color: var(--muted);
  }
  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 24px;
  }
  .active-filters button {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--line);
    background: transparent;
    border-radius: 3px;
    padding: 8px 10px;
    min-height: 36px;
    font-size: 11px;
    max-width: 100%;
    overflow-wrap: anywhere;
    text-align: left;
  }
  .active-filters .clear-all {
    border: 0;
    text-decoration: underline;
    color: var(--muted);
  }
  .catalog-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 40px 24px;
  }
  .empty-state {
    grid-column: 1/-1;
    min-height: 350px;
    padding: 40px 0;
  }
  .empty-state > span {
    color: var(--red);
    font-size: 42px;
  }
  .empty-state h3 {
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.04em;
    font-weight: 500;
    margin: 12px 0;
  }
  .empty-state p {
    color: var(--muted);
    max-width: 40ch;
    font-size: 14px;
    line-height: 1.7;
  }
  .empty-state button {
    display: flex;
    align-items: center;
    gap: 24px;
    min-height: 44px;
    border: 0;
    border-bottom: 1px solid var(--line);
    padding: 8px 0;
    margin-top: 20px;
    background: transparent;
  }
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--line);
    padding-top: 24px;
    margin-top: 36px;
    gap: 8px;
    font-size: 12px;
  }
  .pagination div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    min-width: 0;
    gap: 8px;
  }
  .pagination a,
  .pagination > span {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .pagination > a, .pagination > span { flex-shrink: 0; }
  .pagination [aria-current] {
    background: var(--text);
    color: var(--bg);
    border-radius: 50%;
  }
  .disabled {
    color: var(--muted);
    opacity: 0.5;
  }
  @media (max-width: 1200px) {
    .catalog-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 1100px) {
    .catalog-layout {
      column-gap: 28px;
      grid-template-columns: 218px minmax(0, 1fr);
    }
    .results-toolbar {
      align-items: start;
      flex-direction: column;
      gap: 16px;
    }
    .sort-label {
      width: 100%;
    }
  }
  @media (max-width: 800px) {
    .filter-sticky { transform: none; }
    .catalog-tail { grid-column: 1; margin-top: -28px; }
    .catalog {
      padding-top: 32px;
    }
    .catalog-intro {
      gap: 24px;
      align-items: start;
      flex-direction: column;
      padding-bottom: 28px;
    }
    .catalog-layout {
      grid-template-columns: minmax(0, 1fr);
      padding-top: 24px;
      gap: 28px;
    }
    .filter-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
      min-height: 48px;
      border: 0;
      border-bottom: 1px solid var(--line);
      background: transparent;
      font-size: 14px;
    }
    .filter-toggle span {
      margin-left: auto;
      color: var(--muted);
      font-size: 12px;
    }
    #catalog-filter-panel {
      display: none;
    }
    #catalog-filter-panel.expanded {
      display: block;
      padding: 16px 0 24px;
      border-bottom: 1px solid var(--line);
    }
    form {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 20px;
    }
    .filter-heading,
    .range-note,
    .apply-filters {
      grid-column: 1/-1;
    }
    .results-toolbar {
      flex-direction: row;
      align-items: end;
    }
    .sort-label {
      width: 180px;
    }
  }
  @media (max-width: 540px) {
    form {
      grid-template-columns: minmax(0, 1fr);
    }
    .catalog-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 32px;
    }
    .results-toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .sort-label {
      width: 100%;
    }
    .pagination > a > span,
    .pagination > .disabled > span {
      display: none;
    }
  }
</style>
