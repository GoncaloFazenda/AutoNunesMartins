# Guia editorial do catálogo Orbit

O bloco abaixo dos resultados usa apenas `PublicStock`, a projeção pública recebida
pelo servidor. Não consulta dados privados do CRM nem os veículos dos protótipos.
`catalogEditorial.ts` deriva a introdução, os intervalos de anos/preços conhecidos,
orientação de compra e ligações; `OrbitCatalogEditorial.svelte` apresenta-os.

- Catálogo geral: ligações HTML para todas as marcas retornadas nas facetas da API.
- Marca: modelos publicados compatíveis com os restantes filtros.
- Modelo: orientação para comparar versões, sem presumir equipamento.
- Sem resultados, filtros inválidos e serviço indisponível: mensagens distintas,
  sem preços, viaturas ou disponibilidade inventados.
- Preços desconhecidos e viaturas reservadas conservam essa identificação.
- Os nomes vêm dos dados publicados. Eventuais erros de cadastro devem ser
  corrigidos na origem; o guia não inventa uma normalização de marcas.

## Renderização e indexação

A rota já carrega stock em `+page.server.ts`. O guia e os metadados são derivados
durante SSR, não em `onMount`. As ligações usam `href` normais com `marca`/`modelo`;
também funcionam no carregamento direto e na navegação pelo histórico.

A política anterior do catálogo já permitia indexação de catálogo/marca/modelo
válidos. Foi preservada, mas pesquisa livre, ordenação não padrão e combinações
arbitrárias de facetas passam a `noindex, follow`, tal como os estados vazios ou
inválidos. Canonicals mantêm parâmetros conhecidos em ordem estável e removem
defaults; não apontam pesquisas diferentes indiscriminadamente para a homepage.
O `noindex` das restantes páginas de conceito não foi alterado.

Não foram criadas páginas de marca em massa, schema artificial, sitemap, regras
globais de robots ou alterações de publicação. Isto não garante indexação/ranking.
Neste trabalho só se validou o servidor local: domínio final, headers do alojamento,
robots.txt, sitemap e inspeção no Search Console devem ser confirmados na publicação.
Combinações noindex ainda podem ser rastreadas: uma política de crawl de produção
deve ser avaliada separadamente, sem bloquear a leitura da diretiva por acidente.

## Referências de implementação

- [Google: conteúdo útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: JavaScript SEO e links rastreáveis](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: navegação por facetas](https://developers.google.com/search/blog/2024/12/crawling-december-faceted-nav)
- [Google: canonicalização](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [SvelteKit: SSR](https://svelte.dev/docs/kit/page-options#ssr)
