type Options = { enabled: boolean; open: boolean; close: () => void };

/** One navigation instance: its original slot remains reserved while it floats. */
export function hybridNav(header: HTMLElement, initial: Options) {
  let options = initial;
  const root = header.parentElement!;
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;
  let frame = 0;
  let pinned = false;
  let hidden = false;
  let previous = window.scrollY;
  let travel = 0;
  let direction = 0;
  const draw = () => {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    const hero = root.querySelector<HTMLElement>('.orbit-intro');
    const threshold = hero ? hero.getBoundingClientRect().bottom + y : Infinity;
    const nextPinned =
      options.enabled && (y >= threshold - (pinned ? 24 : 0) || (pinned && options.open));
    const delta = y - previous;
    if (!pinned && y <= 100 && root.classList.contains('nav-pinned')) {
      animation?.cancel();
      root.classList.remove('nav-pinned', 'nav-hidden');
    }
    const nextDirection = Math.sign(delta);
    if (nextDirection && nextDirection !== direction) travel = 0;
    if (nextDirection) direction = nextDirection;
    travel += Math.abs(delta);
    if (nextPinned !== pinned) {
      const current = getComputedStyle(header);
      const start = { opacity: current.opacity, transform: current.transform };
      animation?.cancel();
      pinned = nextPinned;
      hidden = pinned && mobile.matches && delta >= 0;
      travel = 0;
      if (pinned) {
        root.classList.add('nav-pinned');
        if (!hidden && !reduced.matches) {
          animation = header.animate(
            [
              { opacity: 0, transform: 'translateY(-18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 340, easing: 'cubic-bezier(.16,1,.3,1)' },
          );
        }
      } else if (
        !reduced.matches &&
        y > 100 &&
        !options.open &&
        !header.querySelector(':focus-visible')
      ) {
        const exit = header.animate([start, { opacity: 0, transform: 'translateY(-18px)' }], {
          duration: 240,
          easing: 'cubic-bezier(.4,0,.6,1)',
          fill: 'forwards',
        });
        animation = exit;
        void exit.finished
          .then(() => {
            if (!pinned) root.classList.remove('nav-pinned', 'nav-hidden');
            exit.cancel();
          })
          .catch(() => {});
      } else {
        root.classList.remove('nav-pinned', 'nav-hidden');
      }
    }
    const engaged = options.open || !!header.querySelector(':focus-visible');
    if (!pinned || !mobile.matches || engaged) hidden = false;
    else if (direction < 0 && travel >= 22) hidden = false;
    else if (direction > 0 && travel >= 64) hidden = true;
    root.classList.toggle('nav-hidden', pinned && hidden);
    previous = y;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const focusIn = () => {
    hidden = false;
    root.classList.remove('nav-hidden');
    schedule();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && options.open) {
      options.close();
      header.querySelector<HTMLButtonElement>('.mobile-menu')?.focus();
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  header.addEventListener('focusin', focusIn);
  header.addEventListener('focusout', schedule);
  header.addEventListener('keydown', keydown);
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  schedule();
  return {
    update(next: Options) {
      options = next;
      schedule();
    },
    destroy() {
      cancelAnimationFrame(frame);
      animation?.cancel();
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      header.removeEventListener('focusin', focusIn);
      header.removeEventListener('focusout', schedule);
      header.removeEventListener('keydown', keydown);
      root.classList.remove('nav-pinned', 'nav-hidden');
    },
  };
}
