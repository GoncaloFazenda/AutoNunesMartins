type Options = { enabled: boolean; open: boolean; directional: boolean };

/** Share the home compact variant; only the catalog hides with scroll direction. */
export function catalogNavigation(header: HTMLElement, initial: Options) {
  let options = initial;
  const root = header.parentElement!;
  let previous = window.scrollY;
  let travel = 0;
  let frame = 0;
  const show = () => header.classList.remove('catalog-nav-hidden');
  const draw = () => {
    frame = 0;
    const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - previous;
    previous = y;
    const stripHeight = root.querySelector<HTMLElement>('.nav-contact-strip')?.offsetHeight ?? 0;
    const wasCompact = root.classList.contains('nav-compact');
    const compact = options.enabled && y > stripHeight + (wasCompact ? 0 : 2);
    root.classList.toggle('nav-compact', compact);
    if (!options.enabled || !options.directional || !matchMedia('(max-width: 1000px)').matches || options.open || y <= header.offsetHeight || header.querySelector(':focus-visible')) {
      travel = 0;
      show();
      return;
    }
    if (delta && Math.sign(delta) !== Math.sign(travel)) travel = 0;
    travel += delta;
    if (travel >= 48) { header.classList.add('catalog-nav-hidden'); travel = 0; }
    if (travel <= -20) { show(); travel = 0; }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const focus = () => { show(); travel = 0; };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  header.addEventListener('focusin', focus);
  draw();
  return {
    update(next: Options) { options = next; schedule(); },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      header.removeEventListener('focusin', focus);
      root.classList.remove('nav-compact');
      show();
    },
  };
}
