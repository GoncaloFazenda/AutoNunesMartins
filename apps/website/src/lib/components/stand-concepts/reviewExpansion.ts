/** Equal collapsed cards; only an expanded card grows beyond the measured baseline. */
export function reviewExpansion(node: HTMLElement) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-review-card]')).map(card => ({
    card,
    content: card.querySelector<HTMLElement>('.review-content')!,
    copy: card.querySelector<HTMLElement>('.review-copy')!,
    baseline: card.querySelector<HTMLElement>('.review-baseline')!,
    height: 0,
    width: 0,
    animation: undefined as Animation | undefined,
  }));
  const cancel = (item: typeof cards[number]) => {
    item.animation?.cancel(); item.animation = undefined;
    item.card.style.removeProperty('overflow');
  };
  const measure = () => {
    const measured = cards.filter(item => item.content.offsetWidth).map(item => {
      const style = getComputedStyle(item.card);
      const frame = [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      const natural = item.content.offsetHeight + frame;
      return { item, natural, collapsed: natural - item.copy.offsetHeight + item.baseline.offsetHeight };
    });
    const common = Math.ceil(Math.max(0, ...measured.map(value => value.collapsed)));
    for (const { item, natural } of measured) {
      const height = Math.ceil(Math.max(common, natural));
      const width = item.content.offsetWidth;
      if (height === item.height && width === item.width) continue;
      const from = item.animation ? parseFloat(getComputedStyle(item.card).height) : item.height;
      const resized = width !== item.width;
      const initial = !item.height;
      item.height = height; item.width = width;
      cancel(item);
      item.card.style.height = `${height}px`;
      if (initial || resized || media.matches || Math.abs(from - height) < .5) continue;
      item.card.style.overflow = 'clip';
      const animation = item.card.animate([{ height: `${from}px` }, { height: `${height}px` }], {
        duration: 320, easing: 'cubic-bezier(.215, .61, .355, 1)',
      });
      item.animation = animation;
      animation.onfinish = () => { if (item.animation === animation) cancel(item); };
    }
  };
  const observer = new ResizeObserver(measure);
  for (const item of cards) { observer.observe(item.content); observer.observe(item.baseline); }
  measure();
  const preference = () => { if (media.matches) cards.forEach(cancel); measure(); };
  media.addEventListener('change', preference);
  return { destroy() {
    observer.disconnect(); media.removeEventListener('change', preference);
    for (const item of cards) { cancel(item); item.card.style.removeProperty('height'); }
  } };
}
