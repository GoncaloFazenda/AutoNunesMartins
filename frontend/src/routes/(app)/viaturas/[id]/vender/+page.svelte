<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { ArrowRightLeft, Calendar, Search, Tag, User as UserIcon } from 'lucide-svelte';
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
  // Tax regime selector. PARTICULAR → 23/123 margin scheme (IVA leaves the
  // dealer's pocket). COMERCIANTE → B2B sale without IVA discriminated by
  // the seller, so the full margin lands in Lucro Real.
  let buyerType = $state<'PARTICULAR' | 'COMERCIANTE'>('PARTICULAR');
  // ─── Retoma (trade-in) ───────────────────────────────────────────────
  // Off by default — most sales are pure cash. When the dealer toggles it
  // on, the sub-form appears, the allowance is abated from the live profit
  // preview, and a TradeIn row gets persisted alongside the Sale on submit.
  let hasTradeIn = $state(false);
  let tradeInBrand = $state('');
  let tradeInModel = $state('');
  let tradeInYear = $state('');
  let tradeInFuel = $state<'GASOLINE' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'ELECTRIC' | 'LPG'>('GASOLINE');
  let tradeInMileage = $state('');
  let tradeInPlate = $state('');
  let tradeInVin = $state('');
  let tradeInAllowance = $state('');
  // STOCK → carro entra no inventário (cria Vehicle nova, requer VIN).
  // SCRAP → carro vai para abate/desmanche, nunca entra no stock.
  let tradeInDisposition = $state<'STOCK' | 'SCRAP'>('STOCK');
  let tradeInNotes = $state('');
  // ─── Field-level errors devolvidos pelo backend ──────────────────────
  // Preenchidos quando o servidor responde com 409 + `field` (ex.: VIN
  // duplicado). Limpos no oninput do respetivo input para o aviso
  // desaparecer assim que o utilizador começa a corrigir.
  let tradeInVinError = $state<string | null>(null);
  let tradeInPlateError = $state<string | null>(null);
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
    // Trade-in NÃO entra na margem nem no IVA — é uma compra separada que
    // cria um carro novo no stock a custo = allowance. Aqui só importa a
    // margem da venda do carro do stand (ver computeSaleFigures backend).
    const margin = price - purchase - expensesTotal;
    if (margin <= 0 || buyerType === 'COMERCIANTE') {
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

  // Client-side guard: refuse submit when the trade-in is enabled but its
  // mandatory fields aren't filled. The allowance is NOT capped by the
  // sale price anymore (the trade-in is a parallel deal — it can perfectly
  // well be worth more than the sold car, e.g. a downgrade trade).
  function validateTradeIn(): string | null {
    if (!hasTradeIn) return null;
    if (!tradeInBrand.trim()) return 'Indica a marca do carro de retoma.';
    if (!tradeInModel.trim()) return 'Indica o modelo do carro de retoma.';
    if (!tradeInYear) return 'Indica o ano do carro de retoma.';
    if (!tradeInMileage) return 'Indica a quilometragem do carro de retoma.';
    if (!tradeInAllowance || Number(tradeInAllowance) <= 0)
      return 'Indica o valor atribuído à retoma.';
    if (tradeInDisposition === 'STOCK' && !tradeInVin.trim())
      return 'VIN é obrigatório quando a retoma vai para o stock.';
    return null;
  }

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
      const tradeInError = validateTradeIn();
      if (tradeInError) {
        toast.error(tradeInError);
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
          // IMPORTANTE: NÃO chamamos `update()` nem `applyAction()` aqui —
          // o objetivo é PRESERVAR todo o estado do formulário (cliente,
          // preço, dados da retoma) para o dono do stand não ter de
          // reintroduzir tudo. Os $state acima sobrevivem porque a página
          // não é refeita.
          const data = result.data as
            | { error?: string; field?: string | null }
            | undefined;
          toast.error(data?.error ?? 'Falha ao registar.');
          // Marca o input com erro inline quando o backend identifica qual
          // foi o campo que colidiu (VIN ou matrícula duplicada).
          if (data?.field === 'tradeIn.vin') {
            tradeInVinError = data.error ?? 'VIN duplicado.';
          }
          if (data?.field === 'tradeIn.licensePlate') {
            tradeInPlateError = data.error ?? 'Matrícula duplicada.';
          }
        }
      };
    }}
    class="grid grid-cols-1 lg:grid-cols-12 gap-6"
  >
    <input type="hidden" name="vehicleId" value={v.id} />
    <input type="hidden" name="customerId" value={customerId} />
    <input type="hidden" name="buyerType" value={buyerType} />
    <!-- Trade-in toggle + disposition travel as hidden inputs so the action
         can branch on a single boolean string. When `hasTradeIn === 'true'`
         the action collects the remaining `tradeIn.*` named fields. -->
    <input type="hidden" name="hasTradeIn" value={hasTradeIn ? 'true' : 'false'} />
    <input type="hidden" name="tradeIn.disposition" value={tradeInDisposition} />

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
        <div class="p-5 space-y-4">
          <!--
            Tipo de comprador. Particular usa o regime de margem 23/123
            (IVA sai do lucro). Comerciante é uma venda B2B sem IVA
            discriminado pelo vendedor — a margem inteira fica como lucro
            real. O selector atualiza a pré-visualização em tempo real.
          -->
          <div class="flex flex-col">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
            >
              Tipo de comprador
            </span>
            <div
              class="inline-flex h-11 p-1 border border-[var(--color-border)] bg-[var(--color-bg-1)] self-start"
              style="border-radius: var(--radius-btn);"
              role="radiogroup"
              aria-label="Tipo de comprador"
            >
              <button
                type="button"
                role="radio"
                aria-checked={buyerType === 'PARTICULAR'}
                onclick={() => (buyerType = 'PARTICULAR')}
                class="px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors {buyerType ===
                'PARTICULAR'
                  ? 'bg-[var(--color-red)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
                style="border-radius: calc(var(--radius-btn) - 2px);"
              >
                Particular
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={buyerType === 'COMERCIANTE'}
                onclick={() => (buyerType = 'COMERCIANTE')}
                class="px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors {buyerType ===
                'COMERCIANTE'
                  ? 'bg-[var(--color-red)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
                style="border-radius: calc(var(--radius-btn) - 2px);"
              >
                Comerciante
              </button>
            </div>
            <span
              class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed"
            >
              {#if buyerType === 'PARTICULAR'}
                Regime de margem 23/123 — IVA sai do lucro.
              {:else}
                Venda B2B sem IVA — margem inteira fica como lucro real.
              {/if}
            </span>
          </div>
        </div>
        <div class="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <!--
        Retoma (trade-in). Off por defeito — só aparece quando o cliente
        entrega um carro como parte do pagamento. O valor atribuído abate
        ao preço de venda no cálculo de margem/IVA. STOCK cria uma
        Viatura nova no inventário; SCRAP só regista o negócio sem
        adicionar nada ao stock.
      -->
      <Panel>
        <PanelHeader
          icon={ArrowRightLeft}
          title="Retoma"
          meta={hasTradeIn
            ? tradeInDisposition === 'STOCK'
              ? 'ENTRA NO STOCK'
              : 'PARA ABATE'
            : 'OPCIONAL'}
        />
        <div class="p-5 space-y-4">
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              bind:checked={hasTradeIn}
              class="mt-1 h-4 w-4 accent-[var(--color-red)]"
            />
            <span class="text-[13px] leading-snug">
              <span class="font-display font-semibold">Cliente entrega carro como retoma</span>
              <span
                class="block mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] normal-case tracking-normal"
              >
                A retoma é registada como compra separada — não afeta a margem nem o IVA desta venda.
              </span>
            </span>
          </label>

          {#if hasTradeIn}
            <!-- Disposition picker — drives whether a Vehicle row is created. -->
            <div class="flex flex-col">
              <span
                class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
              >
                O que fazer com este carro?
              </span>
              <div
                class="inline-flex h-11 p-1 border border-[var(--color-border)] bg-[var(--color-bg-1)] self-start"
                style="border-radius: var(--radius-btn);"
                role="radiogroup"
                aria-label="Destino da retoma"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={tradeInDisposition === 'STOCK'}
                  onclick={() => (tradeInDisposition = 'STOCK')}
                  class="px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors {tradeInDisposition ===
                  'STOCK'
                    ? 'bg-[var(--color-red)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
                  style="border-radius: calc(var(--radius-btn) - 2px);"
                >
                  Pôr à venda no stand
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={tradeInDisposition === 'SCRAP'}
                  onclick={() => (tradeInDisposition = 'SCRAP')}
                  class="px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors {tradeInDisposition ===
                  'SCRAP'
                    ? 'bg-[var(--color-red)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
                  style="border-radius: calc(var(--radius-btn) - 2px);"
                >
                  Abate / desmanche
                </button>
              </div>
              <span
                class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed"
              >
                {#if tradeInDisposition === 'STOCK'}
                  Cria uma viatura nova em stock com preço de compra = valor da retoma.
                {:else}
                  Carro vai para abate/desmanche — não entra no inventário.
                {/if}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Marca
                </span>
                <input
                  name="tradeIn.brand"
                  type="text"
                  bind:value={tradeInBrand}
                  placeholder="Renault"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                />
              </label>
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Modelo
                </span>
                <input
                  name="tradeIn.model"
                  type="text"
                  bind:value={tradeInModel}
                  placeholder="Clio"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                />
              </label>
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Ano
                </span>
                <input
                  name="tradeIn.year"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  bind:value={tradeInYear}
                  placeholder="2015"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                />
              </label>
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Combustível
                </span>
                <select
                  name="tradeIn.fuel"
                  bind:value={tradeInFuel}
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                >
                  <option value="GASOLINE">Gasolina</option>
                  <option value="DIESEL">Gasóleo</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="PLUGIN_HYBRID">Híbrido Plug-in</option>
                  <option value="ELECTRIC">Elétrico</option>
                  <option value="LPG">GPL</option>
                </select>
              </label>
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Quilometragem
                </span>
                <input
                  name="tradeIn.mileage"
                  type="number"
                  min="0"
                  bind:value={tradeInMileage}
                  placeholder="120000"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                />
              </label>
              <label class="flex flex-col">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Matrícula (opcional)
                </span>
                <input
                  name="tradeIn.licensePlate"
                  type="text"
                  bind:value={tradeInPlate}
                  oninput={() => (tradeInPlateError = null)}
                  placeholder="12-AB-34"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border text-[14px] uppercase outline-none transition-colors {tradeInPlateError
                    ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
                    : 'border-[var(--color-border)] focus:border-[var(--color-red)]'}"
                  style="border-radius: var(--radius-btn);"
                />
                {#if tradeInPlateError}
                  <span class="mt-1.5 font-mono text-[10px] text-[var(--color-red)] tracking-[0.06em]">
                    {tradeInPlateError}
                  </span>
                {/if}
              </label>
              <label class="flex flex-col md:col-span-2">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5 flex items-center gap-2"
                >
                  VIN
                  {#if tradeInDisposition === 'STOCK'}
                    <span class="text-[var(--color-red)] normal-case tracking-normal text-[10.5px]">
                      · obrigatório (vai entrar no stock)
                    </span>
                  {:else}
                    <span
                      class="text-[var(--color-text-faint)] normal-case tracking-normal text-[10.5px]"
                    >
                      · opcional (não entra no stock)
                    </span>
                  {/if}
                </span>
                <input
                  name="tradeIn.vin"
                  type="text"
                  bind:value={tradeInVin}
                  oninput={() => (tradeInVinError = null)}
                  placeholder="VF1XXXXXXXXXXXXXX"
                  maxlength="17"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border text-[14px] uppercase font-mono outline-none transition-colors {tradeInVinError
                    ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
                    : 'border-[var(--color-border)] focus:border-[var(--color-red)]'}"
                  style="border-radius: var(--radius-btn);"
                />
                {#if tradeInVinError}
                  <span class="mt-1.5 font-mono text-[10px] text-[var(--color-red)] tracking-[0.06em]">
                    {tradeInVinError}
                  </span>
                {/if}
              </label>
              <label class="flex flex-col md:col-span-2">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Valor atribuído à retoma (€)
                </span>
                <input
                  name="tradeIn.allowanceValue"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={tradeInAllowance}
                  placeholder="4000.00"
                  class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
                  style="border-radius: var(--radius-btn);"
                />
                <span
                  class="mt-1.5 font-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-[0.12em] leading-relaxed"
                >
                  {#if tradeInDisposition === 'STOCK'}
                    Vira o preço de compra da viatura que entra no stock.
                  {:else}
                    Custo da aquisição da retoma (só para registo — não afeta esta venda).
                  {/if}
                </span>
              </label>
              <label class="flex flex-col md:col-span-2">
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
                >
                  Notas (opcional)
                </span>
                <textarea
                  name="tradeIn.notes"
                  bind:value={tradeInNotes}
                  rows="2"
                  placeholder="Estado, danos visíveis, documentação em falta…"
                  class="px-3 py-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] transition-colors resize-y"
                  style="border-radius: var(--radius-btn);"
                ></textarea>
              </label>
            </div>
          {/if}
        </div>
      </Panel>
    </div>

    <!-- RIGHT: live profit preview -->
    <div class="lg:col-span-5">
      <Panel>
        <PanelHeader
          icon={Calendar}
          title="Pré-visualização"
          meta={buyerType === 'COMERCIANTE' ? 'SEM IVA — COMERCIANTE' : 'REGIME MARGEM 23/123'}
        />
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
            {#if buyerType === 'PARTICULAR'}
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
            {:else}
              <div>
                <div
                  class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
                >
                  IVA
                </div>
                <div
                  class="font-display text-[18px] font-bold italic tabular-nums text-[var(--color-text-faint)]"
                  title="Venda a comerciante — sem IVA discriminado pelo vendedor."
                >
                  —
                </div>
              </div>
            {/if}
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
              Lucro Real{buyerType === 'PARTICULAR' ? ' (após IVA' : ' (margem inteira'}{Number(
                figures.commission,
              ) > 0
                ? ' + comissão'
                : ''})
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
