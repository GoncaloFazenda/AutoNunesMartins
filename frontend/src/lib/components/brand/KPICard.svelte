<script lang="ts">
  import BrandUp from '$lib/components/brand/icons/BrandUp.svelte';
  import BrandDown from '$lib/components/brand/icons/BrandDown.svelte';
  import type { IconComponent } from '$lib/types/ui';
  import Sparkline from './Sparkline.svelte';

  interface Props {
    icon: IconComponent;
    label: string;
    value: string;
    /** Smaller dimmer suffix shown next to the value (e.g. "un", "k €", "%", "d") */
    suffix?: string;
    deltaPct?: number | null;
    deltaCaption?: string;
    sparkline?: number[];
  }

  let {
    icon: Icon,
    label,
    value,
    suffix,
    deltaPct = null,
    deltaCaption = 'vs. mês anterior',
    sparkline,
  }: Props = $props();

  const positive = $derived(deltaPct !== null && deltaPct >= 0);
  const deltaColor = $derived(positive ? 'text-[var(--color-success)]' : 'text-[var(--color-red)]');
</script>

<article
  class="kpi-surface group relative overflow-hidden border border-[var(--color-border)] py-[14px] px-[16px] transition-colors aspect-square md:aspect-auto flex flex-col"
  style="border-radius: var(--radius-card); box-shadow: inset 0 1px 0 rgba(255,255,255,.04);"
>
  <!-- red left rail on hover -->
  <div
    class="absolute left-0 top-0 h-full w-[2px] bg-[var(--color-red)] opacity-0 transition-opacity group-hover:opacity-100"
    aria-hidden="true"
  ></div>

  <div class="spec-row mb-3">
    <Icon class="spec-icon" />
    <div class="spec-sep"></div>
    <span class="spec-label">{label}</span>
  </div>

  <!-- Value with smaller dim suffix.
       num-value applies the canonical recipe (mono + non-italic + tnum + 600).
       On mobile the value scales 38→28 and the suffix 18→14 so a 2-col
       square tile (~156px) doesn't overflow horizontally. -->
  <div class="flex items-baseline gap-1.5 relative z-[1] my-3">
    <span
      class="num-value text-[28px] md:text-[38px] leading-[0.95] text-[var(--color-text)]"
    >
      {value}
    </span>
    {#if suffix}
      <span class="num-value text-[14px] md:text-[18px] text-[var(--color-text-muted)]">
        {suffix}
      </span>
    {/if}
  </div>

  <!-- Delta row -->
  {#if deltaPct !== null}
    <div class="mt-1.5 relative z-[1]">
      <div class="flex items-center gap-1 {deltaColor} text-[12px] font-medium">
        {#if positive}
          <BrandUp class="h-3 w-3" />
        {:else}
          <BrandDown class="h-3 w-3" />
        {/if}
        <span class="tabular-nums">{positive ? '+' : ''}{deltaPct.toFixed(1)}%</span>
        <!-- "vs. mês anterior" caption is desktop-only — at 2-col square
             tiles on mobile it would wrap onto a second line and break the
             tight delta-row rhythm. The arrow + percentage carries the
             signal alone. -->
        <span
          class="hidden md:inline font-mono text-[11px] font-normal text-[var(--color-text-faint)] ml-1.5"
        >
          {deltaCaption}
        </span>
      </div>
    </div>
  {/if}

  <!-- Absolute sparkline pinned to bottom-right per prototype line 705-710 -->
  {#if sparkline && sparkline.length > 1}
    <div class="kpi-spark pointer-events-none">
      <Sparkline values={sparkline} width={140} height={36} />
    </div>
  {/if}
</article>

<style>
  :global([data-theme='dark']) .kpi-surface,
  :global(html:not([data-theme='light'])) .kpi-surface {
    background: linear-gradient(180deg, #131316 0%, #101012 100%);
  }
  :global([data-theme='light']) .kpi-surface {
    background: var(--color-bg-1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85) !important;
  }
  .kpi-spark {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50%;
    height: 36px;
    opacity: 0.55;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    overflow: hidden;
  }
  .kpi-spark :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
