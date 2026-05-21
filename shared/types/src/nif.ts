import { z } from 'zod';

/**
 * Minimal NIF validation: digits only.
 *
 * No prefix table, no mod-11 checksum, no length requirement —
 * we just make sure the value is numeric so accidental letters/spaces
 * get caught.
 */
export function isValidNIF(input: string): boolean {
  return /^\d+$/.test(input);
}

export const nifSchema = z
  .string()
  .trim()
  .min(1, 'NIF obrigatório')
  .max(9, 'NIF tem no máximo 9 dígitos')
  .regex(/^\d+$/, 'NIF deve conter apenas dígitos');

export type NIF = z.infer<typeof nifSchema>;
