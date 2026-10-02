# Orbit — tipografia e interações, 23 setembro 2026

## Âmbito

Website público apenas. Header, fotografia, mapa e trajetórias de luz aprovadas não foram alterados nesta revisão. Sem builds, commits ou publicação. As variantes de comparação continuam disponíveis.

## Alterações

- Escala funcional em `orbitRhythm.css`: leitura de 15 px em mobile / 16 px nos restantes layouts; perguntas de 18 px em mobile / 20–24 px nos restantes; campos editáveis de 16 px. Os títulos de destaque do hero mantêm a escala própria.
- FAQ: título usa a escala comum das secções, perguntas e respostas têm escalas distintas e entrelinha de leitura consistente. Uma resposta aberta de cada vez; selecionar a aberta fecha-a. Mantidos botões nativos, aria-expanded, aria-controls, regiões, inert e transições com preferência de movimento reduzido.
- Campos do contacto original, variantes e pesquisa do catálogo usam 16 px também em tablet e desktop. O modal já usava 16 px. Não foi reproduzida uma mudança de tamanho entre placeholder e valor: ambos mediram 16 px no mobile antes e depois. Não se reduziu o texto abaixo de 16 px para evitar introduzir risco de zoom ao focar em dispositivos móveis.
- Habitáculo: índices 01/02/03 herdam o tamanho do rótulo. Opções de desktop aumentadas para 18–22 px, ativa 22–28 px; mobile 16 px, ativa 21 px. Mantida a hierarquia visual da opção ativa.
- Corrigido o espaço de leitura de «Financiamento» aos 701 px: o padding horizontal dos cartões de serviços passa a 20 px entre 701 e 850 px, sem cortar o texto.
- Contacto: os dois CTAs anteriormente vermelhos passam a branco (#fff), texto escuro (#17231e), hover #e9ede8. As suas setas usam #e30613; ícones informativos e outros CTAs não recebem esta regra. Botões transparentes das propostas continuam transparentes.
- Ações que diziam «Telefonar agora» passam a «Ligar agora», incluindo navegação partilhada e a ocorrência na proposta stand-v2. As etiquetas informativas continuam «Telefone»; números e href tel permanecem iguais.
- Proposta de visita duplicada abaixo da original, identificada como «PROPOSTA · CONVITE COMPACTO». Até 850 px, escolha Viatura/Retoma/Dúvidas, resposta e CTA ficam no mesmo cartão. Acima disso mantém a composição de duas colunas. Estado e IDs independentes. Animação curta (220 ms), sem animação para reduced motion. Espaço de resposta reservado para impedir crescimento ao alternar opções.

## Verificação realizada

- Inspeção DOM/CSS de 7 rotas × 9 viewports: homepage, Quem Somos, catálogo, ficha demo Porsche, ficha real Audi A3, privacidade e referências. Larguras: 320, 390, 430, 768, 820, 1024, 1280, 1920 e 3840 px.
- Inspeção adicional em 45 larguras adjacentes aos breakpoints, em home, Quem Somos, catálogo e ficha demo (180 combinações). Limites: 360, 380, 540, 600, 700, 760, 800, 850, 900, 1000, 1050, 1100, 1200, 1500 e 1800 px, cada um com -1/0/+1.
- Detetado overflow de «Financiamento» aos 701 px; reteste após correção sem esse overflow. Sem overflow horizontal do documento nas amostras. Os alertas de scrollWidth nos hotspots mobile do habitáculo correspondem ao halo animado; os rótulos estão display:none nesse layout, não são texto cortado.
- Capturas visuais revistas: formulário preenchido a 390 px, pergunta/resposta longa do FAQ a 320 px, índices do habitáculo a 1280 px e proposta compacta mobile.
- Testados preenchimento e foco nos formulários integrado e modal, mais submissões de demonstração: confirmação explícita de que não enviam nem guardam dados.
- FAQ testado com clique, Enter e Espaço: abrir uma segunda pergunta fecha a primeira; voltar a ativá-la deixa zero abertas.
- Cartão compacto testado nas três opções a 320/390/430/768/820/850 px: altura idêntica entre opções para cada largura (~416 px a 320; ~402 px nas restantes). A escolha Retoma abriu a mensagem correta no modal; a escolha Viatura também.
- Cores dos botões e setas confirmadas em claro/escuro na homepage e nas comparações de Quem Somos; hover confirmado no botão de pedido. Sem IDs duplicados nas duas páginas.
- Verificação de tipos: 0 erros, 67 avisos existentes. Testes unitários: 79 aprovados.

## Limitações

Atualização após comparação: por pedido do utilizador, a segunda versão «Uma visita. À sua medida.» foi retirada da homepage. Mantém-se apenas a versão original. Os resultados do convite compacto acima são o registo da experiência, não uma descrição da página atual.

Afinação posterior do habitáculo: opções reduzidas para 16–18 px em desktop (ativa 18–22 px), e 14 px em mobile (ativa 17 px). Os índices passam a 85% do texto, por pedido explícito após comparação. Verificados 320/390/700/701/820/1280/1920 px, sem overflow das opções.

Afinação posterior do FAQ: por aprovação do utilizador, as perguntas passam a 17 px em mobile e 18–21 px nos restantes layouts, com peso 400. O título principal, as respostas, a entrelinha e o comportamento do acordeão não foram alterados nesta afinação.

As amostras de layout são de Chromium em desenvolvimento, não de dispositivos físicos nem uma certificação visual de todas as combinações. Não foi testado autofill real de um gestor de palavras-passe nem Safari/iOS. Não foram medidos Lighthouse, Core Web Vitals de produção ou percentil de utilizadores reais. O resultado não implica CLS global zero.
