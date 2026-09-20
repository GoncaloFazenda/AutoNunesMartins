<!--
  PUBLIC DEALERSHIP HOMEPAGE — VERSION 1 (Neo-Classic Clean & High-Tech Showroom)
  ──────────────────────────────────────────────────────────────────────────
  A clean, modern, and highly accessible showroom experience for Auto Nunes Martins.
  Designed with high-contrast surfaces, glassmorphic touches, and the signature brand red.
  
  Key Features:
  - Responsive Light / Dark mode synchronised with ERP ('app-theme')
  - Live search + filter by Category, Fuel, and Transmission
  - Honest pricing highlighting monthly financing options up front (€7k - €25k range)
  - Interactive UI with reveal animations
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // ─── Inventory data (€7,000 to €25,000 range) ──────────────────────────
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
    price: number;
    monthly: number;
    image: string;
    category: 'citadino' | 'familiar' | 'suv' | 'utilitario';
    tag?: string;
  }

  const vehicles: Vehicle[] = [
    {
      id: 'renault-clio-2021',
      brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90,
      price: 13500, monthly: 169,
      image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80',
      category: 'citadino',
      tag: 'Mais Procurado'
    },
    {
      id: 'peugeot-208-2022',
      brand: 'Peugeot', model: '208', trim: '1.2 PureTech Allure',
      year: 2022, km: 32100, fuel: 'Gasolina', transmission: 'Manual', power: 100,
      price: 15900, monthly: 199,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      category: 'citadino',
      tag: 'Destaque'
    },
    {
      id: 'dacia-sandero-2021',
      brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G',
      year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100,
      price: 12800, monthly: 159,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
      category: 'utilitario',
      tag: 'Super Económico'
    },
    {
      id: 'fiat-500-2021',
      brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge',
      year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70,
      price: 9900, monthly: 119,
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
      category: 'citadino'
    },
    {
      id: 'nissan-qashqai-2019',
      brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta',
      year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115,
      price: 18900, monthly: 239,
      image: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=800&q=80',
      category: 'suv',
      tag: 'Familiar Elegante'
    },
    {
      id: 'toyota-yaris-2020',
      brand: 'Toyota', model: 'Yaris', trim: '1.5 Active Hybrid',
      year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116,
      price: 16800, monthly: 209,
      image: 'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=800&q=80',
      category: 'utilitario',
      tag: 'Fiabilidade'
    },
    {
      id: 'ford-focus-2020',
      brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line',
      year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125,
      price: 14900, monthly: 189,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      category: 'familiar'
    },
    {
      id: 'bmw-116d-2018',
      brand: 'BMW', model: 'Série 1', trim: '116d Pack M Auto',
      year: 2018, km: 98600, fuel: 'Diesel', transmission: 'Automática', power: 116,
      price: 21900, monthly: 279,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      category: 'familiar',
      tag: 'Desportivo Pack M'
    }
  ];

  // ─── Theme control ──────────────────────────────────────────────────────
  let isDark = $state(true);

  // ─── Widget de personalização (demo on/off do alinhamento) ────────────────
  // aligned = true  → conteúdo centrado numa coluna (máx. 1600px)
  // aligned = false → conteúdo de ponta a ponta (comportamento original v1)
  let aligned = $state(true);
  let custOpen = $state(false);

  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    if (stored) {
      isDark = stored === 'dark';
    } else {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    }
    updateTheme();
  });

  function toggleTheme() {
    isDark = !isDark;
    updateTheme();
  }

  function updateTheme() {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }

  // ─── Search & Filters state ─────────────────────────────────────────────
  let searchQuery = $state('');
  let selectedCategory = $state('todos');
  let selectedFuel = $state('todos');
  let selectedTrans = $state('todos');
  let maxPrice = $state(25000);

  // Computed filtered list
  const filteredVehicles = $derived(
    vehicles.filter(v => {
      const matchesSearch = v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.trim.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || v.category === selectedCategory;
      const matchesFuel = selectedFuel === 'todos' || v.fuel.toLowerCase().includes(selectedFuel.toLowerCase());
      const matchesTrans = selectedTrans === 'todos' || v.transmission === selectedTrans;
      const matchesPrice = v.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesFuel && matchesTrans && matchesPrice;
    })
  );

  const categories = [
    { id: 'todos', label: 'Todos os Segmentos' },
    { id: 'citadino', label: 'Citadinos' },
    { id: 'utilitario', label: 'Utilitários' },
    { id: 'familiar', label: 'Familiares' },
    { id: 'suv', label: 'SUVs / Crossovers' }
  ];

  // Formatters
  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
