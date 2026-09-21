<script lang="ts">
  import { Cpu, Star } from 'lucide-svelte';
  import BrandCal from '$lib/components/brand/icons/BrandCal.svelte';
  import BrandGauge from '$lib/components/brand/icons/BrandGauge.svelte';
  import BrandTag from '$lib/components/brand/icons/BrandTag.svelte';
  import BrandRight from '$lib/components/brand/icons/BrandRight.svelte';
  import CarSilhouette from '$lib/components/brand/CarSilhouette.svelte';
  import { formatDate, formatEUR, formatInt } from '$lib/utils/format';
  import type { FeaturedVehicleDto } from '$lib/server/dashboard';

  interface Props {
    vehicle: FeaturedVehicleDto | null;
    /** Optional dashboard-wide stats shown in the top-right strip. */
    stockCount?: number;
    salesThisMonth?: number;
    revenueYtd?: string | null;
    /** ISO date used for the eyebrow ("Destaque · 21 Mai 2026"). Optional. */
    asOf?: Date;
  }

  let {
    vehicle,
    stockCount,
    salesThisMonth,
    revenueYtd,
    asOf = new Date(),
  }: Props = $props();

  const FUEL_LABELS: Record<string, string> = {
    GASOLINE: 'Gasolina',
    DIESEL: 'Gasóleo',
    HYBRID: 'Híbrido',
    PLUGIN_HYBRID: 'Híbrido Plug-in',
    ELECTRIC: 'Elétrico',
    LPG: 'GPL',
  };

  // Compact revenue formatter: "€2.4M", "€248k". The hero stats area in the
  // prototype uses a tight, italic numeric — we keep the same density.
  function compactEUR(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const n = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 1_000) return `€${Math.round(n / 1_000)}k`;
    return `€${Math.round(n)}`;
  }

  const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const eyebrow = $derived(
    `Destaque · ${asOf.getDate()} ${PT_MONTHS[asOf.getMonth()]} ${asOf.getFullYear()}`,
  );
</script>

