import { publicVehicleSchema, type PublicVehicle } from './publicVehicles';
export type SelectedVehicle = { id: string; status: number; vehicle: PublicVehicle | null };

/** The public BFF bounds each request to three IDs. Favorites request only their visible page. */
export async function loadSelectedVehicles(ids: string[], signal: AbortSignal): Promise<SelectedVehicle[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 3) chunks.push(ids.slice(i, i + 3));
  return (await Promise.all(chunks.map(async selected => {
    try {
      const params = new URLSearchParams(selected.map(id => ['id', id]));
      const response = await fetch(`/comparar/dados?${params}`, { signal, cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      return selected.map(id => {
        const item = Array.isArray(data.items) ? data.items.find((value: { id?: string } | null) => value?.id === id) : null;
        if (item?.status === 404) return { id, status: 404, vehicle: null };
        const parsed = publicVehicleSchema.safeParse(item?.vehicle);
        if (item?.status !== 200 || !parsed.success || parsed.data.slug !== id) return { id, status: 503, vehicle: null };
        return { id, status: 200, vehicle: parsed.data };
      });
    } catch {
      return selected.map(id => ({ id, status: 503, vehicle: null }));
    }
  }))).flat();
}
