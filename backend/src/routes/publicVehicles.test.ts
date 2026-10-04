import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { Prisma, type PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: {
    vehicle: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    activityLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
  download: vi.fn(),
  auth: vi.fn(),
}));
vi.mock('../db.js', () => ({ prisma: mocks.db }));
vi.mock('../logger.js', () => ({ logger: { error: vi.fn() } }));
vi.mock('../lib/data/storage.js', () => ({
  getBucketName: () => 'private-vehicle-photos',
  getSupabase: () => ({ storage: { from: () => ({ download: mocks.download }) } }),
}));
vi.mock('../middleware/clerk.js', () => ({ requireUser: mocks.auth }));

import router from './publicVehicles.js';
import publicationRouter from './vehicleWebPublication.js';
import {
  publicVehicleDto,
  publicVehicleOrder,
  publicVehicleSelect,
  publicVehicleWhere,
} from '../lib/data/publicVehicle.js';
import {
  isApprovedPhotoPath,
  makePublicSlug,
  publicVehicleQuerySchema,
  webPublicationSchema,
} from '../lib/domain/publicVehicle.js';
import { setWebPublication } from '../lib/server/webPublicationService.js';

const id = 'clabcdefghijklmnopqrstuvw';
const photo = `${id}/12345678-1234-1234-1234-123456789abc.jpg`;
const slug = makePublicSlug({ id, brand: 'BMW', model: 'Série 1', year: 2019 });
const fixture = () => ({
  id,
  brand: 'BMW',
  model: 'Série 1',
  year: 2019,
  fuel: 'DIESEL' as const,
  mileage: 75000,
  status: 'AVAILABLE' as const,
  soldDate: null,
  sale: null,
  webPublished: true,
  publicSlug: slug,
  publicPrice: new Prisma.Decimal('21900.25'),
  publicDescription: 'Approved public description',
  publicPhotoPaths: [photo],
  publicTransmission: 'MANUAL' as const,
  photos: [photo],
  // Deliberately inject private fields despite Prisma select: serialization must resist.
  vin: 'SECRET-VIN',
  licensePlate: 'SECRET-PLATE',
  purchasePrice: 'SECRET-COST',
  salePrice: 'SECRET-NEGOTIATED-PRICE',
  description: 'SECRET-INTERNAL-NOTES',
  pendingDocFlags: { docs: true },
  expenses: [{ amount: 'SECRET-EXPENSE' }],
  customer: { email: 'PRIVATE-EMAIL' },
  documents: ['PRIVATE-DOCUMENT'],
});
const publication = {
  published: true as const,
  price: '21900.25',
  description: 'Approved',
  photoPaths: [photo],
  transmission: 'MANUAL' as const,
};
const db = mocks.db as unknown as PrismaClient;
let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/public/vehicles', router);
  app.use('/api/vehicles', publicationRouter);
  app.use('/api/vehicles', mocks.auth, (_req, res) => {
    res.json({ private: true });
  });
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.db.$transaction.mockImplementation(async (fn) => fn(mocks.db));
  mocks.db.vehicle.findMany.mockResolvedValue([fixture()]);
  mocks.db.vehicle.findFirst.mockResolvedValue(fixture());
  mocks.db.vehicle.findUnique.mockResolvedValue(fixture());
  mocks.db.vehicle.update.mockImplementation(async ({ data }) => ({
    webPublished: data.webPublished,
    publicSlug: data.publicSlug ?? slug,
  }));
  mocks.db.vehicle.count.mockResolvedValue(1);
  mocks.db.vehicle.groupBy.mockImplementation(async ({ by }) => {
    const row = fixture();
    return [
      {
        ...Object.fromEntries(by.map((key: keyof typeof row) => [key, row[key]])),
        _count: { _all: 1 },
      },
    ];
  });
  mocks.db.vehicle.aggregate.mockResolvedValue({
    _min: { year: 2019, mileage: 75000, publicPrice: new Prisma.Decimal('21900.25') },
    _max: { year: 2019, mileage: 75000, publicPrice: new Prisma.Decimal('21900.25') },
  });
  mocks.download.mockResolvedValue({
    data: new Blob(['image'], { type: 'image/jpeg' }),
    error: null,
  });
  mocks.auth.mockImplementation((_req, res) => res.status(401).json({ error: 'Unauthorized' }));
});

