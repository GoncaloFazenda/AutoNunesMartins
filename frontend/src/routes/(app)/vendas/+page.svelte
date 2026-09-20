<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ArrowRightLeft, Car, Receipt, Search, X } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import Skeleton from '$lib/components/common/Skeleton.svelte';
  import ExportMenu from '$lib/components/common/ExportMenu.svelte';
  import { formatDate, formatDateLong, formatEUR } from '$lib/utils/format';
  import type { DeliveryStatus } from '@anm/types';
  import type { SaleListParams } from '$lib/server/sales';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const today = new Date();

  const DELIVERY_OPTIONS: { value: DeliveryStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'SCHEDULED', label: 'Agendada' },
    { value: 'DELIVERED', label: 'Entregue' },
  ];

  function setParam(name: string, value: string | undefined) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value === undefined || value === '') usp.delete(name);
    else usp.set(name, value);
    // Any filter change resets pagination — otherwise you can land on a page
    // number the new filter set no longer has.
    usp.delete('page');
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  const hasFilters = $derived(
    Boolean(
      data.filters.q || data.filters.deliveryStatus || data.filters.dateFrom || data.filters.dateTo,
    ),
  );

  function clearFilters() {
    goto('?', { keepFocus: true, noScroll: true });
  }

  type SortBy = NonNullable<SaleListParams['sortBy']>;

  function setSort(by: SortBy) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (data.filters.sortBy === by) {
      usp.set('sortDir', data.filters.sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      usp.set('sortBy', by);
      usp.set('sortDir', 'desc');
    }
    goto(`?${usp.toString()}`, { keepFocus: true, noScroll: true });
  }

  function sortIndicator(by: SortBy): string {
    if (data.filters.sortBy !== by) return '';
    return data.filters.sortDir === 'asc' ? '↑' : '↓';
  }
</script>

