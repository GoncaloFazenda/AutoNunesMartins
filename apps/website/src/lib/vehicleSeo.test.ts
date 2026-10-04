import { expect, it } from 'vitest';
import { vehicleSeo } from './vehicleSeo';
import type { PublicVehicle } from './publicVehicles';
const vehicle: PublicVehicle = { slug: 'audi-a3-2020-012345abcdef', brand: 'Audi', model: 'A3', year: 2020,
  mileage: 10000, fuel: 'GASOLINE', transmission: null, price: null, currency: 'EUR', description: null,
  availability: 'RESERVED', photos: [],
};
it('distinguishes the vehicle and keeps unknown price and reservation accurate without commercial claims', () => {
  const result = vehicleSeo(vehicle);
  expect(result.title).toContain('Audi A3 (2020)');
  expect(result.description).toContain('Gasolina');
  expect(result.description).toContain('Preço sob consulta. Reservada.');
  expect(result.description).not.toMatch(/garantia|revisão|0 €/);
});
