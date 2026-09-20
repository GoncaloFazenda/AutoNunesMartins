<script lang="ts">
  import { goto } from '$app/navigation';
  import { X } from 'lucide-svelte';
  import BrandSearch from '$lib/components/brand/icons/BrandSearch.svelte';
  import BrandCar from '$lib/components/brand/icons/BrandCar.svelte';
  import BrandDeal from '$lib/components/brand/icons/BrandDeal.svelte';
  import BrandUsers from '$lib/components/brand/icons/BrandUsers.svelte';

  interface Hit {
    id: string;
    primary: string;
    secondary: string | null;
    href: string;
  }
  interface SearchPayload {
    q: string;
    vehicles: Hit[];
    customers: Hit[];
    tasks: Hit[];
    total: number;
  }

  // ─── Local state ────────────────────────────────────────────────────────
  let query = $state('');
  let open = $state(false);
  let loading = $state(false);
  let results = $state<SearchPayload | null>(null);
  let activeIndex = $state(-1);

  let inputEl = $state<HTMLInputElement | null>(null);
  let containerEl = $state<HTMLDivElement | null>(null);

  // Flat list of hits in display order, used for keyboard navigation.
  const flat = $derived<Hit[]>(
    results
      ? [...results.vehicles, ...results.customers, ...results.tasks]
      : [],
  );

  // ─── Client-side LRU cache ──────────────────────────────────────────────
  // Map<query → SearchPayload>. Insertion order = recency. When we hit the
  // size limit, drop the oldest. Repeat queries (very common: typing "Da"
  // → "Dac" → "Dacia" then backspacing back to "Da") render instantly from
  // cache while a fresh network request runs in the background.
  const CACHE_MAX = 50;
  const cache = new Map<string, SearchPayload>();
  function cacheGet(q: string): SearchPayload | undefined {
    const hit = cache.get(q);
    if (hit) {
      // Touch (reinsert) for LRU ordering
      cache.delete(q);
      cache.set(q, hit);
    }
    return hit;
  }
  function cacheSet(q: string, p: SearchPayload) {
    if (cache.has(q)) cache.delete(q);
    cache.set(q, p);
    if (cache.size > CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
  }

  // ─── Debounced fetch ────────────────────────────────────────────────────
  // 50ms is fast enough to feel instant on a keystroke while still
  // collapsing rapid-fire characters into a single request.
  const DEBOUNCE_MS = 50;
  // Don't show the "A pesquisar…" spinner if the request resolves within
  // this window — avoids a loading-flash for warm/cached responses.
  const LOADING_FLASH_DELAY_MS = 180;

  let inflight: AbortController | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let loadingTimer: ReturnType<typeof setTimeout> | null = null;

  function fetchResults(q: string) {
    const needle = q.trim();
    if (needle.length === 0) {
      results = null;
      loading = false;
      if (loadingTimer) clearTimeout(loadingTimer);
      return;
    }

    // Optimistic render from cache — keep showing whatever the user can act
    // on immediately, even while we revalidate in the background.
    const cached = cacheGet(needle);
    if (cached) {
      results = cached;
      activeIndex = cached.total > 0 ? 0 : -1;
    }

    if (inflight) inflight.abort();
    const ctrl = new AbortController();
    inflight = ctrl;

    if (loadingTimer) clearTimeout(loadingTimer);
    if (!cached) {
      // Only show the spinner if there's nothing else to show. Even then,
      // delay it slightly so warm responses don't flicker the chrome.
      loadingTimer = setTimeout(() => {
        if (!ctrl.signal.aborted) loading = true;
      }, LOADING_FLASH_DELAY_MS);
    }

    fetch(`/api/search?q=${encodeURIComponent(needle)}&limit=5`, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    })
      .then((r) => r.json() as Promise<SearchPayload>)
      .then((data) => {
        cacheSet(needle, data);
        results = data;
        loading = false;
        if (loadingTimer) clearTimeout(loadingTimer);
        // Preserve highlight position when possible; otherwise reset to top.
        if (activeIndex < 0 || activeIndex >= data.total) {
          activeIndex = data.total > 0 ? 0 : -1;
        }
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        loading = false;
        if (loadingTimer) clearTimeout(loadingTimer);
      });
  }

  function onInput() {
    open = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchResults(query), DEBOUNCE_MS);
  }

  function clear() {
    query = '';
    results = null;
    activeIndex = -1;
    inputEl?.focus();
  }

  function pick(hit: Hit) {
    open = false;
    query = '';
    results = null;
    activeIndex = -1;
    goto(hit.href);
  }

  // ─── Keyboard handling ──────────────────────────────────────────────────
  function onKeydown(e: KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      open = true;
      return;
    }
    if (e.key === 'Escape') {
      if (query) {
        clear();
      } else {
        open = false;
        inputEl?.blur();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, flat.length - 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      return;
    }
    if (e.key === 'Enter') {
      const target = flat[activeIndex];
      if (activeIndex >= 0 && target) {
        e.preventDefault();
        pick(target);
        return;
      }
      if (query.trim().length > 0) {
        goto(`/viaturas?q=${encodeURIComponent(query.trim())}`);
        open = false;
      }
    }
  }

  // ⌘K / Ctrl+K / "/" to focus from anywhere.
  $effect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        inputEl?.focus();
        inputEl?.select();
        open = true;
      }
      if (
        e.key === '/'
        && document.activeElement?.tagName !== 'INPUT'
        && document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputEl?.focus();
        open = true;
      }
    }
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  });

  // Click-outside dismissal.
  $effect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerEl && !containerEl.contains(e.target as Node)) {
        open = false;
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  });

  // Group offsets used to compute the global keyboard-nav index.
  function groupOffset(group: 'vehicles' | 'customers' | 'tasks'): number {
    if (!results) return 0;
    if (group === 'vehicles') return 0;
    if (group === 'customers') return results.vehicles.length;
    return results.vehicles.length + results.customers.length;
  }

  // Per-entity icon used in the dropdown. Colors stay muted — the icon
  // carries the type signal, no need for chips or rails or accent tints.
  const GROUP_META = {
    vehicles: { label: 'Viaturas', icon: BrandCar },
    customers: { label: 'Clientes', icon: BrandUsers },
    tasks: { label: 'Tarefas', icon: BrandDeal },
  } as const;

  // Scroll the active item into view as it moves with arrow keys.
  let listEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    if (activeIndex < 0 || !listEl) return;
    const el = listEl.querySelector<HTMLElement>(`[data-search-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  });
</script>

<div bind:this={containerEl} class="relative flex-1 max-w-[540px] mx-2">
  <!-- Input shell -->
  <div
    class="gs-input-shell  border rounded-xs  {open ? 'is-open' : ''}"
  >
    <BrandSearch class="h-4 w-4 text-[var(--color-text-faint)] flex-shrink-0" />
    <input
      bind:this={inputEl}
      bind:value={query}
      oninput={onInput}
      onfocus={() => (open = true)}
      onkeydown={onKeydown}
      type="search"
      placeholder="Pesquisar viaturas, clientes, tarefas…"
      class="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="Pesquisar"
      aria-expanded={open}
      aria-controls="global-search-results"
    />
    {#if loading}
      <span class="gs-spinner" aria-hidden="true"></span>
    {/if}
    {#if query}
      <button
        type="button"
        onclick={clear}
        class="text-[var(--color-text-faint)] hover:text-[var(--color-text)] p-1 cursor-pointer"
        aria-label="Limpar pesquisa"
      >
        <X class="h-3.5 w-3.5" />
      </button>
    {:else}
      <kbd class="gs-kbd-hint" title="Atalho: Ctrl/⌘ + K">⌘K</kbd>
    {/if}
  </div>

  <!-- Results dropdown -->
  {#if open && query.trim().length > 0}
    <div
      id="global-search-results"
      role="listbox"
      class="gs-dropdown"
      style="border-radius: var(--radius-card);"
    >
      <div bind:this={listEl} class="gs-scroll">
        {#if results && results.total === 0}
          <div class="gs-empty">
            <BrandSearch class="h-5 w-5 opacity-40" />
            <div>
              <div class="gs-empty-title">Sem resultados</div>
              <div class="gs-empty-sub">para “{query}”</div>
            </div>
          </div>
        {:else if !results && loading}
          <div class="gs-empty">
            <span class="gs-spinner gs-spinner-lg" aria-hidden="true"></span>
            <div class="gs-empty-title">A pesquisar…</div>
          </div>
        {:else if results}
          {#each ['vehicles', 'customers', 'tasks'] as const as group (group)}
            {@const hits = results[group]}
            {#if hits.length > 0}
              {@const meta = GROUP_META[group]}
              {@const ItemIcon = meta.icon}
              <div class="gs-group">
                <div class="gs-group-header">{meta.label}</div>
                {#each hits as hit, i (hit.id)}
                  {@const idx = groupOffset(group) + i}
                  <button
                    type="button"
                    role="option"
                    data-search-idx={idx}
                    aria-selected={activeIndex === idx}
                    onmouseenter={() => (activeIndex = idx)}
                    onclick={() => pick(hit)}
                    class="gs-item {activeIndex === idx ? 'is-active' : ''}"
                  >
                    <ItemIcon class="gs-item-icon h-4 w-4" />
                    <span class="gs-item-body">
                      <span class="gs-item-title">{hit.primary}</span>
                      {#if hit.secondary}
                        <span class="gs-item-sub">{hit.secondary}</span>
                      {/if}
                    </span>
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
        {/if}
      </div>

      {#if results && results.total > 0}
        <div class="gs-footer">
          <kbd class="gs-kbd">↑↓</kbd>
          <span>navegar</span>
          <kbd class="gs-kbd">↵</kbd>
          <span>abrir</span>
          <kbd class="gs-kbd">esc</kbd>
          <span>fechar</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* ─── Input shell ───────────────────────────────────────────────────── */
  .gs-input-shell {
    position: relative;
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    transition: border-color 0.12s;
  }
  .gs-input-shell:hover,
  .gs-input-shell.is-open {
    border-color: var(--color-border-strong);
  }

  /* Hide the browser's built-in clear button on type="search" — we render
     our own X chip below so the native one would just duplicate it. */
  .gs-input-shell input::-webkit-search-cancel-button,
  .gs-input-shell input::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }
  .gs-input-shell input {
    -moz-appearance: textfield;
  }

  .gs-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid color-mix(in oklab, var(--color-red) 40%, transparent);
    border-top-color: var(--color-red);
    border-radius: 50%;
    animation: gs-spin 0.7s linear infinite;
    margin-right: 6px;
  }
  .gs-spinner-lg {
    width: 18px;
    height: 18px;
    border-width: 2px;
    margin-right: 0;
  }
  @keyframes gs-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .gs-kbd-hint {
    display: none;
    align-items: center;
    padding: 2px 6px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    color: var(--color-text-faint);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    user-select: none;
  }
  @media (min-width: 640px) {
    .gs-kbd-hint {
      display: inline-flex;
    }
  }

  /* ─── Dropdown ──────────────────────────────────────────────────────── */
  /* Same surface treatment as the input shell — translucent white-tint
     over the page bg, same border, same radius — so the dropdown reads
     as a continuation of the search field. */
  .gs-dropdown {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 6px);
    z-index: 30;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.03) 0%,
        rgba(255, 255, 255, 0.02) 100%
      ),
      var(--color-bg-0);
    border: 1px solid var(--color-border);
    box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }
  :global([data-theme='light']) .gs-dropdown {
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.015) 0%, rgba(0, 0, 0, 0.02) 100%),
      var(--color-bg-elevated);
  }

  .gs-scroll {
    max-height: 56vh;
    overflow-y: auto;
  }

  /* ─── Group headers ─────────────────────────────────────────────────── */
  .gs-group:not(:first-child) {
    border-top: 1px solid var(--color-border);
    margin-top: 4px;
    padding-top: 4px;
  }
  .gs-group-header {
    padding: 10px 14px 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }

  /* ─── Items ─────────────────────────────────────────────────────────── */
  .gs-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 14px;
    text-align: left;
    color: var(--color-text);
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  .gs-item:hover,
  .gs-item.is-active {
    background: rgba(255, 255, 255, 0.04);
  }
  .gs-item-icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
  }
  .gs-item-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .gs-item-title {
    font-size: 13.5px;
    line-height: 1.25;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .gs-item-sub {
    font-size: 11.5px;
    color: var(--color-text-faint);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ─── Empty / loading state ─────────────────────────────────────────── */
  .gs-empty {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    color: var(--color-text-muted);
  }
  .gs-empty-title {
    font-size: 13px;
    color: var(--color-text);
  }
  .gs-empty-sub {
    font-size: 11.5px;
    color: var(--color-text-faint);
    margin-top: 2px;
  }

  /* ─── Footer ────────────────────────────────────────────────────────── */
  .gs-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-top: 1px solid var(--color-border);
    font-size: 11px;
    color: var(--color-text-faint);
  }
  .gs-kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    color: var(--color-text-muted);
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
  }
</style>
