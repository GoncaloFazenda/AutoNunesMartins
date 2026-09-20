<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import { page, navigating } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from 'lucide-svelte';
  import {
    publicCard,
    publicCatalogSeo,
    fuelLabels,
    transmissionLabels,
    type PublicCard,
    type PublicStock,
  } from '$lib/publicVehicles';
  import OrbitSelect from './OrbitSelect.svelte';
  import { filterLabels, sortOptions, catalogUrl, type FilterKey } from './catalog';

  let { card, stock }: { card: Snippet<[PublicCard, number]>; stock: PublicStock } = $props();
  const params = $derived($page.url.searchParams);
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
  const brand = $derived(params.get('marca') ?? '');
  const models = $derived([...new Set(stock.catalog.facets.models.map((item) => item.value))]);
  const active = $derived(
    (Object.keys(filterLabels) as FilterKey[]).filter((key) => params.get(key)),
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
  const numericFields = [
    ['preco_min', 'Preço mínimo (€)'],
    ['preco_max', 'Preço máximo (€)'],
    ['ano_min', 'Ano mínimo'],
    ['ano_max', 'Ano máximo'],
    ['km_max', 'Quilometragem máxima (km)'],
  ];
  const invalidRange = $derived(
    (params.has('preco_min') &&
      params.has('preco_max') &&
      Number(params.get('preco_min')) > Number(params.get('preco_max'))) ||
      (params.has('ano_min') &&
        params.has('ano_max') &&
        Number(params.get('ano_min')) > Number(params.get('ano_max'))),
  );
  function update(key: string, value: string) {
    void goto(catalogUrl(params, key, value), {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });
  }
  function clear() {
    void goto('/stand-orbit/viaturas', { replaceState: true, noScroll: true, keepFocus: true });
  }
  async function showResults() {
    filtersOpen = false;
    await tick();
    resultsHeading.focus({ preventScroll: true });
    resultsHeading.scrollIntoView({ block: 'start' });
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
    const href = (event.currentTarget as HTMLAnchorElement).href;
    await goto(href, { noScroll: true, keepFocus: true });
    await showResults();
  }
</script>

<svelte:window onkeydown={closeFilters} />

<svelte:head>
  <title>{seo.heading} · {results.total} resultados — Stand Orbit</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonical} />
  <meta name="robots" content={seo.noindex ? 'noindex, follow' : 'index, follow'} />
</svelte:head>

