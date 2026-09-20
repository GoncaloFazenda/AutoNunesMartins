<script lang="ts">
  import { onMount } from 'svelte';
  import { standTrust } from './standTrust';
  import { counterValue, COUNTER_DURATION } from './counterTiming';
  let statsElement: HTMLElement;
  let progress = $state(1);
  let entered = $state(false);
  const format = new Intl.NumberFormat('pt-PT', { useGrouping: false });
  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const finish = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      progress = 1;
      entered = true;
    };
    if (!reduced.matches) {
      progress = 0;
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          entered = true;
          const start = performance.now();
          const tick = (now: number) => {
            progress = Math.min(1, (now - start) / COUNTER_DURATION);
            if (progress < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        },
        { threshold: 0.5 },
      );
      observer.observe(statsElement);
    } else finish();
    const change = () => {
      if (reduced.matches) finish();
    };
    reduced.addEventListener('change', change);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      reduced.removeEventListener('change', change);
    };
  });
</script>

<section
  class="orbit-stats"
  class:entered
  aria-label="Auto Nunes Martins em números"
  bind:this={statsElement}
>
  <div class="stats-grid">
    {#each standTrust.metrics as metric, index}
      <div class="stat" style:--delay={index * 80 + 'ms'}>
        <div class="stat-value" aria-hidden="true">
          {format.format(counterValue(metric.value, progress))}<span>{metric.suffix}</span>
        </div>
        <p aria-hidden="true">{metric.label}</p>
        <span class="sr-only">{metric.value}{metric.suffix} {metric.label}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .orbit-stats {
    width: 100%;
    border-block: 1px solid var(--line);
    background: radial-gradient(
      ellipse at 50% 0,
      color-mix(in srgb, var(--red) 4%, transparent),
      transparent 70%
    );
  }
  .stats-grid {
    width: min(var(--orbit-frame, 90%), 1120px);
    max-width: calc(100% - 48px);
    margin: auto;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-block: 38px;
  }
  .stat {
    min-width: 0;
    text-align: center;
    padding-inline: 12px;
  }
  .stat + .stat {
    border-left: 1px solid var(--line);
  }
  .stat-value {
    font-size: clamp(32px, 3.2vw, 46px);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.065em;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .stat-value > span {
    font-size: 0.74em;
    font-weight: 500;
    margin-left: 0.055em;
  }
  p {
    margin: 12px 0 0;
    font-size: 10px;
    line-height: 1.6;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: no-preference) {
    .entered .stat {
      animation: settle-in 600ms cubic-bezier(0.2, 0.65, 0.3, 1) var(--delay) both;
    }
    @keyframes settle-in {
      from {
        opacity: 0.35;
        translate: 0 12px;
      }
      to {
        opacity: 1;
        translate: 0 0;
      }
    }
  }
  @media (max-width: 700px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding-block: 8px;
    }
    .stat {
      padding: 20px 8px;
    }
    .stat:nth-child(3) {
      border-left: 0;
    }
    .stat:nth-child(n + 3) {
      border-top: 1px solid var(--line);
    }
    .stat-value {
      font-size: clamp(28px, 7.2vw, 40px);
    }
    p {
      font-size: 9px;
      letter-spacing: 0.06em;
      margin-top: 12px;
    }
  }
</style>
