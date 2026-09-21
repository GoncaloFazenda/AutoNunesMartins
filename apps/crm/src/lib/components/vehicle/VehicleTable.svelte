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

<!--
  Mobile (< md): stacked card list. Each card carries the same info as a
  table row but laid out vertically so it stays readable on a phone without
  horizontal scrolling.
-->
<div class="md:hidden divide-y divide-[var(--color-border)]">
  {#each items as v (v.id)}
    <a
      href={`/viaturas/${v.id}`}
      class="block px-4 py-3 hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
    >
      <div class="flex items-center gap-3">
        <div
          class="h-12 w-16 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0 overflow-hidden"
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
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div
              class="font-display font-semibold text-[14px] truncate group-hover:text-[var(--color-red)] transition-colors"
            >
              {v.brand} {v.model}
            </div>
            <StatusBadge status={v.status} />
          </div>
          <!-- Prefer matrícula on mobile cards (the user-facing id); fall
               back to VIN if the plate hasn't been registered yet. -->
          <div class="font-mono text-[10px] tracking-[0.04em] text-[var(--color-text-faint)] truncate mt-0.5">
            {#if v.licensePlate}
              <span class="tracking-[0.18em] text-[var(--color-text-muted)]">{v.licensePlate}</span>
              <span class="mx-1">·</span>VIN {v.vin}
            {:else}
              VIN {v.vin}
            {/if}
          </div>
        </div>
      </div>
      <!-- Compact 2×2 specs grid below the row. Mono labels + tabular
           values keep the brand DNA on the mobile card form. -->
      <div class="mt-3 grid grid-cols-4 gap-2 text-[12px]">
        <div>
          <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Ano</div>
          <div class="num-value text-[13px] mt-0.5">{v.year}</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Km</div>
          <div class="num-value text-[13px] mt-0.5">{formatInt(v.mileage)}</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Aquisição</div>
          <div class="num-value text-[12px] text-[var(--color-text-muted)] mt-0.5">{formatDate(v.acquisitionDate)}</div>
        </div>
        <div>
          <div class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">PVP</div>
          <div class="num-value text-[13px] text-[var(--color-red)] mt-0.5">{v.salePrice ? formatEUR(v.salePrice) : '—'}</div>
        </div>
      </div>
    </a>
  {/each}
</div>

<!--
  Desktop (md+): the original wide table. Wrapped so it never renders on
  mobile (saves the layout from horizontal-scrolling its way off-screen).
-->
<div class="hidden md:block overflow-x-auto">
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
                  {#if v.licensePlate}
                    <span class="tracking-[0.18em] text-[var(--color-text-muted)]">{v.licensePlate}</span>
                    <span class="mx-1">·</span>{v.vin}
                  {:else}
                    {v.vin}
                  {/if}
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
