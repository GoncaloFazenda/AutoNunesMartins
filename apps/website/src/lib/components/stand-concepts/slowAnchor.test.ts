import { afterEach, expect, it, vi } from 'vitest';
import { slowAnchor } from './slowAnchor';

afterEach(() => vi.unstubAllGlobals());
function setup(reduced = false) {
  const frames = new Map<number, FrameRequestCallback>();
  let sequence = 0;
  const attributes = new Set<string>();
  const target = Object.assign(new EventTarget(), {
    isConnected: true,
    getBoundingClientRect: () => ({ top: 1200 }),
    hasAttribute: (name: string) => attributes.has(name),
    setAttribute: (name: string) => attributes.add(name),
    removeAttribute: (name: string) => attributes.delete(name),
    focus: vi.fn(),
  });
  const node = Object.assign(new EventTarget(), {
    href: 'https://example.test/viaturas#contactos', target: '', hasAttribute: () => false,
  });
  const scrollTo = vi.fn();
  const windowMock = Object.assign(new EventTarget(), {
    scrollY: 200, innerHeight: 800, scrollTo, matchMedia: () => ({ matches: reduced }),
  });
  const url = new URL('https://example.test/viaturas');
  vi.stubGlobal('location', url);
  vi.stubGlobal('window', windowMock);
  vi.stubGlobal('document', { getElementById: () => target, querySelector: () => null, documentElement: { scrollHeight: 4000 } });
  vi.stubGlobal('getComputedStyle', () => ({ scrollMarginTop: '0px' }));
  vi.stubGlobal('performance', { now: () => 0 });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const history = vi.fn((next: URL) => { url.hash = next.hash; });
  const action = slowAnchor(node as unknown as HTMLAnchorElement, history);
  const click = (extra = {}) => {
    const event = Object.assign(new Event('click', { cancelable: true }), { button: 0, ...extra });
    node.dispatchEvent(event); return event;
  };
  const advance = (time: number) => {
    const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time));
  };
  return { node, target, windowMock, frames, history, action, click, advance, scrollTo, attributes };
}

it('animates only the opted-in anchor over 800ms and focuses without a second scroll', () => {
  const t = setup();
  expect(t.click().defaultPrevented).toBe(true);
  expect(t.history).toHaveBeenCalledTimes(1);
  t.advance(400); expect(t.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: 'instant' });
  expect(t.target.focus).not.toHaveBeenCalled();
  t.advance(800); expect(t.scrollTo).toHaveBeenLastCalledWith({ top: 1400, behavior: 'instant' });
  expect(t.target.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(t.frames.size).toBe(0);
  t.click(); expect(t.history).toHaveBeenCalledTimes(1);
  t.action.destroy(); expect(t.attributes.size).toBe(0);
});
it('uses immediate positioning with reduced motion', () => {
  const t = setup(true); t.click();
  expect(t.frames.size).toBe(0);
  expect(t.scrollTo).toHaveBeenCalledTimes(1);
  expect(t.scrollTo).toHaveBeenCalledWith({ top: 1400, behavior: 'instant' });
  expect(t.target.focus).toHaveBeenCalledWith({ preventScroll: true });
  t.action.destroy();
});
it.each(['wheel', 'touchstart', 'pointerdown', 'keydown', 'popstate'])('interrupts on %s without stealing focus', event => {
  const t = setup(); t.click(); t.advance(200);
  t.windowMock.dispatchEvent(new Event(event));
  t.advance(800);
  expect(t.frames.size).toBe(0); expect(t.target.focus).not.toHaveBeenCalled();
  t.action.destroy();
});
it('leaves modified clicks and inter-page navigation native', () => {
  const t = setup();
  for (const extra of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    expect(t.click(extra).defaultPrevented).toBe(false);
  }
  t.node.href = 'https://example.test/quem-somos#contactos';
  expect(t.click().defaultPrevented).toBe(false);
  expect(t.frames.size).toBe(0); expect(t.history).not.toHaveBeenCalled();
  t.action.destroy();
});
