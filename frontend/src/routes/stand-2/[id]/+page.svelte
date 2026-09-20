<!--
  ════════════════════════════════════════════════════════════════════════
  PUBLIC VEHICLE DETAIL — VERSION 2  ·  "SHOWROOM EDITORIAL"
  ════════════════════════════════════════════════════════════════════════
  Detail page matching /stand-2. Editorial layout: large gallery, sticky
  purchase panel, live financing simulator, spec sheet, equipment and
  related vehicles. Dark / Light synced via 'app-theme'. Self-contained.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Vehicle {
    id: string;
    brand: string; model: string; trim: string;
    year: number; km: number; fuel: string; transmission: string; power: number;
    doors: number; color: string; price: number; monthly: number; tag?: string;
    gallery: string[]; description: string; equipment: string[];
    co2: string; consumption: string; capacity: string; registration: string;
    category: 'citadino' | 'familiar' | 'suv' | 'utilitario';
  }

  const vehicles: Vehicle[] = [
    {
      id: 'volkswagen-up-2018', brand: 'Volkswagen', model: 'up!', trim: '1.0 MPI Move',
      year: 2018, km: 61200, fuel: 'Gasolina', transmission: 'Manual', power: 60,
      doors: 5, color: 'Branco Puro', price: 7900, monthly: 109, tag: 'Primeiro Carro', category: 'citadino',
      gallery: [
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'O citadino ideal para a cidade e para quem tira a carta. Compacto, fácil de estacionar e muito económico. Nacional, com revisões em dia e pronto a usar. Perfeito como primeiro carro ou segundo carro da família.',
      equipment: ['Ar Condicionado', 'Sistema de Som com Bluetooth', 'Computador de Bordo', 'Vidros Elétricos', 'Direção Assistida', 'Fecho Centralizado', 'Airbags Frontais e Laterais', 'ABS + ESP'],
      co2: '108 g/km', consumption: '4.8 L/100km', capacity: '251 L', registration: '05/2018'
    },
    {
      id: 'opel-corsa-2018', brand: 'Opel', model: 'Corsa', trim: '1.2 Edition',
      year: 2018, km: 72400, fuel: 'Gasolina', transmission: 'Manual', power: 70,
      doors: 5, color: 'Cinza Sovereign', price: 9400, monthly: 129, tag: 'Económico', category: 'citadino',
      gallery: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Corsa fiável e equilibrado, com baixos consumos e custos de manutenção reduzidos. Espaço suficiente para o dia-a-dia e para viagens. Inspeção válida e histórico de manutenção disponível para consulta.',
      equipment: ['Ar Condicionado', 'Ecrã Tátil com Apple CarPlay', 'Sensores de Estacionamento', 'Cruise Control', 'Volante Multifunções', 'Faróis de Nevoeiro', 'Bluetooth & USB', 'Jantes de Liga Leve 16"'],
      co2: '119 g/km', consumption: '5.2 L/100km', capacity: '285 L', registration: '03/2018'
    },
    {
      id: 'fiat-500-2021', brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge',
      year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70,
      doors: 3, color: 'Branco Gelato', price: 11900, monthly: 149, category: 'citadino',
      gallery: [
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'O icónico citadino italiano na versão Mild Hybrid, reduzindo consumos e emissões na cidade. Tecto panorâmico em vidro e jantes especiais. Ideal para recém-cartados ou circulação urbana diária.',
      equipment: ['Uconnect Tátil com Apple CarPlay', 'Tecto de Vidro Panorâmico', 'Jantes de Liga Leve 15"', 'Volante em Pele com Comandos', 'Painel Digital', 'Tecnologia Mild Hybrid 12V', 'Ar Condicionado', 'Sensores Traseiros'],
      co2: '105 g/km', consumption: '4.6 L/100km', capacity: '185 L', registration: '02/2021'
    },
    {
      id: 'renault-clio-2021', brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90,
      doors: 5, color: 'Azul Iron', price: 13500, monthly: 169, tag: 'Mais Procurado', category: 'citadino',
      gallery: [
        'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Clio Intens em excelente estado, nacional e com um único proprietário. Histórico completo de revisões. Equipado com ecrã tátil EasyLink (Apple CarPlay / Android Auto), câmara traseira, ar condicionado automático e faróis LED.',
      equipment: ['EasyLink Multimédia Tátil', 'Câmara de Marcha-Atrás', 'Sensores de Estacionamento', 'Faróis 100% LED', 'Ar Condicionado Automático', 'Alerta de Mudança de Faixa', 'Cruise Control & Limitador', 'Jantes de Liga Leve 16"'],
      co2: '116 g/km', consumption: '5.1 L/100km', capacity: '391 L', registration: '04/2021'
    },
    {
      id: 'dacia-sandero-2021', brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G',
      year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100,
      doors: 5, color: 'Laranja Atacama', price: 12800, monthly: 159, tag: 'Custo Baixo', category: 'utilitario',
      gallery: [
        'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Sandero Stepway bi-fuel GPL/Gasolina de fábrica — custos de combustível extremamente baixos. Visual crossover, maior altura ao solo e barras de tejadilho. Único proprietário nacional.',
      equipment: ['Sistema Media Display', 'Barras de Tejadilho Modulares', 'Sensores Traseiros', 'Luzes LED', 'Ar Condicionado', 'Modo ECO', 'Bluetooth & USB', 'Sistema Bi-Fuel (GPL / Gasolina)'],
      co2: '109 g/km', consumption: '6.5 L/100km (GPL)', capacity: '328 L', registration: '09/2021'
    },
    {
      id: 'seat-ibiza-2020', brand: 'Seat', model: 'Ibiza', trim: '1.0 TSI FR',
      year: 2020, km: 54100, fuel: 'Gasolina', transmission: 'Manual', power: 95,
      doors: 5, color: 'Vermelho Desire', price: 14200, monthly: 179, category: 'citadino',
      gallery: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Ibiza no acabamento desportivo FR, com visual agressivo, jantes específicas e excelente comportamento. Motor 1.0 TSI ágil e eficiente. Viatura jovem com poucos quilómetros.',
      equipment: ['Pack Desportivo FR', 'Ecrã Tátil 8"', 'Climatização Automática', 'Jantes de Liga Leve 17"', 'Faróis Full LED', 'Cruise Control Adaptativo', 'Sensores de Estacionamento', 'Volante Desportivo FR'],
      co2: '113 g/km', consumption: '5.0 L/100km', capacity: '355 L', registration: '06/2020'
    },
    {
      id: 'ford-focus-2020', brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line',
      year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125,
      doors: 5, color: 'Vermelho Race', price: 14900, monthly: 189, tag: 'Desportivo', category: 'familiar',
      gallery: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Versão desportiva ST-Line com suspensão calibrada, soleiras exclusivas e dupla saída de escape. Motor EcoBoost de 125cv. Excelente comportamento dinâmico, referência no segmento.',
      equipment: ['Pack ST-Line Exterior & Interior', 'Suspensão Desportiva', 'Jantes de Liga Leve 17"', 'Volante Desportivo Base Plana', 'SYNC 3 com Ecrã Tátil', 'Sensores Frente e Trás', 'Climatização Automática', 'Bancos com Costuras Vermelhas'],
      co2: '124 g/km', consumption: '5.4 L/100km', capacity: '375 L', registration: '06/2020'
    },
    {
      id: 'toyota-yaris-2020', brand: 'Toyota', model: 'Yaris', trim: '1.5 Hybrid Active',
      year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116,
      doors: 5, color: 'Cinzento Prata', price: 16800, monthly: 209, tag: 'Fiabilidade', category: 'utilitario',
      gallery: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Yaris de quarta geração com tecnologia híbrida auto-recarregável — dispensa cabos e tomadas. Muito fiável, caixa automática suave e consumos reais abaixo dos 4L/100km em cidade.',
      equipment: ['Toyota Safety Sense', 'Cruise Control Adaptativo', 'Ecrã Tátil 8"', 'Sensor de Máximos Automático', 'Pré-Colisão com Radar', 'Câmara Traseira', 'Climatizador Automático', 'Transmissão e-CVT'],
      co2: '92 g/km', consumption: '3.8 L/100km', capacity: '286 L', registration: '10/2020'
    },
    {
      id: 'nissan-qashqai-2019', brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta',
      year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115,
      doors: 5, color: 'Cinzento Escuro', price: 18900, monthly: 239, tag: 'Familiar', category: 'suv',
      gallery: [
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=900&q=80'
      ],
      description: 'Líder dos SUVs familiares em Portugal. Motor 1.5 dCi muito fiável e económico. Tecto panorâmico, câmaras 360º e jantes de 18". Viatura nacional, impecável, com garantia.',
      equipment: ['Câmara 360º Inteligente', 'Tecto Panorâmico', 'Jantes de Liga Leve 18"', 'Navegação GPS 3D', 'Acesso Sem Chave', 'Reconhecimento de Sinais', 'Sensores de Chuva e Luz', 'Climatização Dual-Zone'],
      co2: '121 g/km', consumption: '4.2 L/100km', capacity: '430 L', registration: '11/2019'
    }
  ];

  const carId = $derived($page.params.id);
  const car = $derived(vehicles.find((v) => v.id === carId));
  const related = $derived(
    car ? vehicles.filter((v) => v.id !== car.id)
            .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
            .slice(0, 3) : []
  );

  // theme
  let isDark = $state(false);
  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    isDark = stored ? stored === 'dark' : document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme();
  });
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
  }
  function toggleTheme() { isDark = !isDark; applyTheme(); }

  // gallery + simulator
  let activeImage = $state(0);
  let months = $state(72);
  const monthlyPayment = $derived(car ? Math.round((car.price * 1.079) / months) : 0);

  // contact form
  let customerName = $state('');
  let customerContact = $state('');
  let message = $state('');
  $effect(() => { if (car) message = `Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}).`; });

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const formatKm = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>{car ? `${car.brand} ${car.model} ${car.year} · Auto Nunes Martins` : 'Viatura não encontrada'}</title>
</svelte:head>

<div class="ed-wrap min-h-screen bg-[var(--color-bg-0)] text-[var(--color-text)] transition-colors duration-300">
  <!-- HEADER -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg-0)]/75 border-b border-[var(--color-border)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between gap-6">
      <a href="/stand-2" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
        <span aria-hidden="true">
          <svg viewBox="0 0 64 30" class="w-11 h-6">
            <path d="M3 21 C 20 21 30 14 61 7" fill="none" stroke="var(--color-red)" stroke-width="4.5" stroke-linecap="round"/>
            <path d="M6 26 C 16 26 22 22 37 20" fill="none" stroke="var(--color-text-faint)" stroke-width="2.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="flex flex-col leading-none select-none">
          <span class="font-[var(--font-display)] font-extrabold italic text-lg md:text-xl tracking-tight">
            <span class="text-[var(--color-red)]">AUTO</span><span class="text-[var(--color-text)]">NUNES&nbsp;MARTINS</span>
          </span>
          <span class="text-[8.5px] tracking-[0.34em] text-[var(--color-text-faint)] uppercase font-[var(--font-mono)] mt-1">Comércio de Automóveis</span>
        </span>
      </a>
      <div class="flex items-center gap-2.5">
        <button type="button" onclick={toggleTheme} aria-label="Alternar tema"
          class="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-faint)] transition-colors">
          {#if isDark}
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          {:else}
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          {/if}
        </button>
        <a href="/stand-2#inventario" class="hidden sm:inline-flex items-center gap-2 bg-[var(--color-text)] text-[var(--color-bg-0)] hover:bg-[var(--color-red)] hover:text-white px-5 py-2.5 rounded-full font-semibold text-[13px] transition-colors">
          Ver stock
        </a>
      </div>
    </div>
  </header>

  {#if car}
    <main class="max-w-[1600px] mx-auto px-6 md:px-10 py-8 md:py-12">
      <!-- breadcrumb -->
      <nav class="flex items-center gap-2 text-[12px] text-[var(--color-text-faint)] mb-8 font-[var(--font-mono)]">
        <a href="/stand-2" class="hover:text-[var(--color-red)] transition-colors">Início</a>
        <span>/</span>
        <a href="/stand-2#inventario" class="hover:text-[var(--color-red)] transition-colors">Viaturas</a>
        <span>/</span>
        <span class="text-[var(--color-text-muted)]">{car.brand} {car.model}</span>
      </nav>

      <!-- title row -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] flex items-center gap-2">
            {car.brand}
            {#if car.tag}<span class="bg-[var(--color-red)] text-white px-2 py-0.5 rounded-full not-italic tracking-wider">{car.tag}</span>{/if}
          </div>
          <h1 class="font-[var(--font-display)] font-extrabold italic text-[clamp(2.2rem,5vw,3.4rem)] leading-none tracking-tight mt-1.5">{car.model}</h1>
          <p class="text-[var(--color-text-muted)] mt-1.5">{car.trim} · {car.year} · {formatKm(car.km)} km</p>
        </div>
        <div class="text-left md:text-right">
          <div class="num-value text-[clamp(2rem,5vw,3rem)] text-[var(--color-red)] leading-none">{formatEUR(car.price)}</div>
          <div class="text-[13px] text-[var(--color-text-muted)] mt-1">desde {formatEUR(car.monthly)}/mês · TAEG 7,9%</div>
        </div>
      </div>

      <!-- gallery + purchase -->
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        <!-- gallery -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <div class="relative aspect-[16/11] rounded-[18px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-1)]">
            {#key activeImage}
              <img src={car.gallery[activeImage]} alt="{car.brand} {car.model}" in:fade={{ duration: 250 }} class="w-full h-full object-cover"/>
            {/key}
            <span class="absolute bottom-4 right-4 bg-black/65 text-white text-[12px] font-[var(--font-mono)] px-3 py-1.5 rounded-full">{activeImage + 1} / {car.gallery.length}</span>
          </div>
          {#if car.gallery.length > 1}
            <div class="grid grid-cols-4 gap-3">
              {#each car.gallery as img, idx}
                <button type="button" onclick={() => (activeImage = idx)}
                  class="aspect-[4/3] rounded-xl overflow-hidden border transition-all {activeImage === idx ? 'border-[var(--color-red)] ring-2 ring-[var(--color-red)]/20' : 'border-[var(--color-border)] hover:border-[var(--color-text-faint)]'}">
                  <img src={img} alt="Vista {idx + 1}" class="w-full h-full object-cover"/>
                </button>
              {/each}
            </div>
          {/if}

          <!-- quick spec strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-px mt-2 rounded-[16px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)]">
            {#each [
              { l: 'Ano', v: String(car.year) },
              { l: 'Quilómetros', v: formatKm(car.km) },
              { l: 'Combustível', v: car.fuel },
              { l: 'Caixa', v: car.transmission }
            ] as s}
              <div class="bg-[var(--color-bg-1)] p-4">
                <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">{s.l}</div>
                <div class="num-value text-[15px] text-[var(--color-text)] mt-1">{s.v}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- purchase panel (sticky) -->
        <aside class="lg:col-span-5 lg:sticky lg:top-[88px] flex flex-col gap-5">
          <div class="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-1)] p-6 md:p-7 flex flex-col gap-5">
            <div class="flex items-end justify-between">
              <div>
                <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">Preço final</div>
                <div class="num-value text-3xl text-[var(--color-text)]">{formatEUR(car.price)}</div>
              </div>
              <span class="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg> Garantia 24m
              </span>
            </div>

            <!-- financing simulator -->
            <div class="rounded-[14px] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-5 flex flex-col gap-4">
              <div class="flex items-center justify-between text-[13px]">
                <span class="text-[var(--color-text-muted)] font-medium">Simulador · {months} meses</span>
                <span class="num-value text-[var(--color-red)] text-lg">{formatEUR(monthlyPayment)}/mês</span>
              </div>
              <input type="range" min="24" max="120" step="12" bind:value={months} class="w-full accent-[var(--color-red)] cursor-pointer" aria-label="Prazo em meses"/>
              <div class="flex justify-between text-[10px] font-[var(--font-mono)] text-[var(--color-text-faint)] uppercase">
                <span>24m</span><span>72m</span><span>120m</span>
              </div>
              <p class="text-[11px] text-[var(--color-text-faint)] leading-relaxed">Valor indicativo · TAEG 7,9% · sem entrada obrigatória. Sujeito a aprovação.</p>
            </div>

            <div class="flex flex-col gap-2.5">
              <a href={`https://wa.me/351210000000?text=${encodeURIComponent(`Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}) por ${formatEUR(car.price)}.`)}`}
                target="_blank" rel="noopener noreferrer"
                class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
                Falar por WhatsApp
              </a>
              <a href="tel:+351210000000" class="w-full border border-[var(--color-border-strong)] hover:border-[var(--color-text)] py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
                Ligar 210 000 000
              </a>
            </div>
          </div>

          <!-- contact form -->
          <div class="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-1)] p-6 flex flex-col gap-3">
            <h3 class="font-bold text-base">Pedir mais informações</h3>
            <p class="text-[12px] text-[var(--color-text-faint)] -mt-1">Respondemos em menos de 24h.</p>
            <input type="text" bind:value={customerName} placeholder="O seu nome" class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--color-red)] text-[var(--color-text)]"/>
            <input type="text" bind:value={customerContact} placeholder="Telemóvel ou email" class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--color-red)] text-[var(--color-text)]"/>
            <textarea bind:value={message} rows="3" class="w-full bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--color-red)] text-[var(--color-text)] resize-none"></textarea>
            <button type="button" class="bg-[var(--color-red)] hover:bg-[var(--color-red-deep)] text-white font-semibold text-sm py-3 rounded-full transition-colors">Enviar pedido</button>
          </div>
        </aside>
      </div>

      <!-- description + specs + equipment -->
      <div class="grid lg:grid-cols-12 gap-10 pt-12 mt-12 border-t border-[var(--color-border)]">
        <div class="lg:col-span-7 flex flex-col gap-10">
          <div>
            <h2 class="font-[var(--font-display)] font-extrabold italic text-2xl tracking-tight mb-3">Sobre esta viatura</h2>
            <p class="text-[var(--color-text-muted)] leading-relaxed text-[15px]">{car.description}</p>
          </div>

          <div>
            <h2 class="font-[var(--font-display)] font-extrabold italic text-2xl tracking-tight mb-5">Ficha técnica</h2>
            <div class="grid sm:grid-cols-2 gap-x-10 gap-y-0">
              {#each [
                { l: 'Matrícula', v: car.registration },
                { l: 'Combustível', v: car.fuel },
                { l: 'Caixa', v: car.transmission },
                { l: 'Potência', v: `${car.power} cv` },
                { l: 'Cor exterior', v: car.color },
                { l: 'Portas', v: String(car.doors) },
                { l: 'Emissões CO₂', v: car.co2 },
                { l: 'Consumo médio', v: car.consumption },
                { l: 'Bagageira', v: car.capacity },
                { l: 'Estado', v: 'Inspeccionada' }
              ] as s}
                <div class="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                  <span class="text-[13px] text-[var(--color-text-muted)]">{s.l}</span>
                  <span class="num-value text-[14px] text-[var(--color-text)]">{s.v}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="lg:col-span-5">
          <h2 class="font-[var(--font-display)] font-extrabold italic text-2xl tracking-tight mb-5">Equipamento</h2>
          <div class="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-1)] p-6">
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
              {#each car.equipment as eq}
                <li class="flex items-start gap-2.5 text-[13px] text-[var(--color-text-muted)]">
                  <svg class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7"/></svg>
                  {eq}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>

      <!-- related -->
      <div class="pt-12 mt-12 border-t border-[var(--color-border)]">
        <h2 class="font-[var(--font-display)] font-extrabold italic text-2xl tracking-tight mb-6">Também lhe pode interessar</h2>
        <div class="grid sm:grid-cols-3 gap-6">
          {#each related as r}
            <a href="/stand-2/{r.id}" class="group flex flex-col rounded-[16px] overflow-hidden bg-[var(--color-bg-1)] border border-[var(--color-border)] hover:border-[var(--color-text-faint)] transition-all hover:-translate-y-1">
              <div class="aspect-[16/11] overflow-hidden bg-[var(--color-bg-2)]">
                <img src={r.gallery[0]} alt={r.model} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div class="p-4 flex items-end justify-between">
                <div>
                  <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">{r.brand} · {r.year}</div>
                  <h3 class="font-bold group-hover:text-[var(--color-red)] transition-colors">{r.model}</h3>
                </div>
                <span class="num-value text-[15px] text-[var(--color-text)]">{formatEUR(r.price)}</span>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </main>
  {:else}
    <div class="max-w-md mx-auto text-center py-28 px-6">
      <svg class="w-14 h-14 text-[var(--color-text-faint)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9.17 16.17a4 4 0 015.66 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <h1 class="font-[var(--font-display)] font-extrabold italic text-2xl">Viatura não encontrada</h1>
      <p class="text-[var(--color-text-muted)] text-sm mt-2">Esta viatura poderá já ter sido vendida ou não estar disponível.</p>
      <a href="/stand-2#inventario" class="inline-block mt-6 bg-[var(--color-red)] hover:bg-[var(--color-red-deep)] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors">Ver stock disponível</a>
    </div>
  {/if}

  <!-- FOOTER -->
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-1)] mt-16">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="font-[var(--font-display)] font-extrabold italic text-lg">
        <span class="text-[var(--color-red)]">AUTO</span>NUNES MARTINS
      </div>
      <div class="text-[12px] text-[var(--color-text-faint)]">© 2026 · Rua do Comércio, 123 — Lisboa · +351 210 000 000</div>
    </div>
  </footer>
</div>

<style>
  .ed-wrap { scroll-behavior: smooth; }
</style>
