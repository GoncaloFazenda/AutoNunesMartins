<!--
  ════════════════════════════════════════════════════════════════════════
  PUBLIC DEALERSHIP HOMEPAGE — VERSION 3  ·  "GARAGEM PERFORMANCE"
  ════════════════════════════════════════════════════════════════════════
  A high-energy, cockpit/telemetry-inspired showroom for Auto Nunes Martins.
  Dark-native with a precise red glow, monospaced telemetry numerals,
  diagonal-cut spec panels and the brand's signature red wedge. Built for the
  value used-car market (€5.000 – €20.000). Also fully supports Light mode.

  · Self-contained (inline inventory) — delete /stand-3 to remove.
  · Dark / Light synced with the ERP via the 'app-theme' key.
  · Cards clickable → /stand-3/[id] detail pages.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Vehicle {
    id: string; brand: string; model: string; trim: string;
    year: number; km: number; fuel: string; transmission: string; power: number;
    price: number; monthly: number; image: string;
    category: 'citadino' | 'familiar' | 'suv' | 'utilitario'; tag?: string;
  }

  const vehicles: Vehicle[] = [
    { id: 'volkswagen-up-2018', brand: 'Volkswagen', model: 'up!', trim: '1.0 MPI Move', year: 2018, km: 61200, fuel: 'Gasolina', transmission: 'Manual', power: 60, price: 7900, monthly: 109, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80', category: 'citadino', tag: '1º Carro' },
    { id: 'opel-corsa-2018', brand: 'Opel', model: 'Corsa', trim: '1.2 Edition', year: 2018, km: 72400, fuel: 'Gasolina', transmission: 'Manual', power: 70, price: 9400, monthly: 129, image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80', category: 'citadino', tag: 'Económico' },
    { id: 'fiat-500-2021', brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge', year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70, price: 11900, monthly: 149, image: 'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80', category: 'citadino' },
    { id: 'renault-clio-2021', brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens', year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90, price: 13500, monthly: 169, image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80', category: 'citadino', tag: 'Top' },
    { id: 'dacia-sandero-2021', brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G', year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100, price: 12800, monthly: 159, image: 'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80', category: 'utilitario', tag: 'Low Cost' },
    { id: 'seat-ibiza-2020', brand: 'Seat', model: 'Ibiza', trim: '1.0 TSI FR', year: 2020, km: 54100, fuel: 'Gasolina', transmission: 'Manual', power: 95, price: 14200, monthly: 179, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80', category: 'citadino' },
    { id: 'ford-focus-2020', brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line', year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125, price: 14900, monthly: 189, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80', category: 'familiar', tag: 'ST-Line' },
    { id: 'toyota-yaris-2020', brand: 'Toyota', model: 'Yaris', trim: '1.5 Hybrid Active', year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116, price: 16800, monthly: 209, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80', category: 'utilitario', tag: 'Híbrido' },
    { id: 'nissan-qashqai-2019', brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta', year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115, price: 18900, monthly: 239, image: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=900&q=80', category: 'suv', tag: 'SUV' }
  ];

  // theme
  let isDark = $state(true);
  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    isDark = stored ? stored === 'dark' : true;
    applyTheme();
  });
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
  }
  function toggleTheme() { isDark = !isDark; applyTheme(); }

  // filters
  let searchQuery = $state('');
  let selectedCategory = $state('todos');
  let sortBy = $state('relevance');
  const categories = [
    { id: 'todos', label: 'Tudo' },
    { id: 'citadino', label: 'Citadinos' },
    { id: 'utilitario', label: 'Utilitários' },
    { id: 'familiar', label: 'Familiares' },
    { id: 'suv', label: 'SUV' }
  ];
  const filtered = $derived(
    vehicles
      .filter((v) => {
        const q = searchQuery.toLowerCase();
        const s = `${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q);
        const c = selectedCategory === 'todos' || v.category === selectedCategory;
        return s && c;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'year-desc') return b.year - a.year;
        if (sortBy === 'km-asc') return a.km - b.km;
        return 0;
      })
  );

  // hero stats
  const stockCount = vehicles.length;
  const cheapest = Math.min(...vehicles.map((v) => v.price));
  const avgKm = Math.round(vehicles.reduce((s, v) => s + v.km, 0) / vehicles.length);

  // km gauge (relative to a 150k baseline)
  const kmPct = (km: number) => Math.max(8, Math.min(100, Math.round((1 - km / 150000) * 100)));

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const formatKm = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>Auto Nunes Martins · Garagem · Usados de 5.000€ a 20.000€</title>
  <meta name="description" content="Stand de automóveis usados revistos entre 5.000€ e 20.000€. Garantia, financiamento rápido e retoma. Auto Nunes Martins." />
</svelte:head>

<div class="gp-wrap min-h-screen bg-[var(--color-bg-0)] text-[var(--color-text)] transition-colors duration-300">
  <!-- signature red wedge -->
  <div class="gp-wedge" aria-hidden="true"></div>

  <!-- ─── HEADER ────────────────────────────────────────────────────────── -->
  <header class="sticky top-0 z-50 bg-[var(--color-bg-0)]/85 backdrop-blur-xl border-b border-[var(--color-border)]">
    <div class="max-w-[1600px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-5">
      <a href="/stand-3" class="flex items-center gap-2.5 shrink-0" aria-label="Auto Nunes Martins — início">
        <span aria-hidden="true">
          <svg viewBox="0 0 64 30" class="w-10 h-5">
            <path d="M3 21 C 20 21 30 14 61 7" fill="none" stroke="var(--color-red)" stroke-width="5" stroke-linecap="round"/>
            <path d="M6 26 C 16 26 22 22 37 20" fill="none" stroke="var(--color-text-faint)" stroke-width="2.8" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="font-[var(--font-display)] font-extrabold italic text-lg tracking-tight leading-none select-none">
          <span class="text-[var(--color-red)]">AUTO</span><span class="text-[var(--color-text)]">NUNES&nbsp;MARTINS</span>
        </span>
      </a>

      <nav class="hidden lg:flex items-center gap-7 text-[12px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-muted)]">
        <a href="#stock" class="hover:text-[var(--color-red)] transition-colors">Stock</a>
        <a href="#financiar" class="hover:text-[var(--color-red)] transition-colors">Financiar</a>
        <a href="#vantagens" class="hover:text-[var(--color-red)] transition-colors">Vantagens</a>
        <a href="#contacto" class="hover:text-[var(--color-red)] transition-colors">Contacto</a>
      </nav>

      <div class="flex items-center gap-2">
        <button type="button" onclick={toggleTheme} aria-label="Alternar tema"
          class="w-9 h-9 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-red)] transition-colors" style="clip-path: polygon(0 0,100% 0,100% 70%,80% 100%,0 100%)">
          {#if isDark}
            <svg class="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          {:else}
            <svg class="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          {/if}
        </button>
        <a href="#stock" class="hidden sm:inline-flex items-center gap-2 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-deep)] px-4 py-2 font-[var(--font-display)] italic font-bold uppercase tracking-wider text-[12px] transition-colors" style="clip-path: polygon(0 0,100% 0,100% 65%,90% 100%,0 100%)">
          Ver Stock
        </a>
      </div>
    </div>
  </header>

  <!-- ─── HERO ──────────────────────────────────────────────────────────── -->
  <section class="relative overflow-hidden">
    <div class="gp-grid-bg" aria-hidden="true"></div>
    <!-- glow -->
    <div class="absolute -top-32 -right-20 w-[36rem] h-[36rem] bg-[var(--color-red)]/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-[1600px] mx-auto px-5 md:px-8 py-14 md:py-20 grid lg:grid-cols-2 gap-12 items-center relative">
      <!-- copy -->
      <div class="flex flex-col gap-6">
        <div class="inline-flex items-center gap-2.5 text-[11px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[var(--color-red)] font-semibold">
          <span class="relative flex w-2.5 h-2.5">
            <span class="absolute inline-flex h-full w-full rounded-full bg-[var(--color-red)] opacity-60 animate-ping"></span>
            <span class="relative inline-flex rounded-full w-2.5 h-2.5 bg-[var(--color-red)]"></span>
          </span>
          Stock disponível agora
        </div>

        <h1 class="font-[var(--font-display)] font-black italic uppercase leading-[0.86] tracking-tight text-[clamp(2.8rem,7vw,5.2rem)]">
          Carros a sério.<br/>
          Preços <span class="text-[var(--color-red)]">honestos.</span>
        </h1>

        <p class="text-[15px] text-[var(--color-text-muted)] max-w-md leading-relaxed">
          Usados revistos ponto por ponto, entre os <span class="num-value text-[var(--color-text)]">5.000€</span> e os
          <span class="num-value text-[var(--color-text)]">20.000€</span>. Garantia, financiamento rápido e a
          transparência que faz a diferença.
        </p>

        <div class="flex flex-wrap gap-3 pt-1">
          <a href="#stock" class="inline-flex items-center gap-2.5 bg-[var(--color-red)] text-white hover:bg-[var(--color-red-deep)] px-7 py-3.5 font-[var(--font-display)] italic font-bold uppercase tracking-wider text-sm transition-colors" style="clip-path: polygon(0 0,100% 0,100% 70%,93% 100%,0 100%)">
            Explorar viaturas
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
          <a href="#financiar" class="inline-flex items-center gap-2 px-6 py-3.5 border border-[var(--color-border-strong)] hover:border-[var(--color-red)] font-semibold text-sm transition-colors">
            Simular financiamento
          </a>
        </div>
      </div>

      <!-- telemetry dashboard -->
      <div class="relative">
        <div class="relative rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-1)]/80 backdrop-blur p-1.5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
          <div class="aspect-[16/10] overflow-hidden relative" style="clip-path: polygon(0 0,100% 0,100% 88%,92% 100%,0 100%)">
            <img src="https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1100&q=80" alt="Viatura em destaque" class="w-full h-full object-cover"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10"></div>
            <div class="absolute top-3 left-3 bg-[var(--color-red)] text-white text-[10px] font-bold font-[var(--font-mono)] uppercase tracking-wider px-2.5 py-1">Em destaque</div>
            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-white/70">Renault · 2021</div>
                <div class="text-xl font-bold">Clio 1.0 TCe</div>
              </div>
              <a href="/stand-3/renault-clio-2021" aria-label="Ver ficha do Renault Clio em destaque" class="bg-white text-black hover:bg-[var(--color-red)] hover:text-white w-10 h-10 flex items-center justify-center transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>

          <!-- gauges -->
          <div class="grid grid-cols-3 divide-x divide-[var(--color-border)] mt-1.5">
            <div class="p-3.5 text-center">
              <div class="num-value text-2xl text-[var(--color-red)]">{stockCount}</div>
              <div class="text-[9px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] mt-0.5">Em stock</div>
            </div>
            <div class="p-3.5 text-center">
              <div class="num-value text-2xl text-[var(--color-text)]">{formatEUR(cheapest)}</div>
              <div class="text-[9px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] mt-0.5">A partir de</div>
            </div>
            <div class="p-3.5 text-center">
              <div class="num-value text-2xl text-[var(--color-text)]">{Math.round(avgKm / 1000)}k</div>
              <div class="text-[9px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] mt-0.5">Km médios</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ticker -->
    <div class="border-y border-[var(--color-border)] bg-[var(--color-bg-1)] overflow-hidden">
      <div class="gp-ticker flex items-center gap-10 py-3 whitespace-nowrap text-[12px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-muted)]">
        {#each Array(2) as _}
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-[var(--color-red)]"></span> Garantia 24 meses</span>
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-[var(--color-red)]"></span> Financiamento sem entrada</span>
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-[var(--color-red)]"></span> Retoma do seu usado</span>
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-[var(--color-red)]"></span> Inspeção de 130 pontos</span>
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-[var(--color-red)]"></span> Aprovação de crédito em 24h</span>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── STOCK ─────────────────────────────────────────────────────────── -->
  <section id="stock" class="max-w-[1600px] mx-auto px-5 md:px-8 py-16 md:py-20">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
      <div>
        <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.25em] text-[var(--color-red)] mb-2">// Parque de viaturas</div>
        <h2 class="font-[var(--font-display)] font-black italic uppercase text-[clamp(2rem,4.5vw,3.2rem)] leading-none tracking-tight">O nosso stock</h2>
      </div>
      <div class="flex items-center gap-2 text-[12px] font-[var(--font-mono)] text-[var(--color-text-muted)]">
        <span class="w-2 h-2 bg-emerald-500 animate-pulse"></span>
        <span class="num-value text-[var(--color-text)]">{filtered.length}</span> RESULTADOS
      </div>
    </div>

    <!-- toolbar -->
    <div class="flex flex-col lg:flex-row gap-3 mb-9">
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" bind:value={searchQuery} placeholder="PESQUISAR MARCA / MODELO…"
          class="w-full bg-[var(--color-bg-1)] border border-[var(--color-border)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--color-red)] transition-colors text-[var(--color-text)] font-[var(--font-mono)] uppercase tracking-wide placeholder:tracking-widest"/>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {#each categories as cat (cat.id)}
          <button type="button" onclick={() => (selectedCategory = cat.id)}
            class="px-4 py-3 text-[12px] font-[var(--font-mono)] uppercase tracking-widest whitespace-nowrap border transition-colors
              {selectedCategory === cat.id
                ? 'bg-[var(--color-red)] text-white border-[var(--color-red)]'
                : 'bg-[var(--color-bg-1)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-red)] hover:text-[var(--color-text)]'}">
            {cat.label}
          </button>
        {/each}
      </div>
      <select bind:value={sortBy}
        class="bg-[var(--color-bg-1)] border border-[var(--color-border)] py-3 px-4 text-[12px] font-[var(--font-mono)] uppercase tracking-wide outline-none focus:border-[var(--color-red)] text-[var(--color-text)] shrink-0">
        <option value="relevance">Ordenar</option>
        <option value="price-asc">Preço ↑</option>
        <option value="price-desc">Preço ↓</option>
        <option value="year-desc">Mais novo</option>
        <option value="km-asc">Menos km</option>
      </select>
    </div>

    {#if filtered.length}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each filtered as car (car.id)}
          <a href="/stand-3/{car.id}" in:fade={{ duration: 220 }}
            class="gp-card group relative flex flex-col bg-[var(--color-bg-1)] border border-[var(--color-border)] hover:border-[var(--color-red)] transition-colors duration-300">
            <!-- image -->
            <div class="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-2)]">
              <img src={car.image} alt="{car.brand} {car.model}" loading="lazy"
                class="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.06]"/>
              <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-70"></div>
              {#if car.tag}
                <span class="absolute top-0 left-0 bg-[var(--color-red)] text-white text-[10px] font-bold font-[var(--font-mono)] uppercase tracking-wider px-3 py-1" style="clip-path: polygon(0 0,100% 0,86% 100%,0 100%)">{car.tag}</span>
              {/if}
              <span class="absolute bottom-2.5 right-2.5 num-value text-white text-sm bg-black/55 px-2 py-0.5">{car.year}</span>
            </div>

            <!-- body -->
            <div class="p-4 flex flex-col flex-1">
              <div class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">{car.brand}</div>
              <h3 class="text-lg font-bold leading-tight group-hover:text-[var(--color-red)] transition-colors">{car.model}</h3>
              <p class="text-[12px] text-[var(--color-text-muted)] truncate">{car.trim}</p>

              <!-- telemetry rows -->
              <div class="grid grid-cols-3 gap-2 mt-4 text-center">
                <div class="border border-[var(--color-border)] py-2">
                  <div class="num-value text-[13px] text-[var(--color-text)]">{Math.round(car.km / 1000)}k</div>
                  <div class="text-[8.5px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--color-text-faint)]">km</div>
                </div>
                <div class="border border-[var(--color-border)] py-2">
                  <div class="num-value text-[13px] text-[var(--color-text)]">{car.power}</div>
                  <div class="text-[8.5px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--color-text-faint)]">cv</div>
                </div>
                <div class="border border-[var(--color-border)] py-2">
                  <div class="text-[12px] font-bold text-[var(--color-text)] truncate px-1">{car.transmission === 'Automática' ? 'Auto' : 'Man'}</div>
                  <div class="text-[8.5px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--color-text-faint)]">caixa</div>
                </div>
              </div>

              <!-- km gauge -->
              <div class="mt-3">
                <div class="h-1.5 bg-[var(--color-bg-3)] overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-[var(--color-red)] to-[var(--color-red-soft)]" style="width:{kmPct(car.km)}%"></div>
                </div>
                <div class="flex justify-between text-[8.5px] font-[var(--font-mono)] uppercase tracking-wider text-[var(--color-text-faint)] mt-1">
                  <span>{car.fuel}</span><span>{formatKm(car.km)} km</span>
                </div>
              </div>

              <!-- price -->
              <div class="mt-auto pt-4 flex items-end justify-between border-t border-[var(--color-border)] mt-4">
                <div>
                  <div class="num-value text-xl text-[var(--color-red)]">{formatEUR(car.price)}</div>
                  <div class="text-[10px] text-[var(--color-text-faint)] font-[var(--font-mono)]">{formatEUR(car.monthly)}/MÊS</div>
                </div>
                <span class="text-[11px] font-[var(--font-display)] italic font-bold uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] transition-colors flex items-center gap-1">
                  Ficha <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M9 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="text-center py-20 border border-dashed border-[var(--color-border)]">
        <p class="text-[var(--color-text-muted)] font-[var(--font-mono)] uppercase tracking-widest text-sm">Sem resultados</p>
        <button type="button" onclick={() => { searchQuery=''; selectedCategory='todos'; }} class="mt-4 text-[var(--color-red)] font-semibold text-sm hover:underline">Limpar filtros</button>
      </div>
    {/if}
  </section>

  <!-- ─── FINANCING BAND ────────────────────────────────────────────────── -->
  <section id="financiar" class="relative overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="absolute -bottom-24 -left-16 w-[30rem] h-[30rem] bg-[var(--color-red)]/12 rounded-full blur-[110px] pointer-events-none"></div>
    <div class="max-w-[1600px] mx-auto px-5 md:px-8 py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center relative">
      <div>
        <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.25em] text-[var(--color-red)] mb-2">// Financiamento</div>
        <h2 class="font-[var(--font-display)] font-black italic uppercase text-[clamp(1.9rem,4.5vw,3rem)] leading-[0.9] tracking-tight">
          Conduza hoje,<br/>pague à sua medida.
        </h2>
        <p class="text-[var(--color-text-muted)] mt-4 leading-relaxed max-w-md">
          Trabalhamos com as principais instituições de crédito para encontrar a
          prestação certa para si. Sem entrada obrigatória e com aprovação em 24h.
        </p>
        <div class="grid grid-cols-3 gap-3 mt-8 max-w-md">
          {#each [ { v: '0€', l: 'Entrada mínima' }, { v: '120m', l: 'Prazo máximo' }, { v: '24h', l: 'Aprovação' } ] as s}
            <div class="border border-[var(--color-border)] bg-[var(--color-bg-0)] p-4 text-center">
              <div class="num-value text-2xl text-[var(--color-red)]">{s.v}</div>
              <div class="text-[9px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] mt-1">{s.l}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- mini example panel -->
      <div class="rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-0)] p-7">
        <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)] mb-5">Exemplo · Renault Clio 1.0 TCe</div>
        <div class="flex items-end justify-between mb-5">
          <span class="text-sm text-[var(--color-text-muted)]">Valor da viatura</span>
          <span class="num-value text-xl text-[var(--color-text)]">{formatEUR(13500)}</span>
        </div>
        {#each [ { m: 48, v: 319 }, { m: 72, v: 219 }, { m: 96, v: 169 } ] as row}
          <div class="flex items-center gap-4 py-2.5 border-t border-[var(--color-border)]">
            <span class="num-value text-sm text-[var(--color-text-faint)] w-12">{row.m}m</span>
            <div class="flex-1 h-1.5 bg-[var(--color-bg-3)] overflow-hidden">
              <div class="h-full bg-[var(--color-red)]" style="width:{(row.v / 320) * 100}%"></div>
            </div>
            <span class="num-value text-base text-[var(--color-text)] w-24 text-right">{formatEUR(row.v)}/mês</span>
          </div>
        {/each}
        <p class="text-[10px] text-[var(--color-text-faint)] font-[var(--font-mono)] mt-4">TAEG indicativa 7,9% · Valores sujeitos a aprovação.</p>
        <a href="#contacto" class="block text-center mt-5 bg-[var(--color-red)] hover:bg-[var(--color-red-deep)] text-white font-[var(--font-display)] italic font-bold uppercase tracking-wider text-sm py-3 transition-colors">Pedir simulação</a>
      </div>
    </div>
  </section>

  <!-- ─── VANTAGENS ─────────────────────────────────────────────────────── -->
  <section id="vantagens" class="max-w-[1600px] mx-auto px-5 md:px-8 py-16 md:py-20">
    <div class="mb-10">
      <div class="text-[11px] font-[var(--font-mono)] uppercase tracking-[0.25em] text-[var(--color-red)] mb-2">// Porquê nós</div>
      <h2 class="font-[var(--font-display)] font-black italic uppercase text-[clamp(2rem,4.5vw,3.2rem)] leading-none tracking-tight">A diferença Nunes Martins</h2>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each [
        { n: '01', t: 'Garantia 24 meses', d: 'Cobertura abrangente de motor, caixa e componentes essenciais, válida em todo o país.' },
        { n: '02', t: 'Inspeção 130 pontos', d: 'Cada viatura passa por uma vistoria mecânica completa. Recebe o relatório.' },
        { n: '03', t: 'Crédito em 24h', d: 'Aprovação rápida, sem entrada obrigatória, com a prestação à sua medida.' },
        { n: '04', t: 'Retoma justa', d: 'Avaliamos o seu carro atual ao preço de mercado e abatemos no negócio.' }
      ] as f}
        <div class="relative border border-[var(--color-border)] bg-[var(--color-bg-1)] p-6 hover:border-[var(--color-red)] transition-colors group overflow-hidden">
          <div class="absolute top-0 right-0 w-10 h-10 bg-[var(--color-red)]/10 group-hover:bg-[var(--color-red)]/20 transition-colors" style="clip-path: polygon(100% 0,0 0,100% 100%)"></div>
          <div class="num-value text-3xl text-[var(--color-red)]">{f.n}</div>
          <h3 class="text-base font-bold mt-3">{f.t}</h3>
          <p class="text-[13px] text-[var(--color-text-muted)] leading-relaxed mt-2">{f.d}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- ─── CONTACT / CTA ─────────────────────────────────────────────────── -->
  <section id="contacto" class="relative overflow-hidden border-t border-[var(--color-border)]">
    <div class="absolute inset-0 opacity-[0.04] bg-cover bg-center pointer-events-none" style="background-image:url('https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80')"></div>
    <div class="max-w-[1600px] mx-auto px-5 md:px-8 py-16 md:py-24 relative grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <div class="bg-[var(--color-red)] text-white text-[10px] font-bold font-[var(--font-mono)] uppercase tracking-widest px-2.5 py-1 inline-block mb-5">Showroom aberto</div>
        <h2 class="font-[var(--font-display)] font-black italic uppercase text-[clamp(2rem,5vw,3.4rem)] leading-[0.88] tracking-tight">
          Venha ao stand.<br/>O café é por nossa conta.
        </h2>
        <p class="text-[var(--color-text-muted)] mt-4 leading-relaxed max-w-md">
          Test-drive sem compromisso, de Segunda a Sábado. Estamos na Rua do Comércio, 123 — Lisboa.
        </p>
        <div class="flex flex-wrap gap-3 mt-7">
          <a href="https://wa.me/351210000000" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 font-semibold text-sm transition-colors" style="clip-path: polygon(0 0,100% 0,100% 70%,94% 100%,0 100%)">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
            WhatsApp
          </a>
          <a href="tel:+351210000000" class="inline-flex items-center gap-2 border border-[var(--color-border-strong)] hover:border-[var(--color-red)] px-6 py-3.5 font-semibold text-sm transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
            210 000 000
          </a>
        </div>
      </div>

      <!-- info plate with official logo -->
      <div class="rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-1)] overflow-hidden">
        <div class="bg-white px-6 py-5 flex items-center justify-center">
          <img src="/logo.png" alt="Auto Nunes Martins" class="h-14 w-auto"/>
        </div>
        <div class="divide-y divide-[var(--color-border)]">
          {#each [
            { l: 'Morada', v: 'Rua do Comércio, 123 — Lisboa' },
            { l: 'Horário', v: 'Seg–Sex 9h–19h · Sáb 10h–17h' },
            { l: 'Telefone', v: '+351 210 000 000' },
            { l: 'Email', v: 'geral@autonunesmartins.pt' }
          ] as row}
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-faint)]">{row.l}</span>
              <span class="text-sm font-semibold text-[var(--color-text)]">{row.v}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- ─── FOOTER ────────────────────────────────────────────────────────── -->
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-1)]">
    <div class="max-w-[1600px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-2.5">
        <svg viewBox="0 0 64 30" class="w-10 h-5" aria-hidden="true">
          <path d="M3 21 C 20 21 30 14 61 7" fill="none" stroke="var(--color-red)" stroke-width="5" stroke-linecap="round"/>
          <path d="M6 26 C 16 26 22 22 37 20" fill="none" stroke="var(--color-text-faint)" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
        <span class="font-[var(--font-display)] font-extrabold italic text-lg"><span class="text-[var(--color-red)]">AUTO</span>NUNES MARTINS</span>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12px] font-[var(--font-mono)] uppercase tracking-widest text-[var(--color-text-muted)]">
        <a href="#stock" class="hover:text-[var(--color-red)] transition-colors">Stock</a>
        <a href="#financiar" class="hover:text-[var(--color-red)] transition-colors">Financiar</a>
        <a href="#vantagens" class="hover:text-[var(--color-red)] transition-colors">Vantagens</a>
        <a href="#contacto" class="hover:text-[var(--color-red)] transition-colors">Contacto</a>
      </div>
      <div class="text-[11px] text-[var(--color-text-faint)] font-[var(--font-mono)]">© 2026 · Licença IMT 1234</div>
    </div>
  </footer>
</div>

<style>
  .gp-wrap { scroll-behavior: smooth; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* signature red wedge on the right edge (brand DNA) */
  .gp-wedge {
    position: fixed; top: 0; bottom: 0; right: 0; width: 6px; z-index: 40;
    background: linear-gradient(180deg, #e30613, #a8030d);
    opacity: 0.85; pointer-events: none;
  }
  @media (max-width: 767px) { .gp-wedge { display: none; } }

  /* faint technical grid behind the hero */
  .gp-grid-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(to right, var(--color-border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 80% 70% at 60% 0%, #000 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 60% 0%, #000 30%, transparent 75%);
    opacity: 0.5;
  }

  /* card subtle red glow on hover */
  .gp-card { transition: box-shadow .3s var(--ease-brand), border-color .3s var(--ease-brand), transform .3s var(--ease-brand); }
  .gp-card:hover { box-shadow: 0 0 0 1px var(--color-red), 0 24px 50px -30px color-mix(in oklab, #e30613 60%, transparent); transform: translateY(-3px); }

  /* ticker marquee */
  .gp-ticker { animation: gp-scroll 32s linear infinite; width: max-content; }
  @keyframes gp-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) { .gp-ticker { animation: none; } }
</style>
