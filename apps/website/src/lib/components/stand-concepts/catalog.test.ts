import { describe, expect, it } from 'vitest';
import { cars } from './data';
import { catalogCars, additionalDemoCars, transmissionFor } from './catalogDemo';
import { catalogResults, catalogUrl, catalogSeo, PAGE_SIZE } from './catalog';
const params = (query = '') => new URLSearchParams(query);

describe('Orbit demonstration catalogue', () => {
  it('keeps the original five objects and adds eleven clearly marked mock listings', () => {
    expect(cars).toHaveLength(5);
    expect(catalogCars).toHaveLength(16);
    expect(catalogCars.slice(0, 5)).toEqual(cars);
    expect(additionalDemoCars.every((car) => car.isDemo && car.id.startsWith('demo-'))).toBe(true);
    expect(new Set(catalogCars.map((car) => car.id)).size).toBe(16);
  });
  it('paginates nine and seven, without duplication', () => {
    const first = catalogResults(params());
    const second = catalogResults(params('pagina=2'));
    expect(PAGE_SIZE).toBe(9);
    expect(first.items).toHaveLength(9);
    expect(second.items).toHaveLength(7);
    expect(new Set([...first.items, ...second.items].map((car) => car.id)).size).toBe(16);
    expect(second.pages).toBe(2);
  });
  it('clamps invalid and out-of-range page numbers', () => {
    expect(catalogResults(params('pagina=999')).page).toBe(2);
    for (const page of ['0', '-1', 'NaN', 'Infinity'])
      expect(catalogResults(params(`pagina=${page}`)).page).toBe(1);
  });
  it('filters BMW and its dependent Série 1 models', () => {
    expect(catalogResults(params('marca=BMW')).total).toBe(4);
    expect(catalogResults(params('marca=BMW&modelo=Série+1')).total).toBe(2);
    expect(catalogResults(params('marca=Toyota')).items[0]?.model).toBe('Yaris');
  });
  it('searches case- and accent-insensitively, including versions', () => {
    expect(catalogResults(params('q=SERIE+1')).total).toBe(2);
    expect(catalogResults(params('q=116d')).items[0]?.id).toBe('demo-bmw-serie-1');
  });
  it('combines inclusive price, year, mileage, fuel and transmission bounds', () => {
    const result = catalogResults(
      params(
        'preco_min=20000&preco_max=23000&ano_min=2023&ano_max=2023&km_max=18200&combustivel=Híbrido&transmissao=Automática',
      ),
    );
    expect(result.total).toBe(1);
    expect(result.items[0]?.model).toBe('Yaris');
  });
  it('filters manual and automatic without changing original detail assumptions', () => {
    expect(catalogResults(params('transmissao=Manual')).total).toBe(8);
    expect(catalogResults(params('transmissao=Automática')).total).toBe(8);
    expect(transmissionFor(cars[0]!)).toBe('Automática');
  });
  it('handles zero results and inverted ranges', () => {
    expect(catalogResults(params('q=inexistente')).total).toBe(0);
    expect(catalogResults(params('preco_min=90000&preco_max=10000')).total).toBe(0);
    expect(catalogResults(params('ano_min=2025&ano_max=2020')).total).toBe(0);
  });
  it('sorts price both ways, year and mileage and retains stable relevance', () => {
    expect(catalogResults(params('ordem=preco_asc')).items[0]?.price).toBe(12400);
    expect(catalogResults(params('ordem=preco_desc')).items[0]?.price).toBe(112900);
    expect(catalogResults(params('ordem=ano')).items[0]?.year).toBe(2023);
    expect(catalogResults(params('ordem=km')).items[0]?.km).toBe(18200);
    expect(catalogResults(params()).items[0]?.id).toBe(cars[0]?.id);
  });
  it('resets pagination on filter/sort changes and model on brand changes', () => {
    const url = catalogUrl(params('marca=BMW&modelo=Série+1&pagina=2'), 'marca', 'Toyota');
    expect(url).toBe('/viaturas?marca=Toyota');
    expect(catalogUrl(params('marca=BMW&pagina=2'), 'ordem', 'ano')).not.toContain('pagina');
    expect(catalogUrl(params('marca=BMW'), 'pagina', '2')).toContain('marca=BMW&pagina=2');
  });
  it('round-trips a shared filtered URL', () => {
    const url = catalogUrl(params('marca=BMW&ordem=preco_asc'), 'modelo', 'Série 1');
    expect(catalogResults(new URL(url, 'https://example.test').searchParams).total).toBe(2);
  });
  it('updates headings, descriptions and contextual copy with brand/model', () => {
    expect(catalogSeo(params(), 'https://example.test').heading).toBe(
      'Viaturas usadas disponíveis',
    );
    expect(catalogSeo(params('marca=BMW'), 'https://example.test').heading).toBe(
      'Viaturas BMW usadas',
    );
    const seo = catalogSeo(params('marca=BMW&modelo=Série+1'), 'https://example.test');
    expect(seo.heading).toBe('BMW Série 1 usados');
    expect(seo.description).toContain('2 resultados');
    expect(seo.contextual).toContain('BMW');
    expect(seo.label).toBe('BMW Série 1');
  });
  it('uses clean canonical URLs and excludes prototype and empty variants from indexing', () => {
    expect(
      catalogSeo(
        params('marca=BMW&utm_source=test&pagina=1&ordem=relevancia'),
        'https://example.test',
      ).canonical,
    ).toBe('https://example.test/viaturas?marca=BMW');
    expect(catalogSeo(params('pagina=2'), 'https://example.test').canonical).toContain('pagina=2');
    expect(catalogSeo(params(), 'https://example.test').noindex).toBe(true);
    expect(catalogSeo(params('q=nothing'), 'https://example.test').noindex).toBe(true);
  });
});
