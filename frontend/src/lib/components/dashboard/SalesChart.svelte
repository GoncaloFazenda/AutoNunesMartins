<script lang="ts">
  import { BarChart3 } from 'lucide-svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import { formatEUR, formatInt } from '$lib/utils/format';
  import type { SalesChartData } from '$lib/server/dashboard';

  interface Props {
    data: SalesChartData;
  }

  let { data }: Props = $props();

  // Chart geometry. Wide viewBox so labels stay small on wide monitors,
  // shorter height than before (300 → 220) so the panel no longer
  // overshadows neighbouring cards on the dashboard. PAD_T still reserves
  // room for the current-month callout badge above the data line.
  const W = 900;
  const H = 220;
  const PAD_L = 50;
  const PAD_R = 44;
  const PAD_T = 38;
  const PAD_B = 30;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const path = $derived.by(() => {
    const sold = data.sold;
    const n = sold.length;
    if (n === 0) return { line: '', area: '', points: [] as { x: number; y: number }[] };

    const max = Math.max(1, ...sold);
    const stepX = innerW / Math.max(n - 1, 1);

    const points = sold.map((v, i) => ({
      x: PAD_L + i * stepX,
      y: PAD_T + innerH - (v / max) * innerH,
    }));

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');
    const area = `${line} L${points[points.length - 1]?.x.toFixed(2)},${(PAD_T + innerH).toFixed(2)} L${PAD_L.toFixed(2)},${(PAD_T + innerH).toFixed(2)} Z`;

    return { line, area, points };
  });

  const yMax = $derived(Math.max(1, ...data.sold));

  const yTicks = $derived.by(() => {
    const max = yMax;
    const step = Math.ceil(max / 4) || 1;
    return [step * 4, step * 3, step * 2, step, 0];
  });

  // current month index = last in the series
  const currentIdx = $derived(data.sold.length - 1);
  const currentPoint = $derived(path.points[currentIdx]);
  const currentSold = $derived(data.sold[currentIdx] ?? 0);
</script>

<Panel>
  <PanelHeader icon={BarChart3} title="Vendas Mensais" meta="ÚLTIMOS 12 MESES" />

  <!--
    `.chart-totals` from the prototype: a flex row with 28px gap, NUMBER
    ABOVE LABEL (not below). Mono uppercase faint label under each value.
    Reduced top/bottom padding to keep the panel compact.
  -->
  <div class="px-5 pt-4 pb-1 flex flex-wrap items-start" style="gap: 28px;">
    <div>
      <div class="num-value text-[22px] leading-none">{formatInt(data.ytdSold)}</div>
      <div
        class="mt-1.5 font-mono font-normal text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]"
      >
        Vendidos YTD
      </div>
    </div>
    <div>
      <div class="num-value text-[22px] leading-none">{formatEUR(data.ytdRevenue)}</div>
      <div
        class="mt-1.5 font-mono font-normal text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]"
      >
        Faturação YTD
      </div>
    </div>
    <div>
      <div class="num-value text-[22px] leading-none">
        {data.ytdAvgMarginPct !== null ? `${data.ytdAvgMarginPct.toFixed(1)}%` : '—'}
      </div>
      <div
        class="mt-1.5 font-mono font-normal text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)]"
      >
        Margem Média
      </div>
    </div>
  </div>

  <!-- Tighter padding than the default panel so the chart panel doesn't
       overshadow neighbouring cards. -->
  <div class="px-5 pt-2 pb-4">
    <svg
      viewBox="0 0 {W} {H}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Vendas mensais"
    >
      <!-- Gradient fill -->
      <defs>
        <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-red)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="var(--color-red)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Y grid lines + labels -->
      {#each yTicks as v, i (i)}
        {@const y = PAD_T + (innerH * i) / 4}
        <line
          x1={PAD_L}
          y1={y}
          x2={W - PAD_R}
          y2={y}
          stroke="var(--color-border)"
          stroke-width="1"
          stroke-dasharray={i === 4 ? '0' : '2,3'}
        />
        <text
          x={PAD_L - 8}
          y={y + 4}
          text-anchor="end"
          font-family="JetBrains Mono, monospace"
          font-size="10"
          fill="var(--color-text-faint)"
          class="tabular-nums"
        >
          {v}
        </text>
      {/each}

      <!-- Area under curve -->
      {#if path.area}
        <path d={path.area} fill="url(#sales-fill)" />
      {/if}

      <!-- Line -->
      {#if path.line}
        <path
          d={path.line}
          fill="none"
          stroke="var(--color-red)"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}

      <!-- Month labels (X axis) -->
      {#each data.months as month, i (i)}
        {@const x = PAD_L + (innerW / Math.max(data.sold.length - 1, 1)) * i}
        <text
          x={x}
          y={H - 12}
          text-anchor="middle"
          font-family="JetBrains Mono, monospace"
          font-size="10"
          fill="var(--color-text-faint)"
          style="letter-spacing: 0.12em; text-transform: uppercase;"
        >
          {month}
        </text>
      {/each}

      <!-- Current month dot + callout -->
      {#if currentPoint}
        <rect
          x={currentPoint.x - 5}
          y={currentPoint.y - 5}
          width="10"
          height="10"
          fill="var(--color-red)"
          stroke="white"
          stroke-width="2"
        />
        {#if currentSold > 0}
          {@const calloutW = 92}
          {@const calloutH = 24}
          {@const calloutGap = 14}
          {@const wantedY = currentPoint.y - calloutH - calloutGap}
          {@const calloutY = wantedY >= 4 ? wantedY : currentPoint.y + calloutGap}
          {@const calloutX = Math.max(
            PAD_L,
            Math.min(W - PAD_R - calloutW, currentPoint.x - calloutW / 2),
          )}
          <g>
            <rect
              x={calloutX}
              y={calloutY}
              width={calloutW}
              height={calloutH}
              fill="var(--color-red)"
              rx="3"
            />
            <text
              x={calloutX + calloutW / 2}
              y={calloutY + 16}
              text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="11"
              fill="white"
              class="tabular-nums"
              style="letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;"
            >
              {currentSold} {currentSold === 1 ? 'carro' : 'carros'}
            </text>
          </g>
        {/if}
      {/if}
    </svg>
  </div>
</Panel>
