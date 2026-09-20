/**
 * ════════════════════════════════════════════════════════════════════════
 * AUTO NUNES MARTINS · SITE PÚBLICO — VERSÃO "PISTA"  (/stand-fable-3)
 * ════════════════════════════════════════════════════════════════════════
 * Dados de demonstração partilhados pela homepage e pela ficha de viatura.
 * Self-contained: apagar a pasta /stand-fable-3 remove tudo.
 *
 * Gama-alvo do stand: 5.000€ – 20.000€ (usados revistos, mercado nacional).
 */

export interface StandVehicle {
  id: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  /** Mês/ano da primeira matrícula, ex.: "04/2021". */
  registration: string;
  km: number;
  fuel: 'Gasolina' | 'Diesel' | 'Híbrido' | 'GPL / Gasolina';
  transmission: 'Manual' | 'Automática';
  power: number;
  doors: number;
  color: string;
  price: number;
  tag?: string;
  category: 'citadino' | 'utilitario' | 'familiar' | 'suv';
  gallery: string[];
  description: string;
  equipment: string[];
  co2: string;
  consumption: string;
  trunk: string;
}

const u = (id: string, w = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const VEHICLES: StandVehicle[] = [
  {
    id: 'renault-twingo-2017',
    brand: 'Renault',
    model: 'Twingo',
    trim: 'SCe 70 Limited',
    year: 2017,
    registration: '06/2017',
    km: 74300,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 70,
    doors: 5,
    color: 'Branco Cristal',
    price: 6900,
    tag: 'Preço de Entrada',
    category: 'citadino',
    gallery: [u('photo-1605559424843-9e4c228bf1c2'), u('photo-1494976388531-d1058494cdd8', 900), u('photo-1571987502227-9231b837d92a', 900)],
    description:
      'O carro perfeito para a cidade: raio de viragem mínimo, 5 portas e custos de utilização baixíssimos. Motor traseiro SCe 70 simples e fiável. Inspeção válida e revisão feita na entrega.',
    equipment: ['Ar Condicionado', 'Vidros Elétricos', 'Fecho Centralizado', 'Rádio com Bluetooth', 'Direção Assistida', 'Limitador de Velocidade', 'Airbags Frontais e Laterais', 'ISOFIX'],
    co2: '105 g/km',
    consumption: '4.6 L/100km',
    trunk: '188 L',
  },
  {
    id: 'volkswagen-up-2018',
    brand: 'Volkswagen',
    model: 'up!',
    trim: '1.0 MPI Move',
    year: 2018,
    registration: '05/2018',
    km: 61200,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 60,
    doors: 5,
    color: 'Branco Puro',
    price: 7900,
    tag: 'Ideal 1º Carro',
    category: 'citadino',
    gallery: [u('photo-1494976388531-d1058494cdd8'), u('photo-1571987502227-9231b837d92a', 900), u('photo-1605559424843-9e4c228bf1c2', 900)],
    description:
      'O citadino ideal para quem tira a carta: compacto, fácil de estacionar e muito económico. Nacional, com histórico de revisões em dia e pronto a entregar.',
    equipment: ['Ar Condicionado', 'Som com Bluetooth', 'Computador de Bordo', 'Vidros Elétricos', 'Direção Assistida', 'Fecho Centralizado', 'Airbags Frontais e Laterais', 'ABS + ESP'],
    co2: '108 g/km',
    consumption: '4.8 L/100km',
    trunk: '251 L',
  },
  {
    id: 'opel-corsa-2018',
    brand: 'Opel',
    model: 'Corsa',
    trim: '1.2 Edition',
    year: 2018,
    registration: '03/2018',
    km: 72400,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 70,
    doors: 5,
    color: 'Cinza Sovereign',
    price: 9400,
    category: 'citadino',
    gallery: [u('photo-1605559424843-9e4c228bf1c2'), u('photo-1517994112540-009c47ea476b', 900), u('photo-1494976388531-d1058494cdd8', 900)],
    description:
      'Corsa fiável e equilibrado, com baixos consumos e manutenção barata. Espaço suficiente para o dia-a-dia e para viagens em família. Inspeção válida e dois jogos de chaves.',
    equipment: ['Ar Condicionado', 'Ecrã com Apple CarPlay', 'Sensores de Estacionamento', 'Cruise Control', 'Volante Multifunções', 'Faróis de Nevoeiro', 'Bluetooth & USB', 'Jantes 16"'],
    co2: '119 g/km',
    consumption: '5.2 L/100km',
    trunk: '285 L',
  },
  {
    id: 'fiat-500-2021',
    brand: 'Fiat',
    model: '500',
    trim: '1.0 Mild Hybrid Lounge',
    year: 2021,
    registration: '02/2021',
    km: 28400,
    fuel: 'Híbrido',
    transmission: 'Manual',
    power: 70,
    doors: 3,
    color: 'Branco Gelato',
    price: 11900,
    tag: 'Poucos Kms',
    category: 'citadino',
    gallery: [u('photo-1571987502227-9231b837d92a'), u('photo-1494976388531-d1058494cdd8', 900), u('photo-1606664515524-ed2f786a0bd6', 900)],
    description:
      'O icónico citadino italiano na versão Mild Hybrid, com consumos reduzidos na cidade. Teto panorâmico em vidro e apenas 28 mil quilómetros. Como novo, com garantia incluída.',
    equipment: ['Uconnect com Apple CarPlay', 'Teto Panorâmico', 'Jantes 15"', 'Volante em Pele', 'Painel Digital', 'Mild Hybrid 12V', 'Ar Condicionado', 'Sensores Traseiros'],
    co2: '105 g/km',
    consumption: '4.6 L/100km',
    trunk: '185 L',
  },
  {
    id: 'peugeot-208-2019',
    brand: 'Peugeot',
    model: '208',
    trim: '1.2 PureTech Allure',
    year: 2019,
    registration: '09/2019',
    km: 58600,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 82,
    doors: 5,
    color: 'Cinzento Platinium',
    price: 12400,
    category: 'citadino',
    gallery: [u('photo-1568844293986-8d0400bd4745'), u('photo-1605559424843-9e4c228bf1c2', 900), u('photo-1549399542-7e3f8b79c341', 900)],
    description:
      '208 Allure com i-Cockpit, ecrã tátil e excelente equipamento de série. Único proprietário, nacional, com livro de revisões completo. Um usado jovem com aspeto de novo.',
    equipment: ['i-Cockpit', 'Ecrã Tátil 7"', 'Apple CarPlay / Android Auto', 'Sensores de Estacionamento', 'Cruise Control', 'Climatização Automática', 'Faróis LED Diurnos', 'Jantes 16"'],
    co2: '110 g/km',
    consumption: '4.9 L/100km',
    trunk: '285 L',
  },
  {
    id: 'dacia-sandero-2021',
    brand: 'Dacia',
    model: 'Sandero Stepway',
    trim: '1.0 TCe Eco-G',
    year: 2021,
    registration: '09/2021',
    km: 38500,
    fuel: 'GPL / Gasolina',
    transmission: 'Manual',
    power: 100,
    doors: 5,
    color: 'Laranja Atacama',
    price: 12800,
    tag: 'GPL · Custos Baixos',
    category: 'utilitario',
    gallery: [u('photo-1517994112540-009c47ea476b'), u('photo-1605559424843-9e4c228bf1c2', 900), u('photo-1542228262-3d663b306a53', 900)],
    description:
      'Sandero Stepway bi-fuel GPL/Gasolina de fábrica — combustível a metade do preço. Visual crossover, maior altura ao solo e barras de tejadilho. Único proprietário nacional.',
    equipment: ['Media Display', 'Barras de Tejadilho', 'Sensores Traseiros', 'Luzes LED', 'Ar Condicionado', 'Modo ECO', 'Bluetooth & USB', 'Bi-Fuel (GPL / Gasolina)'],
    co2: '109 g/km',
    consumption: '6.5 L/100km (GPL)',
    trunk: '328 L',
  },
  {
    id: 'renault-clio-2021',
    brand: 'Renault',
    model: 'Clio',
    trim: '1.0 TCe Intens',
    year: 2021,
    registration: '04/2021',
    km: 45200,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 90,
    doors: 5,
    color: 'Azul Iron',
    price: 13500,
    tag: 'Mais Procurado',
    category: 'citadino',
    gallery: [u('photo-1568844293986-8d0400bd4745'), u('photo-1549399542-7e3f8b79c341', 900), u('photo-1494976388531-d1058494cdd8', 900)],
    description:
      'Clio Intens em excelente estado, nacional e com um único proprietário. Histórico completo de revisões. EasyLink com Apple CarPlay / Android Auto, câmara traseira, AC automático e faróis LED.',
    equipment: ['EasyLink Multimédia', 'Câmara de Marcha-Atrás', 'Sensores de Estacionamento', 'Faróis 100% LED', 'AC Automático', 'Alerta de Faixa', 'Cruise Control & Limitador', 'Jantes 16"'],
    co2: '116 g/km',
    consumption: '5.1 L/100km',
    trunk: '391 L',
  },
  {
    id: 'seat-ibiza-2020',
    brand: 'Seat',
    model: 'Ibiza',
    trim: '1.0 TSI FR',
    year: 2020,
    registration: '06/2020',
    km: 54100,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 95,
    doors: 5,
    color: 'Vermelho Desire',
    price: 14200,
    tag: 'Desportivo',
    category: 'citadino',
    gallery: [u('photo-1583121274602-3e2820c69888'), u('photo-1606664515524-ed2f786a0bd6', 900), u('photo-1618843479313-40f8afb4b4d8', 900)],
    description:
      'Ibiza no acabamento desportivo FR, com visual agressivo, jantes específicas e excelente comportamento. Motor 1.0 TSI ágil e eficiente. Viatura jovem com poucos quilómetros.',
    equipment: ['Pack Desportivo FR', 'Ecrã Tátil 8"', 'Climatização Automática', 'Jantes 17"', 'Faróis Full LED', 'Cruise Adaptativo', 'Sensores de Estacionamento', 'Volante FR'],
    co2: '113 g/km',
    consumption: '5.0 L/100km',
    trunk: '355 L',
  },
  {
    id: 'ford-focus-2020',
    brand: 'Ford',
    model: 'Focus',
    trim: '1.0 EcoBoost ST-Line',
    year: 2020,
    registration: '06/2020',
    km: 64500,
    fuel: 'Gasolina',
    transmission: 'Manual',
    power: 125,
    doors: 5,
    color: 'Vermelho Race',
    price: 14900,
    category: 'familiar',
    gallery: [u('photo-1618843479313-40f8afb4b4d8'), u('photo-1555215695-3004980ad54e', 900), u('photo-1583121274602-3e2820c69888', 900)],
    description:
      'Versão desportiva ST-Line com suspensão calibrada, soleiras exclusivas e dupla saída de escape. Motor EcoBoost de 125 cv com excelente comportamento dinâmico. Família e prazer de condução no mesmo carro.',
    equipment: ['Pack ST-Line', 'Suspensão Desportiva', 'Jantes 17"', 'Volante de Base Plana', 'SYNC 3 Tátil', 'Sensores Frente/Trás', 'Climatização Automática', 'Costuras Vermelhas'],
    co2: '124 g/km',
    consumption: '5.4 L/100km',
    trunk: '375 L',
  },
  {
    id: 'toyota-yaris-2020',
    brand: 'Toyota',
    model: 'Yaris',
    trim: '1.5 Hybrid Active',
    year: 2020,
    registration: '10/2020',
    km: 52400,
    fuel: 'Híbrido',
    transmission: 'Automática',
    power: 116,
    doors: 5,
    color: 'Cinzento Prata',
    price: 16800,
    tag: 'Caixa Automática',
    category: 'utilitario',
    gallery: [u('photo-1549399542-7e3f8b79c341'), u('photo-1571987502227-9231b837d92a', 900), u('photo-1568844293986-8d0400bd4745', 900)],
    description:
      'Yaris de quarta geração com tecnologia híbrida auto-recarregável — dispensa cabos. Caixa automática suave e consumos reais abaixo dos 4L/100km em cidade. A fiabilidade Toyota com garantia incluída.',
    equipment: ['Toyota Safety Sense', 'Cruise Adaptativo', 'Ecrã Tátil 8"', 'Máximos Automáticos', 'Pré-Colisão com Radar', 'Câmara Traseira', 'Climatizador Automático', 'Transmissão e-CVT'],
    co2: '92 g/km',
    consumption: '3.8 L/100km',
    trunk: '286 L',
  },
  {
    id: 'nissan-qashqai-2019',
    brand: 'Nissan',
    model: 'Qashqai',
    trim: '1.5 dCi N-Connecta',
    year: 2019,
    registration: '11/2019',
    km: 89200,
    fuel: 'Diesel',
    transmission: 'Manual',
    power: 115,
    doors: 5,
    color: 'Cinzento Escuro',
    price: 18900,
    tag: 'Familiar',
    category: 'suv',
    gallery: [u('photo-1542228262-3d663b306a53'), u('photo-1519440552087-77ddc4bb0fdc', 900), u('photo-1517994112540-009c47ea476b', 900)],
    description:
      'Líder dos SUVs familiares em Portugal. Motor 1.5 dCi muito fiável e económico. Teto panorâmico, câmaras 360º e jantes de 18". Viatura nacional, impecável, com garantia de 18 meses.',
    equipment: ['Câmara 360º', 'Teto Panorâmico', 'Jantes 18"', 'Navegação GPS 3D', 'Acesso Sem Chave', 'Reconhecimento de Sinais', 'Sensores de Chuva/Luz', 'Climatização Dual-Zone'],
    co2: '121 g/km',
    consumption: '4.2 L/100km',
    trunk: '430 L',
  },
];

export const eur = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const fmtKm = (n: number) => `${n.toLocaleString('pt-PT')} km`;

/** Mensalidade "desde", indicativa: 84 meses, sem entrada. */
export const monthlyFrom = (price: number) => Math.round((price * 1.06) / 84);

export const findVehicle = (id: string) => VEHICLES.find((v) => v.id === id);

/** Viaturas com preço mais próximo — para o bloco "na mesma faixa". */
export const related = (car: StandVehicle, n = 3) =>
  VEHICLES.filter((v) => v.id !== car.id)
    .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
    .slice(0, n);

export const MAX_PRICE = Math.max(...VEHICLES.map((v) => v.price));

export const CONTACT = {
  phone: '912 345 678',
  phoneHref: 'tel:+351912345678',
  whatsapp: 'https://wa.me/351912345678',
  email: 'geral@autonunesmartins.pt',
  address: 'Estrada Nacional 1, km 132 · Leiria',
  hours: 'Seg–Sex 9h00–19h00 · Sáb 9h30–13h00',
};
