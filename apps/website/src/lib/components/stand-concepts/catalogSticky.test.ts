import { describe, expect, it } from 'vitest';
import { catalogSidebarPosition, type CatalogSidebarFrame } from './catalogSticky';

const base: CatalogSidebarFrame = { width: 1366, viewportHeight: 720, scrollY: 0, start: 350, end: 1650, panelHeight: 910 };
const at = (scrollY: number, previous?: ReturnType<typeof catalogSidebarPosition>, overrides: Partial<CatalogSidebarFrame> = {}) => catalogSidebarPosition({ ...base, scrollY, ...overrides }, previous);

describe('directional catalogue sidebar without nested scrolling', () => {
  it('lets tall fields scroll naturally before following the lower viewport edge', () => {
    let state = at(0);
    expect(state.offset).toBe(0);
    state = at(400, state);
    expect(state.offset).toBe(0);
    state = at(600, state);
    expect(state.offset).toBe(36);
    state = at(700, state);
    expect(state.offset).toBe(136);
    expect(base.start + state.offset - 700 + base.panelHeight).toBe(696);
  });
  it('does not jump on reversal; upper fields return before the top follows', () => {
    let state = at(700);
    state = at(699, state);
    expect(state.offset).toBe(136);
    state = at(600, state);
    expect(state.offset).toBe(136);
    state = at(450, state);
    expect(state.offset).toBe(124);
    expect(base.start + state.offset - 450).toBe(24);
    expect(at(451, state).offset).toBe(124);
  });
  it('stops at the last car, not the editorial or pagination', () => {
    const state = at(1200, at(800));
    expect(state.offset).toBe(390);
    expect(base.start + state.offset + base.panelHeight).toBe(base.end);
  });
  it('pins a panel that fits at the upper margin', () => {
    const state = at(600, undefined, { viewportHeight: 1080 });
    expect(state.offset).toBe(274);
    expect(base.start + state.offset - 600).toBe(24);
  });
  it.each([720, 900])('follows tall panels at viewport height %i', viewportHeight => {
    const state = at(800, undefined, { viewportHeight });
    expect(state.offset).toBeGreaterThan(0);
    expect(state.offset).toBeLessThanOrEqual(390);
  });
  it.each([0, 300, 900])('keeps a complete panel in normal flow for only %ipx of results', height => {
    expect(at(600, undefined, { end: base.start + height }).offset).toBe(0);
  });
  it('preserves mobile disclosure at and below 800px', () => {
    expect(at(700, undefined, { width: 390 }).offset).toBe(0);
    expect(at(700, undefined, { width: 800 }).offset).toBe(0);
    expect(at(700, undefined, { width: 801 }).offset).toBe(136);
  });
  it('restores a scrolled position without waiting for a scroll event', () => {
    expect(at(700).offset).toBe(136);
  });
  it('clamps previous offsets after results shrink', () => {
    expect(at(700, at(700), { end: 1400 }).offset).toBe(136);
    expect(at(700, at(700), { end: 1300 }).offset).toBe(40);
  });
  it('returns to the natural starting position', () => {
    expect(at(0, at(700)).offset).toBe(0);
  });
});
