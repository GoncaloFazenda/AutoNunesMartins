import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('./publicVehicles', () => ({ publicRequest: vi.fn() }));
import { publicRequest } from './publicVehicles';
import { loadPublicBrands } from './publicBrands';

beforeEach(() => vi.clearAllMocks());
it('loads the available-brand projection without paginated inventory or visitor filters', async () => {
  const brands = [{ value: 'Audi', count: 4 }, { value: 'Volkswagen', count: 2 }];
  vi.mocked(publicRequest).mockResolvedValue(Response.json(brands));
  expect(await loadPublicBrands()).toEqual({ status: 'ready', brands });
  expect(publicRequest).toHaveBeenCalledWith('/brands');
});
it('reloads available stock rather than keeping a brand after its last car becomes unavailable', async () => {
  vi.mocked(publicRequest).mockResolvedValueOnce(Response.json([{ value: 'Audi', count: 1 }])).mockResolvedValueOnce(Response.json([]));
  expect((await loadPublicBrands()).brands).toHaveLength(1);
  expect(await loadPublicBrands()).toEqual({ status: 'ready', brands: [] });
  expect(publicRequest).toHaveBeenCalledTimes(2);
});
it('accepts an empty available selection without substituting reserved or demo brands', async () => {
  vi.mocked(publicRequest).mockResolvedValue(Response.json([]));
  expect(await loadPublicBrands()).toEqual({ status: 'ready', brands: [] });
});
it.each([404, 500, 503])('fails closed when the available-brand endpoint returns HTTP %i', async status => {
  vi.mocked(publicRequest).mockResolvedValue(new Response(null, { status }));
  expect(await loadPublicBrands()).toEqual({ status: 'unavailable', brands: [] });
});
it('rejects malformed data and handles network failure without mock brands', async () => {
  vi.mocked(publicRequest).mockResolvedValueOnce(Response.json([{ value: 'Audi', count: -1 }])).mockRejectedValueOnce(new Error('offline'));
  expect((await loadPublicBrands()).status).toBe('unavailable');
  expect((await loadPublicBrands()).status).toBe('unavailable');
});
