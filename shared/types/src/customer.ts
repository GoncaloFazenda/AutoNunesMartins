import { z } from 'zod';
import { nifSchema } from './nif.js';

export const customerCreateSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\d{9}$/, 'Telefone deve ter 9 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  address: z.string().max(240).optional(),
  nif: nifSchema,
  notes: z.string().max(4000).optional(),
});
export type CustomerCreate = z.infer<typeof customerCreateSchema>;

export const customerUpdateSchema = customerCreateSchema.partial().extend({
  id: z.string().min(1),
});
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>;
