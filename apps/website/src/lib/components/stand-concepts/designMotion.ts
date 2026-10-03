import { sceneProgress, chapterProgress, approachProgress, heroScrollProgress, heroAccentFrame } from './scrollTiming';

/** Scroll choreography that observes native browser scrolling without intercepting input. */
export function designMotion(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let lastTime = 0;
  const progress = new Map<HTMLElement, number>();
  const approach = new Map<HTMLElement, number>();
  let targetX = 0,
    targetY = 0,
    x = 0,
    y = 0;
  let sections = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const draw = (time: number) => {
    frame = 0;
    if (reduced.matches || document.hidden) return;
    const elapsed = lastTime ? Math.min(50, time - lastTime) : 16;
    lastTime = time;
    const damping = 1 - Math.exp(-elapsed / 105);
    let settling = false;
    const height = window.innerHeight;
    const rows = sections
      .map((node) => ({ node, bounds: node.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.bottom >= -50 && bounds.top <= height + 50)
      .map(({ node, bounds }) => {
        const pin = node.querySelector<HTMLElement>(':scope > [data-pin]');
        const sticky = pin && getComputedStyle(pin).position === 'sticky';
        const heroStage = node.hasAttribute('data-scroll-hero')
          ? node.querySelector<HTMLElement>(':scope > [data-hero-stage]')
          : null;
        return {
          node,
          bounds,
          approachBounds: node
            .querySelector<HTMLElement>('[data-approach-target]')
            ?.getBoundingClientRect(),
          pinHeight: sticky && pin ? pin.offsetHeight : null,
          pinTop: sticky && pin ? Number.parseFloat(getComputedStyle(pin).top) || 0 : 0,
          heroBounds: heroStage?.getBoundingClientRect() ?? null,
        };
      });
    for (const { node, bounds, approachBounds, pinHeight, pinTop, heroBounds } of rows) {
      if (bounds.bottom < -50 || bounds.top > height + 50) continue;
      const {
        through,
        enter,
        pinned: pinnedProgress,
      } = sceneProgress(bounds.top, bounds.height, height, pinHeight, pinTop);
      const targetProgress = heroBounds === null
        ? pinnedProgress
        : heroScrollProgress(bounds.top, bounds.top + window.scrollY, heroBounds.height, height);
      if (heroBounds) {
        // Only the wide hero uses the stable track; keep tablet/mobile choreography intact.
        const stableAccent = window.innerWidth > 1050;
        const accent = heroAccentFrame(bounds.top, bounds.height, heroBounds.top, heroBounds.height, height, stableAccent ? window.scrollY : 0);
        const prior = Number.parseFloat(node.style.getPropertyValue('--accent-progress'));
        const delta = accent.progress - prior;
        const value = stableAccent || !Number.isFinite(prior) || Math.abs(delta) > 0.65 || Math.abs(delta) < 0.0005
          ? accent.progress : prior + delta * damping;
        node.style.setProperty('--accent-stage-shift', `${accent.shift}px`);
        node.style.setProperty('--accent-progress', String(value));
        if (Math.abs(accent.progress - value) > 0.0005) settling = true;
      }
      const previous = progress.get(node) ?? targetProgress;
      // Restore/jump navigation lands immediately; normal scrolling gets a short scrub.
      const difference = targetProgress - previous;
      const pinned =
        Math.abs(difference) > 0.65 || Math.abs(difference) < 0.0005
          ? targetProgress
          : previous + difference * damping;
      progress.set(node, pinned);
      if (Math.abs(targetProgress - pinned) > 0.0005) settling = true;
      node.style.setProperty('--through', String(through));
      node.style.setProperty('--p', String(pinned));
      node.style.setProperty('--stage-a', String(chapterProgress(pinned, 0, 0.88)));
      node.style.setProperty('--stage-b', String(chapterProgress(pinned, 0.1, 1)));
      node.style.setProperty('--enter', String(enter));
      if (node.hasAttribute('data-approach')) {
        const targetBounds = approachBounds ?? bounds;
        const target = approachProgress(targetBounds.top, targetBounds.height, height);
        const prior = approach.get(node) ?? target;
        const delta = target - prior;
        const value =
          Math.abs(delta) > 0.8 || Math.abs(delta) < 0.0005 ? target : prior + delta * damping;
        approach.set(node, value);
        if (Math.abs(target - value) > 0.0005) settling = true;
        node.style.setProperty('--approach', String(value));
        if (node.hasAttribute('data-scan-delay')) {
          // Shift only the scan by a small viewport offset; keep its scroll slope unchanged.
          const delay = Number(node.dataset.scanDelay) || 0;
          const scanTarget = approachProgress(
            targetBounds.top + height * delay,
            targetBounds.height,
            height,
          );
          const scanPrior = Number.parseFloat(node.style.getPropertyValue('--scan'));
          const scanDelta = scanTarget - scanPrior;
          const scan =
            !Number.isFinite(scanPrior) || Math.abs(scanDelta) > 0.8 || Math.abs(scanDelta) < 0.0005
              ? scanTarget
              : scanPrior + scanDelta * damping;
          node.style.setProperty('--scan', String(scan));
          if (Math.abs(scanTarget - scan) > 0.0005) settling = true;
        }
        node.style.setProperty('--reveal-a', String(chapterProgress(value, 0.06, 0.58)));
        node.style.setProperty('--reveal-b', String(chapterProgress(value, 0.28, 0.83)));
        node.style.setProperty('--reveal-c', String(chapterProgress(value, 0.5, 1)));
      }
    }
    x += (targetX - x) * 0.09;
    y += (targetY - y) * 0.09;
    root.style.setProperty('--mx', String(x));
    root.style.setProperty('--my', String(y));
    root.style.setProperty(
      '--reading',
      String(clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - height))),
    );
    if (settling || Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002) schedule();
  };
  const schedule = () => {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!document.hidden) schedule();
  };
  const move = (event: PointerEvent) => {
    if (!pointer.matches || reduced.matches || event.clientY > window.innerHeight) return;
    targetX = event.clientX / window.innerWidth - 0.5;
    targetY = event.clientY / window.innerHeight - 0.5;
    schedule();
  };
  const leave = () => {
    targetX = 0;
    targetY = 0;
    schedule();
  };
  const configure = () => {
    progress.clear();
    approach.clear();
    lastTime = 0;
    root.classList.toggle('motion-on', !reduced.matches);
    // Apply the initial scroll pose in the same task as enabling motion, not a frame later.
    cancelAnimationFrame(frame);
    frame = 0;
    draw(performance.now());
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  const mutation = new MutationObserver(() => {
    sections = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
    for (const node of progress.keys()) if (!root.contains(node)) progress.delete(node);
    for (const node of approach.keys()) if (!root.contains(node)) approach.delete(node);
    schedule();
  });
  mutation.observe(root, { childList: true, subtree: true });
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', schedule);
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', leave);
  reduced.addEventListener('change', configure);
  root.classList.toggle('motion-on', !reduced.matches);
  let destroyed = false;
  // Let hydration finish replacing styles before forcing geometry/font measurements.
  // The parser bootstrap already supplies the initial pose; reconcile before paint.
  const initialFrame = requestAnimationFrame(() => {
    if (destroyed) return;
    configure();
    const initialY = document.documentElement.getAttribute('data-orbit-restore-y');
    const initialX = document.documentElement.getAttribute('data-orbit-restore-x');
    if (initialY !== null && Number.isFinite(Number(initialY))) {
      window.scrollTo({ top: Number(initialY), left: Number(initialX) || 0, behavior: 'instant' });
      draw(performance.now());
    }
    document.documentElement.removeAttribute('data-orbit-restore-y');
    document.documentElement.removeAttribute('data-orbit-restore-x');
  });
  // SvelteKit restores before hydration; wait through its final scroll/focus task.
  let restorationFrame = requestAnimationFrame(() => {
    restorationFrame = requestAnimationFrame(() => {
      document.documentElement.removeAttribute('data-orbit-restoring');
      document.documentElement.style.removeProperty('--orbit-restore-height');
    });
  });
  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(restorationFrame);
      document.documentElement.removeAttribute('data-orbit-restoring');
      progress.clear();
      approach.clear();
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', schedule);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      reduced.removeEventListener('change', configure);
    },
  };
}