describe('public query validation and search boundary', () => {
  it('accepts the Orbit filters, translates labels and bounds pagination', () => {
    const q = publicVehicleQuerySchema.parse({
      q: '  Série 1  ',
      marca: 'BMW',
      modelo: 'Série 1',
      preco_min: '20000.01',
      preco_max: '25000',
      ano_min: '2018',
      ano_max: '2022',
      km_min: '1000',
      km_max: '100000',
      combustivel: 'Diesel',
      transmissao: 'Manual',
      ordem: 'preco_asc',
      pagina: '2',
      pageSize: '30',
    });
    expect(q).toMatchObject({
      q: 'Série 1',
      combustivel: 'DIESEL',
      transmissao: 'MANUAL',
      pagina: 2,
      pageSize: 30,
    });
    expect(publicVehicleWhere(q)).toMatchObject({
      brand: { equals: 'BMW' },
      model: { equals: 'Série 1' },
      year: { gte: 2018, lte: 2022 },
      mileage: { gte: 1000, lte: 100000 },
      publicPrice: { gt: 0, gte: 20000.01, lte: 25000 },
    });
  });
  it.each([
    { modelo: 'Série 1' },
    { modelo: 'Série 1', marca: ' ' },
    { pageSize: '31' },
    { pageSize: '0' },
    { pagina: '1001' },
    { pagina: '-1' },
    { pagina: '1.5' },
    { pageSize: ['9', '30'] },
    { q: { contains: 'secret' } },
    { preco_min: 'NaN' },
    { preco_max: 'Infinity' },
    { preco_min: '1e3' },
    { preco_min: '' },
    { ano_min: '2024', ano_max: '2020' },
    { km_min: '20', km_max: '10' },
    { preco_min: '20', preco_max: '10' },
    { km_max: '2000001' },
    { q: 'x'.repeat(121) },
    { status: 'SOLD' },
    { webPublished: 'false' },
    { vin: 'secret' },
    { licensePlate: 'AA-00-AA' },
    { sortBy: 'purchasePrice' },
    { ordem: 'purchasePrice' },
    { include: 'sale.customer' },
    { transmissao: 'Invented' },
    { combustivel: 'Invalid' },
  ])('rejects malformed/private query %j', (input) => {
    expect(publicVehicleQuerySchema.safeParse(input).success).toBe(false);
  });
  it('searches only public content and escapes SQL pattern characters', () => {
    const where = publicVehicleWhere(publicVehicleQuerySchema.parse({ q: 'VIN%_\\' }));
    expect(where.OR).toEqual([
      { brand: { contains: 'VIN\\%\\_\\\\', mode: 'insensitive' } },
      { model: { contains: 'VIN\\%\\_\\\\', mode: 'insensitive' } },
      { publicDescription: { contains: 'VIN\\%\\_\\\\', mode: 'insensitive' } },
    ]);
    expect(JSON.stringify(where)).not.toContain('licensePlate');
    expect(Object.keys(publicVehicleSelect)).not.toContain('vin');
    expect(Object.keys(publicVehicleSelect)).not.toContain('description');
  });
  it.each(['relevancia', 'preco_asc', 'preco_desc', 'ano', 'km'] as const)(
    'uses stable allowlisted order %s',
    (order) => {
      const sort = publicVehicleOrder(order);
      expect(sort[1]).toEqual({ id: 'asc' });
      expect(JSON.stringify(sort)).not.toMatch(/purchasePrice|salePrice|acquisitionDate/);
    },
  );
});

