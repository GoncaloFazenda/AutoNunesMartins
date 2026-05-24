<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { Calendar, Search, Tag, User as UserIcon } from 'lucide-svelte';
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
  const today = new Date().toISOString().slice(0, 10);

  let customerSearch = $state('');
  let customerId = $state('');
  // Read initial salePrice from data directly (not via $derived `v`) to avoid
  // Svelte 5's state_referenced_locally warning. We only need a default.
  let salePriceInput = $state(data.vehicle.salePrice ?? '');
  // Optional financing-referral commission. Net amount the dealer actually
  // pockets from the credit institution — added on top of the vehicle's
  // net margin in the live preview and persisted on the Sale row.
  let commissionInput = $state('');
  let submitting = $state(false);

  const filteredCustomers = $derived.by(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return data.customers.slice(0, 50);
    return data.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nif.includes(q) ||
          c.phone.includes(q) ||
          (c.email ?? '').toLowerCase().includes(q),
      )
      .slice(0, 50);
  });

  const selectedCustomer = $derived(
    customerId ? data.customers.find((c) => c.id === customerId) : null,
  );

  // Live margin VAT preview (mirrors backend computation exactly, including
  // the manual commission fold-in so the previewed "Lucro Real" matches the
  // value that will be persisted on submit).
  const figures = $derived.by(() => {
    const price = Number(salePriceInput);
    const purchase = Number(v.purchasePrice);
    const expensesTotal = Number(v.expensesTotal);
    // Commission may be blank, "0", or a positive number. Treat anything
    // not parseable as 0 so the preview never reads NaN.
    const commissionNum = Number(commissionInput);
    const commission = Number.isFinite(commissionNum) && commissionNum > 0
      ? commissionNum
      : 0;

    if (!Number.isFinite(price) || price <= 0) {
      return {
        margin: '0.00',
        vat: '0.00',
        commission: commission.toFixed(2),
        profit: commission.toFixed(2),
      };
    }
    const margin = price - purchase - expensesTotal;
    if (margin <= 0) {
      // Negative margin + commission can still net positive if the
      // referral covers the loss.
      const profit = margin + commission;
      return {
        margin: margin.toFixed(2),
        vat: '0.00',
        commission: commission.toFixed(2),
        profit: profit.toFixed(2),
      };
    }
    const vat = (margin * 23) / 123;
    const profit = margin - vat + commission;
    return {
      margin: margin.toFixed(2),
      vat: vat.toFixed(2),
      commission: commission.toFixed(2),
      profit: profit.toFixed(2),
    };
  });

  function pickCustomer(id: string) {
    customerId = id;
    customerSearch = '';
  }

  function clearCustomer() {
    customerId = '';
  }
</script>

