<script lang="ts">
  import { onMount } from 'svelte';
  let section: HTMLElement;
  onMount(() => {
    const heading = section.querySelector('h2')!;
    const underline = section.querySelector('em')!;
    const lineWindow = section.querySelector<HTMLElement>('.line-window')!;
    const fragments = [...section.querySelectorAll<HTMLElement>('.read-a, .read-b, em')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const smooth = (value: number) => {
      const p = Math.min(1, Math.max(0, value));
      return p * p * (3 - 2 * p);
    };
    const draw = () => {
      frame = 0;
      if (reduced.matches) return;
      const bounds = heading.getBoundingClientRect();
      const line = lineWindow.getBoundingClientRect();
      // Keep the line's original timing; only the text light trails by 25px of scroll.
      const journey = (innerHeight * 0.92 - bounds.top) / (innerHeight * 0.84);
      const progress = smooth(journey);
      const lightProgress = smooth(journey - 25 / (innerHeight * 0.84));
      const light = smooth(lightProgress / 0.3) * (1 - smooth((lightProgress - 0.72) / 0.28));
      const segmentStart = line.left + Math.max(0, lightProgress * 2 - 1) * line.width;
      const segmentEnd = line.left + Math.min(1, lightProgress * 2) * line.width;
      const accent = smooth((segmentEnd - segmentStart) / 20);
      const textLeft = underline.getBoundingClientRect().left;
      underline.style.setProperty('--segment-start', `${segmentStart - textLeft}px`);
      underline.style.setProperty('--segment-end', `${segmentEnd - textLeft}px`);
      underline.style.setProperty('--light-inset', `${Math.min(24, (segmentEnd - segmentStart) / 2)}px`);
      // The tip crosses the text at halfway, then keeps travelling beyond its
      // right edge. A fixed window clips the trailing segment; opacity stays 1.
      const x = line.left + line.width * lightProgress * 2;
      const y = line.bottom + line.height * 0.08;
      const rects = fragments.map((fragment) => fragment.getBoundingClientRect());
      section.style.setProperty('--line-progress', String(progress));
      section.style.setProperty('--line-light', String(light));
      section.style.setProperty('--accent-light', String(accent));
      fragments.forEach((fragment, index) => {
        const lightX = fragment === underline ? Math.min(x, line.right) : x;
        fragment.style.setProperty('--tip-x', `${lightX - rects[index]!.left}px`);
        fragment.style.setProperty('--tip-y', `${y - rects[index]!.top}px`);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(heading);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  });
</script>

<section
  bind:this={section}
  class="orbit-perspective"
  data-scene
  data-approach
  aria-labelledby="perspective-message"
>
  <div class="perspective-inner">
    <p class="eyebrow">DA ESCOLHA AO CAMINHO</p>
    <div data-approach-target>
      <h2 id="perspective-message">
        <span class="read-a">A escolha certa</span>
        <span class="read-b">começa por</span>
        <span class="read-c"
          ><em
            >fazer sentido.<span class="line-window" aria-hidden="true"
              ><span class="travelling-line"></span></span
            ></em
          ></span
        >
      </h2>
    </div>
  </div>
</section>

<style>
  .orbit-perspective {
    --line-progress: 0;
    --line-light: 0;
    --accent-light: 0;
    /* The moving light is an accent over a permanent, high-contrast text layer. */
    --perspective-base: color-mix(in srgb, var(--text) 92%, var(--bg));
    border-block: 1px solid var(--line);
    background: color-mix(in srgb, var(--text) 2%, transparent);
  }
  .perspective-inner {
    width: var(--orbit-frame, 90%);
    max-width: var(--orbit-frame-max, 1720px);
    margin: auto;
    padding-block: clamp(64px, 7vw, 108px);
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: var(--orbit-space-grid, 32px);
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.12em;
    line-height: 1.8;
    color: var(--muted);
    margin: 9px 0 0;
    max-width: 14ch;
  }
  h2 {
    color: var(--perspective-base);
    margin: 0;
    max-width: 35ch;
    font-size: clamp(32px, 3.2vw, 52px);
    font-weight: 500;
    line-height: 1.28;
    letter-spacing: -0.045em;
  }
  em {
    font-style: normal;
    position: relative;
    white-space: nowrap;
  }
  .line-window {
    position: absolute;
    height: 2px;
    bottom: -0.08em;
    left: 0;
    right: 0;
    overflow: hidden;
    pointer-events: none;
    /* Apply the hero's aura after clipping the travelling segment. */
    opacity: 0.95;
    filter: drop-shadow(0 0 2.5px rgb(255 51 76 / 90%)) drop-shadow(0 0 5px #e3061366)
      drop-shadow(0 0 12px #e3061399)
      drop-shadow(0 0 26px #e3061359);
  }
  .travelling-line {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--red);
    transform: translateX(-100%);
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .read-a,
    :global(.motion-on) .read-b,
    :global(.motion-on) em {
      color: transparent;
      background-image:
        radial-gradient(
          ellipse 310px 180px at var(--tip-x, 0px) var(--tip-y, 0px),
          color-mix(in srgb, var(--text) calc(var(--line-light) * 100%), transparent),
          transparent 100%
        ),
        linear-gradient(var(--perspective-base), var(--perspective-base));
      background-clip: text;
      -webkit-background-clip: text;
    }
    :global(.motion-on) em {
      background-image:
        linear-gradient(
          90deg,
          transparent calc(var(--segment-start, 0px) - 1.8em),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 12%), transparent) calc(var(--segment-start, 0px) - 1.2em),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 42%), transparent) calc(var(--segment-start, 0px) - 0.6em),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 70%), transparent) calc(var(--segment-start, 0px) + var(--light-inset, 0px)),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 70%), transparent) calc(var(--segment-end, 0px) - var(--light-inset, 0px) + 35px),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 42%), transparent) calc(var(--segment-end, 0px) - var(--light-inset, 0px) / 2 + 17.5px + 0.525em),
          color-mix(in srgb, var(--red) calc(var(--accent-light) * 12%), transparent) calc(var(--segment-end, 0px) - var(--light-inset, 0px) / 2 + 17.5px + 1.05em),
          transparent calc(var(--segment-end, 0px) - var(--light-inset, 0px) / 2 + 17.5px + 1.575em)
        ),
        linear-gradient(var(--perspective-base), var(--perspective-base));
    }
    :global(.motion-on) .travelling-line {
      transform: translateX(calc((var(--line-progress) * 2 - 1) * 100%));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .read-a,
    .read-b,
    em {
      color: inherit;
      background: none;
    }
    .travelling-line {
      transform: translateX(0);
    }
  }
  @media (max-width: 700px) {
    .perspective-inner {
      grid-template-columns: 1fr;
      padding-block: 52px;
      gap: 24px;
    }
    .eyebrow {
      max-width: none;
      margin: 0;
    }
    h2 {
      font-size: clamp(28px, 7.4vw, 38px);
    }
    :global(.motion-on) .read-a,
    :global(.motion-on) .read-b {
      background-image:
        radial-gradient(
          ellipse 230px 150px at var(--tip-x, 0px) var(--tip-y, 0px),
          color-mix(in srgb, var(--text) calc(var(--line-light) * 100%), transparent),
          transparent 100%
        ),
        linear-gradient(var(--perspective-base), var(--perspective-base));
    }
  }
</style>
