/** One passive scroll listener and a batched frame for all continuous effects. */
export function scrollMotion(root: HTMLElement) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const selectors = '.hero, .detail-image, .philosophy-image, .contact-section, .scroll-statement';
  let targets = Array.from(root.querySelectorAll<HTMLElement>(selectors));
  const update = () => {
    frame = 0;
    if (preference.matches) return;
    const height = window.innerHeight;
    const pageRange = Math.max(1, document.documentElement.scrollHeight - height);
    root.style.setProperty('--page-progress', String(clamp(window.scrollY / pageRange)));
    // Batch layout reads before any style writes.
    const measurements = targets.map((node) => ({ node, rect: node.getBoundingClientRect() }));
    for (const { node, rect } of measurements) {
      if (rect.bottom < -height * 0.2 || rect.top > height * 1.2) continue;
      const progress = clamp((height - rect.top) / (height + rect.height));
      const entry = clamp((height * 0.95 - rect.top) / (height * 0.6));
      node.style.setProperty('--scroll-progress', String(progress));
      node.style.setProperty('--scroll-entry', String(entry));
      node.style.setProperty(
        '--scroll-shift',
        `${(progress - 0.5) * (window.innerWidth < 700 ? 28 : 65)}px`,
      );
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const configure = () => {
    root.classList.toggle('scroll-enhanced', !preference.matches);
    schedule();
  };
  const mutation = new MutationObserver(() => {
    targets = Array.from(root.querySelectorAll<HTMLElement>(selectors));
    schedule();
  });
  mutation.observe(root, { childList: true, subtree: true });
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  preference.addEventListener('change', configure);
  configure();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', configure);
      root.classList.remove('scroll-enhanced');
    },
  };
}
