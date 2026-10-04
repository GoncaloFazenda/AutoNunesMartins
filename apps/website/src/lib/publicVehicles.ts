import { z } from 'zod';
import { publicSpecificationsSchema } from '@anm/types';

export const fuelLabels = {
  GASOLINE: 'Gasolina',
  DIESEL: 'Diesel',
  HYBRID: 'Híbrido',
  PLUGIN_HYBRID: 'Híbrido Plug-in',
  ELECTRIC: 'Elétrico',
  LPG: 'GPL',
} as const;
export const transmissionLabels = { MANUAL: 'Manual', AUTOMATIC: 'Automática' } as const;
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{12,64}$/;
const money = z.string().regex(/^\d{1,10}\.\d{2}$/);
// Parse into a fresh allowlisted object. Unknown/internal fields never reach page data.
export const publicVehicleSchema = z
  .object({
    slug: z.string().max(180).regex(slugPattern),
    brand: z.string(),
    model: z.string(),
    year: z.number().int(),
    fuel: z.enum(['GASOLINE', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC', 'LPG']),
    mileage: z.number().int().nonnegative(),
    price: money.refine((v) => Number(v) > 0).nullable(),
    currency: z.literal('EUR'),
    description: z.string().nullable(),
    transmission: z.enum(['MANUAL', 'AUTOMATIC']).nullable(),
    specifications: publicSpecificationsSchema.optional(),
    availability: z.enum(['AVAILABLE', 'RESERVED']),
    photos: z.array(z.string()).max(20),
  })
  .superRefine((v, ctx) => {
    if (v.photos.some((path, i) => path !== `/api/public/vehicles/${v.slug}/photos/${i}`)) {
      ctx.addIssue({ code: 'custom', path: ['photos'], message: 'Invalid public photo path' });
    }
  });
export type PublicVehicle = z.infer<typeof publicVehicleSchema>;
const facet = z.object({ value: z.string(), count: z.number().int().nonnegative() });
export const publicBrandFacetsSchema = z.array(facet);
const range = z.object({ min: z.number().nullable(), max: z.number().nullable() });
export const publicCatalogSchema = z.object({
  items: z.array(publicVehicleSchema).max(30),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1).max(1000),
  pageSize: z.number().int().min(1).max(30),
  totalPages: z.number().int().nonnegative(),
  facets: z.object({
    brands: publicBrandFacetsSchema.max(100),
    models: z.array(facet.extend({ brand: z.string() })).max(100),
    fuels: z.array(facet),
    transmissions: z.array(facet),
    year: range,
    mileage: range,
    price: z.object({ min: money.nullable(), max: money.nullable() }),
  }),
});
export type PublicCatalog = z.infer<typeof publicCatalogSchema>;
export type PublicStock = { catalog: PublicCatalog; status: 'ready' | 'unavailable' | 'invalid' };
export function emptyStock(status: PublicStock['status']): PublicStock {
  return {
    status,
    catalog: {
      items: [],
      total: 0,
      page: 1,
      pageSize: 9,
      totalPages: 0,
      facets: {
        brands: [],
        models: [],
        fuels: [],
        transmissions: [],
        year: { min: null, max: null },
        mileage: { min: null, max: null },
        price: { min: null, max: null },
      },
    },
  };
}
export const publicPrice = (value: string | number | null) =>
  value === null
    ? 'Preço sob consulta'
    : new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: Number(value) % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(Number(value));
export const publicHref = (slug: string) => `/viaturas/${slug}`;
export const publicPhoto = (slug: string, index: number) => `${publicHref(slug)}/photos/${index}`;
export function publicCard(vehicle: PublicVehicle) {
  return {
    id: vehicle.slug,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    km: vehicle.mileage,
    fuel: fuelLabels[vehicle.fuel],
    price: vehicle.price === null ? null : Number(vehicle.price),
    image: vehicle.photos.length ? publicPhoto(vehicle.slug, 0) : '/catalog-placeholder.svg',
    category: vehicle.availability === 'RESERVED' ? 'Reservada' : '',
    href: publicHref(vehicle.slug),
    approved: true as const,
  };
}
export type PublicCard = ReturnType<typeof publicCard>;

export function publicCatalogSeo(params: URLSearchParams, origin: string, stock: PublicStock) {
  const brand =
    stock.catalog.facets.brands.find(
      (v) => v.value.toLowerCase() === params.get('marca')?.toLowerCase(),
    )?.value ?? '';
  const model =
    stock.catalog.facets.models.find(
      (v) =>
        !!brand && v.brand === brand &&
        v.value.toLowerCase() === params.get('modelo')?.toLowerCase(),
    )?.value ?? '';
  const label = [brand, model].filter(Boolean).join(' ');
  const heading = label ? `${label} usados` : 'Viaturas usadas';
  const canonical = new URL('/viaturas', origin);
  for (const key of [
    'q',
    'marca',
    'modelo',
    'preco_min',
    'preco_max',
    'ano_min',
    'ano_max',
    'km_min',
    'km_max',
    'combustivel',
    'transmissao',
    'ordem',
    'pagina',
  ]) {
    const value = params.get(key)?.trim();
    if (
      value &&
      !(key === 'pagina' && value === '1') &&
      !(key === 'ordem' && value === 'relevancia')
    )
      canonical.searchParams.set(key, value);
  }
  return {
    brand,
    model,
    label,
    heading,
    canonical: canonical.href,
    description: stock.status !== 'ready'
      ? 'Consulte o catálogo de viaturas usadas da Auto Nunes Martins ou contacte-nos para esclarecer a sua pesquisa.'
      : stock.catalog.total === 0
        ? 'Não há viaturas para esta pesquisa. Ajuste os filtros ou explore o catálogo de usados da Auto Nunes Martins.'
        : `${heading}. ${stock.catalog.total} ${stock.catalog.total === 1 ? 'resultado publicado' : 'resultados publicados'}. Compare preço, ano e quilometragem na Auto Nunes Martins.`,
    contextual: label
      ? `Explore ${label} nesta seleção de viaturas publicadas. Compare os dados de cada ficha e confirme connosco o histórico e as condições antes de decidir.`
      : '',
    noindex:
      stock.status !== 'ready' ||
      !stock.catalog.items.length ||
      // Only the established catalogue/brand/model pages remain candidates for indexing.
      // Search, sort and arbitrary facet combinations are useful UI, not new landing pages.
      [...params].some(([key, value]) => !!value && !['marca', 'modelo', 'pagina'].includes(key) && !(key === 'ordem' && value === 'relevancia')) ||
      !!params.get('q') ||
      (!!params.get('marca') && !brand) ||
      (!!params.get('modelo') && !model),
  };
}
