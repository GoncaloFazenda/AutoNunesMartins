import { publicCatalogSeo, publicHref, publicPrice, type PublicStock } from './publicVehicles';

const base = '/stand-orbit/viaturas';

/** Uses the filtered API projection only, never the prototype catalogue. SSR-safe. */
export function catalogEditorial(params: URLSearchParams, stock: PublicStock) {
  const { brand, model, label } = publicCatalogSeo(params, 'https://catalog.invalid', stock);
  const { total, facets, items, page } = stock.catalog;
  const ready = stock.status === 'ready';
  const hasResults = ready && total > 0 && items.length > 0;
  const heading = !ready ? 'A sua escolha merece informação.'
    : !hasResults ? 'Ainda não encontrou o que procura?'
    : label ? `${label}: o que comparar antes de escolher.` : 'O próximo carro começa nas perguntas certas.';
  const count = `${total} ${total === 1 ? 'viatura publicada' : 'viaturas publicadas'}`;
  const year = facets.year;
  const years = year.min !== null && year.max !== null
    ? year.min === year.max ? ` de ${year.min}` : ` de ${year.min} a ${year.max}` : '';
  const intro = !ready
    ? stock.status === 'invalid'
      ? 'Esta combinação de filtros não é válida. Recomece a pesquisa ou fale connosco sobre o que procura.'
      : 'Não foi possível consultar o catálogo neste momento. Não apresentamos estimativas de stock; pode tentar novamente ou contactar-nos.'
    : !hasResults
      ? params.size
        ? 'Não há viaturas para esta combinação de filtros. Isso não significa que a marca ou o modelo estejam indisponíveis em todo o catálogo: experimente alargar a pesquisa.'
        : 'Neste momento não há viaturas publicadas no catálogo. Fale connosco sobre o que procura e confirme as opções antes de planear a visita.'
      : `${label ? `A seleção de ${label}` : 'A seleção atual'} reúne ${count}${years}. ${model
        ? 'O ano, a versão e o equipamento variam entre exemplares. Compare os detalhes de cada ficha.'
        : brand ? 'Explore os modelos desta pesquisa. Compare a versão, o espaço e o equipamento de cada viatura.'
          : 'Pense no espaço de que precisa, nos seus percursos e no orçamento. Depois, explore as marcas e os modelos.'}`;

  const fuel = params.get('combustivel');
  const allElectric = fuel === 'ELECTRIC' || (items.length === total && items.length > 0 && items.every(v => v.fuel === 'ELECTRIC'));
  const plugin = fuel === 'PLUGIN_HYBRID';
  const guides = [
    {
      title: model ? 'A mesma designação, versões diferentes.' : 'Compare mais do que o preço.',
      text: model
        ? `Ao comparar ${label}, veja o motor, a caixa e o equipamento de cada ficha. Dois exemplares do mesmo ano podem ter extras diferentes.`
        : 'Compare o preço, o ano, os quilómetros e o equipamento. Peça os registos de manutenção e confirme os trabalhos feitos na viatura.',
    },
    {
      title: allElectric || plugin ? 'Pense também no carregamento.' : 'Traga os seus percursos para a escolha.',
      text: allElectric || plugin
        ? 'Confirme o estado da bateria, os cabos e os carregadores compatíveis. Pense onde vai carregar no dia a dia, sem assumir uma autonomia igual para todos os exemplares.'
        : 'Cidade ou viagens longas? Escolha o combustível e a caixa a pensar nos seus percursos. Na visita, experimente a posição de condução, o acesso aos lugares e a bagageira.',
    },
    {
      title: 'Antes de dar o próximo passo.',
      text: 'Confirme a disponibilidade, os documentos e as condições de venda. Para retoma ou financiamento, peça uma proposta para a viatura que escolheu.',
    },
  ];
  // Facet counts exclude the facet being selected, but retain the remaining filters.
  const links = hasResults ? (brand ? facets.models.filter(v => v.brand === brand && v.count > 0) : facets.brands.filter(v => v.count > 0))
    .map(v => {
      const next = new URLSearchParams(params);
      next.delete('pagina');
      if (brand) next.set('modelo', v.value);
      else { next.set('marca', v.value); next.delete('modelo'); }
      return { label: brand ? v.value : `${v.value} usados`, count: v.count, href: `${base}?${next}`, current: brand ? model === v.value : false };
    }) : [];
  const price = hasResults && facets.price.min !== null
    ? `Preços publicados desde ${publicPrice(facets.price.min)}. Confirme o preço na ficha de cada viatura.` : '';
  return {
    heading, intro, guides, links, price, hasResults,
    linkHeading: brand ? `Modelos ${brand} nesta pesquisa` : 'Explorar por marca',
    vehicles: hasResults ? items.slice(0, 3).map(v => ({ label: `${v.brand} ${v.model}`, detail: `${v.year} · ${publicPrice(v.price)}${v.availability === 'RESERVED' ? ' · Reservada' : ''}`, href: publicHref(v.slug) })) : [],
    pageLabel: `Algumas viaturas nesta página${page > 1 ? ` · ${page}` : ''}`,
    resetHref: base,
  };
}
