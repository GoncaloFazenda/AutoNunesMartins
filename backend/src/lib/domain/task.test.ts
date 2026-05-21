import { describe, expect, it } from 'vitest';
import { shiftRecurrence } from './task.js';

describe('shiftRecurrence', () => {
  it('NONE returns same date (cloned)', () => {
    const d = new Date('2026-05-20T10:00:00Z');
    const r = shiftRecurrence(d, 'NONE');
    expect(r.toISOString()).toBe(d.toISOString());
    expect(r).not.toBe(d);
  });

  it('MONTHLY shifts by one month', () => {
    const r = shiftRecurrence(new Date('2026-05-20T10:00:00Z'), 'MONTHLY');
    expect(r.toISOString().slice(0, 10)).toBe('2026-06-20');
  });

  it('MONTHLY on Jan 31 clamps to Feb 28 in non-leap year', () => {
    const r = shiftRecurrence(new Date('2026-01-31T10:00:00Z'), 'MONTHLY');
    expect(r.toISOString().slice(0, 10)).toBe('2026-02-28');
  });

  it('MONTHLY on Jan 31 clamps to Feb 29 in leap year', () => {
    const r = shiftRecurrence(new Date('2028-01-31T10:00:00Z'), 'MONTHLY');
    expect(r.toISOString().slice(0, 10)).toBe('2028-02-29');
  });

  it('ANNUAL shifts by one year', () => {
    const r = shiftRecurrence(new Date('2026-05-20T10:00:00Z'), 'ANNUAL');
    expect(r.toISOString().slice(0, 10)).toBe('2027-05-20');
  });

  it('ANNUAL on Feb 29 leap year clamps to Feb 28 next year', () => {
    const r = shiftRecurrence(new Date('2028-02-29T10:00:00Z'), 'ANNUAL');
    expect(r.toISOString().slice(0, 10)).toBe('2029-02-28');
  });
});
