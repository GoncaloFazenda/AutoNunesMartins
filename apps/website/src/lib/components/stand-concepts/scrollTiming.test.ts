import { describe, expect, it } from 'vitest';
import { sceneProgress, chapterProgress, approachProgress } from './scrollTiming';

describe('scene progress aligned to sticky geometry', () => {
  it('waits until the stage reaches its real sticky position', () => {
    expect(sceneProgress(200, 1100, 900, 650, 125).pinned).toBe(0);
    expect(sceneProgress(125, 1100, 900, 650, 125).pinned).toBe(0);
  });
  it('uses the actual stage height, not the viewport, for the full travel', () => {
    expect(sceneProgress(-100, 1100, 900, 650, 125).pinned).toBe(0.5);
    expect(sceneProgress(-325, 1100, 900, 650, 125).pinned).toBe(1);
  });
  it('clamps before and after the scene, including restored scroll positions', () => {
    expect(sceneProgress(1200, 1100, 900, 650, 125).pinned).toBe(0);
    expect(sceneProgress(-2000, 1100, 900, 650, 125).pinned).toBe(1);
  });
  it('does not animate mobile heroes that are no longer sticky', () => {
    expect(sceneProgress(-200, 640, 800, null).pinned).toBe(0);
  });
  it('handles a zero-length pinned range without division artifacts', () => {
    expect(sceneProgress(-200, 650, 900, 650, 125).pinned).toBe(0);
  });
  it('reverses consistently when scrolling upwards', () => {
    const points = [-325, -100, 125].map((top) => sceneProgress(top, 1100, 900, 650, 125).pinned);
    expect(points).toEqual([1, 0.5, 0]);
  });
  it('starts the second panel later but finishes both within the scene', () => {
    expect(chapterProgress(0.05, 0.1, 1)).toBe(0);
    expect(chapterProgress(0.44, 0, 0.88)).toBe(0.5);
    expect(chapterProgress(1, 0, 0.88)).toBe(1);
    expect(chapterProgress(1, 0.1, 1)).toBe(1);
  });
});

describe('approaching scenes without pinning', () => {
  it('keeps the cards together before entering, then opens while approaching', () => {
    expect(approachProgress(950, 450, 900)).toBe(0);
    expect(approachProgress(500, 450, 900)).toBeGreaterThan(0);
    expect(approachProgress(500, 450, 900)).toBeLessThan(1);
  });
  it('finishes at the viewport centre for both short and tall sections', () => {
    for (const height of [320, 450, 840]) {
      expect(approachProgress(450 - height / 2, height, 900)).toBe(1);
    }
  });
  it('returns to the stack when scrolling backwards, with no overshoot', () => {
    const values = [100, 300, 600, 1000].map((top) => approachProgress(top, 450, 900));
    expect(values[0]).toBe(1);
    expect(values[1]).toBeGreaterThan(values[2]!);
    expect(values[3]).toBe(0);
  });
});
