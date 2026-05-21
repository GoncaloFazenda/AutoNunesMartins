<script lang="ts">
  import { useClerkContext } from 'svelte-clerk';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import KPICard from '$lib/components/brand/KPICard.svelte';
  // Hand-drawn icons matching the index.html prototype's `I.*` library.
  import BrandCar from '$lib/components/brand/icons/BrandCar.svelte';
  import BrandReceipt from '$lib/components/brand/icons/BrandReceipt.svelte';
  import BrandChart from '$lib/components/brand/icons/BrandChart.svelte';
  import BrandGauge from '$lib/components/brand/icons/BrandGauge.svelte';
  import BrandDl from '$lib/components/brand/icons/BrandDl.svelte';
  import BrandPlus from '$lib/components/brand/icons/BrandPlus.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import Skeleton from '$lib/components/common/Skeleton.svelte';
  import SmartAlertsBanner from '$lib/components/dashboard/SmartAlertsBanner.svelte';
  import SalesChart from '$lib/components/dashboard/SalesChart.svelte';
  import BestSellers from '$lib/components/dashboard/BestSellers.svelte';
  import StockAgingTable from '$lib/components/dashboard/StockAgingTable.svelte';
  import TodayTasks from '$lib/components/dashboard/TodayTasks.svelte';
  import RecentActivityFeed from '$lib/components/dashboard/RecentActivityFeed.svelte';
  import FeaturedVehicleHero from '$lib/components/dashboard/FeaturedVehicleHero.svelte';
  import {
    formatCompactEUR,
    formatDateLong,
    formatGreeting,
  } from '$lib/utils/format';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const ctx = useClerkContext();
  const today = new Date();
  const greeting = $derived(formatGreeting(today));
  // Greeting name resolution order:
  //   1. Clerk `username` (preferred — the handle the user chose explicitly)
  //   2. Clerk `firstName`
  //   3. First word of Clerk `fullName` ONLY when it contains a space
  //      (so an email-derived single-token "fullName" doesn't show up as a
  //      pseudo-name)
  //   4. First word of Prisma User.name when it contains a space
  //   5. Empty (the greeting renders without a name)
  const firstName = $derived.by(() => {
    const u = ctx.user;
    if (u?.username) return u.username;
    if (u?.firstName) return u.firstName;
    if (u?.fullName && u.fullName.includes(' ')) return u.fullName.split(' ')[0]!;
    const prismaName = data.currentUser?.name;
    if (prismaName && prismaName.includes(' ')) return prismaName.split(' ')[0]!;
    return '';
  });

</script>

<svelte:head>
  <title>Dashboard · Auto Nunes Martins</title>
</svelte:head>

