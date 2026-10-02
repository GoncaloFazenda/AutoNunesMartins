import { describe, expect, it } from 'vitest';
import { scrollAccent } from './scrollAccent';

describe('scroll-driven text light', () => {
  it('starts with no line or accent', () => {
    expect(scrollAccent(1000, 1000, 160)).toMatchObject({ lineSweep: 0, lineVisible: false, accentLight: 0 });
  });
  it('has a full line midway, with the text light trailing it', () => {
    const frame = scrollAccent(500, 1000, 160);
    expect(frame.lineSweep).toBeCloseTo(1);
    expect(frame.lineVisible).toBe(true);
    expect(frame.segmentStart).toBe(0);
    expect(frame.segmentEnd).toBeLessThan(160);
    expect(frame.accentLight).toBe(1);
  });
  it('removes the line and text glow after their complete passage', () => {
    expect(scrollAccent(0, 1000, 160)).toMatchObject({ lineSweep: 2, lineVisible: false, accentLight: 0 });
  });
  it('hides subpixel line remnants before the endpoint', () => {
    const frame = scrollAccent(81, 1000, 160);
    expect(frame.lineSweep).toBeLessThan(2);
    expect(frame.lineVisible).toBe(false);
  });
});
