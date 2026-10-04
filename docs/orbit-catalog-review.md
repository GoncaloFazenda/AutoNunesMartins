# Revisão do catálogo Orbit — 23 setembro 2026

Âmbito: filtros e coerência visual da listagem `/viaturas`. A homepage aprovada foi usada como referência, não redesenhada. Sem builds, publicação ou alterações ao stock.

Atualização de 4 outubro 2026: a interface foi simplificada para pesquisa, marca, preço máximo, ano exato e combustível. As regras históricas de modelo, preço mínimo, quilometragem e transmissão abaixo já não se aplicam à interface pública; a API mantém essas capacidades. URLs antigas limpam esses filtros e repõem a primeira página. O ano usa `ano_min=ano_max`, um único chip e “Todos os anos”; as opções percorrem o intervalo devolvido pela API, sem afirmar disponibilidade em todos os anos intermédios. Quando há ano selecionado, uma consulta pública sem esse limite preserva as restantes opções do dropdown. Os links editoriais exploram marcas, sem reintroduzir modelos invisíveis. Validação: 255 testes aprovados e Svelte com 0 erros/1 aviso existente.

## Alterações por zona

| Zona | Alteração |
| --- | --- |
| Introdução | Título com peso 500 e escala contínua 36–64 px, sem inversão de tamanho nos breakpoints pequenos. Espaçamentos usam tokens Orbit. Texto de apoio usa a escala de leitura; retirada a frase técnica sobre aprovação para publicação. |
| Filtros | Inputs e seletores usam 16 px, botão usa escala de corpo, notas 12 px. Mantido o foco vermelho para dentro, sem alterar dimensões. Modelo depende da marca e das facets reais da API. |
| Resultados | Estados de carregamento, inválido e indisponível explícitos. Chips de combustível/transmissão mostram rótulos portugueses, não enumerações técnicas. |
| Cartões | Preservados: já reutilizam o componente da homepage. Não foram introduzidas fotografias fictícias onde o stock não as fornece. |
| Paginação | Botões numerados podem quebrar para outra linha, conservando alvos de 44 px e evitando overflow com sete números em mobile. Navegar foca o título dos resultados. |
| Guia editorial | Texto principal 16 px / 15 px mobile, seguindo os tokens da homepage; notas e metadados 12 px e comprimento de leitura limitado. Mantidos dados e ligações públicos reais. |
| Navbar e rodapé | Sem alterações nesta revisão. |

## Regras funcionais

- Modelo só fica disponível depois de uma marca reconhecida, com opções das facets da API pertencentes à marca. Durante atualização não é possível escolher opções antigas.
- Alterar/limpar marca limpa modelo e página; alterar filtros/ordenação repõe a primeira página.
- URL com modelo sem marca é normalizada por redirecionamento temporário, removendo modelo e página. A API/BFF também rejeitam o modelo isolado. Combinação incompatível marca/modelo devolve estado vazio, não pesquisa independente.
- Página pedida além da última existente é redirecionada para essa última página. Sem resultados não há ciclo de redirecionamento.
- Validações no formulário refletem o contrato já existente da API: preços 0–9 999 999 999,99 €, até duas casas decimais; anos inteiros 1950–2200; quilómetros inteiros 0–2 000 000; mínimos não superiores a máximos; pesquisa até 120 caracteres.
- Rascunhos inválidos mostram explicação e conservam os últimos resultados válidos. Texto e números aguardam 300 ms; edições sucessivas acumulam-se no rascunho, não numa URL antiga.
- Pesquisas confirmadas criam histórico, em vez de substituir sempre a entrada anterior. Navegações externas/histórico cancelam timers pendentes; versões de pedido impedem conclusões antigas de apagar rascunhos novos.
- Sidebar sem scroll interno, agora direcional: um painel alto percorre o viewport com o scroll normal da página e acompanha depois pelo limite inferior ao descer ou superior ao subir. Inverter o sentido conserva a posição, sem saltar entre limites. O percurso termina na última viatura. Apenas resultados mais curtos que o próprio painel e o layout vertical até 800 px ficam em fluxo normal.

## Verificação realizada

