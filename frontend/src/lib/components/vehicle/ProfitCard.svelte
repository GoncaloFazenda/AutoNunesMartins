<script lang="ts">
  import { Receipt } from 'lucide-svelte';
  import { formatEUR } from '$lib/utils/format';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';

  interface Props {
    purchasePrice: string;
    salePrice: string | null;
    expensesTotal: string;
    figures: { margin: string; vatAmount: string; commission: string; realProfit: string } | null;
    sale: { vatAmount: string; commission: string; realProfit: string } | null;
  }

  let { purchasePrice, salePrice, expensesTotal, figures, sale }: Props = $props();

  // If a Sale row exists, the persisted VAT / commission / profit on it is
  // canonical. Otherwise we project off the PVP entered on the Vehicle
  // (commission unknown → 0).
  const effective = $derived(
    sale
      ? {
          vatAmount: sale.vatAmount,
          commission: sale.commission,
          realProfit: sale.realProfit,
        }
      : figures,
  );

  const profitNum = $derived(effective ? Number(effective.realProfit) : null);
  const isLoss = $derived(profitNum !== null && profitNum < 0);
  const hasCommission = $derived(
    effective ? Number(effective.commission) > 0 : false,
  );
</script>

<section
  class="overflow-hidden border bg-[var(--color-bg-1)]"
  style="border-radius: var(--radius-card); border-color: {isLoss ? 'color-mix(in oklab, var(--color-red) 40%, transparent)' : 'var(--color-border)'};"
>
  <PanelHeader icon={Receipt} title="Margem · IVA" meta={sale ? 'PERSISTIDO' : 'PROJEÇÃO'} />

  <div class="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
    <div>
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
      >
        Compra
      </div>
      <div class="num-value text-[20px]">
        {formatEUR(purchasePrice)}
      </div>
    </div>
    <div>
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
      >
        Despesas
      </div>
      <div class="num-value text-[20px]">
        {formatEUR(expensesTotal)}
      </div>
    </div>
    <div>
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
      >
        Venda
      </div>
      <div class="num-value text-[20px]">
        {salePrice ? formatEUR(salePrice) : '—'}
      </div>
    </div>
    <div>
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
      >
        Margem
      </div>
      <div class="num-value text-[20px]">
        {figures ? formatEUR(figures.margin) : '—'}
      </div>
    </div>
  </div>

  <!--
    Bottom row: IVA, optional Comissão, Lucro Real. The commission column
    only renders when there's a value to show, so cash sales keep their
    cleaner 2-column layout.
  -->
  <div
    class="grid {hasCommission ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} px-5 pb-5 gap-4 pt-1"
  >
    <div class="border-t border-[var(--color-border)] pt-4">
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
      >
        IVA · Regime Margem (23/123)
      </div>
      <div class="num-value text-[18px] md:text-[24px] text-[var(--color-warning)]">
        {effective ? formatEUR(effective.vatAmount) : '—'}
      </div>
    </div>

    {#if hasCommission && effective}
      <div class="border-t border-[var(--color-border)] pt-4">
        <div
          class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] mb-1.5"
        >
          Comissão extra
        </div>
        <div class="num-value text-[18px] md:text-[24px] text-[var(--color-success)]">
          + {formatEUR(effective.commission)}
        </div>
      </div>
    {/if}

    <div
      class="border-t pt-4"
      style="border-color: {isLoss
        ? 'color-mix(in oklab, var(--color-red) 40%, transparent)'
        : 'var(--color-border)'};"
    >
      <div
        class="font-mono text-[10px] uppercase tracking-[0.25em] mb-1.5 {isLoss
          ? 'text-[var(--color-red)]'
          : 'text-[var(--color-text-faint)]'}"
      >
        Lucro Real
      </div>
      <div
        class="num-value text-[22px] md:text-[32px] {isLoss
          ? 'text-[var(--color-red)]'
          : 'text-[var(--color-success)]'}"
      >
        {effective ? formatEUR(effective.realProfit) : '—'}
      </div>
    </div>
  </div>
</section>
