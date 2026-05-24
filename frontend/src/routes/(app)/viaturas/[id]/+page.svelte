<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import {
    Calendar,
    Car,
    Check,
    FileText,
    Fuel as FuelIcon,
    Gauge,
    Pencil,
    Star,
    StarOff,
    Tag,
  } from 'lucide-svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import SpecRow from '$lib/components/brand/SpecRow.svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import PhotoGallery from '$lib/components/vehicle/PhotoGallery.svelte';
  import ExpenseTable from '$lib/components/vehicle/ExpenseTable.svelte';
  import ProfitCard from '$lib/components/vehicle/ProfitCard.svelte';
  import { formatDate, formatEUR, formatInt } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  // Reactive: when SvelteKit re-runs the load function after a form action,
  // `data` is reassigned and these derived values pick up the new vehicle.
  const v = $derived(data.vehicle);
  const signedPhotos = $derived(data.signedPhotos);
  const isFeatured = $derived(data.isFeatured);

  let featurePending = $state(false);

  const FUEL_LABELS: Record<string, string> = {
    GASOLINE: 'Gasolina',
    DIESEL: 'Gasóleo',
    HYBRID: 'Híbrido',
    PLUGIN_HYBRID: 'Híbrido Plug-in',
    ELECTRIC: 'Elétrico',
    LPG: 'GPL',
  };

  const docFlags = [
    { key: 'financing', label: 'Financiamento' },
    { key: 'imt', label: 'IMT' },
    { key: 'registration', label: 'Registo' },
    { key: 'docs', label: 'Documentação' },
  ];
  const pendingCount = $derived(
    docFlags.filter(
      (f) => v.pendingDocFlags?.[f.key as keyof typeof v.pendingDocFlags],
    ).length,
  );
</script>

