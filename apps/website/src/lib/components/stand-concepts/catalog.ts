import { catalogCars as cars, transmissionFor, catalogIsDemo } from './catalogDemo';

export type CatalogCar = (typeof cars)[number];
export const PAGE_SIZE = 9;
export const brands = [...new Set(cars.map((car) => car.brand))].sort();
export const fuels = [...new Set(cars.map((car) => car.fuel))].sort();
export const filterLabels = {
  q: 'Pesquisa',
  marca: 'Marca',
  modelo: 'Modelo',
  preco_min: 'Preço mínimo',
  preco_max: 'Preço máximo',
  ano_min: 'Ano mínimo',
  ano_max: 'Ano máximo',
  km_min: 'Quilometragem mínima (km)',
  km_max: 'Quilometragem máxima',
  combustivel: 'Combustível',
  transmissao: 'Transmissão',
} as const;
export type FilterKey = keyof typeof filterLabels;
export const sortOptions = {
  relevancia: 'A nossa seleção',
  preco_asc: 'Preço: menor primeiro',
  preco_desc: 'Preço: maior primeiro',
  ano: 'Ano: mais recente',
  km: 'Quilometragem: menor primeiro',
} as const;
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
const bound = (params: URLSearchParams, key: string, fallback: number) => {
  const raw = params.get(key)?.trim();
  const value = Number(raw);
  return raw && Number.isFinite(value) && value >= 0 ? value : fallback;
};

export function catalogResults(params: URLSearchParams, source: CatalogCar[] = cars) {
  const query = normalize(params.get('q') ?? '');
  const matches = source.filter(
    (car) =>
      normalize(`${car.brand} ${car.model} ${car.line} ${car.category}`).includes(query) &&
      (!params.get('marca') || car.brand === params.get('marca')) &&
      (!params.get('modelo') || car.model === params.get('modelo')) &&
      car.price >= bound(params, 'preco_min', 0) &&
      car.price <= bound(params, 'preco_max', Infinity) &&
      car.year >= bound(params, 'ano_min', 0) &&
      car.year <= bound(params, 'ano_max', Infinity) &&
      car.km <= bound(params, 'km_max', Infinity) &&
      (!params.get('combustivel') || car.fuel === params.get('combustivel')) &&
      (!params.get('transmissao') || params.get('transmissao') === transmissionFor(car)),
  );
  const sort = params.get('ordem');
  matches.sort((a, b) =>
    sort === 'preco_asc'
      ? a.price - b.price
      : sort === 'preco_desc'
        ? b.price - a.price
        : sort === 'ano'
          ? b.year - a.year
          : sort === 'km'
            ? a.km - b.km
            : 0,
  );
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const requested = Math.floor(bound(params, 'pagina', 1)) || 1;
  const page = Math.min(pages, Math.max(1, requested));
  return {
    total: matches.length,
    pages,
    page,
    items: matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

export function catalogUrl(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  const clean = value.trim();
  if (clean && !(key === 'ordem' && clean === 'relevancia')) next.set(key, clean);
  else next.delete(key);
  if (key !== 'pagina') next.delete('pagina');
  if (key === 'marca' || !next.get('marca')) next.delete('modelo');
  const query = next.toString();
  return `/viaturas${query ? `?${query}` : ''}`;
}

export const brandCopy: Record<string, string> = {
  BMW: 'Procura um BMW usado? Explore o modelo apresentado, compare o ano, os quilómetros e o preço e abra a ficha para conhecer os detalhes. Antes de decidir, fale connosco sobre o histórico e o equipamento da viatura.',
  Audi: 'Explore os Audi usados apresentados nesta seleção. Compare os dados da ficha e pense no espaço e na utilização de que precisa no dia a dia. Numa visita, poderá esclarecer dúvidas sobre manutenção e equipamento.',
  'Mercedes-Benz':
    'Conheça os Mercedes-Benz usados apresentados e reúna a informação que importa para a sua escolha. Consulte o ano, a quilometragem e o preço; confirme connosco o histórico e as condições antes de avançar.',
  Porsche:
    'Explore os Porsche usados desta seleção e veja cada ficha com tempo. Para além do modelo e do preço, vale a pena esclarecer o histórico de manutenção, o equipamento e as condições da viatura numa conversa com o stand.',
  Tesla:
    'Explore os Tesla usados apresentados. Além do ano, dos quilómetros e do preço, traga as suas perguntas sobre bateria, carregamento e equipamento. Estes detalhes devem ser confirmados para cada viatura.',
};

export function catalogSeo(params: URLSearchParams, origin: string) {
  const results = catalogResults(params);
  const brand = params.get('marca') ?? '';
  const model = params.get('modelo') ?? '';
  const validBrand = brands.includes(brand) ? brand : '';
  const validModel = cars.some(
    (car) => car.model === model && (!validBrand || car.brand === validBrand),
  )
    ? model
    : '';
  const heading = validModel
    ? `${validBrand ? `${validBrand} ` : ''}${validModel} usados`
    : validBrand
      ? `Viaturas ${validBrand} usadas`
      : 'Viaturas usadas disponíveis';
  const description = `${heading}. ${results.total} ${results.total === 1 ? 'resultado' : 'resultados'} nesta seleção de demonstração. Compare preço, ano e quilometragem e explore cada ficha ao seu ritmo.`;
  const canonical = new URL('/viaturas', origin);
  for (const key of Object.keys(filterLabels)) {
    const value = params.get(key)?.trim();
    if (value) canonical.searchParams.set(key, value);
  }
  const order = params.get('ordem');
  if (order && order !== 'relevancia' && order in sortOptions)
    canonical.searchParams.set('ordem', order);
  if (results.page > 1) canonical.searchParams.set('pagina', String(results.page));
  // All current inventory is illustrative: keep the whole prototype out of the index.
  // Zero-result/search/unknown variants remain noindex even after replacing demo stock.
  const noindex =
    catalogIsDemo ||
    !results.total ||
    !!params.get('q') ||
    (Boolean(brand) && !validBrand) ||
    (Boolean(model) && !validModel);
  const contextual = validBrand
    ? (brandCopy[validBrand] ??
      `Explore os ${validBrand} usados desta seleção. Compare o ano, o preço e a quilometragem e consulte os detalhes de cada viatura. Confirme connosco o histórico, o equipamento e as condições antes de decidir.`)
    : '';
  return {
    heading,
    description,
    canonical: canonical.href,
    noindex,
    contextual,
    label: validModel ? `${validBrand} ${validModel}`.trim() : validBrand,
  };
}
