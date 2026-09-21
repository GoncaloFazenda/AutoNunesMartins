<!--
  PUBLIC VEHICLE DETAIL PAGE — V2
  ──────────────────────────────────────────────────────────────────────────
  Companion to /stand-v2. Brand-aligned dark theme (matches the ERP):
  brand red #e30613, dark surfaces, italic uppercase Barlow display,
  JetBrains Mono numeric values, square chips, spec-row pattern, red
  wedge on the right edge, ambient red glow.

  Differentiated from /stand/[id] (which also uses these colors) by:
    • Wider layout (1600px max) and full-bleed gallery
    • Interactive financing slider with live monthly recalc
    • Specs presented with the spec-row brand pattern
    • Sticky info aside that highlights monthly payment up front
    • Inquiry chips (interest selector) and WhatsApp/call shortcuts
    • Related cars selected by price proximity (not first-3 fallback)

  Self-contained — no $lib imports. Delete this file and the parent
  +page.svelte and /stand-v2 disappears.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut, expoOut } from 'svelte/easing';

  interface Vehicle {
    id: string;
    brand: string;
    model: string;
    trim: string;
    year: number;
    km: number;
    fuel: string;
    transmission: string;
    power: number;
    doors: number;
    color: string;
    price: number;
    monthly: number;
    tag?: string;
    badges: string[];
    gallery: string[];
    description: string;
    equipment: string[];
    extras: { co2: string; consumption: string; capacity: string; registration: string };
  }

  const vehicles: Vehicle[] = [
    {
      id: 'renault-clio-2021',
      brand: 'Renault', model: 'Clio', trim: 'TCe 90 Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual 5v',
      power: 90, doors: 5, color: 'Azul Iron', price: 13500, monthly: 169,
      badges: ['Garantia 24M', 'Único dono'],
      gallery: [
        'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Clio Intens em estado de exposição, único dono particular, com revisões integralmente feitas em concessionário Renault. Equipado com sistema multimédia EasyLink 7", câmara traseira e bancos em tecido premium. Inspeção válida até 2027 e IUC verde.',
      equipment: [
        'EasyLink 7" táctil + Apple CarPlay/Android Auto',
        'Câmara traseira com sensores de parqueamento',
        'Climatização automática',
        'Cruise control adaptativo',
        'Faróis LED Pure Vision',
        'Jantes de liga 16" Philia',
        'Bancos em tecido premium Tep',
        'Pack de assistência à condução (LDW, AEB)',
      ],
      extras: { co2: '116 g/km', consumption: '5.1 L/100km', capacity: '391 L', registration: '03/2021' },
    },
    {
      id: 'peugeot-208-2022',
      brand: 'Peugeot', model: '208', trim: '1.2 PureTech Allure',
      year: 2022, km: 32100, fuel: 'Gasolina', transmission: 'Manual 6v',
      power: 100, doors: 5, color: 'Branco Banquise', price: 15500, monthly: 195,
      badges: ['Garantia 24M'],
      gallery: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        '208 Allure com i-Cockpit 3D, ecrã táctil 10" e bancos em pele/tecido. Cor branca, manutenção integralmente feita em rede Peugeot, com pneus recentes. Inspeção em dia, livre de marcas e sem registo de embates.',
      equipment: [
        'Peugeot i-Cockpit 3D (instrumentos hologramados)',
        'Ecrã táctil 10" com mirror screen',
        'Câmara traseira HD',
        'Climatização automática mono-zona',
        'Faróis LED + iluminação diurna assinatura',
        'Jantes de liga 16" Soleil',
        'Bancos mistos pele/tecido',
        'Pack ADAS Drive Assist (ACC, LKA)',
      ],
      extras: { co2: '118 g/km', consumption: '5.2 L/100km', capacity: '311 L', registration: '06/2022' },
    },
    {
      id: 'vw-polo-2022',
      brand: 'Volkswagen', model: 'Polo', trim: '1.0 TSI Life',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Manual 5v',
      power: 95, doors: 5, color: 'Cinzento Limestone', price: 17900, monthly: 225,
      badges: ['Garantia 24M', 'Recém-chegado'],
      gallery: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Polo Life em configuração equilibrada, ideal para circulação urbana e viagens. Acabamento Volkswagen impecável, sistema Composition Media, climatização automática e pack de assistência ativa. Recém-entrado no stand, totalmente revisto.',
      equipment: [
        'Composition Media 8" + App-Connect wireless',
        'Climatronic mono-zona',
        'Pack assistência: Front Assist, Lane Assist',
        'Cruise control adaptativo ACC',
        'Faróis LED com luz diurna',
        'Volante multifunções em pele',
        'Sensores de parqueamento traseiros',
        'Jantes de liga 15" Sassari',
      ],
      extras: { co2: '120 g/km', consumption: '5.3 L/100km', capacity: '351 L', registration: '04/2022' },
    },
    {
      id: 'ford-focus-2022',
      brand: 'Ford', model: 'Focus Active', trim: '1.0 EcoBoost 125',
      year: 2022, km: 38900, fuel: 'Gasolina', transmission: 'Manual 6v',
      power: 125, doors: 5, color: 'Azul Desert Island', price: 18500, monthly: 235,
      badges: ['Garantia 24M'],
      gallery: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1530016884097-31166cc3c0ff?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Focus Active com look crossover, suspensão sobre-elevada e proteções pretas. Pack tecnológico completo, sistema SYNC4 com ecrã 13.2" e câmara 360°. Excelente alternativa para quem procura espaço com pegada moderna.',
      equipment: [
        'SYNC 4 com ecrã 13.2"',
        'Câmara 360° com vista panorâmica',
        'Cruise control adaptativo Stop & Go',
        'Bancos dianteiros aquecidos',
        'Faróis Matrix LED com luz de curva',
        'Jantes de liga 17" Active',
        'Suspensão sobre-elevada (+30mm)',
        'Pack Co-Pilot 360 (BLIS, Pre-Collision)',
      ],
      extras: { co2: '129 g/km', consumption: '5.7 L/100km', capacity: '375 L', registration: '07/2022' },
    },
    {
      id: 'opel-astra-2022',
      brand: 'Opel', model: 'Astra', trim: '1.2 T Edition',
      year: 2022, km: 26100, fuel: 'Gasolina', transmission: 'Manual 6v',
      power: 110, doors: 5, color: 'Cinzento Quartz', price: 19500, monthly: 245,
      badges: ['Garantia 24M', 'IUC verde'],
      gallery: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Novo Astra L com plataforma EMP2 da Stellantis. Design "Vizor" Opel, sistema Pure Panel com dois ecrãs de 10", excelente eficiência e poucos quilómetros. IUC verde reduzido. Inspeção válida até final de 2026.',
      equipment: [
        'Pure Panel: 2x ecrãs 10" curvados',
        'Apple CarPlay/Android Auto wireless',
        'Cruise control adaptativo Stop & Go',
        'Câmara traseira + sensores 360°',
        'Faróis LED IntelliLux Matrix',
        'Jantes de liga 17" diamantadas',
        'Climatização bi-zona',
        'Pack Sight & Light (auto-dimming)',
      ],
      extras: { co2: '124 g/km', consumption: '5.5 L/100km', capacity: '422 L', registration: '05/2022' },
    },
    {
      id: 'seat-leon-2021',
      brand: 'SEAT', model: 'Leon', trim: '1.5 TSI FR',
      year: 2021, km: 51800, fuel: 'Gasolina', transmission: 'Manual 6v',
      power: 150, doors: 5, color: 'Vermelho Desire', price: 19900, monthly: 249,
      badges: ['Garantia 24M'],
      gallery: [
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1530016884097-31166cc3c0ff?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Leon FR com motor 1.5 TSI 150cv, configuração desportiva e pack iluminação assinatura traseira. Tecto solar, bancos em pele/alcântara desportivos e SEAT Connect. Histórico documentado, sem registo de embates.',
      equipment: [
        'Pack Convenience: Virtual Cockpit + ecrã 10"',
        'Iluminação assinatura LED (frente + trás)',
        'Bancos desportivos pele/alcântara',
        'Volante FR perfurado',
        'Tecto solar panorâmico',
        'Pack ADAS: ACC, Side Assist, Lane Assist',
        'Jantes de liga 18" Performance Black',
        'Suspensão desportiva FR',
      ],
      extras: { co2: '124 g/km', consumption: '5.5 L/100km', capacity: '380 L', registration: '02/2021' },
    },
    {
      id: 'renault-captur-2022',
      brand: 'Renault', model: 'Captur', trim: 'E-Tech Hybrid 145',
      year: 2022, km: 31400, fuel: 'Híbrido', transmission: 'Automática multi-mode',
      power: 145, doors: 5, color: 'Laranja Atacama', price: 21900, monthly: 275,
      badges: ['Híbrido', 'Garantia 24M'],
      gallery: [
        'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Captur híbrido full hybrid (não plug-in) — circula em modo 100% elétrico em cidade a maior parte do tempo. Consumo médio real ronda 4.5L/100km. Cor exclusiva Atacama bi-tone, configuração Techno bem equipada.',
      equipment: [
        'Híbrido full hybrid 1.6 E-Tech (sem necessidade de carregamento)',
        'EasyLink 9.3" portrait + nav integrado',
        'Painel digital 10.2"',
        'Carregamento elétrico em travagem (regen)',
        'Pack Highway & Traffic Jam Companion (autónomo nível 2)',
        'Câmara 360°',
        'Jantes de liga 18" Pasadena',
        'Bancos em tecido reciclado premium',
      ],
      extras: { co2: '105 g/km', consumption: '4.6 L/100km', capacity: '422 L', registration: '08/2022' },
    },
    {
      id: 'bmw-serie1-2021',
      brand: 'BMW', model: 'Série 1', trim: '116d Sport Line Auto',
      year: 2021, km: 47600, fuel: 'Diesel', transmission: 'Automática Steptronic',
      power: 116, doors: 5, color: 'Preto Sapphire Metalizado', price: 23500, monthly: 295,
      badges: ['Garantia 24M', 'Caixa auto'],
      gallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Série 1 116d Sport Line com caixa automática 7v. Motor 1.5 diesel económico (~4.5L/100km reais), excelente para quem faz quilómetros. Pack Sport, jantes 18" e iDrive 7. Manutenção em concessionário BMW.',
      equipment: [
        'BMW iDrive 7 com ecrã táctil 8.8"',
        'BMW Live Cockpit Plus (instrumentos digitais)',
        'Câmara traseira + Park Distance Control',
        'Cruise control com função de travagem',
        'Faróis LED com luzes diurnas',
        'Bancos desportivos em Sensatec preto',
        'Jantes de liga 18" Y-spoke Sport',
        'Pack Sport Line completo',
      ],
      extras: { co2: '112 g/km', consumption: '4.3 L/100km', capacity: '380 L', registration: '11/2021' },
    },
    {
      id: 'vw-golf-2022',
      brand: 'Volkswagen', model: 'Golf 8', trim: '1.5 eTSI Life DSG',
      year: 2022, km: 35100, fuel: 'Gasolina', transmission: 'Automática DSG 7v',
      power: 130, doors: 5, color: 'Cinzento Dolphin', price: 24900, monthly: 312,
      badges: ['Mild Hybrid', 'Garantia 24M'],
      gallery: [
        'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1530016884097-31166cc3c0ff?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Golf 8 Life com sistema mild hybrid 48V e caixa DSG 7 velocidades. Discover Pro com nav e Travel Assist (autónomo nível 2). Excelente conforto de marcha, baixos consumos e tecnologia VW de nova geração.',
      equipment: [
        'Mild Hybrid 48V (consumos -10%)',
        'Discover Pro: ecrã 10" + navegação',
        'Digital Cockpit Pro 10.25"',
        'Travel Assist (autónomo nível 2)',
        'IQ.Light Matrix LED',
        'Climatronic 3-zonas Air Care',
        'Volante multifunções aquecido',
        'Jantes de liga 17" Norfolk',
      ],
      extras: { co2: '118 g/km', consumption: '5.2 L/100km', capacity: '380 L', registration: '03/2022' },
    },
    {
      id: 'audi-a3-2021',
      brand: 'Audi', model: 'A3 Sportback', trim: '30 TDI S tronic Advanced',
      year: 2021, km: 53400, fuel: 'Diesel', transmission: 'Automática S tronic 7v',
      power: 116, doors: 5, color: 'Branco Glaciar Metalizado', price: 25900, monthly: 325,
      badges: ['Garantia 24M', 'Caixa auto'],
      gallery: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'A3 Sportback 30 TDI com pack Advanced. Audi Virtual Cockpit Plus, MMI Navigation Plus 10.1" e bancos desportivos em pele/tecido. Excelente eficiência (4.5L/100km reais) e acabamento Audi de topo de gama.',
      equipment: [
        'Audi Virtual Cockpit Plus 10.25"',
        'MMI Navigation Plus 10.1" táctil',
        'Bancos desportivos pele/tecido',
        'Faróis LED Matrix com luz de curva',
        'Cruise control adaptativo Stop & Go',
        'Áudio Premium 3D',
        'Jantes de liga 17" 10-raios estrela',
        'Pack assistência: ACC, Lane Assist, Side Assist',
      ],
      extras: { co2: '115 g/km', consumption: '4.4 L/100km', capacity: '380 L', registration: '01/2021' },
    },
    {
      id: 'peugeot-3008-2021',
      brand: 'Peugeot', model: '3008', trim: '1.5 BlueHDi GT EAT8',
      year: 2021, km: 68200, fuel: 'Diesel', transmission: 'Automática EAT8',
      power: 130, doors: 5, color: 'Cinzento Artense', price: 26500, monthly: 332,
      badges: ['Garantia 24M', 'Pack GT'],
      gallery: [
        'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        '3008 GT com nível de equipamento topo de gama. Bancos em pele Nappa, tecto panorâmico, head-up display e i-Cockpit 3D. SUV ideal para família, com mala de 591L e excelente conforto rodoviário.',
      equipment: [
        'Bancos em pele Nappa Mistral',
        'Tecto panorâmico abrível',
        'Head-up display colorido',
        'i-Cockpit 3D + ecrã 10"',
        'Focal Premium Hi-Fi (10 colunas)',
        'Câmara 360° Visiopark 2',
        'Jantes de liga 19" Washington',
        'Pack Drive Assist Plus (semi-autónomo)',
      ],
      extras: { co2: '127 g/km', consumption: '4.8 L/100km', capacity: '591 L', registration: '04/2021' },
    },
    {
      id: 'hyundai-tucson-2022',
      brand: 'Hyundai', model: 'Tucson', trim: '1.6 T-GDi Hybrid Premium',
      year: 2022, km: 42700, fuel: 'Híbrido', transmission: 'Automática 6v',
      power: 230, doors: 5, color: 'Cinzento Shimmering Silver', price: 27500, monthly: 345,
      badges: ['Híbrido', 'Garantia 24M', 'Premium'],
      gallery: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Tucson híbrido full hybrid em configuração Premium — o topo de gama. Design "Parametric" Hyundai, faróis escondidos na grelha, dois ecrãs de 10.25" e nível de equipamento sem comprometer nada. 230cv combinados.',
      equipment: [
        'Híbrido full hybrid 230cv combinados',
        'Faróis Parametric escondidos na grelha',
        'Dois ecrãs 10.25" (nav + instrumentos)',
        'Bancos em pele aquecidos e ventilados',
        'Som Krell Premium 8 colunas',
        'Tecto solar panorâmico',
        'Pack Highway Drive Assist 2 (autónomo)',
        'Jantes de liga 19" diamantadas',
      ],
      extras: { co2: '125 g/km', consumption: '5.6 L/100km', capacity: '620 L', registration: '06/2022' },
    },
  ];

  // ─── URL param + lookup ─────────────────────────────────────────────────
  const vehicleId = $derived($page.params.id);
  const vehicle = $derived(vehicles.find((v) => v.id === vehicleId));
  const related = $derived(
    vehicle
      ? vehicles
          .filter((v) => v.id !== vehicle.id)
          .sort((a, b) => Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price))
          .slice(0, 3)
      : [],
  );

  // ─── State ──────────────────────────────────────────────────────────────
  let mounted = $state(false);
  let scrollY = $state(0);
  let activePhoto = $state(0);
  let financeMonths = $state(84);

  $effect(() => {
    void vehicleId;
    activePhoto = 0;
  });

  // Naive linear rescale of the headline monthly when the prazo changes —
  // honest enough for a marketing simulator (real TAEG calc is done with
  // the visitor during the visit).
  const financeMonthly = $derived.by(() => {
    if (!vehicle) return 0;
    const baseMonths = 84;
    const baseTotal = vehicle.monthly * baseMonths;
    return Math.round(baseTotal / financeMonths);
  });

  onMount(() => {
    requestAnimationFrame(() => (mounted = true));
  });

  function reveal(node: HTMLElement, params: { delay?: number; y?: number } = {}) {
    const delay = params.delay ?? 0;
    const y = params.y ?? 24;
    node.style.opacity = '0';
    node.style.transform = `translateY(${y}px)`;
    node.style.transition = `opacity 760ms cubic-bezier(.2,.8,.2,1) ${delay}ms, transform 760ms cubic-bezier(.2,.8,.2,1) ${delay}ms`;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
            obs.unobserve(node);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const formatInt = (n: number) => new Intl.NumberFormat('pt-PT').format(n);
</script>

<svelte:head>
  <title>
    {vehicle
      ? `${vehicle.brand} ${vehicle.model} ${vehicle.trim} · Auto Nunes Martins`
      : 'Viatura não encontrada · Auto Nunes Martins'}
  </title>
  {#if vehicle}
    <meta
      name="description"
      content="{vehicle.brand} {vehicle.model} {vehicle.year} · {formatInt(vehicle.km)} km · desde {formatEUR(vehicle.monthly)}/mês — em stock no Auto Nunes Martins."
    />
  {/if}
</svelte:head>

<svelte:window bind:scrollY />

<div class="site">
  <!-- Brand DNA -->
  <div class="ambient" aria-hidden="true"></div>
  <div class="wedge" aria-hidden="true"></div>

  <!-- ─── Nav (matches homepage) ─────────────────────────────────── -->
  <header class="nav" class:scrolled={scrollY > 40}>
    <a href="/stand-v2" class="brand" aria-label="Auto Nunes Martins">
      <span class="wordmark">
        <span class="wm-red">AUTO</span><span class="wm-text">NUNES</span> <span class="wm-text">MARTINS</span>
      </span>
      <span class="wm-caption">Comércio de Automóveis</span>
    </a>

    <nav class="links">
      <a href="/stand-v2#inventario"><span class="link-dot"></span>Inventário</a>
      <a href="/stand-v2#beneficios"><span class="link-dot"></span>Porquê nós</a>
      <a href="/stand-v2#processo"><span class="link-dot"></span>Como funciona</a>
      <a href="/stand-v2#visitar"><span class="link-dot"></span>Visitar</a>
    </nav>

    <div class="nav-right">
      <a href="tel:+351210000000" class="nav-phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span class="num-value">+351 210 000 000</span>
      </a>
      <a href="#contacto" class="nav-cta">
        Pedir info
        <span class="arrow">→</span>
      </a>
    </div>
  </header>

  {#if vehicle}
    <!-- ─── Hero / Gallery + Info ─────────────────────────────── -->
    <section class="hero">
      <div class="hero-inner">
        <a href="/stand-v2#inventario" class="back-link">
          <span class="arrow rev">←</span>
          <span>Voltar ao inventário</span>
        </a>

        <div class="hero-grid">
          <!-- Gallery -->
          <div class="gallery">
            {#if mounted}
              <div class="gallery-main" in:fly={{ y: 24, duration: 700, easing: expoOut }}>
                {#key vehicle.gallery[activePhoto]}
                  <img
                    src={vehicle.gallery[activePhoto]}
                    alt="{vehicle.brand} {vehicle.model}"
                    in:fade={{ duration: 380, easing: cubicOut }}
                  />
                {/key}
                <div class="gallery-shine"></div>

                <div class="gallery-counter num-value">
                  {String(activePhoto + 1).padStart(2, '0')} <span class="counter-sep">/</span> {String(vehicle.gallery.length).padStart(2, '0')}
                </div>

                <button
                  type="button"
                  class="gallery-nav prev"
                  onclick={() => (activePhoto = (activePhoto - 1 + vehicle.gallery.length) % vehicle.gallery.length)}
                  aria-label="Foto anterior"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  type="button"
                  class="gallery-nav next"
                  onclick={() => (activePhoto = (activePhoto + 1) % vehicle.gallery.length)}
                  aria-label="Foto seguinte"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>

              <div class="thumbs" in:fly={{ y: 12, duration: 700, delay: 200 }}>
                {#each vehicle.gallery as src, i (src)}
                  <button
                    type="button"
                    class="thumb"
                    class:active={activePhoto === i}
                    onclick={() => (activePhoto = i)}
                    aria-label="Foto {i + 1}"
                  >
                    <img {src} alt="" loading="lazy" />
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Info aside -->
          <aside class="info">
            {#if mounted}
              <div class="info-badges" in:fly={{ y: 12, duration: 600, delay: 100 }}>
                {#each vehicle.badges as b (b)}
                  <span
                    class="vbadge"
                    class:vbadge-red={b === 'Recém-chegado'}
                    class:vbadge-amber={b === 'Híbrido' || b === 'Mild Hybrid'}
                  >{b}</span>
                {/each}
              </div>

              <div class="info-brand" in:fly={{ y: 12, duration: 600, delay: 180 }}>
                <span class="red-square"></span>
                {vehicle.brand}
              </div>
              <h1 class="info-model" in:fly={{ y: 30, duration: 800, easing: expoOut, delay: 260 }}>
                {vehicle.model}
              </h1>
              <div class="info-trim" in:fly={{ y: 12, duration: 600, delay: 380 }}>
                {vehicle.trim}
              </div>

              <div class="info-quick" in:fly={{ y: 12, duration: 600, delay: 460 }}>
                <span class="num-value">{vehicle.year}</span>
                <span class="sep"></span>
                <span class="num-value">{formatInt(vehicle.km)} km</span>
                <span class="sep"></span>
                <span>{vehicle.fuel}</span>
                <span class="sep"></span>
                <span class="num-value">{vehicle.power} cv</span>
              </div>

              <div class="info-price" in:fly={{ y: 16, duration: 700, delay: 580 }}>
                <div class="price-monthly">
                  <span class="from">prestação</span>
                  <span class="amount num-value">{formatEUR(vehicle.monthly)}<small>/mês</small></span>
                </div>
                <div class="price-total">
                  <span>ou <span class="num-value">{formatEUR(vehicle.price)}</span> pronto</span>
                  <span class="taeg">TAEG 7,9% · sem entrada</span>
                </div>
              </div>

              <div class="info-ctas" in:fly={{ y: 12, duration: 600, delay: 700 }}>
                <a href="#contacto" class="btn btn-red full">
                  Pedir informações
                  <span class="arrow">→</span>
                </a>
                <div class="info-cta-row">
                  <a href="tel:+351210000000" class="btn btn-outline">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Ligar
                  </a>
                  <a
                    href="https://wa.me/351210000000?text=Olá! Tenho interesse no {vehicle.brand} {vehicle.model}."
                    class="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              <div class="info-trust" in:fly={{ y: 12, duration: 600, delay: 820 }}>
                <div class="trust-row">
                  <span class="trust-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="m5 12 5 5 9-11"/>
                    </svg>
                  </span>
                  <span>Garantia 24 meses incluída</span>
                </div>
                <div class="trust-row">
                  <span class="trust-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="m5 12 5 5 9-11"/>
                    </svg>
                  </span>
                  <span>Inspeção feita e válida</span>
                </div>
                <div class="trust-row">
                  <span class="trust-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="m5 12 5 5 9-11"/>
                    </svg>
                  </span>
                  <span>Retoma do seu carro aceite</span>
                </div>
              </div>
            {/if}
          </aside>
        </div>
      </div>
    </section>

    <!-- ─── Specs (brand spec-row pattern) ─────────────────────── -->
    <section class="section specs-section">
      <div use:reveal>
        <div class="eyebrow"><span class="red-square"></span>FICHA TÉCNICA</div>
        <h2 class="section-title">
          Tudo o que precisa <em>saber.</em>
        </h2>
      </div>

      <div class="specs-grid">
        {#each [
          { label: 'Ano', value: String(vehicle.year), icon: 'calendar' },
          { label: 'Quilometragem', value: `${formatInt(vehicle.km)} km`, icon: 'gauge' },
          { label: 'Combustível', value: vehicle.fuel, icon: 'fuel' },
          { label: 'Caixa', value: vehicle.transmission, icon: 'gear' },
          { label: 'Potência', value: `${vehicle.power} cv`, icon: 'bolt' },
          { label: 'Portas', value: String(vehicle.doors), icon: 'door' },
          { label: 'Cor', value: vehicle.color, icon: 'droplet' },
          { label: 'Emissões', value: vehicle.extras.co2, icon: 'leaf' },
          { label: 'Consumo médio', value: vehicle.extras.consumption, icon: 'fuel' },
          { label: 'Bagageira', value: vehicle.extras.capacity, icon: 'box' },
          { label: 'Matrícula', value: vehicle.extras.registration, icon: 'tag' },
          { label: 'Estado', value: 'Disponível', icon: 'check' },
        ] as spec, i (spec.label)}
          <div class="spec-cell" use:reveal={{ delay: i * 30 }}>
            <span class="spec-row">
              <span class="spec-icon">
                {#if spec.icon === 'calendar'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>
                {:else if spec.icon === 'gauge'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20a8 8 0 1 1 8-8"/><path d="m12 12 5-3"/></svg>
                {:else if spec.icon === 'fuel'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M2 22h16"/><path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2"/></svg>
                {:else if spec.icon === 'gear'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>
                {:else if spec.icon === 'bolt'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
                {:else if spec.icon === 'door'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 22h16M6 2h12v20H6zM14 11v2"/></svg>
                {:else if spec.icon === 'droplet'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.7s5.4 6.3 5.4 10.3a5.4 5.4 0 0 1-10.8 0c0-4 5.4-10.3 5.4-10.3z"/></svg>
                {:else if spec.icon === 'leaf'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 3s-3 13-9 14C5 18 4 12 4 12s5-1 9 1 5 6 5 6"/><path d="M3 21s2-7 7-10"/></svg>
                {:else if spec.icon === 'box'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                {:else if spec.icon === 'tag'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 13.6 13 21 3 11V3h8z"/><circle cx="7" cy="7" r="1.5"/></svg>
                {:else}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 12 6 6L20 6"/></svg>
                {/if}
              </span>
              <span class="spec-sep"></span>
              <span class="spec-cell-content">
                <span class="spec-cell-label">{spec.label}</span>
                <span class="spec-cell-value">{spec.value}</span>
              </span>
            </span>
          </div>
        {/each}
      </div>
    </section>

    <!-- ─── About + Equipment ─────────────────────────────────── -->
    <section class="section about-section">
      <div class="about-grid">
        <div class="about-text" use:reveal>
          <div class="eyebrow"><span class="red-square"></span>SOBRE ESTA VIATURA</div>
          <h2 class="section-title">A história <em>desta unidade.</em></h2>
          <p class="about-body">{vehicle.description}</p>
          <div class="about-extras">
            <div>
              <div class="info-label">REGISTO</div>
              <div class="info-val-strong num-value">{vehicle.extras.registration}</div>
            </div>
            <div>
              <div class="info-label">PRÓXIMA IPO</div>
              <div class="info-val-strong num-value">{vehicle.extras.registration.replace(String(vehicle.year), String(vehicle.year + 4))}</div>
            </div>
            <div>
              <div class="info-label">DISTRITO</div>
              <div class="info-val-strong">Lisboa</div>
            </div>
          </div>
        </div>

        <div class="equipment" use:reveal={{ delay: 100 }}>
          <div class="eyebrow"><span class="red-square"></span>EQUIPAMENTO INCLUÍDO</div>
          <ul class="equipment-list">
            {#each vehicle.equipment as item, i (item)}
              <li use:reveal={{ delay: i * 40 }}>
                <span class="eq-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="m5 12 5 5 9-11"/>
                  </svg>
                </span>
                {item}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </section>

    <!-- ─── Finance simulator ─────────────────────────────── -->
    <section class="section finance-section">
      <div use:reveal>
        <div class="eyebrow"><span class="red-square"></span>SIMULADOR</div>
        <h2 class="section-title">Adapte a <em>prestação.</em></h2>
        <p class="section-lead">
          Arraste o cursor para ver como o prazo afeta o valor mensal. Valores
          indicativos com TAEG média de <span class="num-value">7,9%</span>. Simulação personalizada feita no momento da visita.
        </p>
      </div>

      <div class="finance-card" use:reveal={{ delay: 100 }}>
        <div class="finance-display">
          <div class="finance-monthly">
            <span class="finance-from">PRESTAÇÃO MENSAL</span>
            <span class="finance-amount num-value">{formatEUR(financeMonthly)}<small>/mês</small></span>
          </div>
          <div class="finance-meta">
            <div>
              <div class="finance-meta-lbl">VALOR FINANCIADO</div>
              <div class="finance-meta-val num-value">{formatEUR(vehicle.price)}</div>
            </div>
            <div>
              <div class="finance-meta-lbl">PRAZO ESCOLHIDO</div>
              <div class="finance-meta-val num-value">{financeMonths} meses</div>
            </div>
            <div>
              <div class="finance-meta-lbl">ENTRADA</div>
              <div class="finance-meta-val num-value">€0</div>
            </div>
          </div>
        </div>

        <div class="finance-control">
          <div class="finance-slider-head">
            <span>Prazo de pagamento</span>
            <span class="finance-slider-val num-value">{financeMonths} meses</span>
          </div>
          <input
            type="range"
            min="24"
            max="120"
            step="12"
            bind:value={financeMonths}
            class="finance-slider"
            aria-label="Prazo de financiamento em meses"
          />
          <div class="finance-slider-marks">
            <span>24m</span>
            <span>48m</span>
            <span>72m</span>
            <span>96m</span>
            <span>120m</span>
          </div>
        </div>

        <a href="#contacto" class="btn btn-red full big">
          Pedir simulação personalizada
          <span class="arrow">→</span>
        </a>
      </div>
    </section>

    <!-- ─── Inquiry form ─────────────────────────────────── -->
    <section class="section inquiry-section" id="contacto">
      <div class="inquiry-card" use:reveal>
        <div class="inquiry-head">
          <div class="eyebrow"><span class="red-square"></span>INTERESSADO?</div>
          <h2 class="section-title">Vamos <em>conversar.</em></h2>
          <p class="section-lead">
            Preencha os campos e enviamos proposta no mesmo dia útil — incluindo
            simulação de financiamento e disponibilidade para test drive.
          </p>
        </div>

        <form
          class="inquiry-form"
          action="mailto:geral@autonunesmartins.pt?subject=Interesse · {vehicle.brand} {vehicle.model}"
          method="POST"
          enctype="text/plain"
        >
          <label>
            <span>NOME COMPLETO</span>
            <input type="text" name="nome" required placeholder="O seu nome" />
          </label>
          <label>
            <span>TELEFONE</span>
            <input type="tel" name="telefone" required placeholder="+351 ..." />
          </label>
          <label class="span-2">
            <span>EMAIL</span>
            <input type="email" name="email" required placeholder="voce@email.pt" />
          </label>
          <div class="span-2 inquiry-chips">
            <span class="chip-head">PRETENDO</span>
            {#each [
              { v: 'test-drive', l: 'Test drive' },
              { v: 'financiamento', l: 'Financiamento' },
              { v: 'retoma', l: 'Retoma' },
              { v: 'info', l: 'Mais info' },
            ] as c (c.v)}
              <label class="chip-radio">
                <input type="checkbox" name="interesse" value={c.v} />
                <span>{c.l}</span>
              </label>
            {/each}
          </div>
          <label class="span-2">
            <span>MENSAGEM (OPCIONAL)</span>
            <textarea
              name="mensagem"
              rows="4"
              placeholder="Gostaria de agendar uma visita / test drive."
            ></textarea>
          </label>
          <div class="form-foot">
            <span class="form-meta">RESPOSTA NO MESMO DIA ÚTIL</span>
            <button type="submit" class="btn btn-red big">
              Enviar pedido
              <span class="arrow">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- ─── Related cars ─────────────────────────────────── -->
    {#if related.length > 0}
      <section class="section related-section">
        <div class="section-head" use:reveal>
          <div>
            <div class="eyebrow"><span class="red-square"></span>SUGESTÕES PARA SI</div>
            <h2 class="section-title">Viaturas <em>semelhantes.</em></h2>
            <p class="section-lead">Com preço próximo desta unidade.</p>
          </div>
          <a href="/stand-v2#inventario" class="view-all">
            Ver inventário completo
            <span class="arrow">→</span>
          </a>
        </div>

        <div class="related-grid">
          {#each related as r, i (r.id)}
            <a href="/stand-v2/{r.id}" class="rcard" use:reveal={{ delay: i * 80 }}>
              <div class="rcard-photo">
                <img src={r.gallery[0]} alt="{r.brand} {r.model}" loading="lazy" />
                <div class="rcard-shine"></div>
                {#if r.badges[0]}
                  <span
                    class="vbadge"
                    class:vbadge-red={r.badges[0] === 'Recém-chegado'}
                    class:vbadge-amber={r.badges[0] === 'Híbrido' || r.badges[0] === 'Mild Hybrid'}
                  >{r.badges[0]}</span>
                {/if}
              </div>
              <div class="rcard-body">
                <div class="rcard-brand">{r.brand}</div>
                <h3 class="rcard-model">
                  {r.model}
                  <span class="rcard-trim">{r.trim}</span>
                </h3>
                <div class="rcard-foot">
                  <div class="rcard-pricing">
                    <span class="rcard-monthly num-value">{formatEUR(r.monthly)}<small>/mês</small></span>
                    <span class="rcard-total">ou {formatEUR(r.price)}</span>
                  </div>
                  <span class="rcard-cta">
                    Ver
                    <span class="arrow">→</span>
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}
  {:else}
    <!-- ─── Not found ───────────────────────────────────── -->
    <section class="notfound">
      <div class="eyebrow"><span class="red-square"></span>VIATURA NÃO ENCONTRADA</div>
      <h1 class="notfound-title">
        Esta viatura<br/><em>já não está disponível.</em>
      </h1>
      <p>
        Pode ter sido vendida ou a referência expirou. Veja outros destaques
        ou contacte-nos directamente.
      </p>
      <a href="/stand-v2" class="btn btn-red big">
        Voltar ao inventário
        <span class="arrow">→</span>
      </a>
    </section>
  {/if}

  <!-- ─── Footer ─────────────────────────────────────── -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="wordmark wordmark-footer">
          <span class="wm-red">AUTO</span><span class="wm-text">NUNES</span> <span class="wm-text">MARTINS</span>
        </span>
        <span class="wm-caption">Comércio de Automóveis · Desde 2009</span>
        <p>
          Stand familiar em Lisboa. Carros usados verificados, garantia incluída
          e financiamento honesto.
        </p>
      </div>
      <div class="footer-cols">
        <div>
          <h4>STAND</h4>
          <ul>
            <li><a href="/stand-v2#inventario">Inventário</a></li>
            <li><a href="/stand-v2#beneficios">Porquê nós</a></li>
            <li><a href="/stand-v2#processo">Como funciona</a></li>
            <li><a href="/stand-v2#visitar">Visitar</a></li>
          </ul>
        </div>
        <div>
          <h4>CONTACTO</h4>
          <ul>
            <li class="num-value">+351 210 000 000</li>
            <li>geral@autonunesmartins.pt</li>
            <li>Rua do Comércio, 123<br/>2700-000 Lisboa</li>
          </ul>
        </div>
        <div>
          <h4>LEGAL</h4>
          <ul>
            <li>Licença IMT 1234</li>
            <li class="num-value">NIPC 500 000 000</li>
            <li><a href="#">Política de privacidade</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Auto Nunes Martins · Todos os direitos reservados</span>
      <span>Feito em Portugal</span>
    </div>
  </footer>
</div>

<style>
  /*
    Tokens mirror the ERP (app.css). Dark by default. Scoped under .site.
  */
  .site {
    --red: #e30613;
    --red-soft: #ff3b49;
    --red-deep: #a8030d;
    --amber: #e0a040;

    --bg-0: #0a0a0b;
    --bg-1: #131316;
    --bg-2: #1b1c20;
    --bg-3: #25262b;

    --text: #f4f4f2;
    --muted: #a8a8a4;
    --faint: #6e6f73;

    --border: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.22);

    --r-card: 6.6px;
    --r-btn: 4.4px;
    --r-chip: 0px;

    --ease: cubic-bezier(0.2, 0.8, 0.2, 1);

    background: var(--bg-0);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
    scroll-behavior: smooth;
    position: relative;
  }
  .site :global(*) { box-sizing: border-box; }
  .site :global(*) { transition-timing-function: var(--ease); }
  .site a { color: inherit; text-decoration: none; }
  .site h1, .site h2, .site h3, .site h4 { margin: 0; }
  .site p { margin: 0; }
  .site button { font-family: inherit; }

  .num-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-feature-settings: 'tnum' 1;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-style: normal;
  }

  /* ─── Brand DNA: wedge + ambient glow ────────────────────── */
  .wedge {
    position: fixed;
    top: 0; bottom: 0; right: 0;
    width: 12px;
    background: linear-gradient(180deg, #e30613 0%, #b30410 100%);
    z-index: 6;
    opacity: 0.8;
    pointer-events: none;
  }
  @media (max-width: 767px) { .wedge { width: 6px; } }
  .ambient {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .ambient::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(900px 600px at 15% 0%, rgba(227, 6, 19, 0.10), transparent 60%),
      radial-gradient(800px 500px at 90% 100%, rgba(227, 6, 19, 0.08), transparent 70%);
  }

  /* ─── Shared bits ────────────────────────────────────────── */
  .red-square {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--red);
    margin-right: 10px;
    flex-shrink: 0;
  }
  .arrow {
    display: inline-block;
    transition: transform 220ms var(--ease);
  }
  .arrow.rev { margin-right: 4px; }
  .btn:hover .arrow:not(.rev),
  a:hover .arrow:not(.rev) { transform: translateX(3px); }
  a:hover .arrow.rev { transform: translateX(-3px); }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text);
    font-weight: 500;
    margin-bottom: 18px;
  }

  /* ─── Spec-row pattern ──────────────────────────────────── */
  .spec-row {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .spec-row .spec-icon {
    color: var(--text);
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .spec-row .spec-icon svg { width: 22px; height: 22px; }
  .spec-row .spec-sep {
    width: 1.5px;
    height: 22px;
    background: var(--red);
    flex: 0 0 1.5px;
  }

  /* ─── Nav (matches homepage) ────────────────────────── */
  .nav {
    position: fixed;
    inset: 0 12px auto 0;
    z-index: 50;
    height: 76px;
    padding: 0 clamp(20px, 3vw, 48px);
    display: flex;
    align-items: center;
    gap: 32px;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background 280ms, border-color 280ms, backdrop-filter 280ms;
  }
  .nav.scrolled {
    background: rgba(10, 10, 11, 0.78);
    border-bottom-color: var(--border);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .brand {
    display: inline-flex;
    flex-direction: column;
    line-height: 1;
    align-items: flex-start;
  }
  .wordmark {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    font-size: 19px;
  }
  .wm-red { color: var(--red); }
  .wm-text { color: var(--text); }
  .wm-caption {
    margin-top: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .links {
    display: none;
    align-items: center;
    gap: 28px;
    margin-left: auto;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  .links a { display: inline-flex; align-items: center; transition: color 180ms; }
  .link-dot {
    display: inline-block;
    width: 0;
    height: 1px;
    background: var(--red);
    transition: width 280ms var(--ease), margin-right 280ms var(--ease);
  }
  .links a:hover { color: var(--text); }
  .links a:hover .link-dot { width: 14px; margin-right: 8px; }
  @media (min-width: 1000px) { .links { display: inline-flex; } }
  .nav-right { display: flex; align-items: center; gap: 14px; margin-left: auto; }
  @media (min-width: 1000px) { .nav-right { margin-left: 0; } }
  .nav-phone {
    display: none;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    transition: color 180ms;
  }
  .nav-phone svg { width: 14px; height: 14px; }
  .nav-phone:hover { color: var(--red); }
  @media (min-width: 800px) { .nav-phone { display: inline-flex; } }
  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: var(--red);
    color: white;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    font-size: 13px;
    border-radius: var(--r-btn);
    transition: background 180ms, box-shadow 220ms, transform 180ms;
  }
  .nav-cta:hover {
    background: var(--red-soft);
    box-shadow: 0 10px 30px -8px rgba(227, 6, 19, 0.55);
    transform: translateY(-1px);
  }

  /* ─── Hero ─────────────────────────────────────────── */
  .hero {
    position: relative;
    z-index: 1;
    padding: 120px clamp(20px, 4vw, 56px) 60px;
  }
  .hero-inner {
    max-width: 1600px;
    margin: 0 auto;
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 28px;
    transition: color 180ms;
  }
  .back-link:hover { color: var(--red); }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    align-items: start;
  }
  @media (min-width: 1100px) {
    .hero-grid {
      grid-template-columns: minmax(0, 1.6fr) minmax(360px, 1fr);
      gap: 48px;
    }
  }

  /* ─── Gallery ──────────────────────────────────────── */
  .gallery {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .gallery-main {
    position: relative;
    aspect-ratio: 16 / 10;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
  }
  .gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 600ms var(--ease);
  }
  .gallery-main:hover img { transform: scale(1.03); }
  .gallery-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    pointer-events: none;
    transition: left 1000ms var(--ease);
  }
  .gallery-main:hover .gallery-shine { left: 150%; }
  .gallery-counter {
    position: absolute;
    bottom: 16px;
    left: 16px;
    padding: 6px 12px;
    background: rgba(10, 10, 11, 0.85);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 11px;
    letter-spacing: 0.16em;
  }
  .counter-sep { color: var(--red); margin: 0 4px; }
  .gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(10, 10, 11, 0.78);
    border: 1px solid var(--border);
    color: var(--text);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    transition: background 180ms, border-color 180ms, transform 180ms;
  }
  .gallery-nav svg { width: 18px; height: 18px; }
  .gallery-nav:hover { background: rgba(10, 10, 11, 0.95); border-color: var(--red); }
  .gallery-nav.prev { left: 16px; }
  .gallery-nav.next { right: 16px; }
  .thumbs {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .thumb {
    flex-shrink: 0;
    width: 110px;
    height: 76px;
    padding: 0;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-btn);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 180ms, transform 180ms;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 240ms;
  }
  .thumb:hover img { transform: scale(1.06); }
  .thumb.active {
    border-color: var(--red);
    box-shadow: 0 0 0 1px var(--red), 0 8px 24px -8px rgba(227, 6, 19, 0.4);
  }

  /* ─── Info aside ───────────────────────────────────── */
  .info {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    padding: 32px 28px;
    position: sticky;
    top: 96px;
  }
  @media (max-width: 1099px) { .info { position: static; } }
  .info-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
  }
  .vbadge {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background: rgba(10, 10, 11, 0.6);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--r-chip);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .vbadge-red { background: var(--red); color: white; border-color: var(--red); }
  .vbadge-amber { background: var(--amber); color: #1c1408; border-color: var(--amber); }

  .info-brand {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text);
    font-weight: 500;
    margin-bottom: 10px;
  }
  .info-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-size: clamp(30px, 3vw, 42px);
    line-height: 1.05;
    margin-bottom: 8px;
    color: var(--text);
  }
  .info-trim {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 18px;
  }
  .info-quick {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 14px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--muted);
  }
  .info-quick .sep {
    width: 3px;
    height: 3px;
    background: var(--faint);
    border-radius: 50%;
  }
  .info-price {
    padding: 22px 0 20px;
  }
  .price-monthly {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 10px;
  }
  .price-monthly .from {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .price-monthly .amount {
    font-size: clamp(36px, 3.6vw, 48px);
    color: var(--red);
    line-height: 1;
  }
  .price-monthly .amount small {
    font-size: 18px;
    color: var(--muted);
    font-weight: 600;
    margin-left: 2px;
  }
  .price-total {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--muted);
  }
  .price-total .taeg {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .info-ctas {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
  }
  .info-cta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .info-trust {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 22px;
    border-top: 1px solid var(--border);
  }
  .trust-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--muted);
  }
  .trust-check {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--red);
    color: white;
    border-radius: 50%;
  }
  .trust-check svg { width: 12px; height: 12px; }

  /* ─── Buttons ──────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: 0;
    font-size: 14px;
    border-radius: var(--r-btn);
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 180ms, background 180ms, border-color 180ms, color 180ms, box-shadow 220ms;
    justify-content: center;
    text-align: center;
  }
  .btn.full { width: 100%; padding: 15px 20px; }
  .btn.big { padding: 17px 28px; font-size: 15px; }
  .btn-red {
    background: var(--red);
    color: white;
    border-color: var(--red);
  }
  .btn-red:hover {
    background: var(--red-soft);
    border-color: var(--red-soft);
    box-shadow: 0 12px 40px -8px rgba(227, 6, 19, 0.55);
    transform: translateY(-1px);
  }
  .btn-outline {
    background: transparent;
    color: var(--text);
    border-color: var(--border-strong);
  }
  .btn-outline svg { width: 14px; height: 14px; color: var(--red); }
  .btn-outline:hover {
    border-color: var(--red);
    color: var(--red);
  }

  /* ─── Section primitives ───────────────────────────── */
  .section {
    position: relative;
    z-index: 1;
    padding: clamp(80px, 9vw, 130px) clamp(20px, 4vw, 56px);
    max-width: 1600px;
    margin: 0 auto;
  }
  .section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 40px;
  }
  .section-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-size: clamp(30px, 4.2vw, 56px);
    line-height: 1.05;
    color: var(--text);
  }
  .section-title em {
    color: var(--red);
    font-style: italic;
    font-weight: 800;
  }
  .section-lead {
    margin-top: 16px;
    color: var(--muted);
    max-width: 620px;
    font-size: 15.5px;
    line-height: 1.7;
  }
  .section-lead strong { color: var(--text); font-weight: 600; }
  .view-all {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
    transition: color 180ms, border-color 180ms;
  }
  .view-all:hover {
    color: var(--red);
    border-bottom-color: var(--red);
  }

  /* ─── Specs grid ───────────────────────────────── */
  .specs-section {
    border-top: 1px solid var(--border);
    max-width: none;
    padding-left: clamp(20px, 4vw, 56px);
    padding-right: clamp(20px, 4vw, 56px);
    background: var(--bg-1);
  }
  .specs-section > div:first-child,
  .specs-grid {
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
  }
  .specs-grid {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
  }
  .spec-cell {
    background: var(--bg-1);
    padding: 22px 22px;
    transition: background 240ms;
  }
  .spec-cell:hover { background: var(--bg-2); }
  .spec-cell-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .spec-cell-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .spec-cell-value {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
  }

  /* ─── About + equipment ─────────────────────────── */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }
  @media (min-width: 980px) {
    .about-grid {
      grid-template-columns: 1.3fr 1fr;
      gap: 80px;
    }
  }
  .about-body {
    font-size: 16.5px;
    color: var(--muted);
    margin-top: 22px;
    max-width: 620px;
    line-height: 1.75;
  }
  .about-extras {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 24px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  .info-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 8px;
  }
  .info-val-strong {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 15px;
  }
  .info-val-strong.num-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-weight: 600;
  }
  .equipment-list {
    margin: 22px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .equipment-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-btn);
    font-size: 14px;
    color: var(--text);
    transition: border-color 240ms, background 240ms, transform 240ms;
  }
  .equipment-list li:hover {
    border-color: var(--red);
    background: var(--bg-2);
    transform: translateX(2px);
  }
  .eq-check {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(227, 6, 19, 0.15);
    color: var(--red);
    border-radius: 50%;
    margin-top: 1px;
  }
  .eq-check svg { width: 11px; height: 11px; }

  /* ─── Finance simulator ─────────────────────────── */
  .finance-section {
    border-top: 1px solid var(--border);
  }
  .finance-card {
    margin-top: 40px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    padding: 36px clamp(24px, 4vw, 40px) 32px;
    position: relative;
    overflow: hidden;
  }
  .finance-card::before {
    /* faint red corner glow */
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle, rgba(227, 6, 19, 0.18), transparent 70%);
    pointer-events: none;
  }
  .finance-display {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    gap: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
  }
  @media (min-width: 740px) {
    .finance-display {
      grid-template-columns: 1fr 1.4fr;
      gap: 40px;
      align-items: center;
    }
  }
  .finance-monthly {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .finance-from {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    color: var(--faint);
  }
  .finance-amount {
    font-size: clamp(44px, 5vw, 64px);
    color: var(--red);
    line-height: 1;
  }
  .finance-amount small {
    font-size: 20px;
    color: var(--muted);
    font-weight: 600;
    margin-left: 2px;
  }
  .finance-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .finance-meta-lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.2em;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .finance-meta-val {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--text);
  }
  .finance-meta-val.num-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-weight: 600;
  }
  .finance-control { position: relative; margin-bottom: 28px; }
  .finance-slider-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    font-size: 14px;
    color: var(--muted);
  }
  .finance-slider-val {
    font-size: 16px;
    color: var(--red);
  }
  .finance-slider {
    width: 100%;
    height: 6px;
    background: var(--bg-2);
    border-radius: 999px;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  .finance-slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    background: var(--red);
    border-radius: 50%;
    border: 3px solid var(--bg-1);
    box-shadow: 0 4px 12px -2px rgba(227, 6, 19, 0.55);
    cursor: pointer;
    transition: transform 180ms;
  }
  .finance-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
  .finance-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: var(--red);
    border-radius: 50%;
    border: 3px solid var(--bg-1);
    box-shadow: 0 4px 12px -2px rgba(227, 6, 19, 0.55);
    cursor: pointer;
  }
  .finance-slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--faint);
  }

  /* ─── Inquiry form ──────────────────────────────── */
  .inquiry-section { border-top: 1px solid var(--border); }
  .inquiry-card {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    padding: 40px clamp(24px, 4vw, 48px);
  }
  .inquiry-head { margin-bottom: 32px; }
  .inquiry-form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 720px) {
    .inquiry-form { grid-template-columns: 1fr 1fr; }
  }
  .inquiry-form .span-2 { grid-column: 1 / -1; }
  .inquiry-form label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .inquiry-form label > span {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--muted);
    font-weight: 500;
  }
  .inquiry-form input,
  .inquiry-form textarea {
    width: 100%;
    padding: 13px 16px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: var(--r-btn);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14.5px;
    transition: border-color 180ms, background 180ms;
    outline: none;
  }
  .inquiry-form input::placeholder,
  .inquiry-form textarea::placeholder { color: var(--faint); }
  .inquiry-form input:focus,
  .inquiry-form textarea:focus {
    border-color: var(--red);
    background: var(--bg-3);
    box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.08);
  }
  .inquiry-form textarea {
    resize: vertical;
    min-height: 100px;
  }
  .inquiry-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 14px 16px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: var(--r-btn);
  }
  .chip-head {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--faint);
    font-weight: 600;
    margin-right: 4px;
  }
  .chip-radio { cursor: pointer; display: inline-flex; }
  .chip-radio input { display: none; }
  .chip-radio span {
    display: inline-flex;
    align-items: center;
    padding: 7px 14px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-chip);
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-size: 13px;
    color: var(--text);
    transition: background 180ms, border-color 180ms, color 180ms;
  }
  .chip-radio:hover span { border-color: var(--border-strong); }
  .chip-radio input:checked + span {
    background: var(--red);
    border-color: var(--red);
    color: white;
  }
  .form-foot {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .form-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.2em;
    color: var(--faint);
  }

  /* ─── Related ─────────────────────────────────── */
  .related-section {
    border-top: 1px solid var(--border);
    max-width: none;
    padding-left: clamp(20px, 4vw, 56px);
    padding-right: clamp(20px, 4vw, 56px);
    background: var(--bg-1);
  }
  .related-section .section-head,
  .related-grid {
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
  }
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
  }
  .rcard {
    display: flex;
    flex-direction: column;
    background: var(--bg-0);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
    transition: transform 360ms var(--ease), border-color 240ms, box-shadow 360ms;
  }
  .rcard:hover {
    transform: translateY(-4px);
    border-color: var(--border-strong);
    box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.5);
  }
  .rcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    background: var(--bg-2);
    overflow: hidden;
  }
  .rcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 600ms var(--ease);
  }
  .rcard:hover .rcard-photo img { transform: scale(1.06); }
  .rcard-photo .vbadge {
    position: absolute;
    top: 12px;
    left: 12px;
    backdrop-filter: blur(6px);
  }
  .rcard-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    pointer-events: none;
    transition: left 800ms var(--ease);
  }
  .rcard:hover .rcard-shine { left: 150%; }
  .rcard-body { padding: 18px 20px 20px; flex: 1; display: flex; flex-direction: column; }
  .rcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 4px;
  }
  .rcard-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 19px;
    line-height: 1.2;
    margin-bottom: 16px;
    color: var(--text);
    transition: color 180ms;
  }
  .rcard:hover .rcard-model { color: var(--red); }
  .rcard-trim {
    display: block;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 12.5px;
    color: var(--muted);
    text-transform: none;
    letter-spacing: 0;
    margin-top: 2px;
  }
  .rcard-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 14px;
    margin-top: auto;
    border-top: 1px solid var(--border);
  }
  .rcard-pricing { display: flex; flex-direction: column; line-height: 1.1; }
  .rcard-monthly {
    font-size: 20px;
    color: var(--red);
    letter-spacing: -0.02em;
  }
  .rcard-monthly small { font-size: 12px; font-weight: 600; color: var(--muted); }
  .rcard-total { font-size: 11.5px; color: var(--faint); margin-top: 4px; }
  .rcard-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text);
  }
  .rcard:hover .rcard-cta { color: var(--red); }

  /* ─── Not found ───────────────────────────────── */
  .notfound {
    position: relative;
    z-index: 1;
    padding: 160px clamp(20px, 4vw, 56px) 120px;
    max-width: 720px;
    margin: 0 auto;
  }
  .notfound-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.05;
    margin: 14px 0 24px;
    color: var(--text);
  }
  .notfound-title em { color: var(--red); font-style: italic; font-weight: 800; }
  .notfound p {
    color: var(--muted);
    font-size: 16.5px;
    margin: 0 0 36px;
    max-width: 480px;
  }

  /* ─── Footer ──────────────────────────────────── */
  .footer {
    background: var(--bg-1);
    border-top: 1px solid var(--border);
    position: relative;
    z-index: 1;
  }
  .footer-inner {
    padding: 64px clamp(20px, 4vw, 56px) 40px;
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }
  @media (min-width: 760px) {
    .footer-inner { grid-template-columns: 1.4fr 2fr; }
  }
  .footer-brand .wordmark-footer { font-size: 24px; }
  .footer-brand p {
    margin-top: 16px;
    color: var(--muted);
    font-size: 13.5px;
    max-width: 340px;
    line-height: 1.7;
  }
  .footer-cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 32px;
  }
  .footer-cols h4 {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    color: var(--text);
    margin-bottom: 14px;
  }
  .footer-cols ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--muted);
    font-size: 13.5px;
    line-height: 1.5;
  }
  .footer-cols a { transition: color 180ms; }
  .footer-cols a:hover { color: var(--red); }
  .footer-bottom {
    padding: 20px clamp(20px, 4vw, 56px);
    border-top: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
    max-width: 1600px;
    margin: 0 auto;
  }

  /* ─── Mobile ──────────────────────────────────── */
  @media (max-width: 540px) {
    .finance-meta { grid-template-columns: 1fr; }
    .info-cta-row { grid-template-columns: 1fr; }
  }

  /* ─── Reduced motion ─────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .site, .site * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
