/** Opt-in same-document anchor animation; router/global scrolling stays untouched. */
export function slowAnchor(node: HTMLAnchorElement, recordHistory: (url: URL) => void) {
  let frame = 0;
  let removeFocusTarget: (() => void) | undefined;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('popstate', stop);
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || node.hasAttribute('download') ||
        (node.target && node.target !== '_self')) return;
    const url = new URL(node.href, location.href);
    if (!url.hash || url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    stop();
    removeFocusTarget?.();
    if (url.hash !== location.hash) recordHistory(url);
    const start = window.scrollY;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const end = Math.max(0, Math.min(start + target.getBoundingClientRect().top - margin,
      document.documentElement.scrollHeight - window.innerHeight));
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(end - start) < 1) {
      window.scrollTo({ top: end, behavior: 'instant' });
      finish();
      return;
    }
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('pointerdown', stop, { passive: true });
    window.addEventListener('keydown', stop);
    window.addEventListener('popstate', stop);
    const began = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / 800);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: start + (end - start) * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(step);
      else finish();
    };
    frame = requestAnimationFrame(step);
  };
  node.addEventListener('click', click);
  return {
    update(next: (url: URL) => void) { recordHistory = next; },
    destroy() { stop(); removeFocusTarget?.(); node.removeEventListener('click', click); },
  };
}
