import { expect, it } from 'vitest';
import { catalogBrandLinks } from './catalogBrandLinks';

it('links every populated brand facet, independent of paginated vehicle items', () => {
  expect(catalogBrandLinks([{ value: 'Audi', count: 5 }, { value: 'Volkswagen', count: 2 }, { value: 'Esgotada', count: 0 }]))
    .toEqual([
      { name: 'Audi', count: 5, href: '/viaturas?marca=Audi', current: false },
      { name: 'Volkswagen', count: 2, href: '/viaturas?marca=Volkswagen', current: false },
    ]);
});

it('preserves published names, safely encodes a brand, and starts at the first page', () => {
  const params = new URLSearchParams('marca=audi&pagina=3&preco_max=30000&modelo=A3');
  const links = catalogBrandLinks([{ value: 'Audi', count: 1 }, { value: 'Nome & Companhia', count: 1 }, { value: 'renot', count: 1 }], params);
  expect(links[0]?.current).toBe(true);
  const destination = new URL(links[1]!.href, 'https://stand.example');
  expect(destination.searchParams.get('marca')).toBe('Nome & Companhia');
  expect(destination.searchParams.get('preco_max')).toBe('30000');
  expect(destination.searchParams.has('pagina')).toBe(false);
  expect(destination.searchParams.has('modelo')).toBe(false);
  expect(links[2]?.name).toBe('renot');
  expect(params.get('pagina')).toBe('3');
});

it('has no placeholder brands for empty facets', () => { expect(catalogBrandLinks([])).toEqual([]); });