describe('public HTTP responses never disclose private inventory', () => {
  it('returns all available public brands without pagination or reserved/sold/private stock', async () => {
    mocks.db.vehicle.groupBy.mockResolvedValue([
      { brand: 'Audi', _count: { _all: 4 }, privateField: 'SECRET' },
      { brand: 'Volkswagen', _count: { _all: 2 } },
    ]);
    const response = await fetch(`${base}/api/public/vehicles/brands`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ value: 'Audi', count: 4 }, { value: 'Volkswagen', count: 2 }]);
    expect(mocks.db.vehicle.groupBy).toHaveBeenCalledWith({
      by: ['brand'],
      where: { ...publicVehicleWhere(), status: 'AVAILABLE' },
      _count: { _all: true }, orderBy: { brand: 'asc' },
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.db.vehicle.findMany).not.toHaveBeenCalled();
    expect(mocks.auth).not.toHaveBeenCalled();
  });
  it('refreshes the directory when available stock disappears and keeps errors opaque', async () => {
    expect(await (await fetch(`${base}/api/public/vehicles/brands`)).json()).toEqual([{ value: 'BMW', count: 1 }]);
    mocks.db.vehicle.groupBy.mockResolvedValueOnce([]);
    expect(await (await fetch(`${base}/api/public/vehicles/brands`)).json()).toEqual([]);
    mocks.db.vehicle.groupBy.mockRejectedValueOnce(new Error('SECRET database URL'));
    const response = await fetch(`${base}/api/public/vehicles/brands`);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('SECRET');
  });
  it('does not allow filters to widen the available-brand directory', async () => {
    expect((await fetch(`${base}/api/public/vehicles/brands?status=RESERVED`)).status).toBe(400);
    expect(mocks.db.vehicle.groupBy).not.toHaveBeenCalled();
  });
  it('projects unknown price and optional photos without losing reserved availability', () => {
    expect(
      publicVehicleDto({
        ...fixture(),
        publicPrice: null,
        publicPhotoPaths: [],
        status: 'RESERVED',
      }),
    ).toMatchObject({ price: null, photos: [], availability: 'RESERVED' });
    expect(publicVehicleWhere()).not.toHaveProperty('publicPrice');
    expect(publicVehicleOrder('preco_desc')[0]).toEqual({
      publicPrice: { sort: 'desc', nulls: 'last' },
    });
  });
  it('returns only the public allowlist with protected facets and counts', async () => {
    const response = await fetch(`${base}/api/public/vehicles?pagina=2&pageSize=9`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items[0]).toEqual({
      slug,
      brand: 'BMW',
      model: 'Série 1',
      year: 2019,
      fuel: 'DIESEL',
      mileage: 75000,
      price: '21900.25',
      currency: 'EUR',
      description: 'Approved public description',
      specifications: {},
      transmission: 'MANUAL',
      availability: 'AVAILABLE',
      photos: [`/api/public/vehicles/${slug}/photos/0`],
    });
    expect(JSON.stringify(body)).not.toMatch(
      /SECRET|PRIVATE|vin|licensePlate|purchasePrice|salePrice|pendingDocFlags|publicPhotoPaths|private-vehicle-photos/,
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.db.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 9, take: 9 }),
    );
    for (const method of ['findMany', 'count', 'groupBy', 'aggregate'] as const) {
      for (const [args] of mocks.db.vehicle[method].mock.calls) {
        expect(args.where).toMatchObject({
          webPublished: true,
          status: { in: ['AVAILABLE', 'RESERVED'] },
          publicSlug: { not: null },
          soldDate: null,
          sale: { is: null },
        });
      }
    }
  });
  it('handles an empty published catalogue without falling back to CRM/demo stock', async () => {
    mocks.db.vehicle.findMany.mockResolvedValue([]);
    mocks.db.vehicle.count.mockResolvedValue(0);
    mocks.db.vehicle.groupBy.mockResolvedValue([]);
    mocks.db.vehicle.aggregate.mockResolvedValue({
      _min: { year: null, mileage: null, publicPrice: null },
      _max: { year: null, mileage: null, publicPrice: null },
    });
    const body = await (await fetch(`${base}/api/public/vehicles`)).json();
    expect(body).toMatchObject({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 9,
      facets: {
        brands: [],
        models: [],
        fuels: [],
        transmissions: [],
        price: { min: null, max: null },
      },
    });
  });
  it('rejects malformed query before database access and keeps failures opaque', async () => {
    expect((await fetch(`${base}/api/public/vehicles?vin=private`)).status).toBe(400);
    expect(mocks.db.vehicle.findMany).not.toHaveBeenCalled();
    mocks.db.vehicle.findMany.mockRejectedValue(new Error('SECRET database URL'));
    const result = await fetch(`${base}/api/public/vehicles`);
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain('SECRET');
  });
  it('accepts only a slug for detail, applies the publication gate and returns the same 404 for hidden/missing', async () => {
    expect((await fetch(`${base}/api/public/vehicles/${id}`)).status).toBe(404);
    expect(mocks.db.vehicle.findFirst).not.toHaveBeenCalled();
    const ok = await fetch(`${base}/api/public/vehicles/${slug}`);
    expect(ok.status).toBe(200);
    expect(await ok.text()).not.toMatch(/SECRET|PRIVATE/);
    expect(mocks.db.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ...publicVehicleWhere(), publicSlug: slug },
        select: publicVehicleSelect,
      }),
    );
    mocks.db.vehicle.findFirst.mockResolvedValue(null);
    expect((await fetch(`${base}/api/public/vehicles/${slug}`)).status).toBe(404);
  });
  it.each(['SOLD', 'DELIVERED', 'DOCS_PENDING', 'DRAFT'])(
    'refuses accidental over-selection of %s vehicles',
    (status) => {
      expect(() =>
        publicVehicleDto({ ...fixture(), status } as Parameters<typeof publicVehicleDto>[0]),
      ).toThrow();
    },
  );
  it('refuses unpublished records even if a future query over-selects them', () => {
    expect(() => publicVehicleDto({ ...fixture(), webPublished: false })).toThrow();
  });
  it('never offers public writes and keeps CRM publication authenticated', async () => {
    expect((await fetch(`${base}/api/public/vehicles`, { method: 'POST' })).status).toBe(404);
    expect(
      (
        await fetch(`${base}/api/vehicles/${id}/web-publication`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publication),
        })
      ).status,
    ).toBe(401);
    expect((await fetch(`${base}/api/vehicles`)).status).toBe(401);
    expect(mocks.db.vehicle.update).not.toHaveBeenCalled();
    const entry = readFileSync(new URL('../index.ts', import.meta.url), 'utf8');
    expect(entry.indexOf("app.use('/api/public/vehicles', publicVehiclesRouter)")).toBeLessThan(
      entry.indexOf('app.use(clerkMiddleware)'),
    );
    expect(entry).toContain("app.use('/api/vehicles', vehiclesRouter)");
  });
});

