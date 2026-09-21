import { describe, expect, it } from 'vitest';
import { responsivePhoto } from './images';

describe('responsive demo images', () => {
  it('offers real CDN variants with bounded widths', () => {
    const result = responsivePhoto('photo-1503376780353-7e6692767b70', 1280)!;
    expect(result).toContain('w=320&q=80 320w');
    expect(result).toContain('w=1280&q=80 1280w');
    expect(result).not.toContain('1920w');
  });
  it.each([
    '/api/public/vehicles/car/photos/0',
    '/catalog-placeholder.svg',
    'https://example.com/image.jpg',
    'photo-x?secret=yes',
  ])('does not fabricate variants or forward arbitrary URLs: %s', (path) => {
    expect(responsivePhoto(path)).toBeUndefined();
  });
});
