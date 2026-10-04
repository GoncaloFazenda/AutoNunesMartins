# Preparação para publicação — PENDENTE

Atualizado em 4 de outubro de 2026. O utilizador autorizou placeholders e fornecerá os dados oficiais posteriormente. O site **não está pronto para publicação enquanto persistirem estas pendências**. A existência das páginas legais não significa que estejam completas ou juridicamente validadas.

Antes de responder a «está pronto para publicar?», consultar este documento, a configuração e a implementação corrente. Não assumir que uma revisão anterior concluiu a prontidão. Registar aqui evidência e data de cada confirmação; não inferir dados de concorrentes.

## Fontes de estado

- Campos públicos: `apps/website/src/lib/publicationReadiness.json`. `null` é apresentado como «Por preencher / Por confirmar antes da publicação». Não incluir segredos ou documentos pessoais neste ficheiro público.
- Contactos da interface: `apps/website/src/lib/components/stand-concepts/standContact.ts`, atualmente `isDemo: true`.
- Informação legal: `/informacao-legal`; privacidade: `/politica-de-privacidade`.
- Verificação manual na raiz: `node scripts/check-publication-readiness.mjs`, ou `npm run publication:check --workspace @anm/website`. Código 1 assinala pendências; código 0 significa apenas ausência de pendências registadas, nunca certificação. Não é executada pelo dev/build/deploy.

## Dados e decisões do proprietário

| Estado | Necessário | Responsável / evidência esperada |
| --- | --- | --- |
| Pendente | Nome legal, forma jurídica, NIF/NIPC e sede | Proprietário: dados oficiais do operador |
| Pendente | Registo comercial/conservatória e capital social, quando aplicáveis | Proprietário: confirmar dados ou indicar «Não aplicável» com justificação nesta checklist |
| Pendente | Telefone, email, morada, mapa, horário e WhatsApp | Proprietário: substituir todo o conjunto fictício; confirmar número WhatsApp antes de retirar modo demo |
| Pendente | Entidade RAL competente, contactos, site e eventual adesão | Proprietário/revisão jurídica: confirmar aplicabilidade e situação atual; não presumir adesão |
| Pendente | Livro de Reclamações Eletrónico | Proprietário: confirmar registo e ligação aplicável; o portal geral no site não comprova registo |
| Pendente | Responsável pelo tratamento e contacto de privacidade | Proprietário: dados e contacto utilizável |
| Pendente | Finalidades/fundamentos, prestadores, destinatários, transferências e conservação | Proprietário + responsável pela implementação: refletir os serviços realmente escolhidos, não textos genéricos copiados |

Não copiar referências CASA ou ODR do concorrente. Confirmar entidades e mecanismos atuais nas fontes oficiais durante a revisão jurídica. Crédito não faz parte do âmbito atual do website, conforme confirmação explícita do utilizador em 4 de outubro de 2026: não há secção pública nem pendência de intermediação de crédito.

## Funcionalidades e dados — revisão operacional

- **Formulários DEMO:** modal e formulário inferior não enviam nem guardam pedidos num serviço. Apenas apresentam confirmação local de teste. Em 2026-10-04, o proprietário pediu a remoção dos avisos visíveis de demonstração na secção de contacto/formulários e do rótulo de pendência no rodapé. Essa alteração visual não confirma dados nem ativa envio real. Não introduzir dados pessoais reais. Escolher envio/receção, prestadores e conservação antes de ativar contacto real; nenhuma integração foi criada nesta preparação.
- **Contactos DEMO:** telefone/morada/horário são ilustrativos; email `.example`; WhatsApp fictício `+12025550147`; mapa aponta genericamente para Lisboa. Não basta preencher a página legal: atualizar também `standContact.ts` e verificar todos os links `tel:`, `mailto:`, Maps e WhatsApp, além de eventuais contactos de equipa.
- **Preferências locais:** preservar a informação já implementada sobre tema, favoritos e comparação. `anm-orbit-theme`, `anm-favorites-v1`, `anm-comparison-v1` e legado `anm-design-saved` usam armazenamento local; listas não têm expiração automática. A seleção permite pedidos à API pública, não é uma funcionalidade sem rede.
- **Scroll:** `orbit-reload-position` usa armazenamento de sessão com URL completo, coordenadas e hora. Janela de utilização de 60 segundos não equivale a apagar a entrada. A política já descreve esta função.
- **Alojamento e terceiros:** confirmar cookies, logs/IP, retenção, CDN, email, subcontratantes e transferências no ambiente final. Algumas imagens são pedidas ao Unsplash; fontes locais; Maps e WhatsApp são ligações externas. A auditoria do código não comprova a ausência de cookies ou serviços introduzidos pelo alojamento.
- **Consentimento:** não foi instalado banner/CMP. Rever a necessidade e configuração com base nos serviços efetivamente ativos, antes de acrescentar analytics, publicidade, embeds ou outros recursos.
- **Conteúdo:** rever dados fictícios, fotografias ilustrativas, afirmações comerciais, preços/disponibilidade, equipa, contactos e indexação. Preservar `noindex` das demos; aprovar expressamente o estado de indexação das páginas oficiais.

