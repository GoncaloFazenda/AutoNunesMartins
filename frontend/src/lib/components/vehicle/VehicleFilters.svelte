<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Search, X } from 'lucide-svelte';
  import type { Fuel, VehicleStatus } from '@anm/types';

  interface Props {
    filters: {
      brand?: string;
      model?: string;
      fuel?: Fuel;
      status?: VehicleStatus;
      yearMin?: number;
      yearMax?: number;
      mileageMin?: number;
      mileageMax?: number;
      q?: string;
    };
  }

  let { filters }: Props = $props();

  const FUELS: { value: Fuel; label: string }[] = [
    { value: 'GASOLINE', label: 'Gasolina' },
    { value: 'DIESEL', label: 'Gasóleo' },
    { value: 'HYBRID', label: 'Híbrido' },
    { value: 'PLUGIN_HYBRID', label: 'Híbrido Plug-in' },
    { value: 'ELECTRIC', label: 'Elétrico' },
    { value: 'LPG', label: 'GPL' },
  ];

  const STATUSES: { value: VehicleStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'RESERVED', label: 'Reservado' },
    { value: 'SOLD', label: 'Vendido' },
    { value: 'DELIVERED', label: 'Entregue' },
    { value: 'DOCS_PENDING', label: 'Docs Pendentes' },
  ];

  function setFilter(key: string, value: string | undefined) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value === undefined || value === '') usp.delete(key);
    else usp.set(key, value);
    usp.delete('page');
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  function toggleChip(key: string, value: string, currentValue: string | undefined) {
    setFilter(key, currentValue === value ? undefined : value);
  }

  const hasFilters = $derived(
    Boolean(
      filters.brand ||
        filters.model ||
        filters.fuel ||
        filters.status ||
        filters.yearMin ||
        filters.yearMax ||
        filters.mileageMin ||
        filters.mileageMax ||
        filters.q,
    ),
  );

  function clearAll() {
    goto($page.url.pathname, { keepFocus: false, noScroll: true });
  }
</script>

<div class="space-y-4">
  <!-- Search row -->
  <div class="flex items-center gap-3">
    <div
      class="flex-1 relative flex items-center h-11 px-3 border border-[var(--color-border)] bg-[var(--color-bg-1)] focus-within:border-[var(--color-red)] transition-colors"
      style="border-radius: var(--radius-btn);"
    >
      <Search class="h-4 w-4 text-[var(--color-text-faint)]" />
      <input
        type="search"
        placeholder="Pesquisar por marca, modelo ou VIN…"
        value={filters.q ?? ''}
        oninput={(e) => setFilter('q', e.currentTarget.value || undefined)}
        class="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
      />
    </div>
    {#if hasFilters}
      <button
        type="button"
        onclick={clearAll}
        class="inline-flex items-center gap-1.5 px-3 h-11 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
      >
        <X class="h-3 w-3" />
        Limpar filtros
      </button>
    {/if}
  </div>

  <!-- Status chips -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mr-1">
      Estado
    </span>
    {#each STATUSES as s (s.value)}
      {@const active = filters.status === s.value}
      <button
        type="button"
        onclick={() => toggleChip('status', s.value, filters.status)}
        class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors {active
          ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
      >
        {s.label}
      </button>
    {/each}
  </div>

  <!-- Fuel chips -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mr-1">
      Combustível
    </span>
    {#each FUELS as f (f.value)}
      {@const active = filters.fuel === f.value}
      <button
        type="button"
        onclick={() => toggleChip('fuel', f.value, filters.fuel)}
        class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors {active
          ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
      >
        {f.label}
      </button>
    {/each}
  </div>

  <!-- Range filters -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <label class="flex flex-col gap-1">
      <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
        Ano · Mín.
      </span>
      <input
        type="number"
        min="1950"
        placeholder="2000"
        value={filters.yearMin ?? ''}
        oninput={(e) => setFilter('yearMin', e.currentTarget.value || undefined)}
        class="h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col gap-1">
      <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
        Ano · Máx.
      </span>
      <input
        type="number"
        min="1950"
        placeholder="2026"
        value={filters.yearMax ?? ''}
        oninput={(e) => setFilter('yearMax', e.currentTarget.value || undefined)}
        class="h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col gap-1">
      <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
        Km · Mín.
      </span>
      <input
        type="number"
        min="0"
        placeholder="0"
        value={filters.mileageMin ?? ''}
        oninput={(e) => setFilter('mileageMin', e.currentTarget.value || undefined)}
        class="h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col gap-1">
      <span class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
        Km · Máx.
      </span>
      <input
        type="number"
        min="0"
        placeholder="200000"
        value={filters.mileageMax ?? ''}
        oninput={(e) => setFilter('mileageMax', e.currentTarget.value || undefined)}
        class="h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
        style="border-radius: var(--radius-btn);"
      />
    </label>
  </div>
</div>
