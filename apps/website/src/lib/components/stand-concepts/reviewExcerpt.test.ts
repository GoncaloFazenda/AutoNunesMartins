import { describe, expect, it } from 'vitest';
import { reviewExcerpt, REVIEW_PREVIEW_CHARS } from './reviewExcerpt';

describe('review preview', () => {
  it('preserves short reviews and the exact limit', () => {
    for (const text of ['', 'Muito bom.', 'a'.repeat(REVIEW_PREVIEW_CHARS)]) {
      expect(reviewExcerpt(text)).toEqual({ text, truncated: false });
    }
  });
  it('truncates longer reviews at a word boundary', () => {
    expect(reviewExcerpt('Muito bom atendimento e atenção.', 16)).toEqual({ text: 'Muito bom…', truncated: true });
  });
  it('never exceeds the limit, including the ellipsis', () => {
    const result = reviewExcerpt('a'.repeat(200));
    expect(Array.from(result.text)).toHaveLength(REVIEW_PREVIEW_CHARS);
    expect(result.truncated).toBe(true);
  });
  it('does not split Unicode code points', () => {
    expect(reviewExcerpt('🚗'.repeat(130)).text).toBe('🚗'.repeat(119) + '…');
  });
});