## Validação técnica — separada da revisão jurídica

- Pendente: build no ambiente de publicação. Um build anterior chegou à fase de adaptação Vercel e encontrou `EPERM` ao criar symlink no Windows. Não atribuir esse erro à informação legal nem afirmar que o build final foi validado.
- Pendente: confirmar domínio/origem e canonical/OG/JSON-LD, links, fotografias, formulários escolhidos, segurança operacional e percursos desktop/mobile.
- Pendente: revisão final de acessibilidade, contraste, navegação por teclado, links legais e adequação da comunicação ao funcionamento efetivo dos contactos e formulários.
- Testes locais aprovados não equivalem a aprovação de publicação. Não houve commit, push ou deploy nesta preparação.

## Como encerrar pendências

Preencher valores confirmados na configuração e substituir placeholders no texto quando aplicável. Atualizar o conjunto real de contactos e funcionalidades. Só marcar um item de `checks` como `verified` depois de registar aqui evidência, data e responsável pela confirmação. «Não aplicável» exige decisão explícita documentada. Reexecutar a verificação manual e rever o site final; não remover pendências apenas para obter código 0.

### Registo de confirmações

- 4 de outubro de 2026 — utilizador confirmou explicitamente que o website não tem conteúdo/atividade relacionada com crédito; não aplicável ao âmbito atual.
- As restantes confirmações oficiais de dados, registos, serviços finais e aprovação de publicação continuam pendentes.

### Verificação local desta preparação

268 testes do website aprovados. Svelte check final: 0 erros e 0 avisos. `/informacao-legal`, `/politica-de-privacidade` e `/quem-somos` responderam com 200. Campos pendentes e avisos de demonstração confirmados na interface; sem overflow na página legal mobile. A verificação manual continua a assinalar 22 pendências. Nenhum build de publicação ou deploy foi executado; estes resultados não encerram as pendências acima.

### Preparação SEO — 4 de outubro de 2026

- Por autorização explícita do utilizador, home e `/quem-somos` já não têm `noindex` incondicional; títulos e descrições foram preparados para as páginas públicas. Isto não aprova os textos demonstrativos, contactos, dados legais ou publicação.
- As previews Vercel recebem `X-Robots-Tag: noindex, follow`. Noutros alojamentos de staging, configurar `SITE_NOINDEX=true`; não existe domínio final inventado no código. As canonicals e o sitemap usam a origem do pedido, que deve ser validada no domínio final juntamente com os redirecionamentos de aliases.
- `/demo`, favoritos, comparação, páginas legais e combinações de filtros mantêm o seu `noindex`. Catálogo, páginas de paginação com resultados e filtros apenas por marca conservam a política de indexação existente.
- Sitemap dinâmico em `/sitemap.xml`, anunciado em `/robots.txt`: páginas públicas elegíveis, marcas e todas as fichas da projeção pública, incluindo páginas posteriores do catálogo. Falhas da API produzem 503, nunca um sitemap parcial; não são inventadas datas `lastmod`.
- Falha temporária do catálogo passa a devolver HTTP 503 com `Retry-After`, em vez de HTTP 200 com lista indisponível. As fichas recebem títulos com ano e descrições com dados públicos; imagem social apenas quando existe fotografia aprovada.
- Verificação local de HTML SSR: todas as 14 fichas acessíveis pelos links do catálogo (9 + 5), todas responderam 200 e continham JSON-LD. Paginação e carrossel de semelhantes já expõem links HTML; nenhuma ficha órfã nesta amostra. Sitemap respondeu 200 e incluiu as 14 fichas. Home e Quem Somos sem `noindex`; amostras de demo, favoritos, comparação e filtro combinado preservaram `noindex`.
- Conteúdo ainda por rever: 13 de 14 fichas sem fotografias, especificações vazias nas 14, descrições resumidas a marca/modelo/ano, entrada `renot clicli`, destaques da home ligados a demos e referências a financiamento em `standTrust.ts`/`catalogEditorial.ts`, incompatíveis com a confirmação acima. Nenhum dado de negócio foi inventado ou corrigido por suposição nesta revisão técnica.
- Esta validação local não mede ranking nem Core Web Vitals de produção e não encerra qualquer item pendente de publicação.
