import { responsivePhoto } from './images';
export type TeamMember = {
  name: string;
  role: string;
  text: string;
  phone: { display: string; international: string } | null;
  email: string | null;
  exampleContact?: boolean;
};

/** Editorial prototype. Verify the history, people and claims before publication. */
const localPhotoSet = (name: string, widths: number[]) =>
  widths.map((width) => `/images/about/${name}-${width}.webp ${width}w`).join(', ');

export const aboutContent = {
  introduction:
    'Somos um stand independente, em Lisboa. Ajudamos a escolher o próximo carro com informação clara, tempo para decidir e uma equipa por perto.',
  heroImage: {
    id: '/images/about/showroom-demo-v1-960.webp',
    srcset: localPhotoSet('showroom-demo-v1', [480, 960, 1536]),
    alt: 'Vista ilustrativa de um stand com várias viaturas — imagem gerada, não corresponde às instalações reais',
  },
  origins: {
    title: 'Começámos com carros. Crescemos com pessoas.',
    paragraphs: [
      'A Auto Nunes Martins nasceu de um projeto familiar e de uma vontade simples: fazer da compra de um automóvel uma experiência próxima, sem complicações. No início, havia um pequeno espaço e uma seleção curta, escolhida com tempo.',
      'A seleção cresceu. Chegaram novas marcas e novas pessoas. O que procuramos manter é a forma de receber: conhecer quem nos visita, perceber o que precisa e ajudar a encontrar um carro que faça sentido na sua vida.',
    ],
  },
  history: [
    {
      year: '2011',
      title: 'O primeiro espaço.',
      text: 'Um projeto familiar abre portas em Lisboa.',
    },
    {
      year: '2017',
      title: 'Mais escolha. A mesma atenção.',
      text: 'Novas marcas e mais cuidado na preparação de cada viatura.',
    },
    {
      year: 'Hoje',
      title: 'Perto, aqui e no stand.',
      text: 'A conversa pode começar online. A relação continua ao vivo.',
    },
  ],
  approach: {
    title: 'Escolher bem começa por conhecer melhor.',
    paragraphs: [
      'O nosso trabalho começa antes da visita: conhecer cada automóvel, cuidar da apresentação e reunir a informação que ajuda a comparar.',
      'Depois, ouvimos. Falamos sobre o que procura, esclarecemos dúvidas e acompanhamos os próximos passos. Queremos que decida com confiança — e ao seu ritmo.',
    ],
    image: 'photo-1652453822981-653a9a522a5b',
    srcset: responsivePhoto('photo-1652453822981-653a9a522a5b'),
    alt: 'Habitáculo com volante e consola central — fotografia ilustrativa',
  },
  teamIntroduction:
    'Por trás de cada resposta há uma pessoa. Conheça quem o acompanha, da primeira conversa à entrega.',
  essence: {
    eyebrow: 'A NOSSA ESSÊNCIA',
    lead: 'A confiança começa',
    middle: 'nas pessoas',
    highlight: 'que o acompanham.',
  },
  team: [
    {
      name: 'Rui Nunes',
      role: 'Seleção & gestão',
      text: 'Conhece os automóveis e ajuda a perceber o que distingue cada escolha.',
      phone: null,
      email: 'rui.nunes@example.com',
      exampleContact: true,
    },
    {
      name: 'Inês Martins',
      role: 'Atendimento',
      text: 'Recebe-o, ouve o que procura e dá espaço às suas perguntas.',
      phone: null,
      email: 'ines.martins@example.com',
      exampleContact: true,
    },
    {
      name: 'Tiago Alves',
      role: 'Preparação & entrega',
      text: 'Acompanha os detalhes para que o próximo passo seja tranquilo.',
      phone: null,
      email: 'tiago.alves@example.com',
      exampleContact: true,
    },
  ] satisfies TeamMember[],
};
