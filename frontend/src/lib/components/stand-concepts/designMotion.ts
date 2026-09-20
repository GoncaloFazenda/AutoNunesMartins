import { sceneProgress, chapterProgress, approachProgress } from './scrollTiming';

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
    if (reduced.matches) return;
    const elapsed = lastTime ? Math.min(50, time - lastTime) : 16;
    lastTime = time;
    const damping = 1 - Math.exp(-elapsed / 105);
    let settling = false;
    const height = window.innerHeight;
    const rows = sections.map((node) => {
      const pin = node.querySelector<HTMLElement>(':scope > [data-pin]');
      const sticky = pin && getComputedStyle(pin).position === 'sticky';
      return {
        node,
        bounds: node.getBoundingClientRect(),
        approachBounds: node
          .querySelector<HTMLElement>('[data-approach-target]')
          ?.getBoundingClientRect(),
        pinHeight: sticky && pin ? pin.offsetHeight : null,
        pinTop: sticky && pin ? Number.parseFloat(getComputedStyle(pin).top) || 0 : 0,
      };
    });
    for (const { node, bounds, approachBounds, pinHeight, pinTop } of rows) {
      if (bounds.bottom < -50 || bounds.top > height + 50) continue;
      const {
        through,
        enter,
        pinned: targetProgress,
      } = sceneProgress(bounds.top, bounds.height, height, pinHeight, pinTop);
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
    if (!frame) frame = requestAnimationFrame(draw);
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
    schedule();
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
  window.addEventListener('resize', schedule);
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', leave);
  reduced.addEventListener('change', configure);
  configure();
  return {
    destroy() {
      progress.clear();
      approach.clear();
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      reduced.removeEventListener('change', configure);
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
