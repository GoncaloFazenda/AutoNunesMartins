<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { ArrowRightLeft, Check, Tag } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { formatEUR } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const v = $derived(data.vehicle);

  // Pre-popula com a descrição atual da viatura (se já existir alguma
  // — pode vir das notas da retoma) para o vendedor poder editar em vez
  // de partir do zero.
  let salePriceInput = $state('');
  let descriptionInput = $state(data.vehicle.description ?? '');
  let submitting = $state(false);

  // Margem projetada — mostra ao vendedor o que vai ganhar nesta venda
  // se publicar pelo preço que está a digitar. Igual à fórmula que o
  // /vender já usa, mas só com este preço (sem comissão nem buyerType).
  const projectedMargin = $derived.by(() => {
    const price = Number(salePriceInput);
    const purchase = Number(v.purchasePrice);
    const expenses = Number(v.expensesTotal);
    if (!Number.isFinite(price) || price <= 0) return null;
    const margin = price - purchase - expenses;
    if (margin <= 0) return { margin, vat: 0, profit: margin };
    const vat = (margin * 23) / 123;
    return { margin, vat, profit: margin - vat };
  });
</script>

<svelte:head>
  <title>Publicar · {v.brand} {v.model}</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Publicar viatura" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] flex flex-wrap items-center gap-x-2 gap-y-1"
    >
      <span style="color: #f97316;">●</span>
      <span>Rascunho</span>
      <span class="text-[var(--color-text-faint)]">·</span>
      <span>{v.brand} {v.model}</span>
      <span class="text-[var(--color-text-faint)]">·</span>
      <span>{v.licensePlate ?? v.vin}</span>
    </p>
  </div>

  <!-- Origem (banner laranja) — recorda ao vendedor de onde veio o carro. -->
  {#if v.sourceTradeIn}
    {@const o = v.sourceTradeIn}
    <div
      class="flex items-center gap-3 p-3 pl-4 border bg-[color-mix(in_oklab,#f97316_6%,transparent)]"
      style="border-radius: var(--radius-btn); border-color: color-mix(in oklab, #f97316 30%, transparent);"
    >
      <span
        class="inline-flex items-center justify-center h-8 w-8 rounded-full"
        style="background: color-mix(in oklab, #f97316 18%, transparent);"
      >
        <ArrowRightLeft class="h-4 w-4" style="color: #f97316;" />
      </span>
      <div class="flex-1 min-w-0 text-[13px]">
        <span class="font-display font-semibold">Entrada por retoma</span>
        <span class="text-[var(--color-text-muted)]">
          · custo de aquisição {formatEUR(o.allowanceValue)} · de
          {o.sale.customer.name}
        </span>
      </div>
    </div>
  {/if}

  <form
    method="POST"
    action="?/publish"
    use:enhance={({ cancel }) => {
      if (!salePriceInput || Number(salePriceInput) <= 0) {
        toast.error('Indica o preço de venda.');
        cancel();
        return;
      }
      if (!descriptionInput.trim()) {
        toast.error('A descrição é obrigatória ao publicar.');
        cancel();
        return;
      }
      submitting = true;
      return async ({ result }) => {
        submitting = false;
        if (result.type === 'redirect') {
          toast.success('Viatura publicada e disponível para venda.');
        } else if (result.type === 'failure') {
          toast.error(
            (result.data as { error?: string } | undefined)?.error ?? 'Falha ao publicar.',
          );
        }
      };
    }}
    class="grid grid-cols-1 lg:grid-cols-12 gap-6"
  >
    <!-- LEFT: campos para publicar -->
    <div class="lg:col-span-7">
      <Panel>
        <PanelHeader icon={Tag} title="Definir preço e descrição" />
        <div class="p-5 space-y-4">
          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Preço de venda (€) *
            </span>
            <input
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              required
              bind:value={salePriceInput}
              placeholder="6500.00"
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            />
            <span
              class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed"
            >
              Preço de aquisição: {formatEUR(v.purchasePrice)}
              {#if Number(v.expensesTotal) > 0}
                · despesas: {formatEUR(v.expensesTotal)}
              {/if}
            </span>
          </label>

          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Descrição *
            </span>
            <textarea
              name="description"
              bind:value={descriptionInput}
              rows="5"
              required
              maxlength="2000"
              placeholder="Estado geral, equipamento, histórico, garantia…"
              class="px-3 py-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors resize-y"
              style="border-radius: var(--radius-btn);"
            ></textarea>
            <span
              class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed"
            >
              {descriptionInput.length}/2000 — visível na página da viatura.
            </span>
          </label>
        </div>
      </Panel>
    </div>

    <!-- RIGHT: projeção de margem (igual lógica do /vender mas só info) -->
    <div class="lg:col-span-5">
      <Panel>
        <PanelHeader icon={Check} title="Projeção de margem" meta="REGIME MARGEM 23/123" />
        <div class="p-5 space-y-4">
          {#if projectedMargin === null}
            <div
              class="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] py-8 text-center"
            >
              Define um preço para veres a projeção.
            </div>
          {:else}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
                >
                  Margem
                </div>
                <div class="font-display text-[18px] font-bold italic tabular-nums">
                  {formatEUR(projectedMargin.margin.toFixed(2))}
                </div>
              </div>
              <div>
                <div
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
                >
                  IVA (23/123)
                </div>
                <div
                  class="font-display text-[18px] font-bold italic tabular-nums text-[var(--color-warning)]"
                >
                  {formatEUR(projectedMargin.vat.toFixed(2))}
                </div>
              </div>
            </div>
            <div class="border-t border-[var(--color-border)] pt-4">
              <div
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
              >
                Lucro projetado
              </div>
              <div
                class="font-display text-[26px] md:text-[36px] font-extrabold italic tabular-nums tracking-tight"
                style="color: {projectedMargin.profit < 0
                  ? 'var(--color-red)'
                  : 'var(--color-success)'};"
              >
                {formatEUR(projectedMargin.profit.toFixed(2))}
              </div>
              {#if projectedMargin.profit < 0}
                <div class="mt-1 font-mono text-[10px] text-[var(--color-red)] uppercase tracking-[0.12em]">
                  Preço abaixo do custo — vais ter prejuízo.
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </Panel>
    </div>

    <div class="lg:col-span-12 flex items-center justify-end gap-3 pt-2">
      <Button variant="ghost" href={`/viaturas/${v.id}`}>Cancelar</Button>
      <Button
        variant="primary"
        type="submit"
        loading={submitting}
        disabled={submitting || !salePriceInput || !descriptionInput.trim()}
      >
        Publicar viatura
      </Button>
    </div>
  </form>
</section>
