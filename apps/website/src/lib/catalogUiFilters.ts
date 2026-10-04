/** Only the public website's visible filters; the backend contract stays unchanged. */
export const catalogUiLabels = {
  q: 'Pesquisa', marca: 'Marca', preco_max: 'Preço máximo', ano_min: 'Ano', combustivel: 'Combustível',
} as const;

export function normalizeCatalogUi(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  let changed = false;
  for (const key of ['modelo', 'preco_min', 'km_min', 'km_max', 'transmissao']) {
    if (next.has(key)) { next.delete(key); changed = true; }
  }
  // A range cannot be represented by the exact-year selector. Clear both ends.
  if (next.get('ano_min') !== next.get('ano_max')) {
    next.delete('ano_min'); next.delete('ano_max'); changed = true;
  }
  if (changed) next.delete('pagina');
  return next;
}

export function catalogUiParams(params: URLSearchParams, key: string, value: string) {
  const next = normalizeCatalogUi(params);
  const clean = value.trim();
  if (clean && !(key === 'ordem' && clean === 'relevancia')) next.set(key, clean);
  else next.delete(key);
  if (key === 'ano_min') {
    if (clean) next.set('ano_max', clean);
    else next.delete('ano_max');
  }
  if (key !== 'pagina') next.delete('pagina');
  return next;
}

export function catalogYearOptions(range: { min: number | null; max: number | null }, selected = '') {
  const years: number[] = [];
  if (range.min !== null && range.max !== null && Number.isInteger(range.min) && Number.isInteger(range.max)) {
    for (let year = Math.min(2200, range.max); year >= Math.max(1950, range.min); year--) years.push(year);
  }
  if (/^\d{4}$/.test(selected) && Number(selected) >= 1950 && Number(selected) <= 2200 && !years.includes(Number(selected))) years.push(Number(selected));
  return years.sort((a, b) => b - a).map(year => ({ value: String(year), label: String(year) }));
}
