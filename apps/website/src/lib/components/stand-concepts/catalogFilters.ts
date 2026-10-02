import type { PublicStock } from '$lib/publicVehicles';

export const numericCatalogFields = [
  { key: 'preco_min', label: 'Preço mínimo (€)', min: 0, max: 9999999999.99, step: '0.01' },
  { key: 'preco_max', label: 'Preço máximo (€)', min: 0, max: 9999999999.99, step: '0.01' },
  { key: 'ano_min', label: 'Ano mínimo', min: 1950, max: 2200, step: '1' },
  { key: 'ano_max', label: 'Ano máximo', min: 1950, max: 2200, step: '1' },
  { key: 'km_min', label: 'Quilometragem mínima (km)', min: 0, max: 2000000, step: '1' },
  { key: 'km_max', label: 'Quilometragem máxima (km)', min: 0, max: 2000000, step: '1' },
] as const;

export function catalogInputErrors(params: URLSearchParams) {
  const errors: string[] = [];
  if (params.get('modelo') && !params.get('marca')?.trim()) errors.push('Escolha primeiro uma marca para pesquisar um modelo.');
  if ((params.get('q')?.trim().length ?? 0) > 120) errors.push('A pesquisa pode ter até 120 caracteres.');
  for (const field of numericCatalogFields) {
    const value = params.get(field.key);
    if (value === null || value === '') continue;
    const pattern = field.step === '0.01' ? /^\d{1,10}(?:\.\d{1,2})?$/ : /^\d{1,10}$/;
    if (!pattern.test(value) || Number(value) < field.min || Number(value) > field.max)
      errors.push(`${field.label}: use um valor entre ${field.min} e ${field.max}${field.step === '1' ? ', sem casas decimais' : ', com até duas casas decimais'}.`);
  }
  for (const [min, max, label] of [['preco_min', 'preco_max', 'preço'], ['ano_min', 'ano_max', 'ano'], ['km_min', 'km_max', 'quilometragem']]) {
    if (params.get(min!) && params.get(max!) && Number(params.get(min!)) > Number(params.get(max!)))
      errors.push(`O mínimo de ${label} deve ser igual ou inferior ao máximo.`);
  }
  return errors;
}

export function catalogModelOptions(params: URLSearchParams, stock: PublicStock) {
  const requested = params.get('marca')?.trim().toLowerCase();
  const brand = stock.status === 'ready'
    ? stock.catalog.facets.brands.find(item => item.value.toLowerCase() === requested)?.value ?? '' : '';
  const models = brand ? [...new Set(stock.catalog.facets.models
    .filter(item => item.brand === brand && item.count > 0).map(item => item.value))] : [];
  return { brand, models };
}
