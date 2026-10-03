import { fuelLabels, publicHref, publicPhoto, slugPattern, transmissionLabels, type PublicVehicle } from './publicVehicles';

/** The same absolute URL is used by both the canonical link and JSON-LD. */
export const publicVehicleCanonical = (vehicle: Pick<PublicVehicle, 'slug'>, origin: string) =>
  new URL(publicHref(vehicle.slug), origin).href;

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown, max = 10000) => typeof value === 'string' && value.trim().length <= max ? value.trim() : '';
const integer = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;

/** Accept unknown input defensively; this helper never needs private CRM fields. */
export function vehicleStructuredData(input: unknown, origin: string) {
  const vehicle = record(input);
  const slug = text(vehicle.slug, 180);
  const brand = text(vehicle.brand, 200);
  const model = text(vehicle.model, 200);
  if (!slugPattern.test(slug) || !brand || !model) return null;
  let url: string;
  let base: URL;
  try {
    base = new URL(origin);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) return null;
    url = publicVehicleCanonical({ slug }, base.origin);
  } catch { return null; }
  const specs = record(vehicle.specifications);
  const description = text(vehicle.description);
  const fuel = typeof vehicle.fuel === 'string' && Object.hasOwn(fuelLabels, vehicle.fuel) ? fuelLabels[vehicle.fuel as keyof typeof fuelLabels] : undefined;
  const transmission = typeof vehicle.transmission === 'string' && Object.hasOwn(transmissionLabels, vehicle.transmission) ? transmissionLabels[vehicle.transmission as keyof typeof transmissionLabels] : undefined;
  const images = Array.isArray(vehicle.photos) ? vehicle.photos.slice(0, 20).flatMap((path, index) =>
    path === `/api/public/vehicles/${slug}/photos/${index}` ? [new URL(publicPhoto(slug, index), base.origin).href] : []) : [];
  const properties = [
    // "Ano" does not distinguish manufacture, model year or registration: don't invent a date.
    ...(integer(vehicle.year, 1886, 9999) ? [{ '@type': 'PropertyValue', name: 'Ano', value: vehicle.year }] : []),
    ...(integer(specs.powerHp, 1, 3000) ? [{ '@type': 'PropertyValue', name: 'Potência', value: specs.powerHp, unitText: 'cv' }] : []),
    ...(integer(specs.engineCc, 1, 20000) ? [{ '@type': 'PropertyValue', name: 'Cilindrada', value: specs.engineCc, unitText: 'cm³' }] : []),
    ...(Array.isArray(specs.equipment) ? [...new Set(specs.equipment.map(value => text(value, 160)).filter(Boolean))].slice(0, 80).map(value => ({ '@type': 'PropertyValue', name: 'Equipamento', value })) : []),
  ];
  const hasOffer = typeof vehicle.price === 'string' && /^\d{1,10}\.\d{2}$/.test(vehicle.price) && Number(vehicle.price) > 0
    && vehicle.currency === 'EUR' && (vehicle.availability === 'AVAILABLE' || vehicle.availability === 'RESERVED');
  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Car'],
    '@id': `${url}#vehicle`,
    url,
    name: `${brand} ${model}`,
    brand: { '@type': 'Brand', name: brand },
    model,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(integer(vehicle.mileage, 0) ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' } } : {}),
    ...(fuel ? { fuelType: fuel } : {}),
    ...(transmission ? { vehicleTransmission: transmission } : {}),
    ...(integer(specs.doors, 1, 8) ? { numberOfDoors: specs.doors } : {}),
    ...(integer(specs.seats, 1, 20) ? { seatingCapacity: specs.seats } : {}),
    ...(text(specs.color, 80) ? { color: text(specs.color, 80) } : {}),
    ...(text(specs.category, 80) ? { category: text(specs.category, 80) } : {}),
    ...(properties.length ? { additionalProperty: properties } : {}),
    // An unknown price is not a free offer. Reserved means unavailable, not sold.
    ...(hasOffer ? { offers: {
      '@type': 'Offer', url, price: vehicle.price, priceCurrency: vehicle.currency,
      availability: vehicle.availability === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } } : {}),
  };
}

/** Escape HTML-significant characters before inserting JSON into a script raw-text node. */
export function vehicleJsonLdScript(vehicle: unknown, origin: string) {
  const data = vehicleStructuredData(vehicle, origin);
  if (!data) return '';
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `<script type="application/ld+json">${json}</script>`;
}
