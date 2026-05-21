import { describe, expect, it } from 'vitest';
import { mostRecentSundayMidnight } from './sunday.js';

describe('mostRecentSundayMidnight', () => {
  function localISO(d: Date): string {
    // Strip time → YYYY-MM-DD in local time
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  it('on a Sunday afternoon, returns this Sunday 00:00', () => {
    // 2026-05-17 was a Sunday
    const sundayAfternoon = new Date(2026, 4, 17, 14, 30); // local time
    const r = mostRecentSundayMidnight(sundayAfternoon);
    expect(localISO(r)).toBe('2026-05-17');
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getDay()).toBe(0);
  });

  it('on a Monday, returns previous Sunday 00:00', () => {
    const monday = new Date(2026, 4, 18, 10, 0); // 2026-05-18 (Mon)
    const r = mostRecentSundayMidnight(monday);
    expect(localISO(r)).toBe('2026-05-17');
    expect(r.getDay()).toBe(0);
  });

  it('on a Saturday late night, returns Sunday from last week', () => {
    const saturday = new Date(2026, 4, 23, 23, 59); // 2026-05-23 (Sat)
    const r = mostRecentSundayMidnight(saturday);
    expect(localISO(r)).toBe('2026-05-17');
  });

  it('crosses month boundary correctly', () => {
    // 2026-06-01 is a Monday → most recent Sunday is 2026-05-31
    const monday = new Date(2026, 5, 1, 9, 0);
    const r = mostRecentSundayMidnight(monday);
    expect(localISO(r)).toBe('2026-05-31');
    expect(r.getDay()).toBe(0);
  });

  it('idempotent: feeding result back returns same value', () => {
    const t = new Date(2026, 4, 20, 15, 45);
    const a = mostRecentSundayMidnight(t);
    const b = mostRecentSundayMidnight(a);
    expect(a.getTime()).toBe(b.getTime());
  });
});
