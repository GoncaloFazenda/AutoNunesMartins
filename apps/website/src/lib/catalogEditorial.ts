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
        ? 'Mesmo dentro do mesmo modelo, o ano, a versão e o equipamento podem mudar a experiência. Compare cada ficha, não apenas o nome.'
        : brand ? 'Comece pelos modelos apresentados abaixo e depois compare a versão, o espaço e o equipamento de cada exemplar.'
          : 'Defina primeiro o espaço, os percursos e o orçamento de que precisa. A marca e o modelo ajudam a afinar essa escolha.'}`;

  const fuel = params.get('combustivel');
  const allElectric = fuel === 'ELECTRIC' || (items.length === total && items.length > 0 && items.every(v => v.fuel === 'ELECTRIC'));
  const plugin = fuel === 'PLUGIN_HYBRID';
  const guides = [
    {
      title: model ? 'A mesma designação, versões diferentes.' : 'Compare mais do que o preço.',
      text: model
        ? `Ao comparar ${label}, confirme a motorização, a caixa e o equipamento efetivamente indicado em cada ficha. Não assuma que dois exemplares do mesmo ano têm os mesmos extras.`
        : 'Leia o preço em conjunto com o ano, os quilómetros e o equipamento. Peça os registos de manutenção e esclareça que intervenções foram realizadas em cada viatura.',
    },
    {
      title: allElectric || plugin ? 'Pense também no carregamento.' : 'Traga os seus percursos para a escolha.',
      text: allElectric || plugin
        ? 'Pergunte pelo estado da bateria, pelos cabos incluídos e pela compatibilidade de carregamento. Considere onde poderá carregar no dia a dia e confirme os dados do exemplar, sem assumir uma autonomia genérica.'
        : 'Conduz sobretudo em cidade ou faz viagens longas? Compare o combustível e a caixa com essa utilização. Numa visita, confirme a posição de condução, o acesso aos lugares e o espaço de bagagem.',
    },
    {
      title: 'Antes de dar o próximo passo.',
      text: 'Confirme a disponibilidade, a documentação e as condições de venda com o stand. Se pondera uma retoma ou financiamento, peça uma proposta para a viatura concreta antes de decidir.',
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
