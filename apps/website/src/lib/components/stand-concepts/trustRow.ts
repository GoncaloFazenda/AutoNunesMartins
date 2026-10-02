type ServiceSize = { closed: number; reveal: number };

/** Reserve the largest complete card, not the sum of unrelated maxima. */
export function trustRowSizes(cards: ServiceSize[]) {
  return {
    closed: Math.max(0, ...cards.map(card => card.closed)),
    expanded: Math.max(0, ...cards.map(card => card.closed + card.reveal)),
  };
}

/** Measure the real, inert collapsed content: no cloned text, IDs or accessible controls. */
export function stableTrustRow(node: HTMLElement) {
  let frame = 0;
  let width = node.getBoundingClientRect().width;
  const cards = Array.from(node.querySelectorAll<HTMLElement>(':scope > article'));
  const parts = cards.map(card => ({
    card,
    panel: card.querySelector<HTMLElement>('.service-panel')!,
    content: card.querySelector<HTMLElement>('.service-reveal')!,
  }));
  const set = (element: HTMLElement, key: string, value: number) => {
    const text = `${value}px`;
    if (element.style.getPropertyValue(key) !== text) element.style.setProperty(key, text);
  };
  const measure = () => {
    frame = 0;
    width = node.getBoundingClientRect().width;
    // Read every size before writing. Animated panel height is excluded from the base.
    const sizes = parts.map(({ card, panel, content }) => ({
      closed: card.getBoundingClientRect().height - panel.getBoundingClientRect().height,
      reveal: content.getBoundingClientRect().height,
    }));
    const row = trustRowSizes(sizes);
    parts.forEach(({ panel }, index) => set(panel, '--service-reveal-height', sizes[index]!.reveal));
    set(node, '--trust-row-closed', row.closed);
    set(node, '--trust-row-expanded', row.expanded);
    node.dataset.measured = '';
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
  const observer = new ResizeObserver(entries => {
    // Ignore the row's animated height. Width, wrapping and font/content size matter.
    if (entries.some(entry => entry.target !== node || Math.abs(entry.contentRect.width - width) > .1)) schedule();
  });
  observer.observe(node);
  for (const { card, content } of parts) {
    observer.observe(content);
    for (const element of card.querySelectorAll('h3, :scope > p, .service-toggle')) observer.observe(element);
  }
  window.addEventListener('resize', schedule);
  measure();
  return {
    destroy() {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      delete node.dataset.measured;
      node.style.removeProperty('--trust-row-closed');
      node.style.removeProperty('--trust-row-expanded');
      parts.forEach(({ panel }) => panel.style.removeProperty('--service-reveal-height'));
    },
  };
}
