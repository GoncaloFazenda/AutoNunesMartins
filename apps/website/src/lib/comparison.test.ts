import { describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import { COMPARISON_KEY, createComparison, parseSelection, comparisonRows } from './comparison';
import { publicVehicleSchema } from './publicVehicles';

const ids = ['audi-a3-2022-012345abcdef', 'bmw-2020-012345abcdef', 'dacia-2023-012345abcdef', 'tesla-2021-012345abcdef'];
const storage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
};
describe('Comparison selection', () => {
  it('adds up to three, refuses a fourth without replacement, and toggles removal', () => {
    const selection = createComparison();
    selection.initialize(storage);
    ids.slice(0, 3).forEach(id => selection.toggle(id, id));
    selection.toggle(ids[3]!, 'Tesla');
    expect(get(selection.ids)).toEqual(ids.slice(0, 3));
    expect(get(selection.additions)).toBe(3);
    expect(get(selection.notice)?.text).toContain('até 3');
    selection.toggle(ids[1]!, 'BMW');
    expect(get(selection.additions)).toBe(3);
    expect(get(selection.ids)).toEqual([ids[0], ids[2]]);
    selection.toggle(ids[3]!, 'Tesla');
    expect(get(selection.additions)).toBe(4);
    expect(get(selection.ids)).toEqual([ids[0], ids[2], ids[3]]);
  });
  it('persists only stable IDs and restores after remount without overwriting selection', () => {
    const session = storage();
    const first = createComparison(); first.initialize(() => session);
    first.toggle(ids[0]!, 'Private-free name');
    expect(session.getItem(COMPARISON_KEY)).toBe(JSON.stringify([ids[0]]));
    const second = createComparison(); second.initialize(() => session);
    second.initialize(() => { throw new Error('must not read twice'); });
    expect(get(second.ids)).toEqual([ids[0]]);
    second.clear();
    expect(session.getItem(COMPARISON_KEY)).toBe('[]');
    expect(get(second.notice)?.text).toContain('limpa');
  });
  it.each([null, 'bad json', '{}', 'null', '42', '"demo-porsche"'])('tolerates invalid storage %s', raw => {
    expect(parseSelection(raw)).toEqual([]);
  });
  it('deduplicates, rejects malformed and demo IDs and limits restored selection', () => {
    expect(parseSelection(JSON.stringify([null, {}, 'porsche-911', '../private', ids[0], ids[0], ...ids.slice(1)]))).toEqual(ids.slice(0, 3));
  });
  it('keeps in-memory operation when storage access or writes fail', () => {
    const selection = createComparison();
    selection.initialize(() => { throw new Error('blocked'); });
    selection.toggle(ids[0]!, 'Audi');
    expect(get(selection.ready)).toBe(true);
    expect(get(selection.ids)).toEqual([ids[0]]);
    const failing = createComparison();
    failing.initialize(() => ({ getItem: () => '[]', setItem: () => { throw new Error('quota'); } }));
    failing.toggle(ids[1]!, 'BMW');
    expect(get(failing.ids)).toEqual([ids[1]]);
  });
  it('does not leak selection between layout instances / server requests', () => {
    const a = createComparison(), b = createComparison();
    a.toggle(ids[0]!, 'Audi');
    expect(get(b.ids)).toEqual([]);
    expect(get(b.ready)).toBe(false);
  });
  it('announces each mutation and repeated limit attempts, and ignores invalid IDs', () => {
    const selection = createComparison();
    const spy = vi.fn(); const unsubscribe = selection.notice.subscribe(spy);
    ids.slice(0, 3).forEach(id => selection.toggle(id, 'Viatura'));
    selection.toggle(ids[3]!, 'Viatura'); selection.toggle(ids[3]!, 'Viatura');
    expect(spy.mock.calls.at(-1)?.[0].serial).toBe(5);
    selection.toggle('porsche-911', 'Demo');
    expect(get(selection.ids)).toHaveLength(3);
    selection.dismiss(); expect(get(selection.notice)).toBeNull(); unsubscribe();
  });
});

describe('Comparison facts', () => {
  const vehicle = publicVehicleSchema.parse({ slug: ids[0], brand: 'Audi', model: 'A3', year: 2022, mileage: 0,
    fuel: 'GASOLINE', price: null, currency: 'EUR', description: null, transmission: null, availability: 'AVAILABLE', photos: [] });
  const facts = (value = vehicle) => Object.fromEntries(comparisonRows.map(row => [row.label, row.value(value)]));
  it('keeps missing facts distinct from actual zero mileage without demo fallback', () => {
    const result = facts();
    expect(result.Quilometragem).toBe('0 km');
    for (const key of ['Preço', 'Caixa', 'Potência', 'Cilindrada', 'Portas', 'Lugares', 'Categoria', 'Cor', 'Equipamento publicado']) expect(result[key]).toBe('Não indicado');
    expect(result.Combustível).toBe('Gasolina');
  });
  it('uses published units, equipment and reservation status', () => {
    const result = facts({ ...vehicle, mileage: 42000, price: '21900.25', transmission: 'AUTOMATIC', availability: 'RESERVED',
      specifications: { powerHp: 150, engineCc: 1498, seats: 5, doors: 5, equipment: ['GPS', 'GPS', 'ABS'] } });
    expect(result.Potência).toBe('150 cv');
    expect(result.Cilindrada).toMatch(/1\s?498 cm³/);
    expect(result.Preço).toContain('900,25');
    expect(result.Caixa).toBe('Automática');
    expect(result.Disponibilidade).toBe('Reservada');
    expect(result['Equipamento publicado']).toBe('GPS · ABS');
  });
});