<svelte:head>
  <title>Vendas · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Page header -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
    <div class="min-w-0">
      <ItalicHero text="Vendas" size="lg" />
      <div
        class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        {formatDateLong(today)}
        {#await data.list then list}
          <span class="text-[var(--color-text-faint)]">·</span>
          <span class="tabular-nums">{list.total} registadas</span>
        {/await}
      </div>
    </div>
    <!-- Export is desktop-only; preserves the current filter set via the
         existing query string. Menu (sem default) — utilizador escolhe formato. -->
    <div class="hidden md:flex items-center gap-2">
      <ExportMenu baseHref="/vendas/export" extraQuery={$page.url.search} />
    </div>
  </div>

  <!-- Filters (renders immediately, independent of the list promise) -->
  <Panel>
    <div class="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      <!-- Search: wider on desktop because the matched fields (vehicle brand,
           VIN, plate, customer name, NIF) are all free-form. -->
      <label class="md:col-span-5 flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Pesquisar
        </span>
        <div
          class="relative flex items-center h-10 px-3 border border-[var(--color-border)] bg-[var(--color-bg-1)] focus-within:border-[var(--color-red)] transition-colors"
          style="border-radius: var(--radius-btn);"
        >
          <Search class="h-4 w-4 text-[var(--color-text-faint)]" />
          <input
            type="search"
            placeholder="viatura, VIN, matrícula, cliente, NIF…"
            value={data.filters.q ?? ''}
            oninput={(e) => setParam('q', e.currentTarget.value || undefined)}
            class="flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
      </label>

      <label class="md:col-span-3 flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Estado entrega
        </span>
        <select
          value={data.filters.deliveryStatus ?? ''}
          onchange={(e) => setParam('deliveryStatus', e.currentTarget.value || undefined)}
          class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        >
          <option value="">— Todos —</option>
          {#each DELIVERY_OPTIONS as o (o.value)}
            <option value={o.value}>{o.label}</option>
          {/each}
        </select>
      </label>

      <label class="md:col-span-2 flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Venda desde
        </span>
        <input
          type="date"
          value={data.filters.dateFrom ?? ''}
          onchange={(e) => setParam('dateFrom', e.currentTarget.value || undefined)}
          class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>

      <label class="md:col-span-2 flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Venda até
        </span>
        <input
          type="date"
          value={data.filters.dateTo ?? ''}
          onchange={(e) => setParam('dateTo', e.currentTarget.value || undefined)}
          class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>

      {#if hasFilters}
        <div class="md:col-span-12 flex justify-end">
          <button
            type="button"
            onclick={clearFilters}
            class="inline-flex items-center gap-1.5 px-3 h-9 border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] text-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_8%,transparent)] font-mono uppercase tracking-[0.12em] text-[10px] transition-colors cursor-pointer"
            style="border-radius: var(--radius-btn);"
          >
            <X class="h-3 w-3" />
            Limpar filtros
          </button>
        </div>
      {/if}
    </div>
  </Panel>

  <!-- Streamed table -->
  <Panel>
    {#await data.list}
      <div class="p-4 space-y-2">
        {#each Array(6) as _, i (i)}
          <Skeleton width="100%" height="44px" />
        {/each}
      </div>
    {:then list}
      {#if list._error}
        <div class="p-4 flex items-center gap-3 text-[var(--color-red)] text-[13px]">
          <strong class="font-mono uppercase tracking-[0.2em] text-[10px]">Erro</strong>
          <span>{list._error}</span>
        </div>
      {:else if list.items.length === 0}
        <EmptyState
          icon={Receipt}
          title="Nenhuma venda encontrada"
          description={hasFilters
            ? 'Ajusta os filtros para ver mais resultados.'
            : 'Ainda não foram registadas vendas. Cria a primeira a partir de uma viatura disponível.'}
        />
      {:else}
        <!-- Mobile: stacked card list. Each card carries the same info as a
             desktop row but vertically so it stays legible on a phone. -->
        <div class="md:hidden divide-y divide-[var(--color-border)]">
          {#each list.items as s (s.id)}
            {@const isLoss = Number(s.realProfit) < 0}
            <a
              href={`/vendas/${s.id}`}
              class="block px-4 py-3 hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div
                    class="font-display font-semibold text-[14px] truncate group-hover:text-[var(--color-red)] transition-colors"
                  >
                    {s.vehicle.brand} {s.vehicle.model}
                  </div>
                  <div class="font-mono text-[10px] tracking-[0.04em] text-[var(--color-text-faint)] truncate mt-0.5 flex items-center gap-2 flex-wrap">
                    {#if s.vehicle.licensePlate}
                      <span class="tracking-[0.18em] text-[var(--color-text-muted)]">{s.vehicle.licensePlate}</span>
                      <span>·</span><span>{s.vehicle.year}</span>
                    {:else}
                      <span>VIN {s.vehicle.vin}</span><span>·</span><span>{s.vehicle.year}</span>
                    {/if}
                    {#if s.hasTradeIn}
                      <!-- Same pill pattern as "Em destaque" on /viaturas/[id]:
                           border + tinted bg + uppercase mono text. Stands out
                           when scanning the list without screaming. -->
                      <span
                        title="Esta venda envolveu uma retoma"
                        class="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[#f97316] font-mono text-[9px] uppercase tracking-[0.18em]"
                        style="border-radius: var(--radius-btn); border-color: color-mix(in oklab, #f97316 45%, transparent); background: color-mix(in oklab, #f97316 12%, transparent);"
                      >
                        <ArrowRightLeft class="h-2.5 w-2.5" />
                        Retoma
                      </span>
                    {/if}
                  </div>
                </div>
                <StatusBadge status={s.deliveryStatus} />
              </div>
              <div class="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Cliente</div>
                  <div class="text-[12px] truncate mt-0.5">{s.customer.name}</div>
                </div>
                <div>
                  <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Data</div>
                  <div class="num-value text-[12px] text-[var(--color-text-muted)] mt-0.5">{formatDate(s.saleDate)}</div>
                </div>
                <div class="text-right">
                  <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Lucro</div>
                  <div
                    class="num-value text-[13px] mt-0.5 {isLoss
                      ? 'text-[var(--color-red)]'
                      : 'text-[var(--color-success)]'}"
                  >
                    {formatEUR(s.realProfit)}
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>

        <!-- Desktop: full table with margin breakdown columns. Mirrors the
             layout the financeiro/Lucro tab used to show, so margin analysis
             happens here on the same screen as the rest of the sale data. -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-[13px] min-w-[1100px]">
            <thead>
              <tr class="border-b border-[var(--color-border)]">
                <th
                  class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Viatura
                </th>
                <th
                  class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Cliente
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] cursor-pointer hover:text-[var(--color-text)]"
                  onclick={() => setSort('saleDate')}
                >
                  Data {sortIndicator('saleDate')}
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Compra
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] cursor-pointer hover:text-[var(--color-text)]"
                  onclick={() => setSort('salePrice')}
                >
                  Venda {sortIndicator('salePrice')}
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Despesas
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  IVA
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                  title="Comissão de financiamento (banco) somada ao Lucro Real"
                >
                  Comissão
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] cursor-pointer hover:text-[var(--color-text)]"
                  onclick={() => setSort('realProfit')}
                >
                  Lucro {sortIndicator('realProfit')}
                </th>
                <th
                  class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] cursor-pointer hover:text-[var(--color-text)]"
                  onclick={() => setSort('marginPct')}
                >
                  Margem {sortIndicator('marginPct')}
                </th>
                <th
                  class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Entrega
                </th>
              </tr>
            </thead>
            <tbody>
              {#each list.items as s (s.id)}
                {@const isLoss = Number(s.realProfit) < 0}
                <tr
                  class="border-b border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
                >
                  <td class="px-4 py-3">
                    <a href={`/vendas/${s.id}`} class="flex items-center gap-3">
                      <div
                        class="h-9 w-9 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0"
                        style="border-radius: 3px;"
                      >
                        <Car class="h-4 w-4 text-[var(--color-red)]" />
                      </div>
                      <div class="min-w-0">
                        <div
                          class="font-display font-semibold text-[13.5px] truncate group-hover:text-[var(--color-red)] transition-colors"
                        >
                          {s.vehicle.brand} {s.vehicle.model}
                        </div>
                        <div class="font-mono text-[10px] tracking-[0.04em] text-[var(--color-text-faint)] flex items-center gap-2 flex-wrap mt-0.5">
                          {#if s.vehicle.licensePlate}
                            <span class="tracking-[0.18em] text-[var(--color-text-muted)]">{s.vehicle.licensePlate}</span>
                            <span>·</span><span>{s.vehicle.year}</span>
                          {:else}
                            <span class="truncate">{s.vehicle.vin}</span><span>·</span><span>{s.vehicle.year}</span>
                          {/if}
                          {#if s.hasTradeIn}
                            <!-- Same pill pattern as "Em destaque" on /viaturas/[id]:
                                 border + tinted bg + uppercase mono text. Visible
                                 on a scan without crowding the brand/model line. -->
                            <span
                              title="Esta venda envolveu uma retoma"
                              class="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[#f97316] font-mono text-[9px] uppercase tracking-[0.18em]"
                              style="border-radius: var(--radius-btn); border-color: color-mix(in oklab, #f97316 45%, transparent); background: color-mix(in oklab, #f97316 12%, transparent);"
                            >
                              <ArrowRightLeft class="h-2.5 w-2.5" />
                              Retoma
                            </span>
                          {/if}
                        </div>
                      </div>
                    </a>
                  </td>
                  <td class="px-4 py-3">
                    <a
                      href={`/clientes/${s.customer.id}`}
                      class="text-[var(--color-text)] hover:text-[var(--color-red)] transition-colors text-[13px] truncate inline-block max-w-[180px]"
                    >
                      {s.customer.name}
                    </a>
                    <div class="font-mono text-[10px] text-[var(--color-text-faint)] tracking-[0.04em]">
                      NIF {s.customer.nif}
                    </div>
                  </td>
                  <td class="px-4 py-3 num-value text-[12px] text-right text-[var(--color-text-muted)]">
                    {formatDate(s.saleDate)}
                  </td>
                  <td class="px-4 py-3 num-value text-[13px] text-right">
                    {formatEUR(s.purchasePrice)}
                  </td>
                  <td class="px-4 py-3 num-value text-[13px] text-right">
                    {formatEUR(s.salePrice)}
                  </td>
                  <td class="px-4 py-3 num-value text-[13px] text-right text-[var(--color-text-muted)]">
                    {formatEUR(s.expensesTotal)}
                  </td>
                  <td class="px-4 py-3 num-value text-[13px] text-right text-[var(--color-warning)]">
                    {formatEUR(s.vatAmount)}
                  </td>
                  <td
                    class="px-4 py-3 num-value text-[13px] text-right {Number(s.commission) > 0
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-text-faint)]'}"
                  >
                    {Number(s.commission) > 0 ? formatEUR(s.commission) : '—'}
                  </td>
                  <td
                    class="px-4 py-3 num-value text-[13.5px] text-right {isLoss
                      ? 'text-[var(--color-red)]'
                      : 'text-[var(--color-success)]'}"
                  >
                    {formatEUR(s.realProfit)}
                  </td>
                  <td class="px-4 py-3 num-value text-[13px] text-right">
                    {s.marginPct.toFixed(1)}%
                  </td>
                  <td class="px-4 py-3">
                    <StatusBadge status={s.deliveryStatus} />
                  </td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <!-- Totals are computed by the backend across the FULL filtered
                   set (not the current page), so they don't change as the user
                   pages through results. -->
              <tr class="border-t border-[var(--color-border)] bg-[var(--color-bg-2)] font-medium">
                <td
                  colspan="3"
                  class="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] text-right"
                >
                  Totais ({list.totals.count})
                </td>
                <td></td>
                <td class="px-4 py-3 num-value text-[13px] text-right">
                  {formatEUR(list.totals.revenue)}
                </td>
                <td class="px-4 py-3 num-value text-[13px] text-right text-[var(--color-text-muted)]">
                  {formatEUR(list.totals.expenses)}
                </td>
                <td class="px-4 py-3 num-value text-[13px] text-right text-[var(--color-warning)]">
                  {formatEUR(list.totals.vat)}
                </td>
                <td
                  class="px-4 py-3 num-value text-[13px] text-right {Number(list.totals.commission) > 0
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-text-faint)]'}"
                  title="Total de comissões de financiamento (isentas de IVA — art. 9.º, 27.º, a) CIVA)"
                >
                  {Number(list.totals.commission) > 0 ? formatEUR(list.totals.commission) : '—'}
                </td>
                <td class="px-4 py-3 num-value text-[16px] text-right text-[var(--color-success)]">
                  {formatEUR(list.totals.profit)}
                </td>
                <td class="px-4 py-3 num-value text-[13px] text-right">
                  {list.totals.avgMarginPct.toFixed(1)}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Pagination
          currentPage={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
        />
      {/if}
    {/await}
  </Panel>
</section>
