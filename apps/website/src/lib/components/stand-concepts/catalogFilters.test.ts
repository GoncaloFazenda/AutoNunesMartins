import { describe, expect, it } from 'vitest';
import { emptyStock } from '$lib/publicVehicles';
import { catalogInputErrors, catalogModelOptions } from './catalogFilters';
import { catalogUrl } from './catalog';

describe('catalogue filter contract', () => {
  const stock = emptyStock('ready');
  stock.catalog.facets.brands = [{ value: 'Audi', count: 2 }, { value: 'BMW', count: 1 }];
  stock.catalog.facets.models = [{ brand: 'Audi', value: 'A3', count: 2 }, { brand: 'BMW', value: 'Série 1', count: 1 }];
  it('uses brand-scoped API facets, even when current page has no items', () => {
    expect(catalogModelOptions(new URLSearchParams(), stock).models).toEqual([]);
    expect(catalogModelOptions(new URLSearchParams('marca=unknown'), stock).models).toEqual([]);
    expect(catalogModelOptions(new URLSearchParams('marca=audi'), stock).models).toEqual(['A3']);
    expect(catalogModelOptions(new URLSearchParams('marca=BMW'), stock).models).toEqual(['Série 1']);
  });
  it.each(['BMW', ''])('resets dependent model and page when brand becomes %s', brand => {
    const next = new URL(catalogUrl(new URLSearchParams('marca=Audi&modelo=A3&pagina=2&km_max=50000'), 'marca', brand), 'https://example.test');
    expect(next.searchParams.has('modelo')).toBe(false);
    expect(next.searchParams.has('pagina')).toBe(false);
    expect(next.searchParams.get('km_max')).toBe('50000');
  });
  it('composes rapid edits from the latest draft', () => {
    const first = new URL(catalogUrl(new URLSearchParams(), 'preco_min', '10000.25'), 'https://example.test');
    const next = new URL(catalogUrl(first.searchParams, 'preco_max', '20000.50'), first);
    expect(next.searchParams.get('preco_min')).toBe('10000.25');
    expect(next.searchParams.get('preco_max')).toBe('20000.50');
  });
  it('accepts server bounds and decimal prices', () => {
    expect(catalogInputErrors(new URLSearchParams('preco_min=0&preco_max=9999999999.99&ano_min=1950&ano_max=2200&km_min=0&km_max=2000000'))).toEqual([]);
  });
  it.each(['preco_min=-1', 'preco_max=20.123', 'ano_min=1949', 'ano_max=2201', 'km_max=1.5', 'km_max=2000001', 'preco_min=20&preco_max=10', 'ano_min=2024&ano_max=2020', 'km_min=20&km_max=10', 'modelo=A3', `q=${'x'.repeat(121)}`])('validates %s without sending invalid drafts', query => {
    expect(catalogInputErrors(new URLSearchParams(query)).length).toBeGreaterThan(0);
  });
  it('trims text and omits the default sort and orphan models', () => {
    expect(catalogUrl(new URLSearchParams(), 'q', '  Audi  ')).toContain('q=Audi');
    expect(catalogUrl(new URLSearchParams('modelo=A3'), 'ordem', 'relevancia')).toBe('/stand-orbit/viaturas');
  });
});
