import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyStock } from '$lib/publicVehicles';
vi.mock('$lib/server/publicVehicles', () => ({ loadPublicStock: vi.fn() }));
vi.mock('$lib/server/publicBrands', () => ({ loadPublicBrands: vi.fn() }));
import { loadPublicStock } from '$lib/server/publicVehicles';
import { loadPublicBrands } from '$lib/server/publicBrands';
import { load } from './+page.server';
const run = (query: string) => load({ url: new URL(`https://example.test/viaturas${query}`), setHeaders: vi.fn() } as unknown as Parameters<typeof load>[0]);
const brandDirectory = { status: 'ready' as const, brands: [{ value: 'Audi', count: 2 }, { value: 'Volkswagen', count: 1 }] };
beforeEach(() => {
  vi.mocked(loadPublicStock).mockReset();
  vi.mocked(loadPublicBrands).mockReset().mockResolvedValue(brandDirectory);
});
describe('catalogue URL restoration', () => {
  it('loads year choices without the selected year so the dropdown can change directly to another year', async () => {
    const selected = emptyStock('ready');
    selected.catalog.facets.year = { min: 2022, max: 2022 };
    const choices = emptyStock('ready');
    choices.catalog.facets.year = { min: 2020, max: 2024 };
    vi.mocked(loadPublicStock).mockResolvedValueOnce(selected).mockResolvedValueOnce(choices);
    expect(await run('?marca=Audi&ano_min=2022&ano_max=2022')).toEqual({ stock: selected, catalogYearRange: { min: 2020, max: 2024 }, brandDirectory });
    expect(vi.mocked(loadPublicStock).mock.calls[1]?.[0].toString()).toBe('marca=Audi');
  });
  it('normalizes orphan model URLs without querying independent models', async () => {
    await expect(run('?modelo=A3&pagina=2&preco_max=30000')).rejects.toMatchObject({ status: 307, location: '/viaturas?preco_max=30000' });
    expect(loadPublicStock).not.toHaveBeenCalled();
  });
  it('restores a page beyond stock to the last existing page', async () => {
    const stock = emptyStock('ready');
    Object.assign(stock.catalog, { page: 8, totalPages: 2, total: 14 });
    vi.mocked(loadPublicStock).mockResolvedValue(stock);
    await expect(run('?marca=Audi&pagina=8')).rejects.toMatchObject({ status: 307, location: '/viaturas?marca=Audi&pagina=2' });
  });
  it('returns a temporary failure instead of an indexable HTTP 200 during an API outage', async () => {
    vi.mocked(loadPublicStock).mockResolvedValue(emptyStock('unavailable'));
    const setHeaders = vi.fn();
    await expect(load({ url: new URL('https://example.test/viaturas'), setHeaders } as unknown as Parameters<typeof load>[0])).rejects.toMatchObject({ status: 503 });
    expect(setHeaders).toHaveBeenCalledWith({ 'retry-after': '120' });
  });
  it.each(['invalid', 'ready'] as const)('does not redirect an empty %s result in a loop', async status => {
    const stock = emptyStock(status);
    vi.mocked(loadPublicStock).mockResolvedValue(stock);
    expect(await run('?marca=Audi')).toEqual({ stock, catalogYearRange: stock.catalog.facets.year, brandDirectory });
  });
  it('keeps global available brands when the current filtered page has no results', async () => {
    const stock = emptyStock('ready');
    vi.mocked(loadPublicStock).mockResolvedValue(stock);
    const result = await run('?marca=Audi&combustivel=DIESEL&preco_max=10000&pagina=2');
    expect(result).toMatchObject({ stock, brandDirectory });
    expect(loadPublicBrands).toHaveBeenCalledTimes(1);
    expect(loadPublicBrands).toHaveBeenCalledWith();
  });
});