<section class="pb-12 space-y-6">
  <!--
    Page header — mirrors index.html `.page-head` exactly:
      margin-top: 28px, margin-bottom: 24px (handled via pt-[28px] mb-6),
      flex space-between with items-end,
      title block on the left, Exportar + Adicionar Viatura buttons on the right.
  -->
  <div class="flex items-end justify-between gap-6 pt-[28px] pb-[32px]">
    <div>
      <ItalicHero text={`${greeting}, `} accent={firstName ? `${firstName}.` : ''} size="lg" />
      <!--
        Page subtitle — mirrors the prototype's `.page-head .sub-info`:
        mono 11px, font-weight 400 (thinner than our default 500), color
        text-faint (#6E6F73 — dimmer than text-muted), 0.12em tracking.
      -->
      <div
        class="mt-2 flex items-center gap-2 font-mono font-normal text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
      >
        {formatDateLong(today)}
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        <span>Painel · v1</span>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-[14px] py-[10px] bg-transparent border border-[var(--color-border-strong)] hover:border-[var(--color-red)] text-[var(--color-text)] font-display font-semibold italic uppercase text-[12px] tracking-[0.1em] transition-colors cursor-pointer"
        style="border-radius: var(--radius-btn);"
        aria-label="Exportar dashboard"
      >
        <BrandDl class="h-3 w-3" />
        Exportar
      </button>
      <a
        href="/viaturas/nova"
        class="inline-flex items-center gap-2 px-[14px] py-[10px] bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white font-display font-semibold italic uppercase text-[12px] tracking-[0.1em] transition-colors cursor-pointer"
        style="border-radius: var(--radius-btn);"
      >
        <BrandPlus class="h-3 w-3" />
        Adicionar Viatura
      </a>
    </div>
  </div>

  <!-- Streamed dashboard -->
  {#await data.dashboard}
    <!-- Skeleton state -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each Array(4) as _, i (i)}
        <Panel>
          <div class="p-4 space-y-3">
            <Skeleton width="60%" height="10px" />
            <Skeleton width="80%" height="28px" />
            <Skeleton width="50%" height="10px" />
          </div>
        </Panel>
      {/each}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-8">
        <Panel>
          <div class="p-4">
            <Skeleton height="220px" />
          </div>
        </Panel>
      </div>
      <div class="lg:col-span-4">
        <Panel>
          <div class="p-4">
            <Skeleton height="220px" />
          </div>
        </Panel>
      </div>
    </div>
  {:then result}
    {#if result.kind === 'error'}
      <Panel>
        <div class="p-4 flex items-center gap-3 text-[var(--color-red)] text-[13px]">
          <strong class="font-mono uppercase tracking-[0.12em] text-[10px]">Erro</strong>
          <span>{result.message}</span>
        </div>
      </Panel>
    {:else}
      {@const d = result.payload}

      <!-- Featured vehicle hero — awaited in the load function so it ships
           in the initial HTML and doesn't cause a layout shift. -->
      <FeaturedVehicleHero
        vehicle={data.featuredVehicle}
        salesThisMonth={d.kpis.vendasMes.count}
        revenueYtd={d.salesChart.ytdRevenue}
      />

      <!-- Smart Alerts banner (renders only when there's something to alert about) -->
      <SmartAlertsBanner alerts={d.alerts} />

      <!-- KPI row — values compact-formatted with smaller dim suffix -->
      {@const faturacao = formatCompactEUR(d.kpis.faturacaoMes.current)}
      {@const lucro = formatCompactEUR(d.kpis.lucroMes.current)}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={BrandCar}
          label="Vendas · Mês"
          value={String(d.kpis.vendasMes.count)}
          suffix="un"
          deltaPct={d.kpis.vendasMes.deltaPct}
          sparkline={d.kpis.sparklines.vendas}
        />
        <KPICard
          icon={BrandReceipt}
          label="Faturação · Mês"
          value={faturacao.value}
          suffix={faturacao.suffix}
          deltaPct={d.kpis.faturacaoMes.deltaPct}
          sparkline={d.kpis.sparklines.faturacao}
        />
        <KPICard
          icon={BrandChart}
          label="Lucro · Mês"
          value={lucro.value}
          suffix={lucro.suffix}
          deltaPct={d.kpis.lucroMes.deltaPct}
          sparkline={d.kpis.sparklines.lucro}
        />
        <KPICard
          icon={BrandGauge}
          label="Margem Média"
          value={d.kpis.margemMedia.current !== null
            ? d.kpis.margemMedia.current.toFixed(1)
            : '—'}
          suffix={d.kpis.margemMedia.current !== null ? '%' : undefined}
          deltaPct={d.kpis.margemMedia.deltaPct}
          sparkline={d.kpis.sparklines.margem}
        />
      </div>

      <!-- Sales chart (8) + Best Sellers (4) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-8">
          <SalesChart data={d.salesChart} />
        </div>
        <div class="lg:col-span-4">
          <BestSellers items={d.bestSellers} />
        </div>
      </div>

      <!-- Stock aging (7) + Today's Tasks (5) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-7">
          <StockAgingTable items={d.stockAged} />
        </div>
        <div class="lg:col-span-5">
          <TodayTasks
            items={d.todayTasks}
            users={data.users}
            currentUserId={data.currentUser?.id ?? null}
          />
        </div>
      </div>

      <!-- Recent activity (full width) — kept below as our own extension;
           the prototype doesn't have this panel but it provides real value
           for an admin tool. -->
      <RecentActivityFeed items={d.recentActivity} />
    {/if}
  {/await}
</section>
