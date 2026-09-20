<script lang="ts">
  import { Car, ChevronRight, Trophy } from 'lucide-svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import type { BestSeller } from '$lib/server/dashboard';

  interface Props {
    items: BestSeller[];
  }

  let { items }: Props = $props();

  // Highest count drives the radial progress fill on each ai-score circle.
  const maxCount = $derived(items.reduce((m, r) => Math.max(m, r.count), 0));

  function pctFor(count: number): number {
    if (maxCount <= 0) return 0;
    return Math.max(8, Math.round((count / maxCount) * 100));
  }
</script>

<Panel>
  <PanelHeader
    icon={Trophy}
    title="Mais Vendidos · 12M"
    meta={`${items.length} MODELOS`}
    iconClass="text-[#e6b800]"
  />

  {#if items.length === 0}
    <div
      class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
    >
      Sem dados suficientes
    </div>
  {:else}
    {#each items as item (item.rank)}
      {@const pct = pctFor(item.count)}
      <!-- .ai-row layout from the prototype: [circular score] · [name+detail] · [arrow] -->
      <a
        href={`/viaturas?brand=${encodeURIComponent(item.brand)}`}
        class="grid items-center gap-3.5 px-5 py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[color-mix(in_oklab,var(--color-red)_4%,transparent)] transition-colors group"
        style="grid-template-columns: 40px 1fr auto;"
      >
        <!-- ai-score: conic-gradient ring with the rank inside, exactly like prototype -->
        <span
          class="relative inline-flex items-center justify-center h-[38px] w-[38px] rounded-full"
          style="background: conic-gradient(from -90deg, var(--color-red) {pct}%, rgba(255,255,255,0.08) {pct}%);"
        >
          <span
            class="absolute inset-[3px] rounded-full bg-[var(--color-bg-1)]"
            aria-hidden="true"
          ></span>
          <span class="num-value relative z-[1] text-[12px] text-white">
            {String(item.rank).padStart(2, '0')}
          </span>
        </span>

        <div class="min-w-0">
          <div
            class="font-display font-semibold text-[14px] tracking-[-0.005em] truncate group-hover:text-[var(--color-red)] transition-colors"
          >
            {item.brand} {item.model}
          </div>
          <div
            class="font-mono text-[11px] text-[var(--color-text-faint)] mt-[2px]"
          >
            <span class="num-value text-[11px]">{item.count}</span> vendidos · 12M
          </div>
        </div>

        <ChevronRight
          class="h-4 w-4 text-[var(--color-red)] group-hover:translate-x-0.5 transition-transform flex-shrink-0"
        />
      </a>
    {/each}

    <!-- panel-ft footer (prototype line 1785-1788) -->
    <div
      class="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]"
    >
      <span>Top {items.length} · últimos 12 meses</span>
      <a
        href="/vendas?sortBy=realProfit&sortDir=desc"
        class="inline-flex items-center gap-1.5 text-[var(--color-red)] font-semibold hover:underline"
      >
        Ver detalhes
        <ChevronRight class="h-3 w-3" />
      </a>
    </div>
  {/if}
</Panel>
