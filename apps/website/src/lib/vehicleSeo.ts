import { fuelLabels, publicPrice, type PublicVehicle } from './publicVehicles';

/** Distinguish real stock using only facts already visible on its public detail page. */
export function vehicleSeo(vehicle: PublicVehicle) {
  const name = `${vehicle.brand} ${vehicle.model}`;
  const summary = `${name} de ${vehicle.year}, ${fuelLabels[vehicle.fuel]}, ${new Intl.NumberFormat('pt-PT').format(vehicle.mileage)} km. ${publicPrice(vehicle.price)}.${vehicle.availability === 'RESERVED' ? ' Reservada.' : ''}`;
  const text = vehicle.description?.replace(/\s+/g, ' ').trim();
  const detail = text && text !== `${name}, de ${vehicle.year}.` ? text : '';
  return {
    title: `${name} (${vehicle.year}) — Auto Nunes Martins`,
    description: `${summary}${detail ? ` ${detail}` : ' Consulte os detalhes na Auto Nunes Martins.'}`.slice(0, 200),
  };
}
