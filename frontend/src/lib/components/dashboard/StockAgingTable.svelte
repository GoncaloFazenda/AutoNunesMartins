<script lang="ts">
  import { Car, ChevronRight, Clock } from 'lucide-svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import { formatEUR, formatInt } from '$lib/utils/format';
  import type { StockAgedRow } from '$lib/server/dashboard';

  interface Props {
    items: StockAgedRow[];
  }

  let { items }: Props = $props();
</script>

<Panel>
  <PanelHeader icon={Car} title="Em Stock 60+ Dias" meta={`${items.length} VIATURAS`}>
    {#snippet actions()}
      <!-- Desktop-only — on mobile the title + count badge already imply the
           drill-down, and a long action eats the panel header row. -->
      <a
        href="/viaturas?status=AVAILABLE"
        class="hidden md:inline-flex items-center gap-1 px-3 h-8 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        style="border-radius: var(--radius-btn);"
      >
        Ver stock completo
        <ChevronRight class="h-3 w-3" />
      </a>
    {/snippet}
  </PanelHeader>

  {#if items.length === 0}
    <div
      class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
    >
      Sem viaturas em stock prolongado
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-[13px]">
        <thead>
          <tr class="border-b border-[var(--color-border)]">
            <th class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              Viatura
            </th>
            <th class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              Ano
            </th>
            <th class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              Km
            </th>
            <th class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              PVP
            </th>
            <th class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
              Em stock
            </th>
          </tr>
        </thead>
        <tbody>
          {#each items as v (v.id)}
            <tr
              class="border-b border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
            >
              <td class="px-4 py-2.5">
                <a href={`/viaturas/${v.id}`} class="flex items-center gap-3">
                  <div
                    class="h-9 w-11 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0 overflow-hidden"
                    style="border-radius: 3px;"
                  >
                    {#if v.thumbnailUrl}
                      <img
                        src={v.thumbnailUrl}
                        alt={`${v.brand} ${v.model}`}
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    {:else}
                      <Car class="h-4 w-4 text-[var(--color-red)]" />
                    {/if}
                  </div>
                  <div class="min-w-0">
                    <div
                      class="font-display font-semibold text-[13px] truncate group-hover:text-[var(--color-red)] transition-colors"
                    >
                      {v.brand} {v.model}
                    </div>
                    <div class="font-mono text-[10px] text-[var(--color-text-faint)] truncate">
                      {v.licensePlate ?? v.vin}
                    </div>
                  </div>
                </a>
              </td>
              <td class="px-4 py-2.5 num-value text-[13px]">{v.year}</td>
              <td class="px-4 py-2.5 num-value text-[13px] text-right">
                {formatInt(v.mileage)}
              </td>
              <td class="px-4 py-2.5 num-value text-[13px] text-right text-[var(--color-red)]">
                {v.salePrice ? formatEUR(v.salePrice) : '—'}
              </td>
              <td class="px-4 py-2.5 text-right">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)] font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style="border-radius: 3px;"
                >
                  <Clock class="h-2.5 w-2.5" />
                  {v.daysInStock}d
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</Panel>
