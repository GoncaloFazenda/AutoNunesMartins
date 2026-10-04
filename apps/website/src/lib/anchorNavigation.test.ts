import { afterEach, expect, it, vi } from 'vitest';
import { installAnchorNavigation } from './anchorNavigation';
import { internalAnchor, anchorTarget } from './components/stand-concepts/slowAnchor';

afterEach(() => vi.unstubAllGlobals());
function setup(reduced = false) {
  const frames = new Map<number, FrameRequestCallback>();
  let sequence = 0;
  let clock = 0;
  const url = new URL('https://example.test/viaturas');
  const win = Object.assign(new EventTarget(), { scrollY: 200, innerHeight: 800, matchMedia: () => ({ matches: reduced }), scrollTo: vi.fn() });
  win.scrollTo.mockImplementation(({ top }: { top: number }) => { win.scrollY = top; });
  const target = Object.assign(new EventTarget(), {
    isConnected: true, getBoundingClientRect: () => ({ top: 1600 - win.scrollY }),
    hasAttribute: () => false, setAttribute: vi.fn(), removeAttribute: vi.fn(), focus: vi.fn(),
  });
  class Link extends EventTarget {
    href = 'https://example.test/viaturas#contactos'; target = '';
    hasAttribute = () => false;
    closest = () => this;
  }
  const link = new Link();
  let clickHandler: (event: MouseEvent) => void;
  const doc = {
    getElementById: vi.fn((id: string) => id === 'contactos' ? target : null),
    querySelector: () => ({ getBoundingClientRect: () => ({ top: 0, bottom: 80 }) }),
    documentElement: { scrollHeight: 4000 },
    addEventListener: vi.fn((name: string, fn: typeof clickHandler) => { if (name === 'click') clickHandler = fn; }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('Element', Link); vi.stubGlobal('location', url); vi.stubGlobal('window', win); vi.stubGlobal('document', doc);
  vi.stubGlobal('getComputedStyle', () => ({ scrollMarginTop: '0px' }));
  vi.stubGlobal('performance', { now: () => clock });
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => { frames.set(++sequence, fn); return sequence; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  const push = vi.fn((next: URL) => { url.hash = next.hash; });
  const navigate = vi.fn(async () => {});
  const controller = installAnchorNavigation({ tick: async () => {}, push, navigate });
  const click = (extra = {}) => {
    const event = { target: link, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
    clickHandler(event as unknown as MouseEvent); return event;
  };
  const advance = (time: number) => { clock = time; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); };
  return { controller, click, advance, win, url, push, navigate, target, doc, frames, link };
}

it('delegates nested anchor clicks, waits for menu updates, applies actual header offset and focuses once', async () => {
  const t = setup(); expect(t.click().defaultPrevented).toBe(true);
  expect(t.frames.size).toBe(0); await Promise.resolve(); t.advance(0); t.advance(400);
  expect(t.win.scrollY).toBe(850); t.advance(800);
  expect(t.win.scrollY).toBe(1500); expect(t.target.focus).toHaveBeenCalledTimes(1);
  expect(t.push).toHaveBeenCalledTimes(1); t.click(); expect(t.push).toHaveBeenCalledTimes(1);
  t.controller.destroy();
});
it('uses the router for cross-route hashes, resets new content to top, then animates to its target', async () => {
  const t = setup(); t.link.href = 'https://example.test/quem-somos#contactos';
  expect(t.click().defaultPrevented).toBe(true); expect(t.navigate).toHaveBeenCalledWith(new URL(t.link.href)); expect(t.win.scrollTo).not.toHaveBeenCalled();
  t.controller.stop(); t.controller.afterNavigate('goto', new URL(t.link.href));
  expect(t.win.scrollY).toBe(0); await Promise.resolve(); t.advance(0); t.advance(400);
  expect(t.win.scrollY).toBe(750); t.advance(800); expect(t.win.scrollY).toBe(1500); t.controller.destroy();
});
it.each(['popstate', 'enter'])('leaves %s scroll restoration to the router', type => {
  const t = setup(); t.controller.afterNavigate(type, new URL(t.link.href));
  expect(t.win.scrollTo).not.toHaveBeenCalled(); expect(t.frames.size).toBe(0); t.controller.destroy();
});
it('leaves ordinary page navigation untouched even from the footer', () => {
  const t = setup(); t.win.scrollY = 3000; t.link.href = 'https://example.test/quem-somos';
  expect(t.click().defaultPrevented).toBe(false); t.controller.afterNavigate('link', new URL(t.link.href));
  expect(t.win.scrollTo).not.toHaveBeenCalled(); expect(t.navigate).not.toHaveBeenCalled(); t.controller.destroy();
});
it.each(['wheel', 'touchstart', 'pointerdown', 'keydown', 'popstate'])('cancels pending and running animation on %s', async name => {
  const t = setup(); t.click(); t.win.dispatchEvent(new Event(name)); await Promise.resolve(); t.advance(0);
  expect(t.win.scrollTo).not.toHaveBeenCalled(); t.click(); await Promise.resolve(); t.advance(0); t.advance(200);
  const y = t.win.scrollY; t.win.dispatchEvent(new Event(name)); t.advance(900);
  expect(t.win.scrollY).toBe(y); expect(t.target.focus).not.toHaveBeenCalled(); t.controller.destroy();
});
it('reduced motion jumps directly after menu updates and destroy cancels queued work', async () => {
  const t = setup(true); t.click(); await Promise.resolve(); t.advance(0);
  expect(t.win.scrollTo).toHaveBeenCalledTimes(1); expect(t.win.scrollY).toBe(1500);
  t.click(); t.controller.destroy(); await Promise.resolve(); t.advance(100);
  expect(t.win.scrollTo).toHaveBeenCalledTimes(1);
});
it('does not hijack external, special, modified, download or new-window links', () => {
  const t = setup();
  for (const extra of [{ctrlKey:true}, {metaKey:true}, {altKey:true}, {shiftKey:true}, {button:1}, {defaultPrevented:true}]) {
    expect(internalAnchor({ button: 0, ...extra } as unknown as MouseEvent, t.link as unknown as HTMLAnchorElement, t.url)).toBeNull();
  }
  for (const href of ['https://external.test/#contactos','mailto:a@example.test','tel:123','https://example.test/']) {
    t.link.href = href; expect(t.click().defaultPrevented).toBe(false);
  }
  t.link.href = 'https://example.test/#contactos'; t.link.target = '_blank'; expect(t.click().defaultPrevented).toBe(false);
  t.link.target = ''; t.link.hasAttribute = () => true; expect(t.click().defaultPrevented).toBe(false); t.controller.destroy();
});
it('ignores missing and malformed targets without throwing', () => {
  const t = setup(); t.link.href = 'https://example.test/viaturas#missing'; expect(t.click().defaultPrevented).toBe(false);
  expect(anchorTarget('#%E0%A4%A')).toBeNull(); expect(t.frames.size).toBe(0); t.controller.destroy();
});
