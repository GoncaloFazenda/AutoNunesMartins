import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadSelectedVehicles } from './selectedVehicles';
const ids = ['audi-012345abcdef', 'bmw-012345abcdef', 'dacia-012345abcdef', 'tesla-012345abcdef'];
const vehicle = { slug: ids[0], brand: 'Audi', model: 'A3', year: 2022, mileage: 12, fuel: 'GASOLINE', price: null, currency: 'EUR', description: null, transmission: null, availability: 'AVAILABLE', photos: [] };
afterEach(() => vi.unstubAllGlobals());
describe('Fresh selected vehicle data', () => {
  it('loads favorites in bounded batches and retains selection order', async () => {
    const fetcher = vi.fn().mockImplementation(async (url: string) => Response.json({ items: new URL(url, 'http://site.test').searchParams.getAll('id').reverse().map(id => ({ id, status: 404, vehicle: null })) }));
    vi.stubGlobal('fetch', fetcher);
    const result = await loadSelectedVehicles(ids, new AbortController().signal);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.map(item => item.id)).toEqual(ids);
    expect(fetcher.mock.calls[0]![1]).toMatchObject({ cache: 'no-store', credentials: 'omit' });
  });
  it('strips private fields and refuses mismatched data instead of using a stale snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ items: [
      { id: ids[0], status: 200, vehicle: { ...vehicle, vin: 'SECRET', privateNotes: 'SECRET' } },
      { id: ids[1], status: 200, vehicle },
    ] })));
    const result = await loadSelectedVehicles(ids.slice(0, 2), new AbortController().signal);
    expect(result[0]?.status).toBe(200); expect(JSON.stringify(result)).not.toContain('SECRET');
    expect(result[1]).toEqual({ id: ids[1], status: 503, vehicle: null });
  });
  it.each([null, {}, { items: [null] }, { items: 'invalid' }])('tolerates malformed response %j', async data => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)));
    expect((await loadSelectedVehicles([ids[0]!], new AbortController().signal))[0]?.status).toBe(503);
  });
  it('represents offline and no-longer-public vehicles without fabricated fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect((await loadSelectedVehicles([ids[0]!], new AbortController().signal))[0]?.vehicle).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ items: [{ id: ids[0], status: 404, vehicle: { ...vehicle, availability: 'SOLD' } }] })));
    expect((await loadSelectedVehicles([ids[0]!], new AbortController().signal))[0]).toEqual({ id: ids[0], status: 404, vehicle: null });
  });
});
