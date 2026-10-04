import { describe, expect, it } from 'vitest';
import { passedHomeStats, whatsappUrl } from './whatsappContact';

describe('WhatsApp click-to-chat configuration', () => {
  it('requires confirmation for live contacts', () => {
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl({ international: '+12025550147', confirmed: false })).toBeNull();
  });
  it('permits only the fictional range in demo mode', () => {
    expect(whatsappUrl({ international: '+12025550147', confirmed: false, demo: true })).toBe('https://wa.me/12025550147');
    expect(whatsappUrl({ international: '+351210000000', confirmed: true, demo: true })).toBeNull();
  });
  it.each(['351210000000', '+0123456789', '+123', '+1234567890123456', '+351 210 000 000', 'https://evil.test', '+12025550147?text=bad'])('rejects malformed international number %s', international => {
    expect(whatsappUrl({ international, confirmed: true })).toBeNull();
  });
  it('encodes optional text without injecting URL parameters', () => {
    const url = new URL(whatsappUrl({ international: '+12025550147', confirmed: true, message: 'Olá & informação?' })!);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/12025550147');
    expect([...url.searchParams]).toEqual([['text', 'Olá & informação?']]);
  });
  it('waits for the real stats section and follows its lower boundary in both scroll directions', () => {
    expect([null, 900, 200, .5, 0, -1, -500, 1, 900, null].map(passedHomeStats))
      .toEqual([false, false, false, false, true, true, true, false, false, false]);
    expect(passedHomeStats(Number.NaN)).toBe(false);
    expect(passedHomeStats(Infinity)).toBe(false);
  });
});
