import { get, writable } from 'svelte/store';
import { getContext } from 'svelte';
import type { NotificationInput } from './notifications';
import { slugPattern, fuelLabels, transmissionLabels, publicPrice, type PublicVehicle } from './publicVehicles';

export const COMPARISON_LIMIT = 3;
export const COMPARISON_KEY = 'anm-comparison-v1';
export const comparisonContext = Symbol('comparison');
const validId = (id: unknown): id is string => typeof id === 'string' && id.length <= 180 && slugPattern.test(id);
export function parseSelection(raw: string | null, limit = COMPARISON_LIMIT): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter(validId))].slice(0, limit) : [];
  } catch { return []; }
}

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
export function createComparison(notify?: (input: NotificationInput) => unknown) {
  const ids = writable<string[]>([]);
  const ready = writable(false);
  const additions = writable(0);
  const notice = writable<{ serial: number; text: string } | null>(null);
  let serial = 0;
  let storage: Storage | undefined;
  let initialized = false;
  const announce = (text: string) => {
    notice.set({ serial: ++serial, text });
    notify?.({ message: text, channel: 'comparison', action: get(ids).length >= 2 ? { label: 'Ver comparação', href: '/comparar' } : undefined });
  };
  const save = (next: string[]) => {
    ids.set(next);
    try { storage?.setItem(COMPARISON_KEY, JSON.stringify(next)); } catch { /* Memory remains usable. */ }
  };
  return {
    ids: { subscribe: ids.subscribe }, ready: { subscribe: ready.subscribe }, notice: { subscribe: notice.subscribe }, additions: { subscribe: additions.subscribe },
    initialize(getStorage: () => Storage, legacyStorage?: () => Storage) {
      if (initialized) return;
      initialized = true;
      try {
        storage = getStorage();
        const current = storage.getItem(COMPARISON_KEY);
        let legacy: string | null = null;
        if (current === null) { try { legacy = legacyStorage?.().getItem(COMPARISON_KEY) ?? null; } catch { /* Migration is optional. */ } }
        ids.set(parseSelection(current ?? legacy));
        if (current === null && legacy !== null) save(get(ids));
      } catch { /* Storage can be blocked. */ }
      ready.set(true);
    },
    sync(raw: string | null) { ids.set(parseSelection(raw)); },
    toggle(id: string, name: string) {
      if (!validId(id)) return;
      const current = get(ids);
      if (current.includes(id)) { this.remove(id, name); return; }
      if (current.length >= COMPARISON_LIMIT) { announce('Pode comparar até 3 viaturas. Remova uma da seleção para adicionar outra.'); return; }
      save([...current, id]);
      additions.update(value => value + 1);
      announce(`${name} adicionado à comparação. ${current.length + 1} de 3 viaturas selecionadas.`);
    },
    remove(id: string, name = 'Viatura') {
      const current = get(ids);
      if (!current.includes(id)) return;
      save(current.filter(value => value !== id));
      announce(`${name} removido da comparação. ${get(ids).length} de 3 viaturas selecionadas.`);
    },
    clear() { save([]); announce('Comparação limpa. Pode começar uma nova seleção.'); },
    dismiss() { notice.set(null); },
  };
}
export type Comparison = ReturnType<typeof createComparison>;
export const useComparison = () => getContext<Comparison>(comparisonContext);
const missing = 'Não indicado';
const numeric = (value: number | null | undefined, unit = '') => value == null ? missing : `${new Intl.NumberFormat('pt-PT').format(value)}${unit}`;
const text = (value?: string | null) => value?.trim() || missing;
export const comparisonRows: { label: string; value: (v: PublicVehicle) => string }[] = [
  { label: 'Preço', value: v => v.price === null ? missing : publicPrice(v.price) },
  { label: 'Ano', value: v => String(v.year) },
  { label: 'Quilometragem', value: v => numeric(v.mileage, ' km') },
  { label: 'Combustível', value: v => fuelLabels[v.fuel] },
  { label: 'Caixa', value: v => v.transmission ? transmissionLabels[v.transmission] : missing },
  { label: 'Potência', value: v => numeric(v.specifications?.powerHp, ' cv') },
  { label: 'Cilindrada', value: v => numeric(v.specifications?.engineCc, ' cm³') },
  { label: 'Portas', value: v => numeric(v.specifications?.doors) },
  { label: 'Lugares', value: v => numeric(v.specifications?.seats) },
  { label: 'Categoria', value: v => text(v.specifications?.category) },
  { label: 'Cor', value: v => text(v.specifications?.color) },
  { label: 'Disponibilidade', value: v => v.availability === 'RESERVED' ? 'Reservada' : 'Disponível' },
  { label: 'Equipamento publicado', value: v => text([...new Set(v.specifications?.equipment ?? [])].join(' · ')) },
];
