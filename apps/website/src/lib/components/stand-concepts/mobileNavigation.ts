type Options = { open: boolean; close: () => void };

/** Non-modal navigation: keep closed links out of the keyboard order. */
export function mobileNavigation(nav: HTMLElement, initial: Options) {
  let options = initial;
  let frame = 0;
  const mobile = window.matchMedia('(max-width: 700px)');
  const header = nav.closest('header')!;
  const sync = () => {
    nav.inert = mobile.matches && !options.open;
  };
  const outside = (event: Event) => {
    if (mobile.matches && options.open && !header.contains(event.target as Node)) options.close();
  };
  const resize = () => {
    if (!mobile.matches && options.open) options.close();
    sync();
  };
  document.addEventListener('pointerdown', outside);
  document.addEventListener('focusin', outside);
  mobile.addEventListener('change', resize);
  sync();
  return {
    update(next: Options) {
      const opening = next.open && !options.open;
      options = next;
      sync();
      cancelAnimationFrame(frame);
      if (opening && mobile.matches)
        frame = requestAnimationFrame(() => {
          nav.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
        });
    },
    destroy() {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      mobile.removeEventListener('change', resize);
      nav.inert = false;
    },
  };
}
