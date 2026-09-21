import { describe, expect, it } from 'vitest';
import { COUNTER_DURATION, counterValue } from './counterTiming';
import { standTrust } from './standTrust';
import { approachProgress } from './scrollTiming';

describe('reference-inspired count-up', () => {
  it.each([15, 500, 2500, 24])('counts upwards and lands exactly on %i', (target) => {
    const samples = Array.from({ length: 101 }, (_, i) => counterValue(target, i / 100));
    expect(samples[0]).toBe(0);
    expect(samples.at(-1)).toBe(target);
    expect(samples.every((n, i) => i === 0 || n >= samples[i - 1]!)).toBe(true);
    expect(counterValue(target, -1)).toBe(0);
    expect(counterValue(target, 2)).toBe(target);
  });
  it('matches the 1.8 second duration and fast early deceleration', () => {
    expect(COUNTER_DURATION).toBe(1800);
    expect(counterValue(2500, 0.5)).toBe(2187);
    expect(counterValue(2500, 0.25)).toBeGreaterThan(1250);
  });
  it('uses exactly the supplied four metrics without implied guarantee duration', () => {
    expect(standTrust.metrics.map((m) => m.value)).toEqual([15, 500, 2500, 24]);
    expect(standTrust.guaranteeDurationMonths).toBeNull();
  });
  it('delays the scan by 5vh without changing its speed', () => {
    const regular = (top: number) => approachProgress(top, 400, 1000);
    const delayed = (top: number) => approachProgress(top + 50, 400, 1000);
    expect(delayed(925)).toBe(0);
    expect(regular(925)).toBeGreaterThan(0);
    expect(delayed(500) - delayed(600)).toBeCloseTo(regular(500) - regular(600));
    expect(delayed(250)).toBe(1);
  });
});