<section class="hero-block relative overflow-hidden border border-[var(--color-border)] grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]" style="background: linear-gradient(135deg, #131316 0%, #0F0F11 100%);">
  <!-- LEFT: brand-DNA spec list + CTAs -->
  <div class="p-5 md:p-8 lg:p-9 flex flex-col">
    <div class="flex items-center gap-3 mb-3.5 font-mono uppercase tracking-[0.25em] text-[10.5px] text-[var(--color-red)]">
      <span class="inline-block w-5 h-px bg-[var(--color-red)]"></span>
      {eyebrow}
    </div>

    {#if vehicle}
      <h2
        class="font-display font-black italic uppercase leading-[0.92] tracking-[-0.025em] text-[30px] md:text-[44px] lg:text-[52px] mb-2"
      >
        {vehicle.brand}<br />
        <span class="text-[var(--color-red)]">{vehicle.model}</span>
      </h2>
      <p
        class="text-[var(--color-text-muted)] text-[14.5px] leading-[1.5] max-w-[360px] mb-7"
      >
        {vehicle.description ?? 'Viatura em destaque no painel do stand.'}
      </p>

      <!-- Spec list — red icon │ red divider │ value/sublabel -->
      <div class="grid gap-3.5 mb-auto">
        <div
          class="grid items-center gap-4"
          style="grid-template-columns: 26px 1px 1fr;"
        >
          <span class="inline-flex items-center justify-center text-[var(--color-red)]">
            <BrandCal class="h-[22px] w-[22px]" />
          </span>
          <span class="block h-[26px] w-[1.5px] bg-[var(--color-red)] justify-self-center"></span>
          <div class="font-display font-semibold text-[17px] tracking-[0.005em] text-[var(--color-text)]">
            {vehicle.year}
            <small class="block text-[13px] font-sans font-normal text-[var(--color-text-muted)] tracking-normal mt-0.5">
              Adquirida em {formatDate(asOf)}
            </small>
          </div>
        </div>

        <div
          class="grid items-center gap-4"
          style="grid-template-columns: 26px 1px 1fr;"
        >
          <span class="inline-flex items-center justify-center text-[var(--color-red)]">
            <BrandGauge class="h-[22px] w-[22px]" />
          </span>
          <span class="block h-[26px] w-[1.5px] bg-[var(--color-red)] justify-self-center"></span>
          <div class="font-display font-semibold text-[17px] tracking-[0.005em] text-[var(--color-text)]">
            {formatInt(vehicle.mileage)} km
            <small class="block text-[13px] font-sans font-normal text-[var(--color-text-muted)] tracking-normal mt-0.5">
              Histórico registado
            </small>
          </div>
        </div>

        <div
          class="grid items-center gap-4"
          style="grid-template-columns: 26px 1px 1fr;"
        >
          <span class="inline-flex items-center justify-center text-[var(--color-red)]">
            <BrandTag class="h-[22px] w-[22px]" />
          </span>
          <span class="block h-[26px] w-[1.5px] bg-[var(--color-red)] justify-self-center"></span>
          <div class="font-display font-semibold text-[17px] tracking-[0.005em] text-[var(--color-text)]">
            {vehicle.salePrice ? formatEUR(vehicle.salePrice) : '— Por definir —'}
            <small class="block text-[13px] font-sans font-normal text-[var(--color-text-muted)] tracking-normal mt-0.5">
              {vehicle.salePrice ? 'PVP indicativo · negociável' : 'Definir PVP em Editar'}
            </small>
          </div>
        </div>

        <div
          class="grid items-center gap-4"
          style="grid-template-columns: 26px 1px 1fr;"
        >
          <span class="inline-flex items-center justify-center text-[var(--color-red)]">
            <Cpu class="h-[22px] w-[22px]" />
          </span>
          <span class="block h-[26px] w-[1.5px] bg-[var(--color-red)] justify-self-center"></span>
          <div class="font-display font-semibold text-[17px] tracking-[0.005em] text-[var(--color-text)]">
            {FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel}
            <small class="block text-[13px] font-sans font-normal text-[var(--color-text-muted)] tracking-normal mt-0.5">
              {#if vehicle.licensePlate}
                Matrícula {vehicle.licensePlate} <span class="text-[var(--color-text-faint)]">· VIN {vehicle.vin}</span>
              {:else}
                VIN {vehicle.vin}
              {/if}
            </small>
          </div>
        </div>
      </div>

      <div class="flex gap-2.5 mt-7">
        <a
          href={`/viaturas/${vehicle.id}`}
          class="inline-flex items-center gap-2 px-[18px] py-[11px] bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white font-display font-bold italic uppercase text-[12px] tracking-[0.1em] transition-colors cursor-pointer"
          style="border-radius: var(--radius-btn);"
        >
          Ver ficha completa
          <BrandRight class="h-3 w-3" />
        </a>
        <a
          href={`/viaturas/${vehicle.id}/editar`}
          class="inline-flex items-center px-[18px] py-[11px] bg-transparent border border-[var(--color-border-strong)] hover:border-[var(--color-red)] text-[var(--color-text)] font-display font-semibold italic uppercase text-[12px] tracking-[0.1em] transition-colors cursor-pointer"
          style="border-radius: var(--radius-btn);"
        >
          Editar
        </a>
      </div>
    {:else}
      <!-- Empty state: no featured vehicle pinned -->
      <h2
        class="font-display font-black italic uppercase leading-[0.92] tracking-[-0.025em] text-[30px] md:text-[44px] lg:text-[52px] mb-2"
      >
        Sem<br />
        <span class="text-[var(--color-red)]">destaque.</span>
      </h2>
      <p
        class="text-[var(--color-text-muted)] text-[14.5px] leading-[1.5] max-w-[360px] mb-7"
      >
        Selecione uma viatura para a destacar aqui no painel. Acesse a ficha de
        uma viatura e use o botão <strong class="text-[var(--color-text)]">Marcar como destaque</strong>.
      </p>
      <div class="mb-auto"></div>
      <div class="flex gap-2.5 mt-7">
        <a
          href="/viaturas"
          class="inline-flex items-center gap-2 px-[18px] py-[11px] bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white font-display font-bold italic uppercase text-[12px] tracking-[0.1em] transition-colors cursor-pointer"
          style="border-radius: var(--radius-btn);"
        >
          Escolher viatura
          <BrandRight class="h-3 w-3" />
        </a>
      </div>
    {/if}
  </div>

  <!-- RIGHT: vehicle photo (or hand-drawn fallback) on a dark gradient panel
       with the prototype's red diagonal wedge + radial glow overlay. Mobile
       gets a shorter min-height so the hero doesn't dominate the fold. -->
  <div
    class="hero-right relative overflow-hidden min-h-[260px] md:min-h-[420px] lg:min-h-[460px]"
    style="background: linear-gradient(135deg, #1A1A1D 0%, #0A0A0B 100%);"
  >
    <!-- Red diagonal wedge (matches index.html .hero-right::before) -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-deep) 100%); clip-path: polygon(35% 0%, 100% 0%, 100% 100%, 5% 100%); opacity: 0.92;"
    ></div>
    <!-- Radial glow + faint vertical scanlines (matches .hero-right::after) -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(600px 380px at 30% 70%, rgba(227,6,19,.18), transparent 60%), repeating-linear-gradient(90deg, transparent 0 60px, rgba(255,255,255,.015) 60px 61px);"
    ></div>

    <!-- Top-left tag -->
    <div
      class="absolute top-6 left-6 z-10 flex items-center gap-2 font-mono uppercase tracking-[0.25em] text-[10px] text-white/45"
    >
      <span class="inline-block w-1.5 h-1.5 bg-white rounded-full"></span>
      {#if vehicle}
        Stand · {String(Math.min(vehicle.photoCount, 99)).padStart(2, '0')}/{String(vehicle.photoCount).padStart(2, '0')} Fotos
      {:else}
        Em destaque · Em breve
      {/if}
    </div>

    <!-- Top-right stats strip. Hidden on mobile — the 4 KPI cards under the
         hero already carry Vendas/Faturação/Lucro/Margem, and three cells
         inline don't fit a 360px viewport. -->
    {#if stockCount !== undefined || salesThisMonth !== undefined || revenueYtd}
      <div class="absolute top-6 right-6 z-10 hidden md:flex">
        {#if stockCount !== undefined}
          <div class="text-right px-[18px] border-r border-white/15">
            <div
              class="num-value text-[22px] leading-none text-white"
            >
              {formatInt(stockCount)}
            </div>
            <div
              class="font-mono uppercase tracking-[0.2em] text-[9px] text-white/55 mt-1"
            >
              Em Stock
            </div>
          </div>
        {/if}
        {#if salesThisMonth !== undefined}
          <div class="text-right px-[18px] border-r border-white/15 last:border-r-0 last:pr-0">
            <div
              class="num-value text-[22px] leading-none text-white"
            >
              {formatInt(salesThisMonth)}
            </div>
            <div
              class="font-mono uppercase tracking-[0.2em] text-[9px] text-white/55 mt-1"
            >
              Vendas · Mês
            </div>
          </div>
        {/if}
        {#if revenueYtd}
          <div class="text-right px-[18px]">
            <div
              class="num-value text-[22px] leading-none text-white"
            >
              {compactEUR(revenueYtd)}
            </div>
            <div
              class="font-mono uppercase tracking-[0.2em] text-[9px] text-white/55 mt-1"
            >
              Faturação YTD
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Vehicle photo (preferred) or hand-drawn silhouette (fallback) -->
    <div class="absolute z-[1] left-[4%] right-[8%] bottom-[8%]">
      {#if vehicle?.photoUrl}
        <img
          src={vehicle.photoUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          class="w-full h-auto max-h-[340px] object-contain"
          style="filter: drop-shadow(0 30px 40px rgba(0,0,0,.65));"
          loading="lazy"
        />
      {:else}
        <CarSilhouette />
      {/if}
    </div>

    <!-- Bottom-left plate badge (style mirrors index.html .hero-plate) -->
    {#if vehicle}
      <div
        class="absolute bottom-6 left-6 z-10 inline-flex items-center bg-black/50 border border-white/15 font-mono text-[12px] tracking-[0.15em] text-white"
      >
        <span
          class="bg-[var(--color-info)] text-white font-bold text-[9px] tracking-[0.1em] px-1.5 py-1 mr-2"
        >PT</span>
        <span class="pr-2.5 py-1 inline-flex items-center gap-1.5">
          <Star class="h-3 w-3 text-[#e6b800] fill-[#e6b800]" />
          <!-- Show the real matrícula when present; fall back to year · brand
               so the plate chip still reads as a tag for unregistered cars. -->
          {#if vehicle.licensePlate}
            {vehicle.licensePlate}
          {:else}
            {vehicle.year} · {vehicle.brand.toUpperCase()}
          {/if}
        </span>
      </div>
    {/if}
  </div>
</section>

<style>
  /* Match the prototype's card radius for the whole block. */
  .hero-block {
    border-radius: var(--radius-card);
  }
</style>