<svelte:head>
  <title>{v.brand} {v.model} · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Header -->
  <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-6">
    <div class="min-w-0">
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={v.status} />
        {#if v.licensePlate}
          <!-- Stylized PT-plate chip — blue prefix mirrors a real matrícula. -->
          <span
            class="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] border border-[var(--color-border-strong)] overflow-hidden"
            style="border-radius: 3px;"
            title="Matrícula portuguesa"
          >
            <span
              class="bg-[var(--color-info)] text-white font-bold text-[9px] tracking-[0.12em] px-1.5 py-1"
            >PT</span>
            <span class="px-2 py-1 tracking-[0.18em] text-[var(--color-text)]">
              {v.licensePlate}
            </span>
          </span>
        {/if}
        <span
          class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)] truncate"
        >
          VIN {v.vin}
        </span>
        {#if isFeatured}
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-[color-mix(in_oklab,#e6b800_15%,transparent)] border border-[color-mix(in_oklab,#e6b800_45%,transparent)] text-[#e6b800] font-mono text-[9.5px] uppercase tracking-[0.22em]"
            style="border-radius: var(--radius-btn);"
            title="Esta viatura está em destaque no painel"
          >
            <Star class="h-2.5 w-2.5 fill-[#e6b800]" />
            Em destaque
          </span>
        {/if}
      </div>
      <ItalicHero text={`${v.brand} `} accent={v.model} size="lg" />
      <p
        class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
      >
        <span class="text-[var(--color-red)]">●</span>
        Adquirida em {formatDate(v.acquisitionDate)}
        {#if v.soldDate}
          <span class="text-[var(--color-text-faint)]">·</span>
          Vendida em {formatDate(v.soldDate)}
        {/if}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      {#if !v.sale && ['AVAILABLE', 'RESERVED', 'DOCS_PENDING'].includes(v.status)}
        <Button variant="primary" href={`/viaturas/${v.id}/vender`}>
          <Check class="h-4 w-4" />
          Marcar como Vendida
        </Button>
      {/if}
      <!-- Toggle the dashboard hero pin. Uses use:enhance so the request runs
           in the background — no full page refresh. On success we await the
           framework `update()` which refetches the load function so the badge
           and button label flip automatically. -->
      <form
        method="POST"
        action="?/toggleFeatured"
        class="contents"
        use:enhance={() => {
          featurePending = true;
          const wasFeatured = isFeatured;
          return async ({ result, update }) => {
            // IMPORTANT: keep `featurePending` true until AFTER `update()`
            // resolves. The load function reruns inside update() and is what
            // flips `isFeatured`. If we clear pending first, the button
            // briefly renders the OLD label ("Marcar como destaque") before
            // jumping to the new one ("Remover destaque") — a visible flicker.
            try {
              if (result.type === 'success' || result.type === 'redirect') {
                await update({ reset: false });
                toast.success(
                  wasFeatured
                    ? `${v.brand} ${v.model} removido do destaque.`
                    : `${v.brand} ${v.model} agora em destaque no painel.`,
                );
              } else if (result.type === 'failure') {
                const msg = (result.data as { error?: string } | undefined)?.error ?? 'Falha.';
                toast.error(msg);
              } else {
                toast.error('Falha inesperada.');
              }
            } finally {
              featurePending = false;
            }
          };
        }}
      >
        <input type="hidden" name="current" value={isFeatured ? 'true' : 'false'} />
        {#if isFeatured}
          <button
            type="submit"
            disabled={featurePending}
            class="inline-flex items-center gap-2 px-3 h-9 border border-[color-mix(in_oklab,#e6b800_45%,transparent)] text-[#e6b800] hover:bg-[color-mix(in_oklab,#e6b800_12%,transparent)] font-mono uppercase tracking-[0.12em] text-[11px] cursor-pointer transition-colors disabled:opacity-50"
            style="border-radius: var(--radius-btn);"
            title="Remover esta viatura como destaque no painel"
          >
            <StarOff class="h-4 w-4" />
            {featurePending ? 'A remover…' : 'Remover destaque'}
          </button>
        {:else}
          <button
            type="submit"
            disabled={featurePending}
            class="inline-flex items-center gap-2 px-3 h-9 border border-[var(--color-border)] hover:border-[#e6b800] hover:text-[#e6b800] text-[var(--color-text)] font-mono uppercase tracking-[0.12em] text-[11px] cursor-pointer transition-colors disabled:opacity-50"
            style="border-radius: var(--radius-btn);"
            title="Mostrar esta viatura em destaque no painel"
          >
            <Star class="h-4 w-4" />
            {featurePending ? 'A guardar…' : 'Marcar como destaque'}
          </button>
        {/if}
      </form>
      <Button variant="outline" href={`/viaturas/${v.id}/editar`}>
        <Pencil class="h-4 w-4" />
        Editar
      </Button>
    </div>
  </div>

  <!-- Top grid: gallery + spec/profit -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-7 space-y-6">
      <PhotoGallery vehicleId={v.id} photos={signedPhotos} />

      <Panel>
        <PanelHeader icon={FileText} title="Notas" />
        <div class="p-5 text-[14px] leading-relaxed text-[var(--color-text-muted)]">
          {v.description ?? 'Sem notas registadas.'}
        </div>
      </Panel>
    </div>

    <div class="lg:col-span-5 space-y-6">
      <!-- Specs -->
      <Panel>
        <PanelHeader icon={Car} title="Especificações" />
        <div class="p-5 grid grid-cols-2 gap-5">
          <SpecRow icon={Calendar} label="Ano" value={String(v.year)} />
          <SpecRow icon={Gauge} label="Quilometragem" value={`${formatInt(v.mileage)} km`} />
          <SpecRow
            icon={Tag}
            label="PVP"
            value={v.salePrice ? formatEUR(v.salePrice) : '—'}
            valueClass="text-[var(--color-red)] font-bold"
          />
          <SpecRow icon={FuelIcon} label="Combustível" value={FUEL_LABELS[v.fuel] ?? v.fuel} />
        </div>
      </Panel>

      <!-- Pending docs -->
      <Panel>
        <PanelHeader
          icon={FileText}
          title="Documentos pendentes"
          meta={pendingCount === 0 ? 'OK' : `${pendingCount} POR TRATAR`}
        />
        <div class="p-5 grid grid-cols-2 gap-3">
          {#each docFlags as f (f.key)}
            {@const isPending = v.pendingDocFlags?.[f.key as keyof typeof v.pendingDocFlags]}
            <div
              class="flex items-center gap-2 px-3 py-2 border {isPending
                ? 'border-[color-mix(in_oklab,var(--color-red)_30%,transparent)] text-[var(--color-red)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}"
              style="border-radius: var(--radius-btn);"
            >
              <span
                class="h-1.5 w-1.5 rounded-full {isPending
                  ? 'bg-[var(--color-red)]'
                  : 'bg-[var(--color-success)]'}"
              ></span>
              <span class="font-mono text-[10px] uppercase tracking-[0.2em]">{f.label}</span>
            </div>
          {/each}
        </div>
      </Panel>
    </div>
  </div>

  <!-- Profit card -->
  <ProfitCard
    purchasePrice={v.purchasePrice}
    salePrice={v.salePrice}
    expensesTotal={v.expensesTotal}
    figures={v.figures}
    sale={v.sale
      ? {
          vatAmount: v.sale.vatAmount,
          commission: v.sale.commission,
          realProfit: v.sale.realProfit,
        }
      : null}
  />

  <!-- Expenses -->
  <ExpenseTable expenses={v.expenses} vehicleStatus={v.status} />

  {#if v.sale}
    {@const saleId = v.sale.id}
    <Panel>
      <PanelHeader icon={Tag} title="Venda registada" meta={v.sale.deliveryStatus.toUpperCase()}>
        {#snippet actions()}
          <Button variant="outline" size="sm" href={`/sales/${saleId}`}>Ver venda</Button>
        {/snippet}
      </PanelHeader>
      <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-[14px]">
        <div>
          <div
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
          >
            Cliente
          </div>
          <a
            href={`/clientes/${v.sale.customer.id}`}
            class="font-display font-semibold hover:text-[var(--color-red)] transition-colors"
          >
            {v.sale.customer.name}
          </a>
          <div class="font-mono text-[11px] text-[var(--color-text-muted)] mt-0.5">
            NIF {v.sale.customer.nif}
          </div>
        </div>
        <div>
          <div
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
          >
            Data
          </div>
          <div class="font-mono">{formatDate(v.sale.saleDate)}</div>
        </div>
        <div>
          <div
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
          >
            Valor
          </div>
          <div class="num-value text-[18px]">
            {formatEUR(v.sale.salePrice)}
          </div>
        </div>
      </div>
    </Panel>
  {/if}
</section>
