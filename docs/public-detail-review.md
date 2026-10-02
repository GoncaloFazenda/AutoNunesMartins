# Ficha pública, recomendações e navegação — 2 de outubro de 2026

## Resultado

A ficha pública usa agora o mesmo ramo/template de detalhe de `DesignEdition.svelte` que a demonstração Porsche. Foi removido o componente independente `OrbitPublicDetail.svelte`, que tinha estrutura e estilos diferentes. A variante Porsche Lab foi mantida compatível. Galeria, títulos, especificações, botões, grelha 72/28, sticky e relacionados usam os estilos existentes da demonstração. As miniaturas mantêm a faixa horizontal até `max-width: 701px`.

O catálogo público fornece até três sugestões, ordenadas exclusivamente pela diferença absoluta de preço. Um desempate pelo slug garante estabilidade, sem preferência por marca/modelo. Duas consultas ordenadas, limitadas a três resultados de cada lado do preço, cobrem todo o stock elegível sem enviar o catálogo inteiro ao browser. Excluem a própria viatura, duplicados, preços nulos/não positivos e viaturas não publicadas, vendidas ou inelegíveis. Sem preço válido na origem não há sugestões. Erros nas sugestões não impedem abrir a ficha. A demonstração ordena os seus próprios dados ilustrativos por preço e identifica-os como demonstração.

## Auditoria do Jogger Extreme

Ficha: `/stand-orbit/viaturas/dacia-jogger-extreme-2023-cf06e4d3ad62`.

- API/CRM: ano 2023, 83 491 km, Gasolina, preço público 17 141,78 €.
- Descrição pública existente: «Dacia Jogger Extreme, de 2023.».
- Uma fotografia guardada e uma aprovada; transmissão não preenchida.
- Marca, modelo, ano, combustível e quilometragem não se perdiam na API: faltava a secção rica de especificações na apresentação real.
- Potência, cilindrada, portas, lugares, categoria, cor e equipamento não tinham campos públicos próprios. Foram acrescentados como opcionais no painel de publicação comum aos fluxos criar/editar.
- A descrição interna permanece privada. O fluxo «publicar» um rascunho no CRM muda a disponibilidade interna; a aprovação no website continua separada.
- A fotografia aprovada contém texto com valores diferentes: 2024, 67 000 km e 17 950 €. Não se inferiram características a partir da imagem nem se alterou nenhum destes dados. A equipa deve confirmar a ficha e substituir a imagem ou corrigir os campos conforme os dados reais.

Secções de equipamento só aparecem com equipamento preenchido. A imagem editorial usa uma segunda fotografia aprovada quando existe; não se inventa outra imagem nem se repete a única foto do Jogger para preencher espaço. A descrição pública é apresentada tal como aprovada.

## Estrutura e compatibilidade

Migração nova: `20261002233000_add_public_specifications`, coluna opcional JSONB `Vehicle.publicSpecifications`. Aplicada isoladamente ao Supabase configurado e registada em `_prisma_migrations`; cliente Prisma regenerado. Não foram executadas outras migrações pendentes, preenchidas características ou feitas alterações a viaturas para testes.

O contrato partilhado valida os campos permitidos e limites numéricos, rejeitando chaves desconhecidas. Clientes antigos que omitam `specifications` preservam os valores existentes. A publicação atual envia explicitamente os campos confirmados. Os campos em branco são omitidos na página. A API pública não reutiliza notas internas nem dados financeiros privados.

## Scroll

`html { scroll-behavior: smooth }` animava o reposicionamento feito pelo router ao trocar de rota, mostrando primeiro a posição antiga limitada ao fim da página nova. A base passa a `auto`; o router mantém o controlo de topo, histórico e âncoras, sem temporizadores nem intervenção nas animações internas de scroll.

## Verificação

- Backend: 78 testes de publicação, fronteiras públicas e recomendações passaram.
- CRM: 7 testes da ação partilhada de publicação passaram, incluindo parsing e rejeição dos novos campos.
- Website: 32 testes de contrato, carregamento público e catálogo passaram.
- Svelte website: 0 erros (112 avisos existentes). Svelte CRM: 0 erros (22 avisos existentes). TypeScript backend: sem erros.
- API real: sugestões do Jogger coincidem com cálculo independente sobre as 14 viaturas públicas: Clio 15 105,02 €, Golf 23 886,90 €, Golf 24 815,82 €. Inclui resultados para além da primeira página de nove itens.
- Browser: estilos calculados de títulos, grelha, galeria e sticky idênticos entre Porsche e Jogger em desktop. Mobile 390 px com uma coluna, sticky desativado e sem overflow horizontal.
- Browser: homepage profunda → Quem Somos chega a scrollY=0 em desktop e mobile; Voltar restaura posição profunda; âncora da história posiciona o alvo a 100 px do topo.
- Não foi submetida edição de uma viatura real apenas para testar. A persistência foi coberta por testes com mocks; a coluna e leitura pública foram verificadas na base existente.

## Ficheiros deste conjunto de alterações

- `apps/crm/src/lib/components/vehicle/WebPublicationPanel.svelte`
- `apps/crm/src/lib/server/vehicles.ts`
- `apps/crm/src/lib/server/webPublication.ts`
- `apps/crm/src/lib/server/webPublication.test.ts`
- `apps/website/package.json`
- `apps/website/src/app.css`
- `apps/website/src/lib/components/stand-concepts/DesignEdition.svelte`
- `apps/website/src/lib/components/stand-concepts/PorscheDetailLab.svelte`
- `apps/website/src/lib/components/stand-concepts/OrbitPublicDetail.svelte` (removido)
- `apps/website/src/lib/components/stand-concepts/orbitDetail.css`
- `apps/website/src/lib/components/stand-concepts/porscheDetailLab.css`
- `apps/website/src/lib/publicVehicles.ts`
- `apps/website/src/lib/server/publicVehicles.ts`
- `apps/website/src/routes/stand-orbit/viaturas/[slug]/+page.server.ts`
- `apps/website/src/routes/stand-orbit/viaturas/[slug]/+page.svelte`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20261002233000_add_public_specifications/migration.sql`
- `backend/src/lib/data/publicVehicle.ts`
- `backend/src/lib/domain/publicVehicle.ts`
- `backend/src/lib/server/webPublicationService.ts`
- `backend/src/routes/publicVehicles.ts`
- `backend/src/routes/publicVehicles.test.ts`
- `shared/types/src/index.ts`
- `shared/types/src/publicSpecifications.ts`
- `yarn.lock`
- Este documento.

Não houve commit, push, stash, reset ou troca de branch. O checkout contém também trabalho anterior/de outras tarefas: esta lista não autoriza atribuir todas as alterações existentes a este conjunto.
