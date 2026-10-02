import { describe, expect, it } from 'vitest';
import { compactNavProgress } from './hybridNav';

describe('compact navbar scroll arrival', () => {
  it('starts transparent and reaches full visibility at the hero end', () => {
    expect(compactNavProgress(819, 1000, 1000)).toEqual({ pinned: false, progress: 0 });
    expect(compactNavProgress(820, 1000, 1000)).toEqual({ pinned: true, progress: 0 });
    expect(compactNavProgress(910, 1000, 1000).progress).toBe(.5);
    expect(compactNavProgress(1000, 1000, 1000).progress).toBe(1);
    expect(compactNavProgress(2000, 1000, 1000).progress).toBe(1);
  });
  it('is reversible and independent of direction and initialization', () => {
    const positions = [830, 865, 910, 950, 1000];
    const forward = positions.map(y => compactNavProgress(y, 1000, 1000));
    expect([...positions].reverse().map(y => compactNavProgress(y, 1000, 1000))).toEqual([...forward].reverse());
  });
  it('bounds the range on short and tall screens', () => {
    expect(compactNavProgress(950, 1000, 400).progress).toBe(.5);
    expect(compactNavProgress(910, 1000, 1800).progress).toBe(.5);
  });
  it('keeps the normal navbar at the document top', () => {
    expect(compactNavProgress(0, 80, 900)).toEqual({ pinned: false, progress: 0 });
    expect(compactNavProgress(99, 80, 900).pinned).toBe(false);
  });
});
