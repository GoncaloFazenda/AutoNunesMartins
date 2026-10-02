import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyStock } from '$lib/publicVehicles';
vi.mock('$lib/server/publicVehicles', () => ({ loadPublicStock: vi.fn() }));
import { loadPublicStock } from '$lib/server/publicVehicles';
import { load } from './+page.server';
const run = (query: string) => load({ url: new URL(`https://example.test/stand-orbit/viaturas${query}`), setHeaders: vi.fn() } as unknown as Parameters<typeof load>[0]);
beforeEach(() => vi.mocked(loadPublicStock).mockReset());
describe('catalogue URL restoration', () => {
  it('normalizes orphan model URLs without querying independent models', async () => {
    await expect(run('?modelo=A3&pagina=2&preco_max=30000')).rejects.toMatchObject({ status: 307, location: '/stand-orbit/viaturas?preco_max=30000' });
    expect(loadPublicStock).not.toHaveBeenCalled();
  });
  it('restores a page beyond stock to the last existing page', async () => {
    const stock = emptyStock('ready');
    Object.assign(stock.catalog, { page: 8, totalPages: 2, total: 14 });
    vi.mocked(loadPublicStock).mockResolvedValue(stock);
    await expect(run('?marca=Audi&pagina=8')).rejects.toMatchObject({ status: 307, location: '/stand-orbit/viaturas?marca=Audi&pagina=2' });
  });
  it.each(['invalid', 'unavailable', 'ready'] as const)('does not redirect an empty %s result in a loop', async status => {
    const stock = emptyStock(status);
    vi.mocked(loadPublicStock).mockResolvedValue(stock);
    expect(await run('?marca=Audi')).toEqual({ stock });
  });
});
