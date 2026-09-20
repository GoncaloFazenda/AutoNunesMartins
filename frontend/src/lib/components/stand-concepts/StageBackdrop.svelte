<script lang="ts">
  import { onMount } from 'svelte';

  let reveal = $state(0);
  let backdrop = $state<HTMLDivElement>();
  onMount(() => {
    let frame = 0;
    const stage = backdrop?.closest<HTMLElement>('.orbit-stage');
    const path = backdrop?.querySelector<SVGPathElement>('.direction-accent');
    const title = stage?.querySelector<HTMLElement>('.orbit-title');
    const description = stage?.querySelector<HTMLElement>('.orbit-title-note');
    const photo = stage?.querySelector<HTMLElement>('.orbit-main-photo');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const unit = (value: number) => Math.min(1, Math.max(0, value));
    const update = () => {
      frame = 0;
      // Start behind the photo at the top of the page, independently of viewport height.
      // Keep travelling after the first reveal; fade only once the segment leaves the scene.
      const next = reduced.matches
        ? 0
        : Math.max(0, window.scrollY / Math.min(360, window.innerHeight * 0.35));
      if (reveal >= 3 && next >= 3) return;
      reveal = next;
      const mobile = window.innerWidth <= 700;
      const middle = mobile ? 0.755 + reveal * 0.12 : 0.445 - reveal * 0.135;
      const matrix = path?.getScreenCTM();
      if (!path || !matrix) return;
      const point = path
        .getPointAtLength(path.getTotalLength() * unit(middle))
        .matrixTransform(matrix);
      const fading = unit((2.7 - reveal) / 1.3);
      // Each text box gets its own light coordinates: colour reaches nearby glyphs first.
      const targets = [title, description, photo].map((node) => ({
        node,
        bounds: node?.getBoundingClientRect(),
      }));
      for (const { node, bounds } of targets) {
        if (!node || !bounds) continue;
        const dx = Math.max(bounds.left - point.x, 0, point.x - bounds.right);
        const dy = Math.max(bounds.top - point.y, 0, point.y - bounds.bottom);
        const radius = node === photo ? (mobile ? 100 : 180) : mobile ? 320 : 480;
        const proximity = unit(1 - Math.hypot(dx, dy) / radius);
        node.style.setProperty('--nearby-light', String(reduced.matches ? 0 : proximity * fading));
        node.style.setProperty('--light-x', `${point.x - bounds.left}px`);
        node.style.setProperty('--light-y', `${point.y - bounds.top}px`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      for (const node of [title, description, photo]) {
        for (const property of ['--nearby-light', '--light-x', '--light-y'])
          node?.style.removeProperty(property);
      }
    };
  });
</script>

<div class="stage-backdrop" bind:this={backdrop} aria-hidden="true" style:--accent-reveal={reveal}>
  <div class="stage-atmosphere">
    <div class="studio-light"></div>
    <div class="light-plane"></div>
    <div class="photo-ground"></div>
  </div>
  <svg viewBox="0 0 1440 720" preserveAspectRatio="none" focusable="false">
    <path class="direction-accent" pathLength="1" d="M-160 700 1510 218" />
  </svg>
</div>

<style>
  .stage-backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    isolation: isolate;
    z-index: 0;
  }
  .stage-atmosphere {
    position: absolute;
    inset: 0;
    /* Fade the atmosphere without suppressing the line's local red aura. */
    mask-image:
      linear-gradient(
        to bottom,
        transparent,
        #000 12%,
        #000 48%,
        #000d 62%,
        #0006 77%,
        #0001 91%,
        transparent 100%
      ),
      linear-gradient(to right, transparent, #000 10%, #000 88%, transparent);
    mask-composite: intersect;
  }
  .studio-light {
    position: absolute;
    inset: -15%;
    background: radial-gradient(
      ellipse at 71% 48%,
      color-mix(in srgb, var(--text) 8%, transparent),
      transparent 43%
    );
  }
  .light-plane {
    position: absolute;
    top: -24%;
    bottom: -30%;
    left: 29%;
    width: 32%;
    transform: skewX(-22deg);
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--text) 2.6%, transparent) 65%,
      transparent
    );
    filter: blur(28px);
    mask-image: linear-gradient(transparent, #000 24%, #000 76%, transparent);
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: none;
    mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
  }
  path {
    /* Keep normalized dash geometry in SVG space at every aspect ratio. */
    stroke-width: 1;
  }
  .direction-accent {
    stroke: var(--red);
    stroke-width: 2.5;
    stroke-linecap: round;
    opacity: 0.9;
    filter: drop-shadow(0 0 3px #ff334ccc) drop-shadow(0 0 12px #e3061399)
      drop-shadow(0 0 26px #e3061359);
    stroke-dasharray: 0.16 1;
    stroke-dashoffset: -0.365;
  }
  .photo-ground {
    position: absolute;
    width: 59%;
    height: 10%;
    left: 37%;
    bottom: 10%;
    background: radial-gradient(
      ellipse,
      color-mix(in srgb, var(--text) 5%, transparent),
      transparent 70%
    );
    transform: rotate(-4deg);
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .studio-light {
      transform: translate(calc(var(--mx, 0) * 18px), calc(var(--my, 0) * 14px));
    }
    :global(.motion-on) .light-plane {
      transform: translateX(calc(var(--p, 0) * -22px + var(--mx, 0) * 12px)) skewX(-22deg);
    }
    :global(.motion-on) svg {
      transform: translateY(calc(var(--p, 0) * -12px));
    }
    :global(.motion-on) .direction-accent {
      /* The photo occludes the right end; scrolling draws the whole segment out to the left. */
      stroke-dashoffset: calc(-0.365px + var(--accent-reveal) * 0.135px);
      opacity: clamp(0, calc((2.7 - var(--accent-reveal)) * 0.6923077), 0.9);
    }
    :global(.motion-on) .photo-ground {
      transform: translateX(calc(var(--p, 0) * -16px)) rotate(-4deg)
        scaleX(calc(1 + var(--p, 0) * 0.06));
    }
  }
  @media (max-width: 700px) {
    .direction-accent {
      stroke-dasharray: 0.13 1;
      stroke-dashoffset: -0.69;
      stroke-width: 4;
    }
    .studio-light {
      background: radial-gradient(
        ellipse at 58% 65%,
        color-mix(in srgb, var(--text) 7%, transparent),
        transparent 57%
      );
    }
    .light-plane {
      left: 16%;
      width: 55%;
      opacity: 0.6;
    }
    .photo-ground {
      width: 90%;
      left: 5%;
      bottom: 15%;
    }
  }
  @media (max-width: 700px) and (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .direction-accent {
      stroke-dashoffset: calc(-0.69px - var(--accent-reveal) * 0.12px);
    }
  }
</style>
