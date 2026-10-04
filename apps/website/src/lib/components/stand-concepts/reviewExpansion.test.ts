import { afterEach, expect, it, vi } from 'vitest';
import { reviewExpansion } from './reviewExpansion';
import { reviewRevealOffset } from './reviewPosition';

afterEach(() => vi.unstubAllGlobals());
function setup(reduced = false) {
  let resized: () => void = () => {};
  const media = Object.assign(new EventTarget(), { matches: reduced });
  vi.stubGlobal('matchMedia', () => media);
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class { constructor(fn: () => void) { resized = fn; } observe() {} disconnect = disconnect; });
  const cards = [120, 70, 90, 120].map((preview, index) => {
    const size = { header: 100, copy: preview, baseline: preview, width: index === 3 ? 0 : 280, visible: 0 };
    const animations: { cancel: ReturnType<typeof vi.fn>; onfinish?: () => void }[] = [];
    const style = { height: '', overflow: '', removeProperty: vi.fn((key: 'height' | 'overflow') => { style[key] = ''; }) };
    const content = { get offsetHeight() { return size.header + size.copy; }, get offsetWidth() { return size.width; } };
    const copy = { get offsetHeight() { return size.copy; } };
    const baseline = { get offsetHeight() { return size.baseline; } };
    const card = { style, size, querySelector: (selector: string) => ({'.review-content': content, '.review-copy': copy, '.review-baseline': baseline}[selector]),
      animate: vi.fn((_frames: Keyframe[], _options: KeyframeAnimationOptions) => { const a = { cancel: vi.fn() }; animations.push(a); return a; }),
    };
    return { card, size, animations };
  });
  vi.stubGlobal('getComputedStyle', (card: typeof cards[number]['card']) => ({
    height: `${card.size.visible || parseFloat(card.style.height)}px`, paddingTop: '24px', paddingBottom: '24px', borderTopWidth: '1px', borderBottomWidth: '1px',
  }));
  const node = { querySelectorAll: () => cards.map(item => item.card) };
  const action = reviewExpansion(node as unknown as HTMLElement);
  return { cards, action, media, disconnect, resize: () => resized() };
}
it('equalizes different collapsed text lengths without including hidden clones', () => {
  const t = setup();
  expect(t.cards.map(item => item.card.style.height)).toEqual(['270px', '270px', '270px', '']);
  expect(t.cards.every(item => !item.card.animate.mock.calls.length)).toBe(true);
  t.action.destroy();
});
it('grows only the expanded card, then returns it to the shared collapsed baseline', () => {
  const t = setup(); const first = t.cards[0]!;
  first.size.copy = 500; t.resize();
  expect(first.card.animate).toHaveBeenLastCalledWith([{height:'270px'}, {height:'650px'}], {duration:320,easing:'cubic-bezier(.215, .61, .355, 1)'});
  expect(t.cards[1]!.card.style.height).toBe('270px');
  expect(t.cards[1]!.card.animate).not.toHaveBeenCalled();
  first.animations[0]!.onfinish?.(); expect(first.card.style.overflow).toBe('');
  first.size.copy = 120; t.resize();
  expect(first.card.animate.mock.calls.at(-1)?.[0]).toEqual([{height:'650px'}, {height:'270px'}]);
  t.action.destroy();
});
it('reverses rapid toggles from the visible in-flight height', () => {
  const t = setup(); const first = t.cards[0]!;
  first.size.copy = 500; t.resize(); first.size.visible = 410; first.size.copy = 120; t.resize();
  expect(first.animations[0]!.cancel).toHaveBeenCalled();
  expect(first.card.animate.mock.calls.at(-1)?.[0]).toEqual([{height:'410px'}, {height:'270px'}]);
  t.action.destroy();
});
it('remeasures the collapsed baseline on resize even while a review is open', () => {
  const t = setup(); const first = t.cards[0]!;
  first.size.copy = 500; t.resize();
  for (const item of t.cards) { item.size.width = 220; item.size.baseline += 40; }
  first.size.copy = 650; t.resize();
  expect(first.card.style.height).toBe('800px');
  expect(t.cards.slice(1).map(item => item.card.style.height)).toEqual(['310px','310px','310px']);
  expect(first.card.animate).toHaveBeenCalledTimes(1);
  expect(first.card.style.overflow).toBe('');
  t.action.destroy();
});
it('settles immediately for reduced motion and cleans up on unmount', () => {
  const t = setup(true); const first = t.cards[0]!;
  first.size.copy = 500; t.resize(); expect(first.card.animate).not.toHaveBeenCalled();
  t.media.matches = false; first.size.copy = 120; t.resize();
  t.media.matches = true; t.media.dispatchEvent(new Event('change'));
  expect(first.card.style.overflow).toBe('');
  t.action.destroy(); expect(t.disconnect).toHaveBeenCalled();
  expect(t.cards.every(item => item.card.style.height === '')).toBe(true);
});
it('reveals either original or cloned partial card using its actual bounds', () => {
  expect(reviewRevealOffset(-80,240,0,390,20)).toBe(100);
  expect(reviewRevealOffset(180,500,0,390,20)).toBe(-130);
  expect(reviewRevealOffset(30,350,0,390,20)).toBe(0);
});
