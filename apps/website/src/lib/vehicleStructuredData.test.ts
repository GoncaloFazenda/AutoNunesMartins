import { describe, expect, it } from 'vitest';
import { publicVehicleCanonical, vehicleJsonLdScript, vehicleStructuredData } from './vehicleStructuredData';

const origin = 'https://stand.example';
const minimal = { slug: 'dacia-jogger-2023-012345abcdef', brand: 'Dacia', model: 'Jogger' };
const complete = { ...minimal, year: 2023, mileage: 83491, fuel: 'GASOLINE', transmission: 'MANUAL',
  price: '17141.78', currency: 'EUR', availability: 'AVAILABLE', description: 'Descrição aprovada',
  photos: [`/api/public/vehicles/${minimal.slug}/photos/0`],
  specifications: { doors: 5, seats: 7, color: 'Branco', category: 'Monovolume', powerHp: 110, engineCc: 999, equipment: ['Ar condicionado'] },
};

describe('Public vehicle JSON-LD', () => {
  it('maps published facts, EUR offer, kilometer units and approved public image URLs', () => {
    const result = vehicleStructuredData(complete, origin)!;
    expect(result).toMatchObject({ '@type': ['Product', 'Car'], url: publicVehicleCanonical(minimal, origin),
      mileageFromOdometer: { value: 83491, unitCode: 'KMT' }, fuelType: 'Gasolina', vehicleTransmission: 'Manual',
      numberOfDoors: 5, seatingCapacity: 7, color: 'Branco', category: 'Monovolume',
      offers: { price: '17141.78', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
      image: [`${origin}/viaturas/${minimal.slug}/photos/0`],
    });
    expect(result.additionalProperty).toEqual([
      { '@type': 'PropertyValue', name: 'Ano', value: 2023 },
      { '@type': 'PropertyValue', name: 'Potência', value: 110, unitText: 'cv' },
      { '@type': 'PropertyValue', name: 'Cilindrada', value: 999, unitText: 'cm³' },
      { '@type': 'PropertyValue', name: 'Equipamento', value: 'Ar condicionado' },
    ]);
  });
  it('marks a reservation as unavailable, never as sold or preorder', () => {
    expect(vehicleStructuredData({ ...complete, availability: 'RESERVED' }, origin)?.offers?.availability).toBe('https://schema.org/OutOfStock');
  });
  it('keeps a minimal description without inventing optional facts or a zero-priced offer', () => {
    const result = vehicleStructuredData(minimal, origin)!;
    expect(Object.keys(result).sort()).toEqual(['@context', '@type', '@id', 'url', 'name', 'brand', 'model'].sort());
    expect(vehicleStructuredData({ ...minimal, mileage: 0 }, origin)?.mileageFromOdometer?.value).toBe(0);
  });
  it.each([null, undefined, '', '  ', '0.00', '-1.00', '1,20', 'NaN', Infinity, NaN, 100, '20 EUR'])('omits invalid/missing price %s', price => {
    expect(vehicleStructuredData({ ...complete, price }, origin)).not.toHaveProperty('offers');
  });
  it.each([null, undefined, '', -1, Infinity, NaN, '100', '100 km', 1.5])('omits invalid/missing mileage %s', mileage => {
    expect(vehicleStructuredData({ ...complete, mileage }, origin)).not.toHaveProperty('mileageFromOdometer');
  });
  it('omits invalid optional values independently while retaining valid facts', () => {
    const result = vehicleStructuredData({ ...minimal, year: '2023-99-99', description: ' ', fuel: 'toString', transmission: 'UNKNOWN',
      photos: ['/catalog-placeholder.svg', 'https://private.example/photo'],
      specifications: { powerHp: Infinity, engineCc: '999 cm3', doors: 0, seats: 999, color: [], equipment: [' ', null, 'ABS', 'ABS'], category: {} },
    }, origin)!;
    expect(result.additionalProperty).toEqual([{ '@type': 'PropertyValue', name: 'Equipamento', value: 'ABS' }]);
    for (const key of ['image', 'description', 'fuelType', 'vehicleTransmission', 'numberOfDoors', 'seatingCapacity', 'color', 'category']) expect(result).not.toHaveProperty(key);
  });
  it.each([null, '', [], {}])('handles malformed optional containers %s', value => {
    expect(() => vehicleJsonLdScript({ ...minimal, specifications: value, photos: value }, origin)).not.toThrow();
  });
  it.each([{ currency: 'USD' }, { availability: 'SOLD' }, { availability: null }])('omits offers with unsupported terms %s', patch => {
    expect(vehicleStructuredData({ ...complete, ...patch }, origin)).not.toHaveProperty('offers');
  });
  it.each([undefined, null, {}, { ...minimal, brand: '' }, { ...minimal, slug: '../private' }])('omits the script when identity is insufficient %s', value => {
    expect(vehicleJsonLdScript(value, origin)).toBe('');
  });
  it.each(['invalid', 'javascript:alert(1)', 'https://user:password@example.com'])('omits markup for invalid origins %s', base => {
    expect(vehicleJsonLdScript(complete, base)).toBe('');
  });
  it('serializes hostile text as inert valid JSON without leaking unrelated fields', () => {
    const attack = '</script><script>alert("x")</script><!-- & \u2028\u2029';
    const html = vehicleJsonLdScript({ ...complete, description: attack, vin: 'PRIVATE', seller: { name: 'DEMO' } }, origin);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.replace(/^<script type="application\/ld\+json">|<\/script>$/g, '');
    expect(JSON.parse(json).description).toBe(attack.trim());
    expect(json).not.toMatch(/[<>&\u2028\u2029]/);
    expect(json).not.toMatch(/PRIVATE|DEMO|seller|review|warranty/);
  });
});
