import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { phoneAttention, startPhoneAttention } from './phoneAttention';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('navbar phone local timer', () => {
  it('keeps ringing every three minutes with no visit limit', () => {
    const ring = vi.fn(() => true);
    const timer = startPhoneAttention({ eligible: () => true, ring });
    vi.advanceTimersByTime(179_000); expect(ring).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000); expect(ring).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(7 * 180_000); expect(ring).toHaveBeenCalledTimes(8);
    timer.destroy();
    vi.advanceTimersByTime(180_000); expect(ring).toHaveBeenCalledTimes(8);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restarts the interval on remount', () => {
    const ring = vi.fn(() => true), options = { eligible: () => true, ring };
    const first = startPhoneAttention(options);
    vi.advanceTimersByTime(120_000); first.destroy();
    const second = startPhoneAttention(options);
    vi.advanceTimersByTime(179_000); expect(ring).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000); expect(ring).toHaveBeenCalledTimes(1);
    second.destroy();
  });

  it.each(['hidden', 'unfocused', 'offscreen', 'inert', 'form', 'reduced', 'transparent', 'busy'])(
    'skips %s without catching up; clicking does not stop later rings', (condition) => {
      let blocked = true;
      const animate = vi.fn();
      const icon = { getAnimations: () => blocked && condition === 'busy' ? [{ playState: 'running' }] : [], animate };
      const node = Object.assign(new EventTarget(), {
        querySelector: () => icon,
        closest: () => blocked && condition === 'inert' ? {} : null,
        getBoundingClientRect: () => ({ width: 100, height: 45, top: blocked && condition === 'offscreen' ? 1000 : 0, bottom: 45, left: 0, right: 100 }),
        parentElement: null,
      });
      vi.stubGlobal('window', { matchMedia: () => ({ matches: blocked && condition === 'reduced' }) });
      vi.stubGlobal('document', {
        get visibilityState() { return blocked && condition === 'hidden' ? 'hidden' : 'visible'; },
        hasFocus: () => !(blocked && condition === 'unfocused'),
        activeElement: { closest: () => blocked && condition === 'form' ? {} : null },
      });
      vi.stubGlobal('innerHeight', 800); vi.stubGlobal('innerWidth', 1200);
      vi.stubGlobal('getComputedStyle', () => ({ display: 'block', visibility: 'visible', opacity: blocked && condition === 'transparent' ? '0' : '1' }));
      const action = phoneAttention(node as unknown as HTMLAnchorElement);
      vi.advanceTimersByTime(540_000); expect(animate).not.toHaveBeenCalled();
      blocked = false;
      vi.advanceTimersByTime(179_000); expect(animate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000); expect(animate).toHaveBeenCalledTimes(1);
      node.dispatchEvent(new Event('click'));
      vi.advanceTimersByTime(5 * 180_000); expect(animate).toHaveBeenCalledTimes(6);
      action.destroy(); expect(vi.getTimerCount()).toBe(0);
    },
  );
});
