import { describe, expect, it, vi } from 'vitest';
import { emptyStock, type PublicVehicle } from '$lib/publicVehicles';
vi.mock('./publicVehicles', () => ({ loadPublicStock: vi.fn() }));
import { publicSitemap } from './publicSitemap';

const vehicle = (index: number): PublicVehicle => ({
  slug: `audi-a3-2020-${index.toString(16).padStart(12, '0')}`, brand: 'Audi', model: 'A3', year: 2020,
  mileage: 10000, fuel: 'GASOLINE', transmission: null, price: null, currency: 'EUR', description: null,
  availability: 'AVAILABLE', photos: [],
});
const page = (number: number, total = 14) => {
  const stock = emptyStock('ready');
  Object.assign(stock.catalog, { page: number, total, totalPages: Math.ceil(total / 9),
    items: Array.from({ length: Math.max(0, Math.min(9, total - (number - 1) * 9)) }, (_, i) => vehicle((number - 1) * 9 + i)),
  });
  stock.catalog.facets.brands = [{ value: 'Audi', count: total }];
  return stock;
};

describe('public sitemap', () => {
  it('includes every public vehicle across pages, public entry points and canonical brand URLs', async () => {
    const load = vi.fn(async (params: URLSearchParams) => page(Number(params.get('pagina') ?? 1)));
    const xml = await publicSitemap('https://stand.example', load);
    for (let i = 0; i < 14; i++) expect(xml).toContain(`<loc>https://stand.example/viaturas/${vehicle(i).slug}</loc>`);
    expect(xml).toContain('<loc>https://stand.example/</loc>');
    expect(xml).toContain('<loc>https://stand.example/quem-somos</loc>');
    expect(xml).toContain('<loc>https://stand.example/viaturas?pagina=2</loc>');
    expect(xml).toContain('<loc>https://stand.example/viaturas?marca=Audi</loc>');
    expect(xml).not.toMatch(/demo|favoritos|comparar|lastmod|pagina=1|pageSize/);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('rejects partial results when a later page fails', async () => {
    const load = vi.fn().mockResolvedValueOnce(page(1)).mockResolvedValueOnce(emptyStock('unavailable'));
    await expect(publicSitemap('https://stand.example', load)).rejects.toThrow();
  });
  it('rejects stock changes or duplicate results instead of silently omitting a vehicle', async () => {
    const second = page(2);
    second.catalog.items[0] = vehicle(0);
    const load = vi.fn().mockResolvedValueOnce(page(1)).mockResolvedValueOnce(second);
    await expect(publicSitemap('https://stand.example', load)).rejects.toThrow();
  });
  it('keeps public static pages but omits a noindex empty catalogue', async () => {
    const xml = await publicSitemap('https://stand.example', async () => emptyStock('ready'));
    expect(xml).toContain('/quem-somos</loc>');
    expect(xml).not.toContain('/viaturas');
  });
  it('encodes non-ASCII and special brand characters without creating extra query parameters', async () => {
    const stock = page(1, 1);
    stock.catalog.facets.brands = [{ value: 'Marca & É', count: 1 }];
    const xml = await publicSitemap('https://stand.example', async () => stock);
    expect(xml).toContain('/viaturas?marca=Marca+%26+%C3%89</loc>');
  });
});
