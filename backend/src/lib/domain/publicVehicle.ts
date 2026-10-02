import { createHash } from 'node:crypto';
import { z } from 'zod';
import { publicSpecificationsSchema } from '@anm/types';

const fuelValues = ['GASOLINE', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC', 'LPG'] as const;
const fuelLabels: Record<string, (typeof fuelValues)[number]> = {
  Gasolina: 'GASOLINE',
  Diesel: 'DIESEL',
  Híbrido: 'HYBRID',
  'Híbrido Plug-in': 'PLUGIN_HYBRID',
  Elétrico: 'ELECTRIC',
  GPL: 'LPG',
};
const transmissionLabels: Record<string, 'MANUAL' | 'AUTOMATIC'> = {
  Manual: 'MANUAL',
  Automática: 'AUTOMATIC',
};
const textFilter = (max: number) => z.string().trim().min(1).max(max);
const numberFilter = (min: number, max: number, integer = true) =>
  z
    .string()
    .regex(integer ? /^\d{1,10}$/ : /^\d{1,10}(?:\.\d{1,2})?$/)
    .transform(Number)
    .pipe(integer ? z.number().int().min(min).max(max) : z.number().min(min).max(max));

/** Only scalar public query keys: arrays, objects and internal keys are errors. */
export const publicVehicleQuerySchema = z
  .object({
    q: textFilter(120).optional(),
    marca: textFilter(60).optional(),
    modelo: textFilter(80).optional(),
    ano_min: numberFilter(1950, 2200).optional(),
    ano_max: numberFilter(1950, 2200).optional(),
    km_min: numberFilter(0, 2_000_000).optional(),
    km_max: numberFilter(0, 2_000_000).optional(),
    preco_min: numberFilter(0, 9_999_999_999.99, false).optional(),
    preco_max: numberFilter(0, 9_999_999_999.99, false).optional(),
    combustivel: z
      .string()
      .transform((v) => fuelLabels[v] ?? v)
      .pipe(z.enum(fuelValues))
      .optional(),
    transmissao: z
      .string()
      .transform((v) => transmissionLabels[v] ?? v)
      .pipe(z.enum(['MANUAL', 'AUTOMATIC']))
      .optional(),
    ordem: z.enum(['relevancia', 'preco_asc', 'preco_desc', 'ano', 'km']).default('relevancia'),
    pagina: numberFilter(1, 1000).default('1'),
    pageSize: numberFilter(1, 30).default('9'),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.modelo && !v.marca) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['modelo'], message: 'Choose a brand before a model' });
    }
    for (const [min, max] of [
      ['ano_min', 'ano_max'],
      ['km_min', 'km_max'],
      ['preco_min', 'preco_max'],
    ] as const) {
      if (v[min] !== undefined && v[max] !== undefined && v[min]! > v[max]!) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [max],
          message: 'Maximum must not be below minimum',
        });
      }
    }
  });
export type PublicVehicleQuery = z.infer<typeof publicVehicleQuerySchema>;

export const publicSlugSchema = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{12,64}$/);
export const vehicleIdSchema = z.string().regex(/^c[a-z0-9]{24}$/);

/** No storage URL, traversal, encoded separator, or object in another namespace. */
export function isApprovedPhotoPath(id: string, path: string): boolean {
  return (
    vehicleIdSchema.safeParse(id).success &&
    new RegExp(
      `^${id}/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\.(?:jpg|jpeg|png|webp)$`,
    ).test(path)
  );
}

const publicPrice = z
  .string()
  .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
  .refine((v) => Number(v) > 0 && Number(v) <= 9_999_999_999.99, 'Price must be positive');
export const webPublicationSchema = z.discriminatedUnion('published', [
  z.object({ published: z.literal(false) }).strict(),
  z
    .object({
      published: z.literal(true),
      price: publicPrice.nullable(),
      description: z.string().trim().min(1).max(6000),
      photoPaths: z
        .array(z.string().max(160))
        .max(20)
        .refine((v) => new Set(v).size === v.length, 'Duplicate photos'),
      transmission: z.enum(['MANUAL', 'AUTOMATIC']).nullable(),
      specifications: publicSpecificationsSchema.optional(),
    })
    .strict(),
]);
export type WebPublication = z.infer<typeof webPublicationSchema>;

export const SLUG_SUFFIX_LENGTHS = [12, 16, 24, 64] as const;
/** Only public brand/model/year and a one-way hash of the immutable ID. */
export function makePublicSlug(
  vehicle: { id: string; brand: string; model: string; year: number },
  suffixLength = 12,
): string {
  const title =
    `${vehicle.brand}-${vehicle.model}-${vehicle.year}`
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 110)
      .replace(/-$/, '') || 'viatura';
  const suffix = createHash('sha256').update(vehicle.id).digest('hex').slice(0, suffixLength);
  return publicSlugSchema.parse(`${title}-${suffix}`);
}