/** Cancels any pending reveal when a reused page switches to a static context. */
export function conditionalEntrance(node: HTMLElement, delay: number | false) {
  let active = delay === false ? undefined : entrance(node, delay);
  return {
    update(nextDelay: number | false) {
      active?.destroy();
      active = nextDelay === false ? undefined : entrance(node, nextDelay);
    },
    destroy() {
      active?.destroy();
    },
  };
}

export function entrance(node: HTMLElement, delay = 0) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Never hide content already visible on load, restoration or a filter change.
  if (reduced.matches || node.getBoundingClientRect().top < window.innerHeight - 48) return;
  let animation: Animation | undefined;
  animation = node.animate(
    [
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration: 780,
      delay: Math.min(delay, 80),
      easing: 'cubic-bezier(.22,.61,.36,1)',
      fill: 'both',
    },
  );
  animation.pause();
  animation.onfinish = () => animation?.cancel();
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (reduced.matches) {
        animation?.cancel();
        return;
      }
      animation?.play();
    },
    { threshold: 0, rootMargin: '0px 0px -48px 0px' },
  );
  const cancel = () => {
    if (reduced.matches) animation?.cancel();
  };
  const focus = () => {
    observer.disconnect();
    animation?.cancel();
  };
  node.addEventListener('focusin', focus);
  reduced.addEventListener('change', cancel);
  observer.observe(node);
  return {
    destroy() {
      observer.disconnect();
      node.removeEventListener('focusin', focus);
      animation?.cancel();
      reduced.removeEventListener('change', cancel);
    },
  };
}
