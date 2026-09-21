<!--
  PUBLIC VEHICLE DETAIL PAGE — VERSION 1
  ──────────────────────────────────────────────────────────────────────────
  Interactive detail page matching Version 1 (/stand-1).
  Displays full specifications, description, equipment checklist, a live
  recalculating financing simulator, and instant contact methods.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // ─── Shared Vehicle Interface ──────────────────────────────────────────
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
    gallery: string[];
    description: string;
    equipment: string[];
    co2: string;
    consumption: string;
    capacity: string;
    registration: string;
  }

  const vehicles: Vehicle[] = [
    {
      id: 'renault-clio-2021',
      brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90,
      doors: 5, color: 'Azul Iron', price: 13500, monthly: 169,
      tag: 'Mais Procurado',
      gallery: [
        'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Clio Intens em excelente estado geral, nacional e com apenas um proprietário. Histórico completo de revisões efetuadas em concessionário oficial. Equipado com ecrã tátil EasyLink com Apple CarPlay e Android Auto, sensores de estacionamento com câmara traseira, ar condicionado automático e faróis LED Pure Vision. IUC económico e inspecção válida por dois anos.',
      equipment: [
        'EasyLink Multimédia Tátil',
        'Câmara de Marcha-Atrás',
        'Sensores de Estacionamento',
        'Faróis 100% LED Pure Vision',
        'Ar Condicionado Automático',
        'Alerta de Mudança de Faixa',
        'Cruise Control & Limitador',
        'Jantes de Liga Leve 16"'
      ],
      co2: '116 g/km', consumption: '5.1 L/100km', capacity: '391 L', registration: '04/2021'
    },
    {
      id: 'peugeot-208-2022',
      brand: 'Peugeot', model: '208', trim: '1.2 PureTech Allure',
      year: 2022, km: 32100, fuel: 'Gasolina', transmission: 'Manual', power: 100,
      doors: 5, color: 'Amarelo Faro', price: 15900, monthly: 199,
      tag: 'Destaque',
      gallery: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Peugeot 208 Allure com a inovadora tecnologia Peugeot i-Cockpit 3D, ecrã central tátil de 10" e estofos desportivos em pele e tecido. Motor 1.2 PureTech muito ágil e eficiente, ideal para trajetos urbanos ou autoestrada. Com revisões em dia efetuadas em conformidade com o plano da marca.',
      equipment: [
        'Peugeot i-Cockpit 3D',
        'Ecrã Central Tátil de 10"',
        'Ar Condicionado Automático',
        'Sensores de Chuva e Luz',
        'Jantes de Liga Leve 16" Elborn',
        'Faróis LED Signature Diurna',
        'Travagem Ativa de Emergência',
        'Vidros Traseiros Escurecidos'
      ],
      co2: '118 g/km', consumption: '5.2 L/100km', capacity: '311 L', registration: '07/2022'
    },
    {
      id: 'dacia-sandero-2021',
      brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G',
      year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100,
      doors: 5, color: 'Laranja Atacama', price: 12800, monthly: 159,
      tag: 'Super Económico',
      gallery: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Sandero Stepway com alimentação bi-fuel GPL/Gasolina de fábrica. Custos de combustível extremamente baixos. Versão Stepway com visual crossover aventureiro, maior altura ao solo e barras de tejadilho modulares. Único proprietário nacional.',
      equipment: [
        'Sistema Multimédia Media Display',
        'Barras de Tejadilho Modulares',
        'Sensores de Estacionamento Traseiros',
        'Luzes de Cruzamento LED',
        'Ar Condicionado Manual',
        'Modo ECO de Condução',
        'Bluetooth e Conectividade USB',
        'Sistema Bi-Fuel (GPL / Gasolina)'
      ],
      co2: '109 g/km', consumption: '6.5 L/100km (GPL)', capacity: '328 L', registration: '09/2021'
    },
    {
      id: 'fiat-500-2021',
      brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge',
      year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70,
      doors: 3, color: 'Branco Gelato', price: 9900, monthly: 119,
      gallery: [
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'O icónico citadino italiano na versão Mild Hybrid, reduzindo consumos e emissões na cidade. Configuração clássica em Branco Gelato com tecto panorâmico em vidro e jantes especiais. Ideal para recém-cartados ou circulação urbana diária.',
      equipment: [
        'Sistema Uconnect Tátil com Apple CarPlay',
        'Tecto de Vidro Panorâmico',
        'Jantes de Liga Leve de 15"',
        'Volante em Pele com Comandos',
        'Painel de Instrumentos Digital',
        'Tecnologia Mild Hybrid 12V',
        'Ar Condicionado Manual',
        'Sensores de Parqueamento Traseiros'
      ],
      co2: '105 g/km', consumption: '4.6 L/100km', capacity: '185 L', registration: '02/2021'
    },
    {
      id: 'nissan-qashqai-2019',
      brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta',
      year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115,
      doors: 5, color: 'Cinzento Escuro', price: 18900, monthly: 239,
      tag: 'Familiar Elegante',
      gallery: [
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Líder indiscutível dos SUVs familiares em Portugal. Motor 1.5 dCi muito fiável e económico. Equipado com tecto panorâmico, câmaras 360º de estacionamento e jantes de 18". Viatura nacional, impecável, com garantia.',
      equipment: [
        'Câmara de Visão 360º Inteligente',
        'Tecto de Vidro Panorâmico',
        'Jantes de Liga Leve 18"',
        'Navegação GPS 3D Integrada',
        'Chave Inteligente (Acesso Sem Chave)',
        'Reconhecimento de Sinais de Trânsito',
        'Sensores de Chuva e Luzes',
        'Ar Condicionado Automático Dual-Zone'
      ],
      co2: '121 g/km', consumption: '4.2 L/100km', capacity: '430 L', registration: '11/2019'
    },
    {
      id: 'toyota-yaris-2020',
      brand: 'Toyota', model: 'Yaris', trim: '1.5 Active Hybrid',
      year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116,
      doors: 5, color: 'Cinzento Prata', price: 16800, monthly: 209,
      tag: 'Fiabilidade',
      gallery: [
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Toyota Yaris de quarta geração com tecnologia híbrida auto-recarregável. Dispensa cabos e tomadas. Muito fiável, caixa automática de suavidade exemplar e consumos reais abaixo dos 4L/100km em ambiente urbano.',
      equipment: [
        'Toyota Safety Sense completo',
        'Cruise Control Adaptativo Inteligente',
        'Ecrã Tátil de 8" Multimédia',
        'Faróis com Sensor de Máximos Automático',
        'Sistema de Pré-Colisão com Radar',
        'Câmara Traseira de Estacionamento',
        'Climatizador Automático',
        'Transmissão Automática e-CVT'
      ],
      co2: '92 g/km', consumption: '3.8 L/100km', capacity: '286 L', registration: '10/2020'
    },
    {
      id: 'ford-focus-2020',
      brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line',
      year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125,
      doors: 5, color: 'Vermelho Race', price: 14900, monthly: 189,
      gallery: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Versão desportiva ST-Line com suspensão calibrada desportiva, soleiras exclusivas, grelha em favo de mel e dupla saída de escape. Motor dinâmico EcoBoost de 125cv. Excelente comportamento dinâmico de referência no segmento.',
      equipment: [
        'Pack Exterior & Interior ST-Line',
        'Suspensão Desportiva Rebaixada',
        'Jantes de Liga Leve 17" ST-Line',
        'Volante Desportivo com Base Plana',
        'Sistema SYNC 3 com Ecrã Tátil',
        'Sensores Parqueamento Frente e Trás',
        'Ar Condicionado Automático Dual',
        'Bancos com Costuras Desportivas a Vermelho'
      ],
      co2: '124 g/km', consumption: '5.4 L/100km', capacity: '375 L', registration: '06/2020'
    },
    {
      id: 'bmw-116d-2018',
      brand: 'BMW', model: 'Série 1', trim: '116d Pack M Auto',
      year: 2018, km: 98600, fuel: 'Diesel', transmission: 'Automática', power: 116,
      doors: 5, color: 'Azul Estoril', price: 21900, monthly: 279,
      tag: 'Desportivo Pack M',
      gallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Série 1 com tração traseira em Azul Estoril com Pack desportivo M original de fábrica. Caixa automática Steptronic de 8 velocidades, faróis LED M, volante e bancos desportivos alcântara M. Muito económico e dinâmico.',
      equipment: [
        'Pack Desportivo M Completo de Fábrica',
        'Caixa Automática Steptronic 8v',
        'Estofos M em Alcantara e Tecido Hexagon',
        'Faróis 100% LED M Sport',
        'Jantes de Liga Leve 18" Double-Spoke M',
        'Volante Desportivo M Multifunções',
        'Suspensão Desportiva M',
        'Sensores Traseiros + Pack de Luzes M'
      ],
      co2: '112 g/km', consumption: '4.1 L/100km', capacity: '360 L', registration: '02/2018'
    }
  ];

  // ─── Dynamic Lookup ─────────────────────────────────────────────────────
  const carId = $derived($page.params.id);
  const car = $derived(vehicles.find(v => v.id === carId));

  // Related cars (price proximity)
  const relatedCars = $derived(
    car 
      ? vehicles
          .filter(v => v.id !== car.id)
          .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
          .slice(0, 3)
      : []
  );

  // ─── UI State ───────────────────────────────────────────────────────────
  let activeImage = $state(0);
  let isDark = $state(true);
  let months = $state(84); // Default months for simulation
  let monthlyPayment = $derived(car ? Math.round((car.price) / months) : 0);

  // Form interest state
  let interestMessage = $state('Olá, estou interessado nesta viatura.');
  let customerName = $state('');
  let customerPhone = $state('');

  onMount(() => {
    // Theme sync
    const stored = localStorage.getItem('app-theme');
    if (stored) {
      isDark = stored === 'dark';
    } else {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    }
    updateTheme();
  });

  function updateTheme() {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }

  function toggleTheme() {
    isDark = !isDark;
    updateTheme();
  }

  // Formatters
  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
</script>

<svelte:head>
  <title>
    {car ? `${car.brand} ${car.model} · Auto Nunes Martins` : 'Viatura não encontrada'}
  </title>
</svelte:head>

<div class="site-v1-wrapper min-h-screen bg-[var(--color-bg-0)] text-[var(--color-text)] transition-colors duration-300">
  <div class="header-ambient opacity-35 pointer-events-none" aria-hidden="true"></div>
  <div class="app-wedge" aria-hidden="true"></div>

  <!-- ─── HEADER ─────────────────────────────────────────────────────── -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg-0)]/80 border-b border-[var(--color-border)] py-4 px-6 md:px-12 flex justify-between items-center transition-all">
    <a href="/stand-1" class="flex items-center gap-3">
      <div class="flex flex-col select-none">
        <div class="flex items-baseline font-[var(--font-display)] font-extrabold italic text-xl md:text-2xl tracking-tight leading-none">
          <span class="text-[var(--color-red)] mr-1">AUTO</span>
          <span class="text-[var(--color-text)] font-semibold">NUNES MARTINS</span>
        </div>
        <div class="text-[9px] tracking-[0.25em] text-[var(--color-text-faint)] uppercase font-[var(--font-mono)] mt-1">
          Comércio de Automóveis
        </div>
      </div>
    </a>

    <nav class="hidden md:flex items-center gap-8 font-medium">
      <a href="/stand-1#inventario" class="hover:text-[var(--color-red)] transition-colors">Inventário</a>
      <a href="#vantagens" class="hover:text-[var(--color-red)] transition-colors">Garantias</a>
      <a href="#contacto" class="hover:text-[var(--color-red)] transition-colors">Contactos</a>
    </nav>

    <div class="flex items-center gap-4">
      <button 
        type="button" 
        onclick={toggleTheme}
        class="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-faint)] transition-colors"
        aria-label="Alternar Tema"
      >
        {#if isDark}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        {/if}
      </button>
      <a href="/stand-1#inventario" class="hidden sm:inline-flex items-center gap-2 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-soft)] px-5 py-2 rounded-[var(--radius-btn)] font-[var(--font-display)] italic uppercase tracking-wider font-bold transition-all text-xs">
        Inventário
      </a>
    </div>
  </header>

  {#if car}
    <!-- ─── CAR DETAIL HERO ───────────────────────────────────────────── -->
    <main class="py-10 px-6 md:px-12 flex flex-col gap-10">
      <!-- Breadcrumb and back link -->
      <div class="flex items-center justify-between">
        <a href="/stand-1#inventario" class="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Voltar ao Inventário
        </a>
      </div>

      <!-- Core Display Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Photo Gallery Stack (lg:col-span-7) -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <!-- Main view -->
          <div class="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-1)] group">
            {#key activeImage}
              <img 
                src={car.gallery[activeImage]} 
                alt="{car.brand} {car.model}" 
                in:fade={{ duration: 300 }}
                class="w-full h-full object-cover"
              />
            {/key}
            
            {#if car.tag}
              <span class="absolute top-4 left-4 bg-[var(--color-red)] text-white text-xs font-bold font-[var(--font-mono)] uppercase px-3 py-1 tracking-wider">
                {car.tag}
              </span>
            {/if}

            <!-- Navigation indicators -->
            <div class="absolute bottom-4 right-4 bg-black/75 text-white text-xs font-bold font-[var(--font-mono)] px-3 py-1.5 rounded border border-white/10">
              {activeImage + 1} / {car.gallery.length}
            </div>
          </div>

          <!-- Thumbnails -->
          <div class="grid grid-cols-3 gap-4">
            {#each car.gallery as img, idx}
              <button 
                type="button" 
                onclick={() => activeImage = idx}
                class="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border transition-all 
                  {activeImage === idx ? 'border-[var(--color-red)] ring-2 ring-[var(--color-red)]/20' : 'border-[var(--color-border)] hover:border-[var(--color-text-faint)]'}"
              >
                <img src={img} alt="Thumbnail {idx + 1}" class="w-full h-full object-cover" />
              </button>
            {/each}
          </div>
        </div>

        <!-- Car Purchase Info Aside (lg:col-span-5) -->
        <div class="lg:col-span-5 bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <div class="text-xs font-[var(--font-mono)] text-[var(--color-text-faint)] uppercase tracking-widest">{car.brand}</div>
            <h1 class="text-3xl font-extrabold font-[var(--font-display)] italic mt-1 leading-none text-[var(--color-text)]">
              {car.model}
            </h1>
            <p class="text-sm text-[var(--color-text-muted)] mt-1.5">{car.trim}</p>
          </div>

          <!-- Specs pills -->
          <div class="grid grid-cols-2 gap-4 py-4 border-y border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-medium">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-red)]"></span>
              <span>Ano: <strong class="text-[var(--color-text)] font-[var(--font-mono)]">{car.year}</strong></span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-red)]"></span>
              <span>Km: <strong class="text-[var(--color-text)] font-[var(--font-mono)]">{car.km.toLocaleString('pt-PT')}</strong></span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-red)]"></span>
              <span>Caixa: <strong class="text-[var(--color-text)]">{car.transmission}</strong></span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-red)]"></span>
              <span>Potência: <strong class="text-[var(--color-text)] font-[var(--font-mono)]">{car.power} cv</strong></span>
            </div>
          </div>

          <!-- Pricing block -->
          <div class="bg-[var(--color-bg-2)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)]">
            <div class="flex justify-between items-baseline mb-2">
              <span class="text-xs text-[var(--color-text-faint)] font-bold uppercase">Preço Total</span>
              <span class="text-2xl font-black font-[var(--font-mono)] text-[var(--color-red)]">{formatEUR(car.price)}</span>
            </div>
            <div class="flex justify-between items-baseline border-t border-[var(--color-border)] pt-3 mt-3">
              <div class="flex flex-col">
                <span class="text-[10px] text-[var(--color-text-faint)] font-bold uppercase">Financiamento Indicativo</span>
                <span class="text-xs text-[var(--color-text-faint)]">Sem Entrada a {months} meses</span>
              </div>
              <span class="text-2xl font-black font-[var(--font-mono)] text-[var(--color-text)]">
                {formatEUR(monthlyPayment)}<small class="text-xs font-normal text-[var(--color-text-muted)] font-sans">/mês</small>
              </span>
            </div>
          </div>

          <!-- Quick contact actions -->
          <div class="flex flex-col gap-3">
            <a 
              href="https://wa.me/351210000000?text=Olá! Tenho interesse no {car.brand} {car.model} ({car.year}) por {formatEUR(car.price)}."
              target="_blank" 
              rel="noopener noreferrer" 
              class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <!-- WhatsApp Icon -->
              <svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z" />
              </svg>
              Perguntar por WhatsApp
            </a>
            
            <a href="tel:+351210000000" class="w-full bg-[var(--color-bg-2)] hover:bg-[var(--color-border-strong)] text-[var(--color-text)] border border-[var(--color-border)] py-3.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ligar para Consultor
            </a>
          </div>
        </div>
      </div>

      <!-- Detail specifications, description and timeline (Financing simulator) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-[var(--color-border)]">
        <!-- Main Content Column (lg:col-span-8) -->
        <div class="lg:col-span-8 flex flex-col gap-10">
          <!-- Description -->
          <div>
            <h3 class="text-xl font-bold font-[var(--font-display)] italic text-[var(--color-text)] uppercase mb-3">Histórico da Viatura</h3>
            <p class="text-[var(--color-text-muted)] leading-relaxed text-sm">{car.description}</p>
          </div>

          <!-- Dynamic Financing Simulator -->
          <div class="bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 md:p-8">
            <h3 class="text-xl font-bold font-[var(--font-display)] italic text-[var(--color-text)] uppercase mb-2">Simulador de Financiamento</h3>
            <p class="text-xs text-[var(--color-text-muted)] mb-6">Financiamento sem entrada obrigatória, com taxas competitivas. Ajuste o prazo para verificar as estimativas.</p>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div class="md:col-span-7 flex flex-col gap-5">
                <div class="flex justify-between items-baseline">
                  <span class="text-xs text-[var(--color-text-muted)] font-semibold">Prazo de Pagamento:</span>
                  <span class="text-sm font-bold text-[var(--color-red)] font-[var(--font-mono)]">{months} meses</span>
                </div>
                
                <input 
                  type="range" 
                  min="24" 
                  max="120" 
                  step="12"
                  bind:value={months}
                  class="w-full accent-[var(--color-red)] cursor-pointer"
                  aria-label="Meses de financiamento"
                />

                <div class="flex justify-between text-[10px] text-[var(--color-text-faint)] font-bold uppercase font-[var(--font-mono)]">
                  <span>24 Meses</span>
                  <span>72 Meses</span>
                  <span>120 Meses</span>
                </div>
              </div>

              <!-- Simulator result -->
              <div class="md:col-span-5 bg-[var(--color-bg-2)] border border-[var(--color-border)] p-6 rounded-[var(--radius-card)] text-center">
                <span class="text-[10px] text-[var(--color-text-faint)] font-bold uppercase block mb-1">Mensalidade Projetada</span>
                <span class="text-3xl font-black font-[var(--font-mono)] text-[var(--color-text)]">
                  {formatEUR(monthlyPayment)}
                </span>
                <span class="text-[9px] text-[var(--color-text-faint)] block mt-1.5">TAEG indicativa 7,9% · Entrada €0</span>
              </div>
            </div>
          </div>

          <!-- Spec-row vector specifications -->
          <div>
            <h3 class="text-xl font-bold font-[var(--font-display)] italic text-[var(--color-text)] uppercase mb-6">Ficha de Especificações</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {#each [
                { label: 'Matrícula (Mês/Ano)', value: car.registration, icon: 'tag' },
                { label: 'Combustível', value: car.fuel, icon: 'fuel' },
                { label: 'Cor Exterior', value: car.color, icon: 'droplet' },
                { label: 'Número de Portas', value: String(car.doors), icon: 'door' },
                { label: 'Emissões CO2', value: car.co2, icon: 'leaf' },
                { label: 'Consumo Médio', value: car.consumption, icon: 'speed' },
                { label: 'Bagageira', value: car.capacity, icon: 'box' },
                { label: 'Estado', value: 'Inspeccionada', icon: 'check' }
              ] as sp}
                <div class="spec-row flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <div class="flex items-center gap-3">
                    <!-- Custom icons -->
                    <span class="text-[var(--color-red)]">
                      {#if sp.icon === 'tag'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {:else if sp.icon === 'fuel'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      {:else if sp.icon === 'droplet'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      {:else if sp.icon === 'door'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
                      {:else if sp.icon === 'leaf'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" /></svg>
                      {:else if sp.icon === 'speed'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {:else if sp.icon === 'box'}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10l8 4m-8-4v10l8 4m0-10V4" /></svg>
                      {:else}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {/if}
                    </span>
                    <span class="text-xs font-semibold text-[var(--color-text-muted)]">{sp.label}</span>
                  </div>
                  <span class="text-xs font-bold text-[var(--color-text)] font-[var(--font-mono)]">{sp.value}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Equipment list Sidebar (lg:col-span-4) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <div class="border border-[var(--color-border)] p-6 rounded-[var(--radius-card)] bg-[var(--color-bg-1)]/60">
            <h3 class="text-lg font-bold font-[var(--font-display)] italic uppercase tracking-wider text-[var(--color-text)] mb-4">Equipamento</h3>
            <ul class="flex flex-col gap-3 text-xs text-[var(--color-text-muted)]">
              {#each car.equipment as eq}
                <li class="flex items-start gap-2.5">
                  <span class="text-[var(--color-success)] mt-0.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span>{eq}</span>
                </li>
              {/each}
            </ul>
          </div>

          <!-- Contact request form -->
          <div class="border border-[var(--color-border)] p-6 rounded-[var(--radius-card)] bg-[var(--color-bg-1)]/60 flex flex-col gap-4">
            <div>
              <h3 class="text-lg font-bold font-[var(--font-display)] italic uppercase tracking-wider text-[var(--color-text)]">Pedir Proposta</h3>
              <p class="text-[10px] text-[var(--color-text-faint)] mt-1">Preencha o formulário e responderemos em menos de 24h.</p>
            </div>
            
            <div class="flex flex-col gap-3">
              <input 
                type="text" 
                bind:value={customerName}
                placeholder="O seu Nome" 
                class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[var(--radius-btn)] p-3 text-xs outline-none focus:border-[var(--color-red)] text-[var(--color-text)]"
              />
              <input 
                type="text" 
                bind:value={customerPhone}
                placeholder="Telemóvel / E-mail" 
                class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[var(--radius-btn)] p-3 text-xs outline-none focus:border-[var(--color-red)] text-[var(--color-text)]"
              />
              <textarea 
                bind:value={interestMessage}
                placeholder="Mensagem..." 
                rows="3"
                class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[var(--radius-btn)] p-3 text-xs outline-none focus:border-[var(--color-red)] text-[var(--color-text)] resize-none"
              ></textarea>

              <button 
                type="button" 
                class="bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white text-xs font-bold font-[var(--font-display)] uppercase py-3 rounded-[var(--radius-btn)] tracking-wider transition-colors mt-2"
              >
                Enviar Pedido de Informações
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Cars -->
      <div class="pt-10 border-t border-[var(--color-border)] mt-6">
        <h3 class="text-xl font-bold font-[var(--font-display)] italic text-[var(--color-text)] uppercase mb-6">Alternativas Recomendadas</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {#each relatedCars as r}
            <a 
              href="/stand-1/{r.id}"
              class="group bg-[var(--color-bg-1)] border border-[var(--color-border)] hover:border-[var(--color-red-soft)] rounded-[var(--radius-card)] overflow-hidden shadow-sm transition-all duration-300 flex flex-col"
            >
              <div class="aspect-[4/3] bg-zinc-900 overflow-hidden relative">
                <img src={r.gallery[0]} alt={r.model} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span class="absolute bottom-3 left-3 bg-[var(--color-bg-0)]/90 text-[var(--color-text)] text-[9px] font-bold font-[var(--font-mono)] px-2 py-0.5 tracking-wider border border-[var(--color-border)]">
                  {r.year}
                </span>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div class="text-[9px] font-[var(--font-mono)] text-[var(--color-text-faint)] uppercase tracking-widest">{r.brand}</div>
                  <h4 class="font-bold text-sm text-[var(--color-text)] leading-tight group-hover:text-[var(--color-red)] transition-colors mt-0.5">{r.model}</h4>
                </div>
                <div class="flex justify-between items-end border-t border-[var(--color-border)] pt-3 mt-3 text-xs">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase tracking-wider text-[var(--color-text-faint)] font-bold">Preço</span>
                    <span class="font-black font-[var(--font-mono)] text-[var(--color-text)]">{formatEUR(r.price)}</span>
                  </div>
                  <span class="text-[var(--color-red)] font-[var(--font-display)] italic uppercase tracking-wider font-bold text-[10px]">
                    Ver Ficha →
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </main>
  {:else}
    <!-- Car not found -->
    <div class="py-24 px-6 text-center max-w-md mx-auto">
      <svg class="w-16 h-16 text-[var(--color-text-faint)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <h2 class="text-2xl font-bold">Viatura não encontrada</h2>
      <p class="text-sm text-[var(--color-text-muted)] mt-1.5">Pedimos desculpa, mas o veículo solicitado poderá ter sido vendido ou já não se encontrar em stock.</p>
      <a href="/stand-1" class="mt-6 bg-[var(--color-red)] text-white px-6 py-2.5 rounded-[var(--radius-btn)] font-semibold text-xs transition-colors inline-block">
        Voltar ao Inventário
      </a>
    </div>
  {/if}

  <!-- ─── FOOTER ─────────────────────────────────────────────────────── -->
  <footer id="contacto" class="border-t border-[var(--color-border)] py-12 px-6 md:px-12 bg-[var(--color-bg-0)] text-sm mt-10">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      <div class="flex flex-col gap-4">
        <div class="font-[var(--font-display)] font-extrabold italic text-xl">
          <span class="text-[var(--color-red)]">AUTO</span> NUNES MARTINS
        </div>
        <p class="text-[var(--color-text-muted)] text-xs leading-relaxed">
          Comércio de automóveis usados de qualidade e confiança. Mais de 15 anos no mercado nacional a ajudar famílias a encontrar a sua viatura ideal.
        </p>
      </div>

      <div>
        <h4 class="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs mb-4">Navegação</h4>
        <ul class="flex flex-col gap-2.5 text-[var(--color-text-muted)] text-xs">
          <li><a href="/stand-1#inventario" class="hover:text-[var(--color-red)] transition-colors">Inventário Completo</a></li>
          <li><a href="/stand-1#vantagens" class="hover:text-[var(--color-red)] transition-colors">Vantagens & Garantia</a></li>
          <li><a href="/stand-1#visitar" class="hover:text-[var(--color-red)] transition-colors">Visitar o Showroom</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs mb-4">Legal</h4>
        <ul class="flex flex-col gap-2.5 text-[var(--color-text-muted)] text-xs">
          <li>Licença IMT nº 1234</li>
          <li>Intermediário de Crédito Registado</li>
          <li>Livro de Reclamações Eletrónico</li>
          <li>Política de Privacidade</li>
        </ul>
      </div>

      <div>
        <h4 class="font-bold text-[var(--color-text)] uppercase tracking-wider text-xs mb-4">Contactos</h4>
        <ul class="flex flex-col gap-2.5 text-[var(--color-text-muted)] text-xs">
          <li class="font-bold text-[var(--color-text)]">+351 210 000 000</li>
          <li>geral@autonunesmartins.pt</li>
          <li>Rua do Comércio, 123 — Lisboa</li>
        </ul>
      </div>
    </div>

    <div class="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--color-text-faint)]">
      <span>© 2026 Auto Nunes Martins. Todos os direitos reservados.</span>
      <span>Desenvolvido com Svelte 5 & Tailwind</span>
    </div>
  </footer>
</div>

<style>
  /*
    Coluna de conteúdo centrada a 1600px (homepage + ficha alinhadas).
    O gutter vive no padding lateral, por isso o header, o conteúdo e o footer
    partilham a mesma coluna, mantendo os fundos a ir de ponta a ponta.
  */
  .site-v1-wrapper > :is(header, main, footer) {
    padding-left: max(2rem, calc((100% - 1600px) / 2)) !important;
    padding-right: max(2rem, calc((100% - 1600px) / 2)) !important;
  }
</style>
