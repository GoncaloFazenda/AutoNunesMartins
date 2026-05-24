<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { Calendar, Car, Receipt, Tag, User as UserIcon } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import SpecRow from '$lib/components/brand/SpecRow.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { formatDate, formatEUR } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const s = $derived(data.sale);
  const v = $derived(s.vehicle);
  const c = $derived(s.customer);
  // True when this sale captured a manual extra commission (e.g. financing
  // referral). Drives the optional Comissão column in the profit summary.
  const hasCommission = $derived(Number(s.commission ?? '0') > 0);

  let updatingDelivery = $state(false);
</script>

<svelte:head>
  <title>Venda · {v.brand} {v.model}</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Header -->
  <div class="flex items-end justify-between gap-6">
    <div>
      <div class="mb-2 flex items-center gap-2">
        <StatusBadge status={s.deliveryStatus} />
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Vendida em {formatDate(s.saleDate)}
        </span>
      </div>
      <ItalicHero text={`${v.brand} `} accent={v.model} size="lg" />
      <p
        class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        <span class="text-[var(--color-red)]">●</span>
        Para {c.name} <span class="text-[var(--color-text-faint)]">·</span> NIF {c.nif}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" href={`/viaturas/${v.id}`}>Ver viatura</Button>
      <Button variant="outline" href={`/clientes/${c.id}`}>Ver cliente</Button>
    </div>
  </div>

  <!-- Profit summary. When a financing-referral commission was captured at
       sale time, it gets its own cell between IVA and Lucro Real so the
       breakdown clearly shows what's the vehicle margin and what's the
       intermediation income that lifts the bottom line.
       `{@const}` must be the immediate child of a control-flow block, so
       we use a $derived in the script tag's scope. -->
  <Panel>
    <PanelHeader icon={Receipt} title="Margem · IVA" meta="REGIME MARGEM 23/123" />
    <div
      class="p-5 grid grid-cols-2 gap-4 {hasCommission ? 'md:grid-cols-5' : 'md:grid-cols-4'}"
    >
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Preço Compra
        </div>
        <div class="num-value text-[20px]">
          {formatEUR(v.purchasePrice)}
        </div>
      </div>
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Preço Venda
        </div>
        <div class="num-value text-[20px]">
          {formatEUR(s.salePrice)}
        </div>
      </div>
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          IVA (23/123)
        </div>
        <div class="num-value text-[20px] text-[var(--color-warning)]">
          {formatEUR(s.vatAmount)}
        </div>
      </div>
      {#if hasCommission}
        <div>
          <div
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
          >
            Comissão
          </div>
          <div class="num-value text-[20px] text-[var(--color-success)]">
            + {formatEUR(s.commission)}
          </div>
        </div>
      {/if}
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Lucro Real
        </div>
        <div
          class="num-value text-[24px] {Number(s.realProfit) < 0
            ? 'text-[var(--color-red)]'
            : 'text-[var(--color-success)]'}"
        >
          {formatEUR(s.realProfit)}
        </div>
      </div>
    </div>
  </Panel>

  <!-- Two-col: vehicle + customer cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Panel>
      <PanelHeader icon={Car} title="Viatura" />
      <div class="p-5 space-y-3">
        <SpecRow icon={Car} label="Marca / Modelo" value={`${v.brand} ${v.model}`} />
        <SpecRow icon={Calendar} label="Ano" value={String(v.year)} />
        <SpecRow icon={Tag} label="VIN" value={v.vin} />
      </div>
    </Panel>

    <Panel>
      <PanelHeader icon={UserIcon} title="Cliente" />
      <div class="p-5 space-y-3">
        <SpecRow icon={UserIcon} label="Nome" value={c.name} />
        <SpecRow icon={Tag} label="NIF" value={c.nif} />
        <SpecRow icon={UserIcon} label="Telefone" value={c.phone} />
        {#if c.email}
          <SpecRow icon={UserIcon} label="Email" value={c.email} />
        {/if}
      </div>
    </Panel>
  </div>

  <!-- Delivery management -->
  <Panel>
    <PanelHeader icon={Calendar} title="Entrega" />
    <form
      method="POST"
      action="?/delivery"
      use:enhance={() => {
        updatingDelivery = true;
        return async ({ result }) => {
          updatingDelivery = false;
          if (result.type === 'success') {
            toast.success('Entrega actualizada.');
            await invalidateAll();
          } else if (result.type === 'failure') {
            toast.error(
              (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
            );
          }
        };
      }}
      class="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
    >
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
        >
          Estado
        </span>
        <select
          name="deliveryStatus"
          value={s.deliveryStatus}
          class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
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
          Data de entrega
        </span>
        <input
          name="deliveryDate"
          type="date"
          value={s.deliveryDate ? s.deliveryDate.slice(0, 10) : ''}
          class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>
      <div class="flex justify-end">
        <Button variant="primary" type="submit" loading={updatingDelivery}>
          Actualizar entrega
        </Button>
      </div>
    </form>
  </Panel>
</section>
