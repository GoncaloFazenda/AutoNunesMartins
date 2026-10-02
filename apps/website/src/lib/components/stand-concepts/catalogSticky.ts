export type CatalogSidebarFrame = {
  width: number;
  viewportHeight: number;
  viewportTop?: number;
  scrollY: number;
  start: number;
  end: number;
  panelHeight: number;
};
export type CatalogSidebarPosition = { offset: number; scrollY: number };

/**
 * A tall panel travels with normal page scrolling until its lower/upper edge is visible.
 * Reversing direction retains its document position (no jump between sticky edges).
 * The last car bounds travel, not the editorial, pagination or the stretched grid row.
 */
export function catalogSidebarPosition(frame: CatalogSidebarFrame, previous?: CatalogSidebarPosition): CatalogSidebarPosition {
  const { width, viewportHeight, scrollY, start, end, panelHeight } = frame;
  const maxOffset = Math.max(0, end - start - panelHeight);
  const clamp = (offset: number) => Math.min(maxOffset, Math.max(0, offset));
  if (width <= 800 || panelHeight <= 0 || maxOffset === 0) return { offset: 0, scrollY };
  const top = scrollY + (frame.viewportTop ?? 0) + 24 - start;
  const bottom = scrollY + (frame.viewportTop ?? 0) + viewportHeight - 24 - panelHeight - start;
  let offset: number;
  if (panelHeight <= viewportHeight - 48) offset = top;
  else if (!previous) offset = bottom;
  else if (scrollY > previous.scrollY) offset = Math.max(previous.offset, bottom);
  else if (scrollY < previous.scrollY) offset = Math.min(previous.offset, top);
  else offset = previous.offset;
  return { offset: clamp(offset), scrollY };
}

export function catalogSticky(node: HTMLElement) {
  const layout = node.closest('.catalog-layout');
  const sidebar = node.closest<HTMLElement>('.catalog-filters');
  const results = layout?.querySelector<HTMLElement>('.catalog-results');
  const grid = results?.querySelector<HTMLElement>('.catalog-grid');
  let frame = 0;
  let previous: CatalogSidebarPosition | undefined;
  let geometry = '';
  const measure = () => {
    frame = 0;
    if (!sidebar || !grid) return;
    const scrollY = window.scrollY;
    const width = window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const panelHeight = node.getBoundingClientRect().height;
    const nextGeometry = `${width}:${viewportHeight}:${panelHeight}`;
    if (nextGeometry !== geometry) { previous = undefined; geometry = nextGeometry; }
    const next = catalogSidebarPosition({
      width, viewportHeight, viewportTop: window.visualViewport?.offsetTop ?? 0,
      scrollY, panelHeight,
      start: sidebar.getBoundingClientRect().top + scrollY,
      end: grid.getBoundingClientRect().bottom + scrollY,
    }, previous);
    // Transforms preserve the form's reserved space; there is no nested scroll container.
    if (!previous || Math.abs(next.offset - previous.offset) > .01)
      node.style.setProperty('--catalog-filter-shift', `${next.offset}px`);
    previous = next;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
  const observer = new ResizeObserver(schedule);
  observer.observe(node);
  if (results) observer.observe(results);
  if (grid) observer.observe(grid);
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  schedule();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
      node.style.removeProperty('--catalog-filter-shift');
    },
  };
}
