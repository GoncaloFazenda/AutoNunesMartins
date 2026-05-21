import { describe, expect, it } from 'vitest';
import { isValidNIF, nifSchema } from './nif.js';

describe('NIF validation (digits-only, max 9)', () => {
  it('accepts any digit-only string (isValidNIF ignores length)', () => {
    expect(isValidNIF('1')).toBe(true);
    expect(isValidNIF('923123827')).toBe(true);
  });

  it('rejects empty input', () => {
    expect(isValidNIF('')).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    expect(isValidNIF('12345678a')).toBe(false);
    expect(isValidNIF('123-456-789')).toBe(false);
    expect(isValidNIF('123 456 789')).toBe(false);
  });

  it('zod schema accepts a real 9-digit NIF', () => {
    const result = nifSchema.safeParse('923123827');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('923123827');
  });

  it('zod schema accepts shorter digit strings', () => {
    expect(nifSchema.safeParse('1').success).toBe(true);
    expect(nifSchema.safeParse('12345').success).toBe(true);
  });

  it('zod schema rejects more than 9 digits', () => {
    const result = nifSchema.safeParse('1234567890');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/9 dígitos/);
    }
  });

  it('zod schema returns useful error for non-digit input', () => {
    const result = nifSchema.safeParse('abc');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/dígitos/);
    }
  });

  it('zod schema trims surrounding whitespace', () => {
    const result = nifSchema.safeParse('  923123827  ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('923123827');
  });
});
