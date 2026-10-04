import { describe, expect, it } from 'vitest';
import { catalogEditorial } from './catalogEditorial';
import { emptyStock, publicCatalogSeo, type PublicStock, type PublicVehicle } from './publicVehicles';

function fixture(): PublicStock {
  const stock = emptyStock('ready');
  stock.catalog.total = 2;
  stock.catalog.items = ['A3', 'Q3'].map((model, i): PublicVehicle => ({
    slug: `audi-${model.toLowerCase()}-2022-012345abcdef`, brand: 'Audi', model,
    year: 2022 + i, fuel: 'GASOLINE', mileage: 50000, price: i ? null : '25000.00',
    currency: 'EUR', description: null, transmission: null, photos: [], availability: i ? 'RESERVED' : 'AVAILABLE',
  }));
  stock.catalog.facets.brands = [{ value: 'Audi', count: 2 }];
  stock.catalog.facets.models = [{ brand: 'Audi', value: 'A3', count: 1 }, { brand: 'Audi', value: 'Q3', count: 1 }];
  stock.catalog.facets.year = { min: 2022, max: 2023 };
  stock.catalog.facets.price = { min: '25000.00', max: '25000.00' };
  return stock;
}

describe('catalogue editorial guide', () => {
  it('uses actual filtered totals, dates and vehicle details', () => {
    const guide = catalogEditorial(new URLSearchParams('marca=Audi&ano_min=2020&ano_max=2020&pagina=2'), fixture());
    expect(guide.heading).toContain('Audi');
    expect(guide.intro).toContain('2 viaturas publicadas de 2022 a 2023');
    expect(guide.vehicles[1]?.detail).toContain('Preço sob consulta · Reservada');
  });
  it('changes automatically between brand, model and general views without retaining stale copy', () => {
    const stock = fixture();
    expect(catalogEditorial(new URLSearchParams('marca=Audi&modelo=A3'), stock).guides[0]?.text).toContain('Audi A3');
    const general = catalogEditorial(new URLSearchParams(), stock);
    expect(general.heading).not.toContain('Audi');
  });
  it('does not promote an unrecognised brand or an incompatible model', () => {
    const seo = publicCatalogSeo(new URLSearchParams('marca=Inventada&modelo=A3'), 'https://stand.example', fixture());
    expect(seo.label).toBe('');
    expect(seo.noindex).toBe(true);
  });
  it.each(['ready', 'invalid', 'unavailable'] as const)('has an honest %s empty state without phantom links or prices', status => {
    const guide = catalogEditorial(new URLSearchParams('marca=Audi'), emptyStock(status));
    expect(guide.hasResults).toBe(false);
    expect(guide.vehicles).toEqual([]);
    expect(guide.price).toBe('');
    expect(guide.intro).not.toContain('0 viaturas publicadas');
  });
  it('shows appropriate charging questions for an electric selection, without claiming range', () => {
    const guide = catalogEditorial(new URLSearchParams('combustivel=ELECTRIC'), fixture());
    expect(guide.guides[1]?.title).toContain('carregamento');
    expect(guide.guides[1]?.text).toContain('sem assumir uma autonomia');
  });
  it.each(['preco_max=30000', 'ano_min=2020', 'ordem=preco_asc', 'combustivel=DIESEL', 'q=carro'])('does not index arbitrary facet combinations: %s', query => {
    const seo = publicCatalogSeo(new URLSearchParams(`marca=Audi&${query}`), 'https://stand.example', fixture());
    expect(seo.noindex).toBe(true);
  });
  it('preserves established brand/model indexability and canonical pagination without broadening prototype policy', () => {
    const seo = publicCatalogSeo(new URLSearchParams('marca=Audi&modelo=A3&pagina=2'), 'https://stand.example', fixture());
    expect(seo.noindex).toBe(false);
    expect(seo.canonical).toBe('https://stand.example/viaturas?marca=Audi&modelo=A3&pagina=2');
  });
});
