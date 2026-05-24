<script lang="ts">
  import { Car, Download, Plus } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import VehicleFilters from '$lib/components/vehicle/VehicleFilters.svelte';
  import VehicleTable from '$lib/components/vehicle/VehicleTable.svelte';
  import VehicleTableSkeleton from '$lib/components/vehicle/VehicleTableSkeleton.svelte';
  import { formatDateLong } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const today = new Date();
</script>

<svelte:head>
  <title>Viaturas · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Page header -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
    <div class="min-w-0">
      <ItalicHero text="Viaturas" size="lg" />
      <div
        class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        {formatDateLong(today)}
        {#await data.list then list}
          <span class="text-[var(--color-text-faint)]">·</span>
          <span class="tabular-nums">{list.total} no inventário</span>
        {/await}
      </div>
    </div>
    <!-- Desktop-only action buttons — mobile has the icon CTA in the topbar. -->
    <div class="hidden md:flex items-center gap-2">
      <Button variant="outline" size="md" href="/viaturas/export?format=csv">
        <Download class="h-4 w-4" />
        Exportar
      </Button>
      <Button variant="primary" size="md" href="/viaturas/nova">
        <Plus class="h-4 w-4" />
        Adicionar Viatura
      </Button>
    </div>
  </div>

  <!-- Filters render immediately (independent of data) -->
  <Panel>
    <div class="p-4">
      <VehicleFilters filters={data.filters} />
    </div>
  </Panel>

  <!-- Streamed table: skeleton first, then data flows in -->
  <Panel>
    {#await data.list}
      <VehicleTableSkeleton rows={6} />
    {:then list}
      {#if list._error}
        <div class="p-4 flex items-center gap-3 text-[var(--color-red)] text-[13px]">
          <strong class="font-mono uppercase tracking-[0.2em] text-[10px]">Erro</strong>
          <span>{list._error}</span>
        </div>
      {:else if list.items.length === 0}
        <EmptyState
          icon={Car}
          title="Nenhuma viatura encontrada"
          description="Ajusta os filtros acima ou adiciona a primeira viatura ao stand."
        >
          {#snippet actions()}
            <Button variant="primary" size="md" href="/viaturas/nova">
              <Plus class="h-4 w-4" />
              Adicionar primeira viatura
            </Button>
          {/snippet}
        </EmptyState>
      {:else}
        <VehicleTable items={list.items} />
        <Pagination
          currentPage={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
        />
      {/if}
    {/await}
  </Panel>
</section>
