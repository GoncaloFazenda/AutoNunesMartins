import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { heroScrollProgress, heroAccentFrame } from './scrollTiming';
import { compactNavProgress } from './hybridNav';

const startup = readFileSync(new URL('../../../../static/orbit-startup.js', import.meta.url), 'utf8');

// Exercise the real parser-time script with geometry only: no browser, network or storage writes.
function startupProgress(viewport: number, stageHeight: number, documentTop: number, scroll: number, width = 1440) {
  const values = new Map<string, number>();
  const rect = { top: documentTop - scroll, height: stageHeight + viewport * 0.04, bottom: documentTop - scroll + stageHeight + viewport * 0.04 };
  const padding = Math.min(viewport * 0.04, Math.max(0, (viewport - stageHeight) / 2 - documentTop));
  const stage = { getBoundingClientRect: () => ({ height: stageHeight, top: rect.top + padding }) };
  const scene = {
    getBoundingClientRect: () => rect,
    querySelector: (selector: string) => selector.includes('data-hero-stage') ? stage : null,
    hasAttribute: (name: string) => name === 'data-scroll-hero',
    style: { setProperty: (name: string, value: number | string) => values.set(name, Number.parseFloat(String(value))) },
  };
  const root = {
    querySelector: (selector: string) => selector === '.orbit-intro' ? scene : null,
    querySelectorAll: () => [scene],
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: (name: string) => name === 'orbit-home' },
    style: { setProperty: (name: string, value: number | string) => values.set(name, Number(value)) },
  };
  runInNewContext(`${startup}\nwindow.initializeOrbitDocument();`, {
    window: {},
    location: { pathname: '/stand-orbit' },
    addEventListener: () => {},
    setTimeout: () => {},
    matchMedia: () => ({ matches: false }),
    performance: { getEntriesByType: () => [] },
    sessionStorage: { getItem: () => null },
    innerHeight: viewport,
    innerWidth: width,
    scrollY: scroll,
    document: {
      querySelector: () => root,
      documentElement: { setAttribute: () => {}, hasAttribute: () => true, scrollHeight: 10000 },
    },
  });
  return values;
}

describe('navbar first-paint parity', () => {
  it.each([400, 844, 900, 1180, 2160])('matches hydration at every scroll position for %ipx height', viewport => {
    const bottom = 94 + 700 + viewport * .04;
    for (const scroll of [0, bottom - 200, bottom - 90, bottom - 1, bottom, bottom + 200]) {
      expect(startupProgress(viewport, 700, 94, scroll).get('--nav-progress'))
        .toBeCloseTo(compactNavProgress(scroll, bottom, viewport).progress, 12);
    }
  });
});

describe('natural hero scroll', () => {
  it('keeps the Full HD resting pose but spreads the remaining rotation over normal scroll', () => {
    const start = heroScrollProgress(94, 94, 714.4, 940);
    const next = heroScrollProgress(54, 94, 714.4, 940);
    expect(start).toBeCloseTo(0.5);
    expect(next).toBeGreaterThan(start);
    expect(next).toBeLessThan(0.6);
  });

  it('preserves the completed resting pose on tall 4K viewports', () => {
    expect(heroScrollProgress(94, 94, 740, 2020)).toBe(1);
    expect(heroScrollProgress(-106, 94, 740, 2020)).toBe(1);
  });

  it('reverses without overshoot, including reloads and mobile positions', () => {
    expect(heroScrollProgress(82, 82, 820, 844)).toBe(0);
    expect(heroScrollProgress(-18, 82, 820, 844)).toBeGreaterThan(0);
    expect(heroScrollProgress(-2000, 82, 820, 844)).toBe(1);
    expect(heroScrollProgress(1000, 82, 820, 844)).toBe(0);
    expect(Number.isFinite(heroScrollProgress(0, 0, 0, 0))).toBe(true);
  });

  it.each([
    [940, 714.4, 94, 0],
    [940, 714.4, 94, 100],
    [880, 668.8, 94, 200],
    [2020, 740, 94, 0],
    [2020, 740, 94, 400],
    [844, 820, 82, 0],
    [844, 820, 82, 100],
    [844, 820, 82, 600],
  ])('matches parser-time and hydrated progress at %ipx viewport', (viewport, stage, top, scroll) => {
    expect(startupProgress(viewport, stage, top, scroll).get('--p'))
      .toBeCloseTo(heroScrollProgress(top - scroll, top, stage, viewport), 12);
  });
});

describe('independent hero accent frame', () => {
  const layouts = [
    [940, 714.4, 94], [1080, 740, 94], [2020, 740, 94],
    [2160, 740, 94], [844, 820, 82], [1180, 700, 94],
  ];
  it.each(layouts)('keeps the approved resting track stable at %ipx, forwards and backwards', (viewport, stage, documentTop) => {
    const range = viewport * 0.04;
    const pinTop = Math.max(0, (viewport - stage) / 2);
    const padding = Math.min(range, Math.max(0, pinTop - documentTop));
    const restingTop = Math.min(Math.max(documentTop, pinTop), documentTop + range);
    const restingProgress = Math.min(1, Math.max(0, (pinTop - documentTop) / range));
    const restingOffset = restingTop - documentTop - padding - restingProgress * 12;
    for (const scroll of [0, 2, 5, 10, 20, 40, 70, 90, 100, 180, 400, 600, 100, 40, 10, 0]) {
      const top = documentTop - scroll;
      const stageTop = top + padding;
      const accent = heroAccentFrame(top, stage + range, stageTop, stage, viewport, scroll);
      expect(accent.shift - accent.progress * 12).toBeCloseTo(restingOffset, 8);
      expect(accent.progress).toBeCloseTo(restingProgress, 8);
      // The parser and hydrated line must land in the same pose after a restored refresh.
      const initial = startupProgress(viewport, stage, documentTop, scroll);
      expect(initial.get('--accent-stage-shift')).toBeCloseTo(accent.shift, 8);
      expect(initial.get('--accent-progress')).toBeCloseTo(accent.progress, 8);
    }
  });

  it('has finite output without a sticky travel range', () => {
    expect(heroAccentFrame(0, 0, 0, 0, 0)).toEqual({ shift: 0, progress: 0 });
  });

  it.each([390, 700, 701, 820, 1024, 1050])('preserves the former path below the wide breakpoint (%ipx)', (width) => {
    const viewport = 844, stage = 820, documentTop = 82, range = viewport * .04;
    const pinTop = Math.max(0, (viewport - stage) / 2);
    for (const scroll of [0, 5, 20, 80, 100, 160, 400, 100, 0]) {
      const top = documentTop - scroll;
      const accent = heroAccentFrame(top, stage + range, top, stage, viewport);
      const oldTop = Math.min(Math.max(top, pinTop), top + range);
      const oldProgress = Math.min(1, Math.max(0, (pinTop - top) / range));
      expect(top + accent.shift - accent.progress * 12).toBeCloseTo(oldTop - oldProgress * 12, 8);
      const initial = startupProgress(viewport, stage, documentTop, scroll, width);
      expect(initial.get('--accent-stage-shift')).toBeCloseTo(accent.shift, 8);
      expect(initial.get('--accent-progress')).toBeCloseTo(accent.progress, 8);
    }
  });
});