describe('private photo storage boundary', () => {
  it.each([
    `other/${photo.split('/')[1]}`,
    `${id}/../secret.jpg`,
    `${id}/%2e%2e/secret.jpg`,
    `https://private.example/${photo}`,
    `${photo}?token=secret`,
    `${id}/document.pdf`,
    `${id}/image.svg`,
  ])('refuses unapproved path %s', (path) => {
    expect(isApprovedPhotoPath(id, path)).toBe(false);
    expect(
      publicVehicleDto({ ...fixture(), publicPhotoPaths: [path], photos: [path] }).photos,
    ).toEqual([]);
  });
  it('serves only an approved current photo without storage URLs or bearer tokens', async () => {
    const response = await fetch(`${base}/api/public/vehicles/${slug}/photos/0`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/jpeg');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mocks.download).toHaveBeenCalledTimes(1);
    expect(mocks.download).toHaveBeenCalledWith(photo);
    expect(mocks.db.vehicle.findFirst.mock.calls[0]?.[0].where).toEqual({
      ...publicVehicleWhere(),
      publicSlug: slug,
    });
    expect((await fetch(`${base}/api/public/vehicles/${slug}/photos/20`)).status).toBe(404);
  });
  it('revokes reads after unpublication or removal from the private photo list', async () => {
    mocks.db.vehicle.findFirst.mockResolvedValue(null);
    expect((await fetch(`${base}/api/public/vehicles/${slug}/photos/0`)).status).toBe(404);
    expect(mocks.download).not.toHaveBeenCalled();
    mocks.db.vehicle.findFirst.mockResolvedValue({ ...fixture(), photos: [] });
    expect((await fetch(`${base}/api/public/vehicles/${slug}/photos/0`)).status).toBe(404);
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it('rejects non-raster storage content', async () => {
    mocks.download.mockResolvedValue({
      data: new Blob(['<svg/>'], { type: 'image/svg+xml' }),
      error: null,
    });
    expect((await fetch(`${base}/api/public/vehicles/${slug}/photos/0`)).status).toBe(404);
  });
});

describe('explicit publication and stable unique slugs', () => {
  it('normalizes accents and punctuation, distinguishes identical titles and never includes private identifiers', () => {
    expect(slug).toMatch(/^bmw-serie-1-2019-[a-f0-9]{12}$/);
    const other = makePublicSlug({ ...fixture(), id: 'clabcdefghijklmnopqrstuvx' });
    expect(other).not.toBe(slug);
    expect(makePublicSlug({ ...fixture(), brand: 'Citroën', model: 'C4 / ë-C4' })).toMatch(
      /^citroen-c4-e-c4-2019-/,
    );
    expect(slug).not.toContain(id);
    expect(slug).not.toMatch(/SECRET|private/);
  });
  it('requires an explicit complete public payload and rejects internal fields', () => {
    expect(webPublicationSchema.safeParse({ ...publication, description: null }).success).toBe(
      false,
    );
    expect(webPublicationSchema.safeParse({ ...publication, description: '  ' }).success).toBe(
      false,
    );
    expect(
      webPublicationSchema.safeParse({ ...publication, photoPaths: [], price: null }).success,
    ).toBe(true);
    expect(webPublicationSchema.safeParse({ published: true }).success).toBe(false);
    expect(webPublicationSchema.safeParse({ ...publication, price: '0' }).success).toBe(false);
    expect(webPublicationSchema.safeParse({ ...publication, vin: 'SECRET' }).success).toBe(false);
    expect(
      webPublicationSchema.safeParse({ ...publication, publicSlug: 'chosen-by-client' }).success,
    ).toBe(false);
    expect(
      webPublicationSchema.safeParse({ ...publication, photoPaths: [photo, photo] }).success,
    ).toBe(false);
  });
  it('generates on first opt-in and never copies CRM description/price/photos automatically', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValue({ ...fixture(), publicSlug: null });
    expect(await setWebPublication(db, id, publication, 'admin-id')).toEqual({
      published: true,
      slug,
    });
    expect(mocks.db.vehicle.update.mock.calls[0]?.[0].data).toEqual({
      webPublished: true,
      publicSlug: slug,
      publicPrice: '21900.25',
      publicDescription: 'Approved',
      publicPhotoPaths: [photo],
      publicTransmission: 'MANUAL',
    });
    expect(mocks.db.activityLog.create).toHaveBeenCalled();
  });
  it('preserves the slug through title changes, unpublishing and republication', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValue({
      ...fixture(),
      brand: 'Changed',
      model: 'Title',
      year: 2026,
    });
    expect(await setWebPublication(db, id, publication, 'admin-id')).toEqual({
      published: true,
      slug,
    });
    await setWebPublication(db, id, { published: false }, 'admin-id');
    expect(mocks.db.vehicle.update.mock.calls[1]?.[0].data).toEqual({ webPublished: false });
    expect(await setWebPublication(db, id, publication, 'admin-id')).toEqual({
      published: true,
      slug,
    });
  });
  it('resolves a unique-index collision with a longer immutable ID hash', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValue({ ...fixture(), publicSlug: null });
    mocks.db.vehicle.update.mockRejectedValueOnce({
      code: 'P2002',
      meta: { target: ['publicSlug'] },
    });
    const result = await setWebPublication(db, id, publication, 'admin-id');
    expect(result.slug).toBe(makePublicSlug(fixture(), 16));
    expect(mocks.db.vehicle.update).toHaveBeenCalledTimes(2);
  });
  it('fails closed if every collision candidate is taken', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValue({ ...fixture(), publicSlug: null });
    mocks.db.vehicle.update.mockRejectedValue({ code: 'P2002', meta: { target: ['publicSlug'] } });
    await expect(setWebPublication(db, id, publication, 'admin-id')).rejects.toMatchObject({
      status: 409,
    });
    expect(mocks.db.vehicle.update).toHaveBeenCalledTimes(4);
  });
  it('re-reads the winning slug after a concurrent first publication', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValueOnce({ ...fixture(), publicSlug: null });
    mocks.db.vehicle.update.mockRejectedValueOnce({ code: 'P2034' });
    const result = await setWebPublication(db, id, publication, 'admin-id');
    expect(result.slug).toBe(slug);
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(2);
    expect(mocks.db.$transaction.mock.calls[0]?.[1]).toEqual({ isolationLevel: 'Serializable' });
  });
  it.each(['SOLD', 'DELIVERED', 'DOCS_PENDING', 'DRAFT'])(
    'cannot publish invalid CRM state %s',
    async (status) => {
      mocks.db.vehicle.findUnique.mockResolvedValue({ ...fixture(), status });
      await expect(setWebPublication(db, id, publication, 'admin-id')).rejects.toMatchObject({
        status: 409,
      });
      expect(mocks.db.vehicle.update).not.toHaveBeenCalled();
    },
  );
  it('cannot publish a sold record or a photo from another vehicle', async () => {
    mocks.db.vehicle.findUnique.mockResolvedValue({ ...fixture(), sale: { id: 'sale' } });
    await expect(setWebPublication(db, id, publication, 'admin-id')).rejects.toMatchObject({
      status: 409,
    });
    mocks.db.vehicle.findUnique.mockResolvedValue(fixture());
    await expect(
      setWebPublication(
        db,
        id,
        { ...publication, photoPaths: [`other/${photo.split('/')[1]}`] },
        'admin-id',
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(mocks.db.vehicle.update).not.toHaveBeenCalled();
  });
  it('prepares an additive migration with private defaults and a unique slug, never publishes existing stock', () => {
    const sql = readFileSync(
      new URL(
        '../../prisma/migrations/20260919230000_add_public_vehicle_catalog/migration.sql',
        import.meta.url,
      ),
      'utf8',
    );
    expect(sql).toContain('"webPublished" BOOLEAN NOT NULL DEFAULT false');
    expect(sql).toContain('CREATE UNIQUE INDEX "Vehicle_publicSlug_key"');
    expect(sql).not.toMatch(/\b(?:UPDATE|DELETE|DROP|TRUNCATE)\b/);
  });
});

