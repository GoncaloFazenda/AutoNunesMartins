import { describe, expect, it } from 'vitest';
import {
  emptyStock,
  publicVehicleSchema,
  publicCatalogSchema,
  publicCard,
  publicCatalogSeo,
  publicPrice,
} from './publicVehicles';

export const vehicle = {
  slug: 'bmw-serie-1-2019-012345abcdef',
  brand: 'BMW',
  model: 'Série 1',
  year: 2019,
  fuel: 'DIESEL',
  mileage: 75000,
  price: '21900.25',
  currency: 'EUR',
  description: 'Descrição aprovada',
  transmission: null,
  availability: 'AVAILABLE',
  photos: ['/api/public/vehicles/bmw-serie-1-2019-012345abcdef/photos/0'],
};
describe('Public website projection', () => {
  it('keeps unknown price distinct from zero and supports photo-free reserved listings', () => {
    const parsed = publicVehicleSchema.parse({
      ...vehicle,
      price: null,
      photos: [],
      availability: 'RESERVED',
    });
    expect(publicCard(parsed).price).toBeNull();
    expect(publicPrice(parsed.price)).toBe('Preço sob consulta');
    expect(publicCard(parsed).category).toBe('Reservada');
    expect(publicVehicleSchema.safeParse({ ...vehicle, price: '0.00' }).success).toBe(false);
    expect(publicCard(publicVehicleSchema.parse(vehicle)).category).toBe('');
  });
  it('strips private or future fields at both vehicle and list boundaries', () => {
    const parsed = publicVehicleSchema.parse({
      ...vehicle,
      vin: 'PRIVATE',
      purchasePrice: 1,
      customer: { nif: 'SECRET' },
    });
    expect(parsed).toEqual(vehicle);
    const list = publicCatalogSchema.parse({
      ...emptyStock('ready').catalog,
      items: [parsed],
      total: 1,
      privateNotes: 'SECRET',
    });
    expect(JSON.stringify(list)).not.toMatch(/PRIVATE|SECRET|purchasePrice|privateNotes/);
  });
  it.each([
    'https://storage.example/private?token=secret',
    '/api/vehicles/private',
    '//evil.example/a',
    '/api/public/vehicles/other/photos/0',
  ])('rejects non-allowlisted photo %s', (photo) => {
    expect(publicVehicleSchema.safeParse({ ...vehicle, photos: [photo] }).success).toBe(false);
  });
  it.each(['SOLD', 'DRAFT', 'DELIVERED', 'DOCS_PENDING'])(
    'rejects availability %s',
    (availability) => {
      expect(publicVehicleSchema.safeParse({ ...vehicle, availability }).success).toBe(false);
    },
  );
  it('uses stable detail/photo URLs, preserves cents and never invents equipment', () => {
    const card = publicCard(publicVehicleSchema.parse(vehicle));
    expect(card.href).toBe(`/stand-orbit/viaturas/${vehicle.slug}`);
    expect(card.image).toBe(`${card.href}/photos/0`);
    expect(card).not.toHaveProperty('power');
    expect(card).not.toHaveProperty('transmission');
    expect(publicPrice(card.price)).toContain('900,25');
  });
  it('does not substitute a demo car for a missing approved photo', () => {
    const card = publicCard(
      publicVehicleSchema.parse({ ...vehicle, photos: [], availability: 'RESERVED' }),
    );
    expect(card.image).toBe('/catalog-placeholder.svg');
    expect(card.category).toBe('Reservada');
  });
  it.each(['ready', 'invalid', 'unavailable'] as const)(
    'has no fallback stock and noindexes empty %s',
    (status) => {
      const stock = emptyStock(status);
      expect(stock.catalog.items).toEqual([]);
      expect(publicCatalogSeo(new URLSearchParams(), 'https://stand.example', stock).noindex).toBe(
        true,
      );
    },
  );
  it('uses API facets and totals for SEO without prototype brands', () => {
    const stock = emptyStock('ready');
    stock.catalog.items = [publicVehicleSchema.parse(vehicle)];
    stock.catalog.total = 1;
    stock.catalog.facets.brands = [{ value: 'BMW', count: 1 }];
    stock.catalog.facets.models = [{ brand: 'BMW', value: 'Série 1', count: 1 }];
    const seo = publicCatalogSeo(
      new URLSearchParams('marca=BMW&modelo=Série+1&pagina=2'),
      'https://stand.example',
      stock,
    );
    expect(seo.heading).toBe('BMW Série 1 usados');
    expect(seo.description).toContain('1 resultado publicado');
    expect(seo.noindex).toBe(false);
    expect(seo.canonical).toContain('pagina=2');
    expect(
      publicCatalogSeo(new URLSearchParams('marca=Porsche'), 'https://stand.example', stock)
        .noindex,
    ).toBe(true);
  });
});
