<!--
  ════════════════════════════════════════════════════════════════════════
  PUBLIC DEALERSHIP HOMEPAGE — VERSION 2  ·  "SHOWROOM EDITORIAL"
  ════════════════════════════════════════════════════════════════════════
  An editorial, magazine-style showroom for Auto Nunes Martins.
  Big confident typography, generous whitespace, asymmetric layouts and
  the brand red used as a precise accent. Premium yet honest — designed for
  the value used-car market (€5.000 – €20.000).

  · Self-contained (inline inventory) — delete the /stand-2 folder to remove.
  · Dark / Light mode synced with the ERP via the 'app-theme' key.
  · Cards are fully clickable → /stand-2/[id] detail pages.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // ─── Inventory (€5.000 – €20.000) ───────────────────────────────────────
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
      id: 'volkswagen-up-2018',
      brand: 'Volkswagen', model: 'up!', trim: '1.0 MPI Move',
      year: 2018, km: 61200, fuel: 'Gasolina', transmission: 'Manual', power: 60,
      price: 7900, monthly: 109,
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      category: 'citadino', tag: 'Primeiro Carro'
    },
    {
      id: 'opel-corsa-2018',
      brand: 'Opel', model: 'Corsa', trim: '1.2 Edition',
      year: 2018, km: 72400, fuel: 'Gasolina', transmission: 'Manual', power: 70,
      price: 9400, monthly: 129,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80',
      category: 'citadino', tag: 'Económico'
    },
    {
      id: 'fiat-500-2021',
      brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge',
      year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70,
      price: 11900, monthly: 149,
      image: 'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80',
      category: 'citadino'
    },
    {
      id: 'renault-clio-2021',
      brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90,
      price: 13500, monthly: 169,
      image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80',
      category: 'citadino', tag: 'Mais Procurado'
    },
    {
      id: 'dacia-sandero-2021',
      brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G',
      year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100,
      price: 12800, monthly: 159,
      image: 'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80',
      category: 'utilitario', tag: 'Custo Baixo'
    },
    {
      id: 'seat-ibiza-2020',
      brand: 'Seat', model: 'Ibiza', trim: '1.0 TSI FR',
      year: 2020, km: 54100, fuel: 'Gasolina', transmission: 'Manual', power: 95,
      price: 14200, monthly: 179,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
      category: 'citadino'
    },
    {
      id: 'ford-focus-2020',
      brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line',
      year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125,
      price: 14900, monthly: 189,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
      category: 'familiar', tag: 'Desportivo'
    },
    {
      id: 'toyota-yaris-2020',
      brand: 'Toyota', model: 'Yaris', trim: '1.5 Hybrid Active',
      year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116,
      price: 16800, monthly: 209,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      category: 'utilitario', tag: 'Fiabilidade'
    },
    {
      id: 'nissan-qashqai-2019',
      brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta',
      year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115,
      price: 18900, monthly: 239,
      image: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=900&q=80',
      category: 'suv', tag: 'Familiar'
    }
  ];

  // ─── Theme ───────────────────────────────────────────────────────────────
  let isDark = $state(false);
  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    isDark = stored ? stored === 'dark' : document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme();
    // reveal-on-scroll
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
  }
  function toggleTheme() { isDark = !isDark; applyTheme(); }

  // ─── Filters ───────────────────────────────────────────────────────────
  let searchQuery = $state('');
  let selectedCategory = $state('todos');
  let sortBy = $state('relevance');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'citadino', label: 'Citadinos' },
    { id: 'utilitario', label: 'Utilitários' },
    { id: 'familiar', label: 'Familiares' },
    { id: 'suv', label: 'SUV' }
  ];

  const filtered = $derived(
    vehicles
      .filter((v) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = `${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q);
        const matchesCat = selectedCategory === 'todos' || v.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'year-desc') return b.year - a.year;
        if (sortBy === 'km-asc') return a.km - b.km;
        return 0;
      })
  );

  const featured: Vehicle = vehicles.find((v) => v.tag === 'Mais Procurado') ?? vehicles[0]!;

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const formatKm = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>Auto Nunes Martins · Viaturas Usadas de Confiança</title>
  <meta name="description" content="Stand de automóveis usados entre 5.000€ e 20.000€. Carros revistos, garantia até 24 meses e financiamento rápido. Auto Nunes Martins." />
</svelte:head>

<div class="ed-wrap min-h-screen bg-[var(--color-bg-0)] text-[var(--color-text)] transition-colors duration-300">

  <!-- ─── ANNOUNCEMENT BAR ──────────────────────────────────────────────── -->
  <div class="bg-[var(--color-red)] text-white text-[11px] md:text-xs font-medium tracking-wide text-center py-2 px-4 flex items-center justify-center gap-2">
    <span class="hidden sm:inline opacity-80 font-[var(--font-mono)] uppercase text-[10px] tracking-widest">Auto Nunes Martins</span>
    <span class="hidden sm:inline opacity-40">·</span>
    <span>Garantia até 24 meses · Financiamento sem entrada · Retoma do seu usado</span>
  </div>

  <!-- ─── HEADER ────────────────────────────────────────────────────────── -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg-0)]/75 border-b border-[var(--color-border)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between gap-6">
      <!-- Wordmark (faithful reproduction of the official logo, theme-aware) -->
      <a href="/stand-2" class="flex items-center gap-3 shrink-0 group" aria-label="Auto Nunes Martins — início">
        <span class="ed-mark" aria-hidden="true">
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

      <nav class="hidden lg:flex items-center gap-9 text-[13px] font-medium text-[var(--color-text-muted)]">
        <a href="#inventario" class="hover:text-[var(--color-text)] transition-colors">Viaturas</a>
        <a href="#processo" class="hover:text-[var(--color-text)] transition-colors">Como Funciona</a>
        <a href="#confianca" class="hover:text-[var(--color-text)] transition-colors">Garantias</a>
        <a href="#visitar" class="hover:text-[var(--color-text)] transition-colors">Onde Estamos</a>
      </nav>

      <div class="flex items-center gap-2.5">
        <button type="button" onclick={toggleTheme} aria-label="Alternar tema"
          class="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-faint)] transition-colors">
          {#if isDark}
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          {:else}
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          {/if}
        </button>
        <a href="tel:+351210000000" class="hidden sm:inline-flex items-center gap-2 bg-[var(--color-text)] text-[var(--color-bg-0)] hover:bg-[var(--color-red)] hover:text-white px-5 py-2.5 rounded-full font-semibold text-[13px] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
          210 000 000
        </a>
      </div>
    </div>
  </header>

  <!-- ─── HERO ──────────────────────────────────────────────────────────── -->
  <section class="relative overflow-hidden border-b border-[var(--color-border)]">
    <!-- giant brand swoosh watermark -->
    <svg class="absolute -top-10 right-0 w-[120%] md:w-[70%] opacity-[0.06] pointer-events-none select-none" viewBox="0 0 600 200" aria-hidden="true">
      <path d="M10 150 C 180 150 300 60 590 25" fill="none" stroke="var(--color-red)" stroke-width="26" stroke-linecap="round"/>
      <path d="M30 178 C 150 178 230 135 400 120" fill="none" stroke="var(--color-text)" stroke-width="14" stroke-linecap="round"/>
    </svg>

    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-14 md:py-24 grid lg:grid-cols-12 gap-12 items-center relative">
      <!-- Left: editorial copy -->
      <div class="lg:col-span-6 flex flex-col gap-7">
        <div class="flex items-center gap-3 text-[11px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          <span class="inline-block w-7 h-px bg-[var(--color-red)]"></span>
          Desde 2008 · Mais de 4.000 famílias
        </div>

        <h1 class="font-[var(--font-display)] font-extrabold italic leading-[0.95] tracking-tight text-[clamp(2.6rem,6vw,4.6rem)]">
          O carro certo,<br/>
          <span class="text-[var(--color-red)]">pelo preço justo.</span>
        </h1>

        <p class="text-[15px] md:text-base text-[var(--color-text-muted)] max-w-md leading-relaxed">
          Não vendemos sonhos caros — vendemos viaturas usadas de confiança,
          rigorosamente revistas, entre os <strong class="text-[var(--color-text)]">5.000€ e os 20.000€</strong>.
          Com garantia, financiamento simples e a transparência que merece.
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-1">
          <a href="#inventario" class="inline-flex items-center gap-2.5 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-deep)] px-7 py-3.5 rounded-full font-semibold text-sm transition-colors">
            Ver viaturas em stock
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
          <a href="#processo" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[var(--color-border-strong)] hover:border-[var(--color-text)] font-semibold text-sm transition-colors">
            Como compramos
          </a>
        </div>

        <!-- stat row -->
        <div class="grid grid-cols-3 gap-6 pt-8 mt-2 border-t border-[var(--color-border)] max-w-md">
          <div>
            <div class="num-value text-2xl md:text-3xl text-[var(--color-text)]">24<span class="text-base text-[var(--color-text-muted)]">m</span></div>
            <div class="text-[11px] text-[var(--color-text-faint)] mt-0.5">Garantia incluída</div>
          </div>
          <div>
            <div class="num-value text-2xl md:text-3xl text-[var(--color-text)]">130</div>
            <div class="text-[11px] text-[var(--color-text-faint)] mt-0.5">Pontos revistos</div>
          </div>
          <div>
            <div class="num-value text-2xl md:text-3xl text-[var(--color-text)]">24<span class="text-base text-[var(--color-text-muted)]">h</span></div>
            <div class="text-[11px] text-[var(--color-text-faint)] mt-0.5">Resposta crédito</div>
          </div>
        </div>
      </div>

      <!-- Right: featured vehicle, editorial framing -->
      <div class="lg:col-span-6 relative">
        <div class="relative">
          <span class="absolute -top-7 -left-1 font-[var(--font-display)] font-extrabold italic text-[var(--color-text)]/[0.06] text-[7rem] leading-none select-none pointer-events-none">01</span>
          <a href="/stand-2/{featured.id}" class="group block relative rounded-[18px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-1)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]">
            <div class="aspect-[5/4] overflow-hidden">
              <img src={featured.image} alt="{featured.brand} {featured.model}" class="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.04]"/>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"></div>
            <span class="absolute top-4 left-4 bg-[var(--color-red)] text-white text-[10px] font-bold font-[var(--font-mono)] uppercase tracking-wider px-3 py-1.5 rounded-full">★ Destaque</span>
            <div class="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
              <div class="text-white">
                <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-widest text-white/70">{featured.brand} · {featured.year}</div>
                <div class="text-2xl font-bold mt-0.5">{featured.model}</div>
                <div class="text-sm text-white/80">{featured.trim}</div>
              </div>
              <div class="text-right text-white">
                <div class="text-[10px] uppercase tracking-wider text-white/60">desde</div>
                <div class="num-value text-2xl">{formatEUR(featured.monthly)}<span class="text-sm font-normal text-white/70">/mês</span></div>
              </div>
            </div>
          </a>
        </div>

        <!-- floating logo plate (uses the official logo on a guaranteed-light surface) -->
        <div class="absolute -bottom-7 -left-4 sm:-left-7 bg-white rounded-2xl shadow-xl border border-black/5 px-5 py-3.5 hidden sm:flex items-center gap-3">
          <img src="/logo.png" alt="Auto Nunes Martins" class="h-9 w-auto"/>
          <div class="pl-3 border-l border-black/10">
            <div class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg>
              Stand certificado IMT
            </div>
            <div class="text-[11px] text-zinc-500 mt-0.5">Avaliações reais · 4,9/5</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── BRAND / TRUST STRIP ───────────────────────────────────────────── -->
  <section class="border-b border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-[var(--color-text-faint)] text-[13px] font-[var(--font-mono)] uppercase tracking-widest">
      <span>Renault</span><span class="opacity-40">·</span>
      <span>Peugeot</span><span class="opacity-40">·</span>
      <span>Volkswagen</span><span class="opacity-40">·</span>
      <span>Toyota</span><span class="opacity-40">·</span>
      <span>Ford</span><span class="opacity-40">·</span>
      <span>Dacia</span><span class="opacity-40">·</span>
      <span>Nissan</span>
    </div>
  </section>

  <!-- ─── INVENTORY ─────────────────────────────────────────────────────── -->
  <section id="inventario" class="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div class="reveal">
        <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[var(--color-red)] mb-3 flex items-center gap-2">
          <span class="inline-block w-7 h-px bg-[var(--color-red)]"></span> O nosso stock
        </div>
        <h2 class="font-[var(--font-display)] font-extrabold italic text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">
          Viaturas disponíveis
        </h2>
        <p class="text-[var(--color-text-muted)] mt-3 max-w-lg text-[15px]">
          Quilómetros certificados, histórico verificado e revisão completa antes da entrega.
          Carregue em qualquer viatura para ver a ficha completa.
        </p>
      </div>
      <div class="flex items-center gap-2 text-[var(--color-text-muted)] text-[13px] font-[var(--font-mono)] shrink-0">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="num-value text-[var(--color-text)]">{filtered.length}</span> viaturas em stock
      </div>
    </div>

    <!-- toolbar -->
    <div class="flex flex-col lg:flex-row gap-4 mb-10 sticky top-[72px] z-30 py-3 -mx-2 px-2 bg-[var(--color-bg-0)]/85 backdrop-blur-md">
      <div class="relative flex-1">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" bind:value={searchQuery} placeholder="Pesquisar marca, modelo ou versão…"
          class="w-full bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-full py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--color-red)] transition-colors text-[var(--color-text)]"/>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
        {#each categories as cat (cat.id)}
          <button type="button" onclick={() => (selectedCategory = cat.id)}
            class="px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors
              {selectedCategory === cat.id
                ? 'bg-[var(--color-text)] text-[var(--color-bg-0)] border-[var(--color-text)]'
                : 'bg-[var(--color-bg-1)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-text-faint)] hover:text-[var(--color-text)]'}">
            {cat.label}
          </button>
        {/each}
      </div>
      <select bind:value={sortBy}
        class="bg-[var(--color-bg-1)] border border-[var(--color-border)] rounded-full py-3 px-4 text-sm outline-none focus:border-[var(--color-red)] text-[var(--color-text)] shrink-0">
        <option value="relevance">Ordenar: Relevância</option>
        <option value="price-asc">Preço ↑</option>
        <option value="price-desc">Preço ↓</option>
        <option value="year-desc">Mais recentes</option>
        <option value="km-asc">Menos km</option>
      </select>
    </div>

    <!-- grid -->
    {#if filtered.length}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {#each filtered as car, i (car.id)}
          <a href="/stand-2/{car.id}" in:fade={{ duration: 250 }}
            class="group flex flex-col rounded-[16px] overflow-hidden bg-[var(--color-bg-1)] border border-[var(--color-border)] hover:border-[var(--color-text-faint)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.45)]">
            <div class="relative aspect-[16/11] overflow-hidden bg-[var(--color-bg-2)]">
              <img src={car.image} alt="{car.brand} {car.model}" loading="lazy"
                class="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.05]"/>
              <span class="absolute top-3 left-3 text-[10px] font-[var(--font-mono)] text-white/90 bg-black/45 backdrop-blur px-2.5 py-1 rounded-full tracking-wider">
                {String(i + 1).padStart(2, '0')}
              </span>
              {#if car.tag}
                <span class="absolute top-3 right-3 bg-[var(--color-red)] text-white text-[10px] font-bold font-[var(--font-mono)] uppercase tracking-wider px-2.5 py-1 rounded-full">{car.tag}</span>
              {/if}
            </div>

            <div class="p-5 flex flex-col flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <div>
                  <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">{car.brand}</div>
                  <h3 class="text-lg font-bold leading-tight group-hover:text-[var(--color-red)] transition-colors">{car.model}</h3>
                </div>
                <span class="num-value text-[13px] text-[var(--color-text-muted)]">{car.year}</span>
              </div>
              <p class="text-[13px] text-[var(--color-text-muted)] truncate mt-0.5">{car.trim}</p>

              <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[12px] text-[var(--color-text-muted)]">
                <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--color-red)]"></span>{formatKm(car.km)} km</span>
                <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--color-red)]"></span>{car.fuel}</span>
                <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--color-red)]"></span>{car.transmission}</span>
              </div>

              <div class="mt-auto pt-5 flex items-end justify-between">
                <div>
                  <div class="num-value text-2xl text-[var(--color-text)]">{formatEUR(car.price)}</div>
                  <div class="text-[11px] text-[var(--color-text-faint)]">ou {formatEUR(car.monthly)}/mês</div>
                </div>
                <span class="w-10 h-10 rounded-full bg-[var(--color-bg-2)] group-hover:bg-[var(--color-red)] text-[var(--color-text-muted)] group-hover:text-white flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="text-center py-20 border border-dashed border-[var(--color-border)] rounded-[16px]">
        <p class="text-[var(--color-text-muted)]">Nenhuma viatura corresponde à pesquisa.</p>
        <button type="button" onclick={() => { searchQuery=''; selectedCategory='todos'; }}
          class="mt-4 text-[var(--color-red)] font-semibold text-sm hover:underline">Limpar filtros</button>
      </div>
    {/if}
  </section>

  <!-- ─── PROCESS ───────────────────────────────────────────────────────── -->
  <section id="processo" class="border-y border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24">
      <div class="max-w-2xl reveal">
        <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[var(--color-red)] mb-3 flex items-center gap-2">
          <span class="inline-block w-7 h-px bg-[var(--color-red)]"></span> Simples e sem surpresas
        </div>
        <h2 class="font-[var(--font-display)] font-extrabold italic text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">Como funciona</h2>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mt-12 bg-[var(--color-border)] rounded-[16px] overflow-hidden border border-[var(--color-border)]">
        {#each [
          { n: '01', t: 'Escolha online', d: 'Veja o stock, fotos reais e ficha técnica completa de cada viatura sem sair de casa.' },
          { n: '02', t: 'Reserve a visita', d: 'Marque um test-drive sem compromisso. Tratamos da retoma do seu carro atual.' },
          { n: '03', t: 'Financiamento 24h', d: 'Simulamos e aprovamos o crédito em menos de 24 horas, sem entrada obrigatória.' },
          { n: '04', t: 'Leve o seu carro', d: 'Documentação tratada por nós e garantia de 24 meses incluída na entrega.' }
        ] as step}
          <div class="bg-[var(--color-bg-1)] p-7 flex flex-col gap-3 hover:bg-[var(--color-bg-2)] transition-colors">
            <span class="num-value text-3xl text-[var(--color-red)]">{step.n}</span>
            <h3 class="text-lg font-bold">{step.t}</h3>
            <p class="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{step.d}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── TRUST / WHY US ────────────────────────────────────────────────── -->
  <section id="confianca" class="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-5 reveal">
      <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[var(--color-red)] mb-3 flex items-center gap-2">
        <span class="inline-block w-7 h-px bg-[var(--color-red)]"></span> Porquê confiar
      </div>
      <h2 class="font-[var(--font-display)] font-extrabold italic text-[clamp(2rem,4vw,3rem)] leading-[0.98] tracking-tight">
        Transparência<br/>do princípio ao fim.
      </h2>
      <p class="text-[var(--color-text-muted)] mt-4 leading-relaxed max-w-md">
        Somos um stand de bairro com padrões de concessionário. Cada carro é vendido
        com o relatório de inspeção em mãos — sem letra pequena, sem custos escondidos.
      </p>
      <a href="#visitar" class="inline-flex items-center gap-2 mt-7 font-semibold text-sm text-[var(--color-red)] hover:gap-3 transition-all">
        Venha conhecer o espaço
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>
    </div>

    <div class="lg:col-span-7 grid sm:grid-cols-2 gap-5">
      {#each [
        { t: 'Garantia 24 meses', d: 'Motor, caixa e componentes essenciais cobertos, com assistência em todo o país.', icon: 'shield' },
        { t: 'Inspeção 130 pontos', d: 'Vistoria mecânica completa antes da venda. Recebe a ficha de verificação.', icon: 'check' },
        { t: 'Crédito sem entrada', d: 'Parcerias com as principais instituições. Aprovação rápida e prestação à sua medida.', icon: 'card' },
        { t: 'Retoma do seu usado', d: 'Avaliamos e retomamos o seu carro atual, abatendo o valor no negócio.', icon: 'repeat' }
      ] as f}
        <div class="reveal p-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-1)] flex flex-col gap-3 hover:border-[var(--color-text-faint)] transition-colors">
          <span class="w-11 h-11 rounded-xl bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center">
            {#if f.icon === 'shield'}<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.6-4.02A12 12 0 0112 2.94a12 12 0 01-8.6 3.04A12 12 0 003 9c0 5.6 3.82 10.29 9 11.62 5.18-1.33 9-6.02 9-11.62 0-1.04-.13-2.05-.4-3.02z"/></svg>
            {:else if f.icon === 'check'}<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {:else if f.icon === 'card'}<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
            {:else}<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0111.9-2.5M19 15a7 7 0 01-11.9 2.5"/></svg>{/if}
          </span>
          <h3 class="text-base font-bold">{f.t}</h3>
          <p class="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{f.d}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- ─── TESTIMONIALS ──────────────────────────────────────────────────── -->
  <section class="border-y border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
      <div class="flex items-end justify-between gap-4 mb-10">
        <h2 class="font-[var(--font-display)] font-extrabold italic text-[clamp(1.7rem,3.5vw,2.5rem)] leading-none tracking-tight">O que dizem os clientes</h2>
        <div class="text-right shrink-0">
          <div class="num-value text-3xl text-[var(--color-text)]">4,9<span class="text-base text-[var(--color-text-muted)]">/5</span></div>
          <div class="text-[11px] text-[var(--color-text-faint)]">+380 avaliações</div>
        </div>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        {#each [
          { n: 'Sofia M.', c: 'Lisboa', q: 'Comprei o meu primeiro carro aqui. Explicaram tudo com calma e o preço foi exatamente o combinado. Recomendo a olhos fechados.' },
          { n: 'Bruno R.', c: 'Almada', q: 'Trataram da retoma do meu antigo e do financiamento em dois dias. Profissionalismo do início ao fim.' },
          { n: 'Helena C.', c: 'Sintra', q: 'O carro veio impecável e com a inspeção feita. Já passou um ano e nem um problema. Voltarei.' }
        ] as t}
          <figure class="p-6 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-0)] flex flex-col gap-4">
            <div class="flex gap-0.5 text-[var(--color-red)]">
              {#each Array(5) as _}<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z"/></svg>{/each}
            </div>
            <blockquote class="text-[14px] text-[var(--color-text)] leading-relaxed">“{t.q}”</blockquote>
            <figcaption class="text-[12px] text-[var(--color-text-muted)] mt-auto pt-2 border-t border-[var(--color-border)]">
              <strong class="text-[var(--color-text)]">{t.n}</strong> · {t.c}
            </figcaption>
          </figure>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── VISIT / CTA ───────────────────────────────────────────────────── -->
  <section id="visitar" class="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24">
    <div class="rounded-[22px] overflow-hidden border border-[var(--color-border)] grid lg:grid-cols-2">
      <div class="p-9 md:p-12 flex flex-col gap-6 bg-[var(--color-bg-1)]">
        <h2 class="font-[var(--font-display)] font-extrabold italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[0.98] tracking-tight">
          Venha tomar um café<br/>e conhecer o carro.
        </h2>
        <p class="text-[var(--color-text-muted)] leading-relaxed max-w-md">
          Estamos abertos de Segunda a Sábado. Test-drive sem compromisso e
          aconselhamento honesto — mesmo que não compre connosco.
        </p>
        <div class="grid sm:grid-cols-2 gap-4 mt-2">
          <div>
            <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">Morada</div>
            <div class="text-sm font-semibold mt-1">Rua do Comércio, 123 — Lisboa</div>
          </div>
          <div>
            <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">Horário</div>
            <div class="text-sm font-semibold mt-1">Seg–Sex 9h–19h · Sáb 10h–17h</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 mt-3">
          <a href="https://wa.me/351210000000" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 rounded-full font-semibold text-sm transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
            WhatsApp
          </a>
          <a href="tel:+351210000000" class="inline-flex items-center gap-2 border border-[var(--color-border-strong)] hover:border-[var(--color-text)] px-6 py-3.5 rounded-full font-semibold text-sm transition-colors">
            Ligar agora
          </a>
        </div>
      </div>
      <div class="relative min-h-[280px] bg-[var(--color-bg-2)]">
        <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1000&q=80" alt="Showroom" class="absolute inset-0 w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-5 left-5 bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2.5">
          <img src="/logo.png" alt="Auto Nunes Martins" class="h-7 w-auto"/>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── FOOTER ────────────────────────────────────────────────────────── -->
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">
      <div class="flex flex-col gap-4">
        <div class="font-[var(--font-display)] font-extrabold italic text-xl">
          <span class="text-[var(--color-red)]">AUTO</span>NUNES MARTINS
        </div>
        <p class="text-[var(--color-text-muted)] text-[13px] leading-relaxed max-w-xs">
          Comércio de automóveis usados de confiança desde 2008. Carros revistos,
          preços justos e o acompanhamento que merece.
        </p>
      </div>
      <div>
        <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Navegação</h4>
        <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--color-text-muted)]">
          <li><a href="#inventario" class="hover:text-[var(--color-red)] transition-colors">Viaturas</a></li>
          <li><a href="#processo" class="hover:text-[var(--color-red)] transition-colors">Como Funciona</a></li>
          <li><a href="#confianca" class="hover:text-[var(--color-red)] transition-colors">Garantias</a></li>
          <li><a href="#visitar" class="hover:text-[var(--color-red)] transition-colors">Onde Estamos</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Legal</h4>
        <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--color-text-muted)]">
          <li>Licença IMT nº 1234</li>
          <li>Intermediário de Crédito Registado</li>
          <li>Livro de Reclamações</li>
          <li>Política de Privacidade</li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Contactos</h4>
        <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--color-text-muted)]">
          <li class="font-bold text-[var(--color-text)]">+351 210 000 000</li>
          <li>geral@autonunesmartins.pt</li>
          <li>Rua do Comércio, 123 — Lisboa</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-[var(--color-border)]">
      <div class="max-w-[1600px] mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-[var(--color-text-faint)]">
        <span>© 2026 Auto Nunes Martins. Todos os direitos reservados.</span>
        <span class="font-[var(--font-mono)] uppercase tracking-widest">Showroom Editorial · v2</span>
      </div>
    </div>
  </footer>
</div>

<style>
  .ed-wrap { scroll-behavior: smooth; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* reveal-on-scroll */
  .reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s var(--ease-brand), transform .7s var(--ease-brand); }
  :global(.reveal.in-view) { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; transform: none; transition: none; }
  }
</style>
