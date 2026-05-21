<script lang="ts">
  import {
    Calendar,
    Car,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Tag,
    User as UserIcon,
  } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import SpecRow from '$lib/components/brand/SpecRow.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import { formatDate, formatEUR } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const c = $derived(data.customer);

  const totalSpent = $derived(
    c.sales.reduce((sum, s) => sum + Number(s.salePrice), 0),
  );
</script>

<svelte:head>
  <title>{c.name} · Clientes · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Header -->
  <div class="flex items-end justify-between gap-6">
    <div>
      <div class="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
        NIF {c.nif}
      </div>
      <ItalicHero text={c.name} size="lg" />
      <p
        class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
      >
        <span class="text-[var(--color-red)]">●</span>
        Registado em {formatDate(c.createdAt)}
        {#if c.lastContactDate}
          <span class="text-[var(--color-text-faint)]">·</span>
          Último contacto {formatDate(c.lastContactDate)}
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" href={`/clientes/${c.id}/editar`}>
        <Pencil class="h-4 w-4" />
        Editar
      </Button>
    </div>
  </div>

  <!-- Grid: contact + sales summary -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-5 space-y-6">
      <Panel>
        <PanelHeader icon={UserIcon} title="Contacto" />
        <div class="p-5 space-y-4">
          <SpecRow icon={Phone} label="Telefone" value={c.phone} />
          {#if c.email}
            <SpecRow icon={Mail} label="Email" value={c.email} />
          {/if}
          {#if c.address}
            <SpecRow icon={MapPin} label="Morada" value={c.address} />
          {/if}
          <SpecRow icon={Tag} label="NIF" value={c.nif} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          icon={FileText}
          title="Notas"
          meta={c.notes ? undefined : 'SEM REGISTOS'}
        />
        <div
          class="p-5 text-[14px] leading-relaxed text-[var(--color-text-muted)] whitespace-pre-wrap"
        >
          {c.notes ?? 'Sem notas registadas.'}
        </div>
      </Panel>
    </div>

    <div class="lg:col-span-7 space-y-6">
      <Panel>
        <PanelHeader
          icon={Car}
          title="Viaturas adquiridas"
          meta={`${c.sales.length} VENDA${c.sales.length === 1 ? '' : 'S'}`}
        />
        {#if c.sales.length === 0}
          <div
            class="p-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]"
          >
            Este cliente ainda não tem compras registadas
          </div>
        {:else}
          <div class="divide-y divide-[var(--color-border)]">
            {#each c.sales as s (s.id)}
              <a
                href={`/viaturas/${s.vehicle.id}`}
                class="flex items-center gap-4 px-5 py-4 hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
              >
                <div
                  class="h-12 w-16 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0"
                  style="border-radius: 3px;"
                >
                  <Car class="h-5 w-5 text-[var(--color-red)]" />
                </div>
                <div class="flex-1 min-w-0">
                  <div
                    class="font-display font-bold italic text-[15px] truncate group-hover:text-[var(--color-red)] transition-colors"
                  >
                    {s.vehicle.brand} {s.vehicle.model}
                  </div>
                  <div
                    class="flex items-center gap-2 mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]"
                  >
                    <span>{s.vehicle.year}</span>
                    <span>·</span>
                    <span>{s.vehicle.vin}</span>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="num-value text-[16px]">
                    {formatEUR(s.salePrice)}
                  </div>
                  <div
                    class="flex items-center justify-end gap-1.5 mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
                  >
                    <Calendar class="h-2.5 w-2.5" />
                    {formatDate(s.saleDate)}
                  </div>
                </div>
                <StatusBadge status={s.deliveryStatus as 'PENDING' | 'SCHEDULED' | 'DELIVERED'} />
              </a>
            {/each}
          </div>

          <div
            class="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-2)]"
          >
            <span
              class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
            >
              Total facturado
            </span>
            <span class="num-value text-[20px]">
              {formatEUR(totalSpent)}
            </span>
          </div>
        {/if}
      </Panel>
    </div>
  </div>
</section>
