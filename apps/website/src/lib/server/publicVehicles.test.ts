import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('$env/static/public', () => ({ PUBLIC_BACKEND_URL: 'http://public-backend.test:3001' }));
import { loadPublicStock, loadPublicVehicle, publicRequest } from './publicVehicles';
import { emptyStock } from '../publicVehicles';

afterEach(() => vi.unstubAllGlobals());
describe('Public BFF without CRM authentication', () => {
  it('rejects a model without a brand before fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await loadPublicStock(new URLSearchParams('modelo=A3'))).status).toBe('invalid');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('requests only the public API with no forwarded cookies or authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    await publicRequest('?marca=BMW');
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('http://public-backend.test:3001/api/public/vehicles?marca=BMW');
    expect(init.headers).toEqual({ accept: 'application/json' });
    expect(init.credentials).toBe('omit');
    expect(init.redirect).toBe('error');
    expect(init.cache).toBe('no-store');
  });
  it.each([400, 404, 500, 503])('does not substitute mock inventory on HTTP %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    const result = await loadPublicStock(new URLSearchParams());
    expect(result.catalog.items).toEqual([]);
    expect(result.status).toBe(status === 400 ? 'invalid' : 'unavailable');
  });
  it('preserves repeated and unknown filters for rejection by the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);
    await loadPublicStock(new URLSearchParams('marca=BMW&marca=Audi&vin=not-allowed'));
    expect(String(fetchMock.mock.calls[0]![0])).toContain('marca=BMW&marca=Audi&vin=not-allowed');
  });
  it('preserves catalogue pagination and page size', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(emptyStock('ready').catalog));
    vi.stubGlobal('fetch', fetchMock);
    expect(
      (await loadPublicStock(new URLSearchParams('marca=BMW&pagina=8&pageSize=30'))).status,
    ).toBe('ready');
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain('pageSize=30');
    expect(url).toContain('pagina=8');
  });
  it('treats network failure and malformed public responses as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect((await loadPublicStock(new URLSearchParams())).status).toBe('unavailable');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ items: [{ vin: 'PRIVATE' }] })),
    );
    expect((await loadPublicStock(new URLSearchParams())).status).toBe('unavailable');
  });
  it('rejects legacy/demo identifiers before making a backend request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await loadPublicVehicle('demo-bmw-serie-1')).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('distinguishes not-published from unavailable details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    expect((await loadPublicVehicle('bmw-2019-012345abcdef')).status).toBe(404);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    expect((await loadPublicVehicle('bmw-2019-012345abcdef')).status).toBe(503);
  });
});
