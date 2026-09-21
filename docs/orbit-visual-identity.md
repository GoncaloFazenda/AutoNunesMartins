# Identidade visual — website público Orbit

## Estabilidade visual e carregamento

Tratar a estabilidade do layout como requisito de cada alteração, não apenas do estado final.
Reservar a mesma geometria antes e depois da hidratação: alturas de cenas, espaços da navegação,
proporções de imagens e posição inicial de elementos animados. Animações devem preferir
transform e opacity; o foco dos campos reforça a borda para dentro, sem alterar dimensões.

Verificar homepage, catálogo e ficha em desktop e mobile: entrada direta, refresh no topo,
refresh com scroll restaurado, fontes/imagens a carregar, filtros, formulário e navegação.
Não declarar CLS ou SEO aprovados apenas com svelte-check: medir num build de produção.

Correções aplicadas: fontes locais Orbit Inter com preload dos pesos principais e display=optional
(em ligação lenta pode manter Arial nessa navegação, evitando substituição tardia); DiscoverVehicles
usa altura automática e linhas de grelha uniformes, sem ResizeObserver; o header reserva a
geometria sticky antes da hidratação. As fotos da ficha já reservam proporção 4/3.
Pendente: medição de CLS em produção e testes de refresh com scroll restaurado nas diferentes
dimensões de ecrã. Não confundir regras antigas de cenas já removidas com problemas ativos.
Manter noindex nas páginas demonstrativas até à revisão de conteúdo e publicação real.

## Brilho das linhas vermelhas

O brilho das linhas é uma assinatura visual do Orbit: núcleo vermelho definido,
halo curto rosado e duas camadas difusas vermelhas. Não equivale à iluminação
ambiente do canto nem a uma sombra vermelha genérica em cartões.

Fonte reutilizável: `--orbit-line-glow`, definido em
`frontend/src/lib/components/stand-concepts/orbitRhythm.css`, no âmbito `.design.orbit`.

```css
color: var(--red); /* #e30613 */
opacity: 0.95;
filter: var(--orbit-line-glow);

/* Composição exata do token */
filter:
  drop-shadow(0 0 2.5px rgb(255 51 76 / 90%))
  drop-shadow(0 0 5px #e3061366)
  drop-shadow(0 0 12px #e3061399)
  drop-shadow(0 0 26px #e3061359);
```

As linhas do hero usam traço de 2.5 e extremidades arredondadas. O acordeão
usa traço de 1.75 no estado expandido. Preservar a espessura própria de cada
ícone: partilhar o brilho não significa engrossar todos os traços.

Referências: `StageBackdrop.svelte`, `OrbitPerspective.svelte` e
`OrbitAccordion.svelte`. Ao aplicar o «glow das nossas linhas», usar este token
e estas referências, sem inventar outra cor ou intensidade.

No cartão `DiscoverVehicles`, a seta é vermelha e diagonal em repouso;
no hover/foco aponta à direita e recebe este brilho. O contorno do cartão
mantém-se neutro. O efeito não altera a área clicável nem a legibilidade.
Movimento deve respeitar `prefers-reduced-motion`; o estado visual pode
continuar presente sem animação.