describe('nearest-price recommendations', () => {
 const candidate = (suffix: string, price: string | null) => ({...fixture(), id: 'candidate-'+suffix, publicSlug: 'car-'+suffix.padStart(12,'a'), publicPrice: price === null ? null : new Prisma.Decimal(price), publicPhotoPaths: []});
 it('ranks both sides of the price, excludes current and duplicates, and enforces eligibility', async () => {
  mocks.db.vehicle.findMany.mockResolvedValueOnce([candidate('1','21800.25'),candidate('2','20000'),fixture()]).mockResolvedValueOnce([candidate('3','22000.25'),candidate('1','21800.25'),candidate('4','23000')]);
  const response=await fetch(base+'/api/public/vehicles/'+slug+'/related');
  expect(response.status).toBe(200);
  expect((await response.json()).map((v: {price:string})=>v.price)).toEqual(['21800.25','22000.25','23000.00','20000.00']);
  for(const [query] of mocks.db.vehicle.findMany.mock.calls) expect(query.where).toMatchObject({webPublished:true,publicSlug:{not:null},status:{in:['AVAILABLE','RESERVED']},soldDate:null,sale:{is:null},id:{not:id}});
 });
 it('takes five from each price side before selecting the nearest five across the full eligible stock', async () => {
  mocks.db.vehicle.findMany.mockResolvedValueOnce([candidate('1','21800'),candidate('2','21700'),candidate('3','21600'),candidate('4','21500'),candidate('5','21400')]).mockResolvedValueOnce([candidate('6','22000'),candidate('7','22100'),candidate('8','22200'),candidate('9','22300'),candidate('10','22400')]);
  const response = await fetch(base+'/api/public/vehicles/'+slug+'/related');
  const rows = await response.json();
  expect(rows.map((v:{price:string})=>v.price)).toEqual(['22000.00','21800.00','22100.00','21700.00','22200.00']);
  expect(rows).toHaveLength(5);
  for (const [query] of mocks.db.vehicle.findMany.mock.calls) expect(query.take).toBe(5);
 });
 it.each([null,'0','-1','NaN'])('omits suggestions for invalid source price %s',async(price)=>{
  mocks.db.vehicle.findFirst.mockResolvedValue(candidate('1',price));
  const response=await fetch(base+'/api/public/vehicles/'+slug+'/related');
  expect(await response.json()).toEqual([]);expect(mocks.db.vehicle.findMany).not.toHaveBeenCalled();
 });
 it('rejects invalid candidate prices',async()=>{
  mocks.db.vehicle.findMany.mockResolvedValueOnce([candidate('1',null),candidate('2','0'),candidate('3','-1')]).mockResolvedValueOnce([candidate('4','NaN'),candidate('5','22000')]);
  const response=await fetch(base+'/api/public/vehicles/'+slug+'/related');
  expect((await response.json()).map((v:{price:string})=>v.price)).toEqual(['22000.00']);
 });
 it('returns 404 for a non-public source',async()=>{
  mocks.db.vehicle.findFirst.mockResolvedValue(null);
  const response=await fetch(base+'/api/public/vehicles/'+slug+'/related');
  expect(response.status).toBe(404);expect(mocks.db.vehicle.findMany).not.toHaveBeenCalled();
 });
});

describe('confirmed public specifications boundary',()=>{
 it('persists optional specifications through the publication write path',async()=>{
  const input=webPublicationSchema.parse({...publication,specifications:{powerHp:110,seats:7,equipment:['Bluetooth']}});
  await setWebPublication(mocks.db as unknown as PrismaClient,id,input,null);
  expect(mocks.db.vehicle.update).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({publicSpecifications:{powerHp:110,seats:7,equipment:['Bluetooth']}})}));
 });
 it('rejects private or invalid specification keys at the boundary',()=>{
  expect(webPublicationSchema.safeParse({...publication,specifications:{purchasePrice:100}}).success).toBe(false);
  expect(webPublicationSchema.safeParse({...publication,specifications:{powerHp:0}}).success).toBe(false);
 });
 it('returns approved specifications in the public DTO',async()=>{
  mocks.db.vehicle.findFirst.mockResolvedValue({...fixture(),publicSpecifications:{powerHp:110,equipment:['Bluetooth']}});
  const response=await fetch(base+'/api/public/vehicles/'+slug);
  const result=await response.json();expect(result.specifications).toEqual({powerHp:110,equipment:['Bluetooth']});expect(JSON.stringify(result)).not.toMatch(/SECRET|PRIVATE/);
 });
});
