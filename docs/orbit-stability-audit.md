# Orbit — auditoria de arranque, 20 setembro 2026

Ambiente: Vite de desenvolvimento. Sem builds, sem Lighthouse de produção e sem dados de utilizadores reais.

## Cobertura e evidência

Foram capturadas sequências antes/durante/depois de refresh nas 13 secções e rodapé da homepage, em desktop (1280 × 720) e mobile (390 × 844). Um script temporário no início do documento registou scroll, alturas/posições de secções e entradas `layout-shift` com fontes. O instrumento foi removido após a investigação.

- Reproduzida restauração animada desde `scrollY=0` até `3276`, ao longo de cerca de 1,2 segundos, mesmo sem alteração de altura da página. Não contou como CLS, mas era um salto visual indesejado.
- Desktop: geometria das secções manteve-se; pequenos eventos de aproximadamente 0,000385 e 0,000082 apontaram para o SVG do carro da secção de visita.
- Mobile: compensações de scroll de cerca de 29 px, mantendo a geometria das secções. Desativar scroll anchoring durante a restauração eliminou essa compensação no reteste da secção de confiança.
- Mobile: identificadas entradas nos números (cerca de 0,00184), no scan do convite (cerca de 0,00061) e nos ícones da navegação (cerca de 0,000017).
- Capturas do interior mostraram a passagem do estado plano ao estado inclinado ao hidratar. Após inicialização antecipada, a medição dessa secção já começou com movimento e navegação ativos, posição constante e sem entradas de layout shift.

Estes valores são eventos/somas observados durante os testes, não uma nota Lighthouse, nem o CLS de campo ao percentil 75. A bateria final completa após as últimas correções foi interrompida por timeout da ferramenta de navegador; não foi certificada como concluída.

## Correções implementadas

1. Scroll automático (não smooth) e sem scroll anchoring apenas durante o arranque Orbit. Scroll suave normal regressa após hidratação. Fallback temporal evita manter esse estado indefinidamente.
2. Posição de reload guardada localmente ao sair e restaurada sobre o HTML SSR antes da hidratação, somente para o mesmo URL e um reload recente. Navegações normais, hashes e back/forward continuam sob responsabilidade do browser/SvelteKit.
3. Navegação flutuante e pose inicial das cenas calculadas antes da primeira pintura; ação da navegação inicializa sincronamente, sem repetir a entrada.
4. Carro e preenchimento da linha do convite usam transform, em vez de alterar left/width. Scan usa uma faixa móvel transformada, em vez de top variável.
5. Contadores mantêm slots de dígitos estáveis, arranque simultâneo e durações ligeiramente diferentes. Valores estáticos não são escondidos quando JavaScript está desativado.

O cálculo inicial, agora em `apps/website/static/orbit-startup.js`, deve manter equivalência com `scrollTiming.ts` e `designMotion.ts`. Ao alterar a coreografia, testar ambas as fases, incluindo posições restauradas e reduced motion.

## Validação e pendências

- Svelte-check: 0 erros, 89 avisos existentes na última execução.
- Repetir a bateria final completa com janela de observação suficiente para a contagem terminar, e testar tablet, rede lenta/cache frio, navegação entre páginas, reduced motion e imagens lentas.
- Não assumir que CLS baixo significa boa performance global. Medir LCP, resposta a interações, trabalho de JavaScript e renderização/GPU na versão de produção quando autorizado.
- A separação de layouts e autenticação foi entretanto implementada; ver a atualização abaixo.
- As páginas de conceito continuam com noindex por intenção. Não publicar como indexáveis sem rever dados demo, contactos e configuração SEO.

## Atualização — separação das aplicações, 21 setembro 2026

- Bateria repetida em desenvolvimento: 13 secções e rodapé em 1280 × 720 e 390 × 844; quatro posições adicionais em 820 × 1180. Capturas antes, três momentos durante o refresh e após estabilização; observação de entradas de layout shift durante cerca de 2,4 segundos por execução. Não registadas entradas nessas janelas, após as correções anteriores. Não é uma medição de campo nem exclui eventos mais tardios.
- Detetado um problema separado de CLS no fim da página: durante a hidratação, parágrafos de apresentação e formulário ocupavam temporariamente menos linhas; a altura encurtava e o browser limitava scrollY. No mobile a diferença era cerca de 52 px, no tablet cerca de 123 px.
- A restauração conserva temporariamente a altura SSR do documento e reconcilia a posição após hidratação, antes da pintura. A proteção é removida após o arranque, tem fallback temporal e é cancelada por interação. No reteste ao limite inferior: mobile manteve a posição de 11838 px e tablet 8290 px; sem alteração de scroll observada. A posição final não fica presa a uma altura artificial.
- Instrumentação temporária de medição e intercetação de scroll removida. Não há recolha/envio de telemetria.
- Website sem Clerk; login do CRM renderiza em aplicação independente. Testados abrir/fechar formulário, expansão de FAQ e página de referências. Não testada uma sessão autenticada do CRM nem submissão real de formulários.
- Imagem principal observada: variante 1280 px em desktop e 480 px em mobile, em vez do pedido fixo anterior de 1800 px. Não foi medida uma melhoria percentual de LCP ou um ganho de pontuação.
- Testes unitários: website 61, CRM 5, backend 98, âmbito de deploy 2. As configurações de alojamento foram preparadas, mas não executadas. Continuam pendentes testes de produção, cache frio/rede lenta, reduced motion e hardware físico.
