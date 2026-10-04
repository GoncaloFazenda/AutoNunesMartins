import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('$lib/server/publicVehicles', () => ({ loadPublicVehicle: vi.fn() }));
import { loadPublicVehicle } from '$lib/server/publicVehicles';
import { GET } from './dados/+server';
const ids = ['audi-2022-012345abcdef', 'bmw-2020-012345abcdef', 'dacia-2023-012345abcdef', 'tesla-2021-012345abcdef'];
const request = (query: string) => GET({ url: new URL(`http://site.test/comparar/dados?${query}`) } as Parameters<typeof GET>[0]);
beforeEach(() => vi.mocked(loadPublicVehicle).mockReset());
describe('Public comparison endpoint', () => {
  it.each(['id=porsche-911', 'id=../private', 'vin=secret', `id=${ids[0]}&id=${ids[0]}`, ids.map(id => `id=${id}`).join('&')])('rejects invalid selections before any lookup: %s', async query => {
    expect((await request(query)).status).toBe(400);
    expect(loadPublicVehicle).not.toHaveBeenCalled();
  });
  it('loads each selected slug directly, including vehicles outside the first catalogue page', async () => {
    vi.mocked(loadPublicVehicle).mockResolvedValue({ status: 404, vehicle: null });
    const response = await request(ids.slice(0, 3).map(id => `id=${id}`).join('&'));
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(loadPublicVehicle).toHaveBeenCalledTimes(3);
    expect((await response.json()).items.map((item: { id: string }) => item.id)).toEqual(ids.slice(0, 3));
  });
  it('refreshes lookups on every request and preserves not-published vs service-error states', async () => {
    vi.mocked(loadPublicVehicle).mockResolvedValueOnce({ status: 404, vehicle: null }).mockResolvedValueOnce({ status: 503, vehicle: null });
    expect((await (await request(`id=${ids[0]}`)).json()).items[0].status).toBe(404);
    expect((await (await request(`id=${ids[0]}`)).json()).items[0].status).toBe(503);
    expect(loadPublicVehicle).toHaveBeenCalledTimes(2);
  });
});