<svelte:head>
  <title>Registar Venda · {v.brand} {v.model}</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Registar venda" size="lg" />
    <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] flex flex-wrap items-center gap-x-2 gap-y-1">
      <span class="text-[var(--color-red)]">●</span>
      <span>{v.brand} {v.model}</span>
      <span class="text-[var(--color-text-faint)]">·</span>
      <span>{v.year}</span>
      <span class="text-[var(--color-text-faint)]">·</span>
      <span>{v.licensePlate ?? v.vin}</span>
    </p>
  </div>

  <form
    method="POST"
    action="?/submit"
    use:enhance={({ cancel }) => {
      if (!customerId) {
        toast.error('Seleciona um cliente.');
        cancel();
        return;
      }
      submitting = true;
      return async ({ result }) => {
        submitting = false;
        if (result.type === 'success') {
          toast.success('Venda registada.');
          await goto(`/viaturas/${v.id}`);
        } else if (result.type === 'failure') {
          toast.error(
            (result.data as { error?: string } | undefined)?.error ?? 'Falha ao registar.',
          );
        }
      };
    }}
    class="grid grid-cols-1 lg:grid-cols-12 gap-6"
  >
    <input type="hidden" name="vehicleId" value={v.id} />
    <input type="hidden" name="customerId" value={customerId} />

    <!-- LEFT: customer + sale fields -->
    <div class="lg:col-span-7 space-y-6">
      <Panel>
        <PanelHeader icon={UserIcon} title="Cliente" />
        <div class="p-5 space-y-3">
          {#if selectedCustomer}
            <div
              class="flex items-center justify-between gap-4 p-3 border border-[color-mix(in_oklab,var(--color-red)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)]"
              style="border-radius: var(--radius-btn);"
            >
              <div>
                <div class="font-display font-semibold text-[16px]">{selectedCustomer.name}</div>
                <div
                  class="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
                >
                  NIF {selectedCustomer.nif} <span class="text-[var(--color-text-faint)]">·</span> {selectedCustomer.phone}
                </div>
              </div>
              <button
                type="button"
                onclick={clearCustomer}
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
              >
                Trocar
              </button>
            </div>
          {:else}
            <div
              class="relative flex items-center h-11 px-3 border border-[var(--color-border)] bg-[var(--color-bg-1)] focus-within:border-[var(--color-red)] transition-colors"
              style="border-radius: var(--radius-btn);"
            >
              <Search class="h-4 w-4 text-[var(--color-text-faint)]" />
              <input
                type="search"
                placeholder="Pesquisar por nome, NIF ou telefone…"
                bind:value={customerSearch}
                class="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
              />
            </div>

            <div
              class="max-h-72 overflow-y-auto border border-[var(--color-border)] bg-[var(--color-bg-1)]"
              style="border-radius: var(--radius-btn);"
            >
              {#if filteredCustomers.length === 0}
                <div
                  class="p-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  Sem resultados — <a class="text-[var(--color-red)] underline" href="/clientes/novo"
                    >criar cliente</a
                  >
                </div>
              {:else}
                {#each filteredCustomers as c (c.id)}
                  <button
                    type="button"
                    onclick={() => pickCustomer(c.id)}
                    class="w-full text-left flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors"
                  >
                    <div>
                      <div class="font-display font-semibold text-[14px]">{c.name}</div>
                      <div
                        class="mt-0.5 font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-faint)]"
                      >
                        NIF {c.nif} · {c.phone}
                      </div>
                    </div>
                    <span
                      class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
                    >
                      {c._count.sales} compras
                    </span>
                  </button>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      </Panel>

      <Panel>
        <PanelHeader icon={Tag} title="Detalhes da venda" />
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Preço de venda (€)
            </span>
            <input
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              required
              bind:value={salePriceInput}
              placeholder="17950.00"
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            />
          </label>
          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Data da venda
            </span>
            <input
              name="saleDate"
              type="date"
              required
              value={today}
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            />
          </label>
          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Estado da entrega
            </span>
            <select
              name="deliveryStatus"
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors"
              style="border-radius: var(--radius-btn);"
              value="PENDING"
            >
              <option value="PENDING">Pendente</option>
              <option value="SCHEDULED">Agendada</option>
              <option value="DELIVERED">Entregue</option>
            </select>
          </label>
          <label class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Data da entrega (opcional)
            </span>
            <input
              name="deliveryDate"
              type="date"
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            />
          </label>

          <!--
            Manual commission. Spans both columns so it stands apart from
            the standard sale fields. The hint and tooltip surface the
            VAT-exempt nature of the income (art. 9.º, 27.º, a) CIVA) so
            the form documents *why* the user enters a net amount and not
            a gross value — this matters for the demo's credibility.
          -->
          <label class="flex flex-col md:col-span-2">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5 flex items-center gap-2"
            >
              Comissão extra (opcional)
              <span class="text-[var(--color-text-faint)] normal-case tracking-normal text-[10.5px]">
                · ex: comissão de financiamento paga pelo banco
              </span>
            </span>
            <input
              name="commission"
              type="number"
              step="0.01"
              min="0"
              bind:value={commissionInput}
              placeholder="0.00"
              title="Valor que a financeira te paga pela intermediação. Isento de IVA ao abrigo do art. 9.º, 27.º, a) do CIVA — introduz o valor líquido tal como o recebes."
              class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            />
            <span class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed">
              Valor líquido que recebes — somado ao Lucro Real.<br />
              <span class="normal-case tracking-normal text-[10.5px]">
                Isento de IVA (art. 9.º, 27.º, a) CIVA) — entra como rendimento para efeitos de IRC.
              </span>
            </span>
          </label>
        </div>
      </Panel>
    </div>

    <!-- RIGHT: live profit preview -->
    <div class="lg:col-span-5">
      <Panel>
        <PanelHeader icon={Calendar} title="Pré-visualização" meta="REGIME MARGEM 23/123" />
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
              >
                Compra
              </div>
              <div class="font-display text-[18px] font-bold italic tabular-nums">
                {formatEUR(v.purchasePrice)}
              </div>
            </div>
            <div>
              <div
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
              >
                Despesas
              </div>
              <div class="font-display text-[18px] font-bold italic tabular-nums">
                {formatEUR(v.expensesTotal)}
              </div>
            </div>
            <div>
              <div
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
              >
                Margem
              </div>
              <div class="font-display text-[18px] font-bold italic tabular-nums">
                {formatEUR(figures.margin)}
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
                {formatEUR(figures.vat)}
              </div>
            </div>
          </div>

          <!--
            Optional commission line. Only renders when the user has entered
            a positive value — keeps the preview clean for cash sales.
          -->
          {#if Number(figures.commission) > 0}
            <div
              class="flex items-center justify-between border-t border-[var(--color-border)] pt-4 -mt-1"
            >
              <div
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
              >
                + Comissão extra
              </div>
              <div
                class="font-display text-[18px] font-bold italic tabular-nums text-[var(--color-success)]"
              >
                {formatEUR(figures.commission)}
              </div>
            </div>
          {/if}

          <div class="border-t border-[var(--color-border)] pt-4">
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
            >
              Lucro Real (após IVA{Number(figures.commission) > 0 ? ' + comissão' : ''})
            </div>
            <div
              class="font-display text-[26px] md:text-[36px] font-extrabold italic tabular-nums tracking-tight"
              class:text-loss={Number(figures.profit) < 0}
              class:text-profit={Number(figures.profit) >= 0}
            >
              {formatEUR(figures.profit)}
            </div>
          </div>
        </div>
      </Panel>
    </div>

    <div class="lg:col-span-12 flex items-center justify-end gap-3 pt-2">
      <Button variant="ghost" href={`/viaturas/${v.id}`}>Cancelar</Button>
      <Button
        variant="primary"
        type="submit"
        loading={submitting}
        disabled={submitting || !customerId || !salePriceInput}
      >
        Registar venda
      </Button>
    </div>
  </form>
</section>

<style>
  .text-loss {
    color: var(--color-red);
  }
  .text-profit {
    color: var(--color-success);
  }
</style>
