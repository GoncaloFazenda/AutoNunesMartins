/** Shared, interruptible 800 ms anchor movement; never changes global scroll behavior. */
export function createAnchorScroller() {
  let frame = 0;
  let removeFocusTarget: (() => void) | undefined;
  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'popstate'] as const;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    events.forEach(event => window.removeEventListener(event, stop));
  };
  const scroll = (target: HTMLElement) => {
    stop();
    removeFocusTarget?.();
    const start = window.scrollY;
    const destination = () => {
      const header = document.querySelector<HTMLElement>('.design header');
      const rect = header?.getBoundingClientRect();
      const visibleHeader = rect && rect.top <= 1 && rect.bottom > 0 ? rect.bottom + 20 : 0;
      const margin = Math.max(parseFloat(getComputedStyle(target).scrollMarginTop) || 0, visibleHeader);
      return Math.max(0, Math.min(window.scrollY + target.getBoundingClientRect().top - margin,
        document.documentElement.scrollHeight - window.innerHeight));
    };
    const finish = () => {
      stop();
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        const cleanup = () => {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', cleanup);
          removeFocusTarget = undefined;
        };
        removeFocusTarget = cleanup;
        target.addEventListener('blur', cleanup);
      }
      target.focus({ preventScroll: true });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(destination() - start) < 1) {
      window.scrollTo({ top: destination(), behavior: 'instant' });
      finish();
      return;
    }
    events.forEach(event => window.addEventListener(event, stop, { passive: true }));
    const began = performance.now();
    const step = (now: number) => {
      if (!target.isConnected) { stop(); return; }
      const progress = Math.min(1, (now - began) / 800);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: start + (destination() - start) * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else finish();
    };
    frame = requestAnimationFrame(step);
  };
  return { scroll, stop, destroy() { stop(); removeFocusTarget?.(); } };
}

export function anchorTarget(hash: string): HTMLElement | null {
  try { return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; }
  catch { return null; }
}

export function internalAnchor(event: MouseEvent, link: HTMLAnchorElement, current: URL): URL | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey ||
    event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
  const url = new URL(link.href, current);
  return url.origin === current.origin && url.hash.length > 1 && /^https?:$/.test(url.protocol) ? url : null;
}

/** Small adapter for isolated consumers; the public site uses one delegated controller. */
export function slowAnchor(node: HTMLAnchorElement, recordHistory: (url: URL) => void) {
  const scroller = createAnchorScroller();
  const click = (event: MouseEvent) => {
    const url = internalAnchor(event, node, new URL(location.href));
    if (!url || url.pathname !== location.pathname || url.search !== location.search) return;
    const target = anchorTarget(url.hash);
    if (!target) return;
    event.preventDefault();
    if (url.hash !== location.hash) recordHistory(url);
    scroller.scroll(target);
  };
  node.addEventListener('click', click);
  return {
    update(next: (url: URL) => void) { recordHistory = next; },
    destroy() { scroller.destroy(); node.removeEventListener('click', click); },
  };
}
