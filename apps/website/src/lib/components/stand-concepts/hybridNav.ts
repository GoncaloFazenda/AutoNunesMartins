type Options = { enabled: boolean; open: boolean; close: () => void };

/** Finish arriving when the hero leaves the viewport. Keep startup JS in sync. */
export function compactNavProgress(scrollY: number, heroBottom: number, viewportHeight: number) {
  const distance = Math.max(100, Math.min(180, viewportHeight * .18));
  const start = Math.max(100, heroBottom - distance);
  return { pinned: scrollY >= start, progress: Math.max(0, Math.min(1, (scrollY - start) / distance)) };
}

/** One navigation instance and a reserved original slot; no time-based scroll animation. */
export function hybridNav(header: HTMLElement, initial: Options) {
  let options = initial;
  const root = header.parentElement!;
  let frame = 0;
  const reset = () => {
    root.classList.remove('nav-pinned', 'nav-hidden');
    root.style.removeProperty('--nav-progress');
    header.inert = false;
    header.removeAttribute('aria-hidden');
  };
  const draw = () => {
    frame = 0;
    const hero = root.querySelector<HTMLElement>('.orbit-intro');
    if (!options.enabled || !hero) { reset(); return; }
    const y = Math.max(0, window.scrollY);
    const state = compactNavProgress(y, hero.getBoundingClientRect().bottom + y, innerHeight);
    // Never fade a menu or a keyboard target out from under its current user.
    const engaged = options.open || !!header.querySelector(':focus-visible');
    const pinned = state.pinned || (root.classList.contains('nav-pinned') && engaged && y > 100);
    const progress = pinned && engaged ? 1 : state.progress;
    root.classList.toggle('nav-pinned', pinned);
    root.classList.remove('nav-hidden');
    root.style.setProperty('--nav-progress', String(progress));
    const invisible = pinned && progress <= 0;
    header.inert = invisible;
    if (invisible) header.setAttribute('aria-hidden', 'true');
    else header.removeAttribute('aria-hidden');
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && options.open) {
      options.close();
      header.querySelector<HTMLButtonElement>('.mobile-menu')?.focus();
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  header.addEventListener('focusin', schedule);
  header.addEventListener('focusout', schedule);
  header.addEventListener('keydown', keydown);
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  const hero = root.querySelector('.orbit-intro');
  if (hero) resize.observe(hero);
  draw();
  return {
    update(next: Options) { options = next; schedule(); },
    destroy() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      header.removeEventListener('focusin', schedule);
      header.removeEventListener('focusout', schedule);
      header.removeEventListener('keydown', keydown);
      reset();
    },
  };
}