- Website: 142 testes passaram após as correções abaixo; typecheck 0 erros, 67 avisos preexistentes em 10 ficheiros.
- Backend: 68 testes de `publicVehicles.test.ts` passaram; typecheck sem erros.
- Navegador: Audi → A3 → BMW limpa modelo; modelos corretos pelas facets; limpeza de filtros; preços decimais consecutivos; intervalo invertido bloqueado sem mudar URL/resultados; ordenação crescente confirmada nos preços; página 2 com resultados 10–14 e foco no título; URL modelo isolado normalizada; marca/modelo incompatíveis sem resultados e noindex; página 8 recuperada para página 2.
- Teclado: Enter/ArrowDown/Enter selecionam marca; Escape fecha primeiro o seletor, depois os filtros mobile, devolvendo foco ao botão.
- Larguras medidas: 320, 390, 540, 541, 700, 701, 800, 801, 1024, 1200, 1440 e 1920 px, sem overflow horizontal. Paginação longa exercitada com `pageSize=1`, usando dados reais. Filtros mobile sem overflow interno. Lista Tesla curta mantém sidebar estática.
- Inspeção visual com capturas: desktop claro/escuro, mobile claro, guia mobile escuro e referência homepage. Não equivale a certificação de contraste/acessibilidade ou a testes em dispositivos físicos.

## Limites / confirmação posterior

- Voltar/Avançar com os botões reais do browser e navegação sob rede artificialmente lenta não foram reproduzidos nesta sessão. O mecanismo foi revisto no código; não declarar esses dois cenários integralmente validados.
- Não foram feitas medições Lighthouse/CLS de produção nem builds, conforme instruído.
- Fotografias ausentes e a marca `renot` são dados publicados atuais; não foram corrigidos/inventados pelo frontend.
- Confirmar visualmente com o utilizador; não confundir aprovação estética com testes técnicos.

## Correções posteriores ao feedback do utilizador

A solução anterior que desativava o acompanhamento se o painel não coubesse no viewport foi rejeitada. Foi substituída pelo percurso direcional acima; não tratar a versão estática anterior como aprovada.

- **Modelo mais largo:** reproduzido a 265,55 px numa coluna de 248 px em 1366×720. `OrbitSelect` usa agora track `minmax(0, 1fr)` e botão com `min-width: 0` / `max-width: 100%`. Confirmado 248 px, 218 px aos 801 px, 361 px na coluna do formulário aos 800 px e 342 px em mobile390. O texto continua completo no DOM e em `title`; apenas a apresentação visual é abreviada se necessário. Nenhum overflow da página foi ocultado.
- **Acompanhamento medido, painel de 910,28 px:** em 1366×720, scroll600→720 mantém fundo696 px; inverter720→719 move o painel1 px; scroll460 coloca topo24 px; a1060 fundo do painel e da grelha coincidem em585,97 px. Em1440×900, scroll500→650 mantém fundo876 px; ao subir a550 topo24 px; a950 fundo painel/grelha756,94 px. Em1920×1080, scroll550→750 mantém topo24 px; a1250 fundo painel/grelha706,84 px.
- Acompanhamento confirmado também aos801 px. Aos800 e390 px permanece disclosure sem transformação. Nos painéis, overflow é `visible`, `scrollHeight` corresponde a `clientHeight`; sem altura máxima, cortes ou contentor de scroll interno. Os dropdowns mantêm o seu próprio comportamento de lista de opções e foram abertos nos quatro layouts sem cortes laterais.
- Lista Tesla curta e estado vazio mantêm todos os campos no fluxo normal, reservando a altura do formulário antes do guia, sem o sobrepor.
- Percurso completo com Tab em1366×720 terminou no botão de aplicar com caixa647,25–696px, dentro do viewport720px; Shift+Tab regressou ao campo de pesquisa com caixa117,79–165,52px. Todos os campos são alcançáveis também por teclado, sem rolagem interna.
- **FAQs:** reutilizado `OrbitFaq` em Viaturas e Política de Privacidade, depois do conteúdo/guia e imediatamente antes de `OrbitPageEnding` / `#contactos`. Uma única instância por página, mesmo acordeão e conteúdo, texto legal intacto. Medido intervalo0 entre fundoFAQ/iníciocontactos, com respiro dentro da FAQ pelos tokens existentes:52px mobile,85,8px em1440px e96px em1920px. Testados clique eEnter no acordeão; sem overflow horizontal.