</script>

<svelte:head>
  <title>Auto Nunes Martins · Stand Público v1</title>
  <meta name="description" content="Encontre a sua próxima viatura usada de confiança. Garantia e financiamento rápido." />
</svelte:head>

<div class:align-on={aligned} class="site-v1-wrapper min-h-screen transition-colors duration-300 bg-[var(--color-bg-0)] text-[var(--color-text)]">
  <!-- Glowing backdrops -->
  <div class="header-ambient opacity-40 pointer-events-none" aria-hidden="true"></div>
  <div class="app-wedge" aria-hidden="true"></div>

  <!-- ─── HEADER ─────────────────────────────────────────────────────── -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg-0)]/80 border-b border-[var(--color-border)] py-4 px-6 md:px-12 flex justify-between items-center transition-all">
    <!-- Brand Logo Replica in SVG -->
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

    <!-- Nav links -->
    <nav class="hidden md:flex items-center gap-8 font-medium">
      <a href="#inventario" class="hover:text-[var(--color-red)] transition-colors">Inventário</a>
      <a href="#vantagens" class="hover:text-[var(--color-red)] transition-colors">Garantias</a>
      <a href="#contacto" class="hover:text-[var(--color-red)] transition-colors">Contactos</a>
    </nav>

    <!-- Side Actions -->
    <div class="flex items-center gap-4">
      <!-- Dark/Light switch -->
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

      <!-- Main Action -->
      <a href="#inventario" class="hidden sm:inline-flex items-center gap-2 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-soft)] px-5 py-2 rounded-[var(--radius-btn)] font-[var(--font-display)] italic uppercase tracking-wider font-bold transition-all text-xs">
        Inventário
      </a>
    </div>
  </header>

  <!-- ─── HERO ───────────────────────────────────────────────────────── -->
  <section class="relative py-12 md:py-24 px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center overflow-hidden border-b border-[var(--color-border)]">
    <!-- Red ambient wedge -->
    <div class="absolute -right-32 -top-32 w-96 h-96 bg-[var(--color-red)]/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="md:col-span-7 flex flex-col gap-6 relative z-10">
      <div class="inline-flex items-center gap-2 text-xs font-[var(--font-mono)] text-[var(--color-red)] font-semibold tracking-widest uppercase">
        <span class="w-2 h-2 rounded-full bg-[var(--color-red)] ping-dot relative"></span>
        Mais de 15 anos de honestidade
      </div>
      <h1 class="text-4xl md:text-6xl font-[var(--font-display)] font-extrabold italic leading-none tracking-tight">
        A QUALIDADE QUE <span class="text-[var(--color-red)]">MERECE</span>,<br/>
        O PREÇO QUE <span class="text-[var(--color-red)]">PODE</span> PAGAR.
      </h1>
      <p class="text-base text-[var(--color-text-muted)] max-w-xl font-normal leading-relaxed">
        Não somos um stand de luxo. Somos o stand de confiança das famílias em Portugal. Dispomos de viaturas rigorosamente inspeccionadas entre os <strong>7.000€ e os 25.000€</strong>, com facilidade de financiamento e garantia de até 24 meses.
      </p>

      <div class="flex flex-wrap items-center gap-4 mt-4">
        <a href="#inventario" class="inline-flex items-center gap-3 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-soft)] px-7 py-3.5 rounded-[var(--radius-btn)] font-[var(--font-display)] italic uppercase tracking-wider font-bold text-sm transition-all shadow-lg shadow-[var(--color-red)]/15">
          Explorar Viaturas
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
        <a href="#vantagens" class="inline-flex items-center gap-3 border border-[var(--color-border-strong)] hover:border-[var(--color-text)] px-7 py-3.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all">
          Conhecer Garantias
        </a>
      </div>

      <!-- Trust Badges -->
      <div class="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-[var(--color-border)]">
        <div>
          <div class="text-2xl font-bold font-[var(--font-mono)] text-[var(--color-text)]">24 Meses</div>
          <div class="text-xs text-[var(--color-text-faint)]">Garantia Completa</div>
        </div>
        <div>
          <div class="text-2xl font-bold font-[var(--font-mono)] text-[var(--color-text)]">130+</div>
          <div class="text-xs text-[var(--color-text-faint)] font-medium">Pontos Revistos</div>
        </div>
        <div>
          <div class="text-2xl font-bold font-[var(--font-mono)] text-[var(--color-text)]">100%</div>
          <div class="text-xs text-[var(--color-text-faint)]">Aprovado em 24h</div>
        </div>
      </div>
    </div>

    <!-- Hero Image showcase -->
    <div class="md:col-span-5 relative">
      <div class="relative w-full aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-bg-1)] shadow-xl group">
        <img 
          src="https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80" 
          alt="Destaque Clio" 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-0)]/90 via-transparent to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div class="flex flex-col">
            <span class="text-xs font-[var(--font-mono)] text-[var(--color-red)] uppercase font-semibold">Destaque da Semana</span>
            <h3 class="text-xl font-bold text-white mt-1">Renault Clio 1.0 TCe</h3>
            <span class="text-xs text-gray-300">Prestação desde €169/mês</span>
          </div>
          <a href="/stand-1/renault-clio-2021" class="w-10 h-10 bg-white text-[var(--color-bg-0)] rounded-full flex items-center justify-center hover:bg-[var(--color-red)] hover:text-white transition-all transform translate-y-0 group-hover:-translate-y-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── INVENTORY SECTION ───────────────────────────────────────────── -->
  <section id="inventario" class="py-16 px-6 md:px-12 bg-[var(--color-bg-1)] transition-colors duration-300">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <span class="text-xs font-[var(--font-mono)] text-[var(--color-red)] font-semibold tracking-wider uppercase block mb-2">Parque de Viaturas</span>
        <h2 class="text-3xl md:text-4xl font-[var(--font-display)] font-extrabold italic leading-tight">ENCONTRE O SEU PRÓXIMO CARRO</h2>
        <p class="text-[var(--color-text-muted)] mt-2 max-w-xl">Todos os carros com quilómetros certificados, histórico completo e revisão efetuada antes da entrega.</p>
      </div>

      <!-- Live stock count -->
      <div class="flex items-center gap-3 bg-[var(--color-bg-2)] border border-[var(--color-border)] px-4 py-3 rounded-[var(--radius-card)]">
        <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
        <span class="text-xs font-[var(--font-mono)] font-semibold uppercase">
          <span class="num-value font-bold text-[var(--color-text)] mr-1">{filteredVehicles.length}</span> viaturas disponíveis
        </span>
      </div>
    </div>

    <!-- Search and Filters Grid -->
    <div class="bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 md:p-8 mb-10 flex flex-col gap-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- Search bar -->
        <div class="md:col-span-5 relative">
          <svg class="absolute left-4 top-3.5 w-4 h-4 text-[var(--color-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Pesquisar por marca, modelo, versão..."
            class="w-full bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-[var(--radius-btn)] py-2.5 pl-11 pr-4 outline-none focus:border-[var(--color-red)] text-sm transition-colors text-[var(--color-text)]"
          />
        </div>

        <!-- Fuel selector -->
        <div class="md:col-span-3">
          <select 
            bind:value={selectedFuel}
            class="w-full bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-[var(--radius-btn)] py-2.5 px-4 outline-none focus:border-[var(--color-red)] text-sm transition-colors text-[var(--color-text)]"
          >
            <option value="todos">Todos os Combustíveis</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diesel</option>
            <option value="Híbrido">Híbrido</option>
            <option value="GPL">GPL</option>
          </select>
        </div>

        <!-- Transmission selector -->
        <div class="md:col-span-2">
          <select 
            bind:value={selectedTrans}
            class="w-full bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-[var(--radius-btn)] py-2.5 px-4 outline-none focus:border-[var(--color-red)] text-sm transition-colors text-[var(--color-text)]"
          >
            <option value="todos">Caixas (Todas)</option>
            <option value="Manual">Manual</option>
            <option value="Automática">Automática</option>
          </select>
        </div>

        <!-- Price Range Trigger / Reset button -->
        <div class="md:col-span-2">
          <button 
            type="button"
            onclick={() => { searchQuery = ''; selectedCategory = 'todos'; selectedFuel = 'todos'; selectedTrans = 'todos'; maxPrice = 25000; }}
            class="w-full border border-[var(--color-border-strong)] hover:border-[var(--color-text)] py-2.5 px-4 rounded-[var(--radius-btn)] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <!-- Segment Tabs (Categories) -->
      <div class="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5">
        {#each categories as cat (cat.id)}
          <button 
            type="button"
            onclick={() => selectedCategory = cat.id}
            class="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all border
              {selectedCategory === cat.id 
                ? 'bg-[var(--color-red)] border-[var(--color-red)] text-white' 
                : 'bg-[var(--color-bg-1)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-faint)]'}"
          >
            {cat.label}
          </button>
        {/each}

        <!-- Price slider inline -->
        <div class="ml-auto flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 bg-[var(--color-bg-1)] px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-card)]">
          <span class="text-xs text-[var(--color-text-muted)] font-medium">Preço Máximo:</span>
          <input 
            type="range" 
            min="8000" 
            max="25000" 
            step="1000"
            bind:value={maxPrice}
            class="accent-[var(--color-red)] cursor-pointer"
            aria-label="Preço máximo"
          />
          <span class="text-xs font-bold font-[var(--font-mono)] text-[var(--color-text)]">{formatEUR(maxPrice)}</span>
        </div>
      </div>
    </div>

    <!-- Vehicles List Grid -->
    {#if filteredVehicles.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each filteredVehicles as car (car.id)}
          <div 
            class="group bg-[var(--color-bg-0)] border border-[var(--color-border)] hover:border-[var(--color-red-soft)] rounded-[var(--radius-card)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            in:fade
          >
            <!-- Card Image -->
            <div class="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
              <img 
                src={car.image} 
                alt="{car.brand} {car.model}" 
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {#if car.tag}
                <span class="absolute top-3 left-3 bg-[var(--color-red)] text-white text-[9px] font-bold font-[var(--font-mono)] uppercase px-2.5 py-1 tracking-wider">
                  {car.tag}
                </span>
              {/if}
              <!-- Quick highlight for warranty -->
              <span class="absolute bottom-3 right-3 bg-[var(--color-bg-0)]/90 backdrop-blur-sm text-[var(--color-text)] text-[9px] font-bold font-[var(--font-mono)] px-2 py-0.5 tracking-wider border border-[var(--color-border)]">
                GARANTIA 24M
              </span>
            </div>

            <!-- Card Body -->
            <div class="p-5 flex-1 flex flex-col">
              <div class="text-[10px] font-[var(--font-mono)] text-[var(--color-text-faint)] uppercase tracking-widest">{car.brand}</div>
              <h3 class="text-lg font-bold text-[var(--color-text)] leading-tight group-hover:text-[var(--color-red)] transition-colors mt-0.5">
                {car.model}
                <span class="block text-xs text-[var(--color-text-muted)] font-normal truncate mt-0.5">{car.trim}</span>
              </h3>

              <!-- Technical Details strip -->
              <div class="grid grid-cols-2 gap-y-2.5 gap-x-2 my-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[var(--color-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  <span class="num-value text-[var(--color-text)]">{car.year}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[var(--color-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="m12 12 4-2.5" /></svg>
                  <span class="num-value text-[var(--color-text)]">{car.km.toLocaleString('pt-PT')} km</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[var(--color-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M18 14h2M18 18h2" /></svg>
                  <span class="truncate">{car.fuel}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[var(--color-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 5v2M12 17v2M5 12h2M17 12h2" /></svg>
                  <span class="truncate">{car.transmission}</span>
                </div>
              </div>

              <!-- Price section -->
              <div class="mt-auto pt-4 border-t border-[var(--color-border)] flex justify-between items-end">
                <div class="flex flex-col">
                  <span class="text-[9px] uppercase tracking-wider text-[var(--color-text-faint)] font-bold">Prestação</span>
                  <span class="text-xl font-black font-[var(--font-mono)] text-[var(--color-text)]">
                    {formatEUR(car.monthly)}<small class="text-xs font-normal text-[var(--color-text-muted)] font-sans">/mês</small>
                  </span>
                  <span class="text-[10px] text-[var(--color-text-faint)]">ou {formatEUR(car.price)} pronto</span>
                </div>

                <a 
                  href="/stand-1/{car.id}" 
                  class="bg-[var(--color-bg-2)] hover:bg-[var(--color-red)] text-[var(--color-text-muted)] hover:text-white border border-[var(--color-border-strong)] hover:border-[var(--color-red)] px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  Ficha
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-[var(--color-bg-0)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-12 text-center text-[var(--color-text-muted)]">
        <svg class="w-12 h-12 mx-auto text-[var(--color-text-faint)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-bold text-[var(--color-text)]">Nenhuma viatura encontrada</h3>
        <p class="text-sm mt-1 max-w-sm mx-auto">Experimente alterar os filtros de pesquisa ou limpe os parâmetros para ver todo o stock.</p>
        <button 
          type="button"
          onclick={() => { searchQuery = ''; selectedCategory = 'todos'; selectedFuel = 'todos'; selectedTrans = 'todos'; maxPrice = 25000; }}
          class="mt-4 bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white px-5 py-2 rounded-[var(--radius-btn)] font-semibold text-xs transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    {/if}
  </section>

  <!-- ─── WHY US / ADVANTAGES ────────────────────────────────────────── -->
  <section id="vantagens" class="py-20 px-6 md:px-12 border-t border-[var(--color-border)] relative">
    <div class="max-w-4xl mx-auto text-center mb-16">
      <span class="text-xs font-[var(--font-mono)] text-[var(--color-red)] font-semibold tracking-wider uppercase">Vantagens Auto Nunes Martins</span>
      <h2 class="text-3xl md:text-5xl font-[var(--font-display)] font-extrabold italic mt-2 tracking-tight">TRANSPARÊNCIA SEM COMPLICAÇÕES</h2>
      <p class="text-base text-[var(--color-text-muted)] mt-3 leading-relaxed">Não complicamos. O nosso compromisso é vender carros com segurança e apoiar os nossos clientes com o melhor serviço pós-venda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Shield item -->
      <div class="bg-[var(--color-bg-1)] border border-[var(--color-border)] p-8 rounded-[var(--radius-card)] flex flex-col gap-4">
        <div class="w-12 h-12 bg-[var(--color-red)]/10 text-[var(--color-red)] rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--color-text)]">Garantia Absoluta 24M</h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Sem falsas promessas. Garantia de 2 anos abrangente (motor, caixa de velocidades e componentes essenciais) com assistência em qualquer ponto do país.
        </p>
      </div>

      <!-- Mechanic check item -->
      <div class="bg-[var(--color-bg-1)] border border-[var(--color-border)] p-8 rounded-[var(--radius-card)] flex flex-col gap-4">
        <div class="w-12 h-12 bg-[var(--color-red)]/10 text-[var(--color-red)] rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--color-text)]">Inspeção de 130 Pontos</h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Cada carro é submetido a uma rigorosa vistoria mecânica antes de ser colocado à venda. Entregamos a ficha de verificação detalhada com total transparência.
        </p>
      </div>

      <!-- Credit approval item -->
      <div class="bg-[var(--color-bg-1)] border border-[var(--color-border)] p-8 rounded-[var(--radius-card)] flex flex-col gap-4">
        <div class="w-12 h-12 bg-[var(--color-red)]/10 text-[var(--color-red)] rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--color-text)]">Financiamento até 120M</h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Temos parcerias com as principais instituições de crédito. Conseguimos a melhor prestação, sem entrada obrigatória e com aprovação rápida em menos de 24h.
        </p>
      </div>
    </div>
  </section>

  <!-- ─── CALL TO ACTION / VISIT STAND ───────────────────────────────── -->
  <section id="visitar" class="relative py-24 px-6 md:px-12 overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-bg-0)]">
    <div class="absolute inset-0 bg-cover bg-center opacity-5 select-none" style="background-image: url('https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80');"></div>
    
    <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
      <div class="bg-[var(--color-red)] text-white text-xs font-bold font-[var(--font-mono)] uppercase px-3 py-1 tracking-widest">
        Showroom Aberto
      </div>
      <h2 class="text-3xl md:text-5xl font-[var(--font-display)] font-black italic tracking-tight">VISITE O NOSSO ESPAÇO EM LISBOA</h2>
      <p class="text-base text-[var(--color-text-muted)] max-w-2xl font-normal leading-relaxed">
        Venha conhecer as viaturas de perto, fazer um teste drive sem compromisso e tomar um café connosco. Estamos abertos de <strong>Segunda a Sábado</strong> na Rua do Comércio, 123 - Lisboa.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-8">
        <div class="border border-[var(--color-border)] p-5 rounded-[var(--radius-card)] bg-[var(--color-bg-1)]/60 backdrop-blur-sm">
          <div class="text-[10px] font-bold text-[var(--color-text-faint)] tracking-widest uppercase">Morada</div>
          <div class="text-sm font-semibold mt-1">Rua do Comércio, 123 — Lisboa</div>
        </div>
        <div class="border border-[var(--color-border)] p-5 rounded-[var(--radius-card)] bg-[var(--color-bg-1)]/60 backdrop-blur-sm">
          <div class="text-[10px] font-bold text-[var(--color-text-faint)] tracking-widest uppercase">Horário</div>
          <div class="text-sm font-semibold mt-1">Seg-Sex: 9h-19h | Sáb: 10h-17h</div>
        </div>
        <div class="border border-[var(--color-border)] p-5 rounded-[var(--radius-card)] bg-[var(--color-bg-1)]/60 backdrop-blur-sm">
          <div class="text-[10px] font-bold text-[var(--color-text-faint)] tracking-widest uppercase">Contacto Rápido</div>
          <div class="text-sm font-semibold mt-1 text-[var(--color-red)]">+351 210 000 000</div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-4 mt-4">
        <a href="https://wa.me/351210000000" target="_blank" rel="noopener noreferrer" class="bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-3.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all flex items-center gap-2">
          <!-- WhatsApp Icon -->
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z" />
          </svg>
          Falar via WhatsApp
        </a>
      </div>
    </div>
  </section>

  <!-- ─── FOOTER ─────────────────────────────────────────────────────── -->
  <footer id="contacto" class="border-t border-[var(--color-border)] py-12 px-6 md:px-12 bg-[var(--color-bg-0)] text-sm">
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
          <li><a href="#inventario" class="hover:text-[var(--color-red)] transition-colors">Inventário Completo</a></li>
          <li><a href="#vantagens" class="hover:text-[var(--color-red)] transition-colors">Vantagens & Garantia</a></li>
          <li><a href="#visitar" class="hover:text-[var(--color-red)] transition-colors">Visitar o Showroom</a></li>
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

  <!-- ─── Widget de personalização (demo on/off do alinhamento) ─── -->
  <div class="cust">
    {#if custOpen}
      <div class="cust-panel">
        <div class="cust-head">
          <span>Personalização</span>
          <button type="button" class="cust-x" onclick={() => (custOpen = false)} aria-label="Fechar">×</button>
        </div>
        <div class="cust-row">
          <span class="cust-text">
            <strong>Conteúdo centrado</strong>
            <small>Limita o conteúdo a uma coluna central de 1600px (os fundos continuam de ponta a ponta). Desligue para ver a versão original a toda a largura.</small>
          </span>
          <button type="button" class="cust-switch" class:on={aligned} role="switch" aria-checked={aligned} aria-label="Alternar conteúdo centrado" onclick={() => (aligned = !aligned)}>
            <span class="cust-knob"></span>
          </button>
        </div>
      </div>
    {/if}
    <button type="button" class="cust-fab" onclick={() => (custOpen = !custOpen)} aria-label="Abrir personalização do layout">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  </div>
</div>

<style>
  /* Local overrides or custom additions scoped to v1 style if needed */
  .site-v1-wrapper {
    scroll-behavior: smooth;
  }

  /*
    ─── Coluna de conteúdo centrada (toggle pela widget de personalização) ───
    O gutter vive no padding lateral, por isso os fundos das secções (ex.: a
    faixa do inventário) continuam a ir de ponta a ponta — só o conteúdo é que
    encosta a uma coluna de 1600px centrada. Desligar = original v1.
  */
  .site-v1-wrapper.align-on > :is(header, section, footer) {
    padding-left: max(2rem, calc((100% - 1600px) / 2)) !important;
    padding-right: max(2rem, calc((100% - 1600px) / 2)) !important;
  }

  /* ─── Widget de personalização ─── */
  .cust { position: fixed; left: 22px; bottom: 22px; z-index: 70; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
  .cust-fab { width: 50px; height: 50px; border-radius: 999px; background: var(--color-red); color: #fff; border: none; display: grid; place-items: center; cursor: pointer; box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.45); transition: transform 0.2s ease; }
  .cust-fab:hover { transform: translateY(-2px); }
  .cust-fab svg { width: 22px; height: 22px; }
  .cust-panel { width: 300px; background: var(--color-bg-1); border: 1px solid var(--color-border); border-radius: var(--radius-card); padding: 16px; box-shadow: 0 28px 70px -24px rgba(0, 0, 0, 0.5); }
  .cust-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; font-family: var(--font-display); font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: 0.02em; font-size: 13px; color: var(--color-text); }
  .cust-x { background: none; border: none; color: var(--color-text-faint); font-size: 22px; line-height: 1; cursor: pointer; padding: 0 4px; }
  .cust-x:hover { color: var(--color-text); }
  .cust-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
  .cust-text strong { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); }
  .cust-text small { display: block; margin-top: 4px; font-size: 11.5px; line-height: 1.5; color: var(--color-text-muted); }
  .cust-switch { flex-shrink: 0; width: 44px; height: 26px; margin-top: 2px; padding: 0; border-radius: 999px; background: var(--color-bg-3); border: 1px solid var(--color-border); position: relative; cursor: pointer; transition: background 0.2s ease, border-color 0.2s; }
  .cust-switch.on { background: var(--color-red); border-color: var(--color-red); }
  .cust-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 999px; background: #fff; transition: transform 0.2s ease; }
  .cust-switch.on .cust-knob { transform: translateX(18px); }
</style>