<main class="catalog" id="inicio">
  <div class="catalog-intro">
    <div>
      <p class="eyebrow">A SELEÇÃO · AO SEU RITMO</p>
      <h1>{seo.heading}<span aria-hidden="true">.</span></h1>
      <p class="intro-count">
        {results.total}
        {results.total === 1 ? 'possibilidade para descobrir' : 'possibilidades para descobrir'}.
      </p>
    </div>
    <p>
      Comece pelo que importa para si.<br />Compare os detalhes. Guarde os favoritos.<small
        >Apenas viaturas e dados aprovados para publicação.</small
      >
    </p>
  </div>
  <div class="catalog-layout">
    <aside class="catalog-filters" aria-label="Filtros de viaturas">
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
          action="/stand-orbit/viaturas"
          method="GET"
          onsubmit={(event) => {
            event.preventDefault();
            void showResults();
          }}
        >
          <div class="filter-heading">
            <h2>O que procura?</h2>
            <button
              type="button"
              class="clear"
              onclick={clear}
              disabled={!active.length && !params.has('ordem')}>Limpar</button
            >
          </div>
          <label
            >Pesquisar<input
              name="q"
              type="search"
              placeholder="Marca, modelo ou versão"
              value={params.get('q') ?? ''}
              oninput={(event) => update('q', event.currentTarget.value)}
            /></label
          >
          <OrbitSelect
            id="catalog-brand"
            label="Marca"
            name="marca"
            value={brand}
            options={[
              { value: '', label: 'Todas as marcas' },
              ...brands.map((value) => ({ value, label: value })),
            ]}
            onChange={(value) => update('marca', value)}
          />
          <OrbitSelect
            id="catalog-model"
            label="Modelo"
            name="modelo"
            value={params.get('modelo') ?? ''}
            options={[
              { value: '', label: brand ? 'Todos os modelos' : 'Escolha um modelo' },
              ...models.map((value) => ({ value, label: value })),
            ]}
            onChange={(value) => update('modelo', value)}
          />
          <div class="numeric-fields">
            {#each numericFields as field}<label class:full={field[0] === 'km_max'}
                >{field[1]}<input
                  name={field[0]}
                  type="number"
                  inputmode="numeric"
                  min="0"
                  step="1"
                  placeholder="Sem limite"
                  value={params.get(field[0]!) ?? ''}
                  oninput={(event) => update(field[0]!, event.currentTarget.value)}
                /></label
              >{/each}
          </div>
          {#if invalidRange}<p class="range-note" role="alert">
              O mínimo deve ser igual ou inferior ao máximo.
            </p>{/if}
          <OrbitSelect
            id="catalog-fuel"
            label="Combustível"
            name="combustivel"
            value={params.get('combustivel') ?? ''}
            options={[{ value: '', label: 'Todos' }, ...fuels]}
            onChange={(value) => update('combustivel', value)}
          />
          <OrbitSelect
            id="catalog-transmission"
            label="Transmissão"
            name="transmissao"
            describedBy="transmission-note"
            value={params.get('transmissao') ?? ''}
            options={[
              { value: '', label: 'Todas' },
              ...stock.catalog.facets.transmissions.map((item) => ({
                value: item.value,
                label:
                  transmissionLabels[item.value as keyof typeof transmissionLabels] ?? item.value,
              })),
            ]}
            onChange={(value) => update('transmissao', value)}
          />
          <p id="transmission-note" class="filter-note">
            Compare a caixa indicada na ficha de cada viatura.
          </p>
          <button class="apply-filters" type="submit"
            >Ver {results.total}
            {results.total === 1 ? 'viatura' : 'viaturas'}<ArrowRight size={16} /></button
          >
        </form>
      </div>
    </aside>
    <section
      class="catalog-results"
      aria-labelledby="catalog-results-heading"
      aria-busy={!!$navigating}
    >
      <div class="results-toolbar">
        <div>
          <h2 id="catalog-results-heading" bind:this={resultsHeading} tabindex="-1">
            As suas possibilidades<span>.</span>
          </h2>
          <p role="status" aria-live="polite" aria-atomic="true">
            {results.total}
            {results.total === 1
              ? 'viatura encontrada'
              : 'viaturas encontradas'}{#if results.items.length}
              · {(results.page - 1) * results.pageSize + 1}–{Math.min(
                results.page * results.pageSize,
                results.total,
              )} de {results.total}{/if}
          </p>
        </div>
        <div class="sort-label">
          <OrbitSelect
            id="catalog-sort"
            label="Ordenar por"
            name="ordem"
            value={params.get('ordem') ?? 'relevancia'}
            options={Object.entries(sortOptions).map(([value, label]) => ({ value, label }))}
            onChange={(value) => update('ordem', value)}
            subtle
          />
        </div>
      </div>
      {#if active.length}<div class="active-filters" aria-label="Filtros selecionados">
          {#each active as key}<button
              onclick={() => update(key, '')}
              aria-label={`Remover filtro ${filterLabels[key]}: ${params.get(key)}`}
              >{filterLabels[key]}: {params.get(key)}<X size={13} aria-hidden="true" /></button
            >{/each}<button class="clear-all" onclick={clear}>Limpar filtros</button>
        </div>{/if}
      <div class="catalog-grid">
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
      <section class="catalog-editorial" aria-labelledby="catalog-editorial-heading">
        <p class="eyebrow">UMA ESCOLHA INFORMADA</p>
        <h2 id="catalog-editorial-heading">
          {seo.label ? `${seo.label} usados. Ao seu ritmo.` : 'Um usado. Novas possibilidades.'}
        </h2>
        <p>
          {seo.contextual ||
            'Escolher um carro usado começa por perceber o que faz sentido para os seus dias. Explore a seleção do Stand Orbit, compare os preços, os anos e os quilómetros e consulte os detalhes de cada viatura. Quando encontrar uma possibilidade, fale connosco sobre o histórico, o equipamento e as condições antes de decidir.'}
        </p>
        {#if params.get('modelo') && seo.label}<p>
            Está a explorar {seo.label}. Use os filtros para comparar as versões apresentadas e abra
            a ficha da que se aproxima dos seus planos.
          </p>{/if}
        <p class="editorial-note">
          A disponibilidade e os dados de cada viatura devem ser confirmados com o stand.
        </p>
      </section>
    </section>
  </div>
</main>

<style>
  .catalog {
    width: var(--orbit-frame);
    max-width: var(--orbit-frame-max);
    margin: auto;
    padding: 52px 0 76px;
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
    font-size: 10px;
    letter-spacing: 0.13em;
    color: var(--muted);
  }
  .catalog-intro {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 32px;
    padding-bottom: 44px;
    border-bottom: 1px solid var(--line);
  }
  h1 {
    font-family: inherit;
    font-size: clamp(42px, 4.5vw, 68px);
    font-weight: 600;
    line-height: 1.02;
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
    font-size: 14px;
    line-height: 1.8;
  }
  .catalog-intro small {
    display: block;
    font-size: 11px;
    margin-top: 16px;
  }
  .catalog-layout {
    display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
    gap: 48px;
    padding-top: 36px;
  }
  .catalog-filters {
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
    font-size: 13px;
  }
  input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  .numeric-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 12px;
  }
  .full {
    grid-column: 1/-1;
  }
  .filter-note,
  .range-note {
    color: var(--muted);
    font-size: 11px;
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
    font-size: 13px;
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
  .pagination [aria-current] {
    background: var(--text);
    color: var(--bg);
    border-radius: 50%;
  }
  .disabled {
    color: var(--muted);
    opacity: 0.5;
  }
  .catalog-editorial {
    border-top: 1px solid var(--line);
    padding-top: 36px;
    margin-top: 56px;
  }
  .catalog-editorial h2 {
    font-size: clamp(26px, 2.5vw, 36px);
    letter-spacing: -0.045em;
    font-weight: 500;
    line-height: 1.15;
    margin: 16px 0;
  }
  .catalog-editorial > p:not(.eyebrow) {
    max-width: 72ch;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.85;
  }
  .catalog-editorial .editorial-note {
    font-size: 11px !important;
    margin-top: 16px;
  }
  @media (max-width: 1200px) {
    .catalog-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 1100px) {
    .catalog-layout {
      gap: 28px;
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
    .catalog {
      padding-top: 32px;
    }
    .catalog-intro {
      gap: 24px;
      align-items: start;
      flex-direction: column;
      padding-bottom: 28px;
    }
    .catalog-intro > p {
      font-size: 13px;
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
    .numeric-fields,
    .filter-note,
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
    h1 {
      font-size: clamp(36px, 10.5vw, 52px);
    }
    .pagination > a > span,
    .pagination > .disabled > span {
      display: none;
    }
    .catalog-editorial {
      margin-top: 40px;
    }
  }
</style>
