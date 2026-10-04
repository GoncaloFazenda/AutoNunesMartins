import { expect, it } from 'vitest';
import { brandLogo } from './brandLogos';

it('uses verified local assets for exact brand names, ignoring case and outer whitespace', () => {
  expect(brandLogo(' BMW ')).toBe('/images/brands/bmw.svg');
  expect(brandLogo('Renault')).toBe('/images/brands/renault.svg');
});
it.each(['renot', 'Renault Trucks', 'Inventada', '__proto__', 'constructor', '../renault'])('does not guess a logo for %s', name => {
  expect(brandLogo(name)).toBeUndefined();
});
