<script lang="ts">
  import { Car, MoreHorizontal } from 'lucide-svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import { formatDate, formatEUR, formatInt } from '$lib/utils/format';
  import type { VehicleListItem } from '$lib/server/vehicles';

  interface Props {
    items: VehicleListItem[];
  }

  let { items }: Props = $props();
</script>

<div class="overflow-x-auto">
  <table class="w-full text-[13px]">
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
          Ano
        </th>
        <th
          class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Km
        </th>
        <th
          class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Aquisição
        </th>
        <th
          class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          PVP
        </th>
        <th
          class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Estado
        </th>
        <th class="w-10"></th>
      </tr>
    </thead>
    <tbody>
      {#each items as v (v.id)}
        <tr
          class="border-b border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
        >
          <td class="px-4 py-3">
            <a href={`/viaturas/${v.id}`} class="flex items-center gap-3">
              <div
                class="h-11 w-14 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0 overflow-hidden"
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
                  <Car class="h-5 w-5 text-[var(--color-red)]" />
                {/if}
              </div>
              <div class="min-w-0">
                <div
                  class="font-display font-semibold text-[14px] truncate group-hover:text-[var(--color-red)] transition-colors"
                >
                  {v.brand} {v.model}
                </div>
                <div class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-faint)] truncate">
                  {v.vin}
                </div>
              </div>
            </a>
          </td>
          <td class="px-4 py-3 num-value text-[13px]">{v.year}</td>
          <td class="px-4 py-3 num-value text-[13px] text-right">
            {formatInt(v.mileage)}
          </td>
          <td class="px-4 py-3 num-value text-[12px] text-right text-[var(--color-text-muted)]">
            {formatDate(v.acquisitionDate)}
          </td>
          <td class="px-4 py-3 num-value text-[13px] text-right text-[var(--color-red)]">
            {v.salePrice ? formatEUR(v.salePrice) : '—'}
          </td>
          <td class="px-4 py-3">
            <StatusBadge status={v.status} />
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="text-[var(--color-text-faint)] hover:text-[var(--color-text)] p-1"
              aria-label="Mais opções"
            >
              <MoreHorizontal class="h-4 w-4" />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
