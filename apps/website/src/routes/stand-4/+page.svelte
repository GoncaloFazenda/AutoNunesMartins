<!--
  ════════════════════════════════════════════════════════════════════════
  AUTO NUNES MARTINS · SITE PÚBLICO — VERSÃO "EM MOVIMENTO"  (/stand-4)
  ════════════════════════════════════════════════════════════════════════
  Identidade derivada exclusivamente do logótipo oficial:
    · Vermelho vivo (#E2231A) + grafite (#23242A) + branco
    · O "swoosh" do automóvel como gesto gráfico central (movimento/velocidade)
    · Lettering itálico forte (Barlow Black Italic) — eco do wordmark
    · Tag "comércio de automóveis"
  Briefing: profissionalismo, detalhe, diferenciação, facilidade de uso.
  Gama de viaturas: 5.000€ – 20.000€.

  · Paleta e temas (claro/escuro) próprios e auto-contidos (tokens locais).
  · Cards clicáveis → /stand-4/[id]. Self-contained → apagar /stand-4 remove tudo.
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
    { id: 'renault-clio-2021', brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens', year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90, price: 13500, monthly: 169, image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80', category: 'citadino', tag: 'Mais Procurado' },
    { id: 'dacia-sandero-2021', brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G', year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100, price: 12800, monthly: 159, image: 'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80', category: 'utilitario', tag: 'Custo Baixo' },
    { id: 'seat-ibiza-2020', brand: 'Seat', model: 'Ibiza', trim: '1.0 TSI FR', year: 2020, km: 54100, fuel: 'Gasolina', transmission: 'Manual', power: 95, price: 14200, monthly: 179, image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80', category: 'citadino' },
    { id: 'ford-focus-2020', brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line', year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125, price: 14900, monthly: 189, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80', category: 'familiar', tag: 'Desportivo' },
    { id: 'toyota-yaris-2020', brand: 'Toyota', model: 'Yaris', trim: '1.5 Hybrid Active', year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116, price: 16800, monthly: 209, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80', category: 'utilitario', tag: 'Fiabilidade' },
    { id: 'nissan-qashqai-2019', brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta', year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115, price: 18900, monthly: 239, image: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=900&q=80', category: 'suv', tag: 'Familiar' }
  ];

  // ── Tema (claro por defeito — combina com o fundo branco do logótipo) ──
  let isDark = $state(false);
  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    isDark = stored === 'dark';
    const io = new IntersectionObserver(
      (en) => en.forEach((e) => e.isIntersecting && e.target.classList.add('show')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  function toggleTheme() { isDark = !isDark; localStorage.setItem('app-theme', isDark ? 'dark' : 'light'); }

  // ── Filtros ──
  let q = $state('');
  let cat = $state('todos');
  let sort = $state('rel');
  const cats = [
    { id: 'todos', label: 'Todos' },
    { id: 'citadino', label: 'Citadinos' },
    { id: 'utilitario', label: 'Utilitários' },
    { id: 'familiar', label: 'Familiares' },
    { id: 'suv', label: 'SUV' }
  ];
  const list = $derived(
    vehicles
      .filter((v) => `${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q.toLowerCase()) && (cat === 'todos' || v.category === cat))
      .sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'year' ? b.year - a.year : sort === 'km' ? a.km - b.km : 0)
  );
  const featured: Vehicle = vehicles.find((v) => v.tag === 'Mais Procurado') ?? vehicles[0]!;

  const eur = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const km = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>Auto Nunes Martins — Comércio de Automóveis | Usados de confiança</title>
  <meta name="description" content="Stand de automóveis usados entre 5.000€ e 20.000€. Viaturas revistas, garantia até 24 meses e financiamento rápido. Auto Nunes Martins — comércio de automóveis." />
</svelte:head>

<div class="s4 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style="font-family:'Inter',system-ui,sans-serif">

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 h-[70px] flex items-center justify-between gap-6">
        <a href="/stand-4" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          {@render swoosh('w-12 h-7')}
          <span class="leading-none select-none">
            <span class="block font-italic-strong text-[19px] tracking-tight">
              <span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES MARTINS</span>
            </span>
            <span class="block text-[8px] tracking-[0.36em] uppercase text-[var(--faint)] mt-[3px] italic">Comércio de Automóveis</span>
          </span>
        </a>

        <nav class="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-[var(--muted)]">
          <a href="#viaturas" class="hover:text-[var(--ink)] transition-colors">Viaturas</a>
          <a href="#processo" class="hover:text-[var(--ink)] transition-colors">Como Funciona</a>
          <a href="#porque" class="hover:text-[var(--ink)] transition-colors">Porquê Nós</a>
          <a href="#visitar" class="hover:text-[var(--ink)] transition-colors">Contactos</a>
        </nav>

        <div class="flex items-center gap-2.5">
          <button type="button" onclick={toggleTheme} aria-label="Alternar tema claro/escuro"
            class="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30 transition-colors">
            {#if isDark}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            {/if}
          </button>
          <a href="tel:+351210000000" class="hidden sm:inline-flex items-center gap-2 bg-[var(--red)] text-white px-5 py-2.5 rounded-full font-semibold text-[13px] hover:bg-[var(--red-d)] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
            210 000 000
          </a>
        </div>
      </div>
    </header>

    <!-- ══ HERO ══ -->
    <section class="relative overflow-hidden">
      <!-- giant swoosh motif -->
      <div class="absolute inset-x-0 top-0 h-full pointer-events-none select-none opacity-[0.07]">
        {@render swooshBig('absolute -right-[6%] top-[8%] w-[80%]')}
      </div>
      <div class="absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full bg-[var(--red)]/10 blur-[120px] pointer-events-none"></div>

      <div class="relative mx-auto max-w-[1240px] px-5 md:px-8 pt-14 md:pt-20 pb-16 grid lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-6 flex flex-col gap-6">
          <span class="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--red)]">
            {@render swoosh('w-8 h-4')} Desde 2008 · +4.000 famílias
          </span>
          <h1 class="font-italic-strong text-[clamp(2.7rem,6.2vw,4.8rem)] leading-[0.92] tracking-tight">
            O carro certo,<br/>com a <span class="text-[var(--red)]">confiança</span><br/>que merece.
          </h1>
          <p class="text-[15px] md:text-[16px] text-[var(--muted)] max-w-md leading-relaxed">
            Comércio de automóveis usados, revistos ponto por ponto, entre os
            <strong class="text-[var(--ink)]">5.000€ e os 20.000€</strong>. Garantia, financiamento
            simples e transparência total — do primeiro contacto à entrega das chaves.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <a href="#viaturas" class="group inline-flex items-center gap-2.5 bg-[var(--red)] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[var(--red-d)] transition-colors">
              Ver viaturas em stock
              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
            <a href="#processo" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[var(--ink)]/15 hover:border-[var(--ink)]/40 font-semibold text-sm transition-colors">
              Como funciona
            </a>
          </div>
          <div class="grid grid-cols-3 gap-5 pt-8 border-t border-[var(--line)] max-w-md">
            {#each [{n:'15+',l:'anos de experiência'},{n:'24m',l:'garantia incluída'},{n:'24h',l:'resposta a crédito'}] as s}
              <div>
                <div class="font-italic-strong text-3xl text-[var(--ink)] leading-none">{s.n}</div>
                <div class="text-[11.5px] text-[var(--faint)] mt-1.5">{s.l}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- featured car, forward-leaning -->
        <div class="lg:col-span-6 relative">
          <a href="/stand-4/{featured.id}" class="group block relative">
            <div class="s4-shape relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] shadow-[0_40px_80px_-40px_var(--shadow)]">
              <div class="aspect-[5/4] overflow-hidden">
                <img src={featured.image} alt="{featured.brand} {featured.model}" class="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.05]"/>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"></div>
              <span class="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[var(--red)] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">★ Destaque</span>
              <div class="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between text-white">
                <div>
                  <div class="text-[11px] uppercase tracking-widest text-white/70">{featured.brand} · {featured.year}</div>
                  <div class="font-italic-strong text-2xl leading-tight mt-0.5">{featured.model}</div>
                  <div class="text-[13px] text-white/80">{featured.trim}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] uppercase tracking-wider text-white/60">desde</div>
                  <div class="font-italic-strong text-2xl">{eur(featured.monthly)}<span class="text-sm font-normal not-italic text-white/70">/mês</span></div>
                </div>
              </div>
            </div>
          </a>
          <!-- logótipo oficial sobre superfície branca garantida -->
          <div class="absolute -bottom-6 -left-3 sm:-left-6 bg-white rounded-2xl shadow-xl border border-black/5 pl-4 pr-5 py-3 hidden sm:flex items-center gap-3.5">
            <img src="/logo.png" alt="Auto Nunes Martins" class="h-10 w-auto"/>
            <div class="pl-3.5 border-l border-black/10">
              <div class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg> Stand certificado
              </div>
              <div class="text-[11px] text-zinc-500 mt-0.5">4,9/5 · avaliações reais</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ TRUST STRIP ══ -->
    <section class="border-y border-[var(--line)] bg-[var(--surface)]">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-4">
        {#each [
          { t: 'Garantia até 24 meses', i: 'shield' },
          { t: 'Financiamento sem entrada', i: 'card' },
          { t: 'Retoma do seu usado', i: 'repeat' },
          { t: 'Inspeção de 130 pontos', i: 'check' }
        ] as p}
          <div class="flex items-center gap-3 px-2">
            <span class="w-9 h-9 rounded-full bg-[var(--red)]/10 text-[var(--red)] grid place-items-center shrink-0">
              {#if p.i==='shield'}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.6-4.02A12 12 0 0112 2.94a12 12 0 01-8.6 3.04A12 12 0 003 9c0 5.6 3.82 10.29 9 11.62 5.18-1.33 9-6.02 9-11.62 0-1.04-.13-2.05-.4-3.02z"/></svg>
              {:else if p.i==='card'}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
              {:else if p.i==='repeat'}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0111.9-2.5M19 15a7 7 0 01-11.9 2.5"/></svg>
              {:else}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{/if}
            </span>
            <span class="text-[13.5px] font-semibold">{p.t}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- ══ INVENTORY ══ -->
    <section id="viaturas" class="mx-auto max-w-[1240px] px-5 md:px-8 py-16 md:py-20">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-9 rise">
        <div>
          <span class="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--red)] mb-2">{@render swoosh('w-7 h-3.5')} O nosso stock</span>
          <h2 class="font-italic-strong text-[clamp(2rem,4.4vw,3.1rem)] leading-none tracking-tight">Viaturas disponíveis</h2>
          <p class="text-[var(--muted)] mt-3 max-w-lg text-[15px]">Quilómetros certificados, histórico verificado e revisão completa antes da entrega. Carregue numa viatura para ver toda a ficha.</p>
        </div>
        <div class="flex items-center gap-2 text-[13px] text-[var(--muted)] shrink-0">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <strong class="text-[var(--ink)] font-italic-strong text-base">{list.length}</strong> em stock
        </div>
      </div>

      <!-- toolbar -->
      <div class="flex flex-col lg:flex-row gap-3 mb-9 sticky top-[70px] z-30 py-3 bg-[var(--bg)]/90 backdrop-blur-md">
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" bind:value={q} placeholder="Pesquisar marca, modelo ou versão…"
            class="w-full bg-[var(--surface)] border border-[var(--line)] rounded-full py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] transition-colors"/>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-bar pb-1 lg:pb-0">
          {#each cats as c (c.id)}
            <button type="button" onclick={() => (cat = c.id)}
              class="px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors {cat===c.id ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30'}">{c.label}</button>
          {/each}
        </div>
        <select bind:value={sort} class="bg-[var(--surface)] border border-[var(--line)] rounded-full py-3 px-4 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] shrink-0">
          <option value="rel">Ordenar: Relevância</option>
          <option value="price-asc">Preço ↑</option>
          <option value="price-desc">Preço ↓</option>
          <option value="year">Mais recentes</option>
          <option value="km">Menos km</option>
        </select>
      </div>

      {#if list.length}
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each list as car (car.id)}
            <a href="/stand-4/{car.id}" in:fade={{ duration: 220 }}
              class="s4-card group flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[14px] overflow-hidden transition-all duration-300">
              <div class="relative aspect-[16/11] overflow-hidden bg-[var(--surface-2)]">
                <img src={car.image} alt="{car.brand} {car.model}" loading="lazy" class="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.06]"/>
                <!-- red swoosh corner accent -->
                <div class="absolute -bottom-px inset-x-0 h-10 pointer-events-none opacity-90">{@render swooshBig('absolute bottom-0 right-0 w-[55%] translate-y-1/3')}</div>
                {#if car.tag}<span class="absolute top-3 left-3 bg-[var(--red)] text-white text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">{car.tag}</span>{/if}
                <span class="absolute top-3 right-3 bg-black/55 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur">{car.year}</span>
              </div>
              <div class="p-5 flex flex-col flex-1">
                <div class="text-[10.5px] uppercase tracking-widest text-[var(--faint)]">{car.brand}</div>
                <h3 class="font-italic-strong text-xl leading-tight group-hover:text-[var(--red)] transition-colors">{car.model}</h3>
                <p class="text-[13px] text-[var(--muted)] truncate">{car.trim}</p>
                <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[12.5px] text-[var(--muted)]">
                  <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--red)]"></span>{km(car.km)} km</span>
                  <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--red)]"></span>{car.fuel}</span>
                  <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[var(--red)]"></span>{car.transmission}</span>
                </div>
                <div class="mt-auto pt-5 flex items-end justify-between">
                  <div>
                    <div class="font-italic-strong text-2xl text-[var(--ink)] leading-none">{eur(car.price)}</div>
                    <div class="text-[11.5px] text-[var(--faint)] mt-1">ou {eur(car.monthly)}/mês</div>
                  </div>
                  <span class="w-10 h-10 rounded-full bg-[var(--surface-2)] group-hover:bg-[var(--red)] text-[var(--muted)] group-hover:text-white grid place-items-center transition-colors">
                    <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-20 border border-dashed border-[var(--line)] rounded-[14px]">
          <p class="text-[var(--muted)]">Nenhuma viatura corresponde à pesquisa.</p>
          <button type="button" onclick={() => { q=''; cat='todos'; }} class="mt-4 text-[var(--red)] font-semibold text-sm hover:underline">Limpar filtros</button>
        </div>
      {/if}
    </section>

    <!-- ══ PROCESSO ══ -->
    <section id="processo" class="border-y border-[var(--line)] bg-[var(--surface)]">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 py-16 md:py-20">
        <div class="max-w-2xl rise">
          <span class="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--red)] mb-2">{@render swoosh('w-7 h-3.5')} Simples e sem surpresas</span>
          <h2 class="font-italic-strong text-[clamp(2rem,4.4vw,3.1rem)] leading-none tracking-tight">Como funciona</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-11">
          {#each [
            { n: '01', t: 'Escolha online', d: 'Veja o stock, fotos reais e ficha completa de cada viatura, sem sair de casa.' },
            { n: '02', t: 'Marque a visita', d: 'Test-drive sem compromisso. Tratamos da retoma do seu carro atual.' },
            { n: '03', t: 'Crédito em 24h', d: 'Simulamos e aprovamos o financiamento em menos de 24 horas.' },
            { n: '04', t: 'Leve o seu carro', d: 'Documentação tratada por nós e garantia de 24 meses na entrega.' }
          ] as s}
            <div class="relative rise bg-[var(--bg)] border border-[var(--line)] rounded-[14px] p-6 overflow-hidden">
              <div class="absolute top-0 right-0 opacity-[0.08] w-24">{@render swooshBig('w-24 translate-x-3 -translate-y-2')}</div>
              <div class="font-italic-strong text-4xl text-[var(--red)] leading-none">{s.n}</div>
              <h3 class="font-semibold text-lg mt-3">{s.t}</h3>
              <p class="text-[13px] text-[var(--muted)] leading-relaxed mt-2">{s.d}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ PORQUÊ / DIFERENCIAÇÃO ══ -->
    <section id="porque" class="mx-auto max-w-[1240px] px-5 md:px-8 py-16 md:py-20 grid lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 rise">
        <span class="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--red)] mb-2">{@render swoosh('w-7 h-3.5')} Porquê nós</span>
        <h2 class="font-italic-strong text-[clamp(2rem,4.4vw,3.1rem)] leading-[0.98] tracking-tight">O detalhe<br/>faz a diferença.</h2>
        <p class="text-[var(--muted)] mt-4 leading-relaxed max-w-md">
          Somos um stand de proximidade com padrões de concessionário. Cada viatura é
          vendida com o relatório de inspeção em mãos — sem letra pequena, sem surpresas.
          É essa transparência que nos distingue.
        </p>
        <a href="#visitar" class="inline-flex items-center gap-2 mt-7 font-semibold text-sm text-[var(--red)] hover:gap-3 transition-all">
          Venha conhecer o espaço
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>
      </div>
      <div class="lg:col-span-7 grid sm:grid-cols-2 gap-5">
        {#each [
          { t: 'Garantia real de 24 meses', d: 'Cobertura abrangente de motor, caixa e componentes essenciais, com assistência em todo o país.' },
          { t: 'Inspeção de 130 pontos', d: 'Vistoria mecânica completa antes da venda. Entregamos a ficha de verificação ao cliente.' },
          { t: 'Crédito à sua medida', d: 'Parcerias com as principais instituições. Sem entrada obrigatória e aprovação rápida.' },
          { t: 'Acompanhamento honesto', d: 'Aconselhamento sincero, mesmo que não compre connosco. A relação vale mais que a venda.' }
        ] as f}
          <div class="rise bg-[var(--surface)] border border-[var(--line)] rounded-[14px] p-6 flex flex-col gap-3 hover:border-[var(--red)]/40 transition-colors">
            <span class="w-11 h-11 rounded-xl bg-[var(--red)]/10 text-[var(--red)] grid place-items-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
            <h3 class="font-semibold text-base">{f.t}</h3>
            <p class="text-[13px] text-[var(--muted)] leading-relaxed">{f.d}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- ══ VISITAR / CTA ══ -->
    <section id="visitar" class="mx-auto max-w-[1240px] px-5 md:px-8 pb-16 md:pb-24">
      <div class="rounded-[22px] overflow-hidden border border-[var(--line)] grid lg:grid-cols-2">
        <div class="p-9 md:p-12 flex flex-col gap-6 bg-[var(--surface)]">
          <h2 class="font-italic-strong text-[clamp(1.9rem,4vw,2.8rem)] leading-[0.98] tracking-tight">Venha tomar um café<br/>e conhecer o carro.</h2>
          <p class="text-[var(--muted)] leading-relaxed max-w-md">Aberto de Segunda a Sábado. Test-drive sem compromisso e aconselhamento honesto.</p>
          <div class="grid sm:grid-cols-2 gap-5 mt-1">
            <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">Morada</div><div class="text-sm font-semibold mt-1">Rua do Comércio, 123 — Lisboa</div></div>
            <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">Horário</div><div class="text-sm font-semibold mt-1">Seg–Sex 9h–19h · Sáb 10h–17h</div></div>
          </div>
          <div class="flex flex-wrap gap-3 mt-2">
            <a href="https://wa.me/351210000000" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 rounded-full font-semibold text-sm transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
              WhatsApp
            </a>
            <a href="tel:+351210000000" class="inline-flex items-center gap-2 border border-[var(--ink)]/15 hover:border-[var(--ink)]/40 px-6 py-3.5 rounded-full font-semibold text-sm transition-colors">Ligar agora</a>
          </div>
        </div>
        <div class="relative min-h-[300px] bg-[var(--surface-2)]">
          <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1000&q=80" alt="Showroom" class="absolute inset-0 w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
          <div class="absolute bottom-5 left-5 bg-white rounded-xl shadow-lg px-4 py-2.5"><img src="/logo.png" alt="Auto Nunes Martins" class="h-8 w-auto"/></div>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER ══ -->
    <footer class="border-t border-[var(--line)] bg-[var(--surface)]">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2.5">
            {@render swoosh('w-11 h-6')}
            <span class="font-italic-strong text-lg"><span class="text-[var(--red)]">AUTO</span>NUNES MARTINS</span>
          </div>
          <p class="text-[var(--muted)] text-[13px] leading-relaxed max-w-xs italic">comércio de automóveis usados de confiança desde 2008.</p>
        </div>
        <div>
          <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Navegação</h4>
          <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]">
            <li><a href="#viaturas" class="hover:text-[var(--red)] transition-colors">Viaturas</a></li>
            <li><a href="#processo" class="hover:text-[var(--red)] transition-colors">Como Funciona</a></li>
            <li><a href="#porque" class="hover:text-[var(--red)] transition-colors">Porquê Nós</a></li>
            <li><a href="#visitar" class="hover:text-[var(--red)] transition-colors">Contactos</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Legal</h4>
          <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]">
            <li>Licença IMT nº 1234</li><li>Intermediário de Crédito</li><li>Livro de Reclamações</li><li>Política de Privacidade</li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold uppercase tracking-wider text-xs mb-4">Contactos</h4>
          <ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]">
            <li class="font-bold text-[var(--ink)]">+351 210 000 000</li><li>geral@autonunesmartins.pt</li><li>Rua do Comércio, 123 — Lisboa</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-[var(--line)]">
        <div class="mx-auto max-w-[1240px] px-5 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-[var(--faint)]">
          <span>© 2026 Auto Nunes Martins. Todos os direitos reservados.</span>
          <span class="italic">Comércio de automóveis</span>
        </div>
      </div>
    </footer>
  </div>
</div>

<!-- ══ SWOOSH (logo motif) snippets ══ -->
{#snippet swoosh(cls: string)}
  <svg class={cls} viewBox="0 0 110 34" fill="none" aria-hidden="true">
    <path d="M4 26 C 26 28 36 12 64 9 C 86 7 98 16 106 25" stroke="var(--red)" stroke-width="5" stroke-linecap="round"/>
    <path d="M8 31 C 22 31 30 27 44 25" stroke="var(--faint)" stroke-width="3" stroke-linecap="round"/>
  </svg>
{/snippet}
{#snippet swooshBig(cls: string)}
  <svg class={cls} viewBox="0 0 1100 300" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <path d="M20 250 C 130 256 210 244 280 224 C 360 150 520 108 680 116 C 840 124 950 178 1085 256" stroke="var(--red)" stroke-width="26" stroke-linecap="round"/>
    <path d="M60 278 C 200 278 300 260 450 248" stroke="var(--red)" stroke-width="14" stroke-linecap="round" opacity="0.55"/>
  </svg>
{/snippet}

<style>
  /* ── Identidade tipográfica: itálico forte (eco do wordmark) ── */
  .font-italic-strong {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    letter-spacing: -0.02em;
  }

  /* ── Tokens de cor derivados do logótipo (auto-contidos) ── */
  .s4 {
    --red: #e2231a;
    --red-d: #b3140d;
    --red-l: #ff5347;
    --color-red: #e2231a;       /* alinha regras globais (seleção) ao vermelho do logo */
    --ink: #1b1c21;
    --muted: #5d5f67;
    --faint: #9a9ca3;
    --bg: #f7f6f3;
    --surface: #ffffff;
    --surface-2: #f0efeb;
    --line: rgba(20, 20, 28, 0.10);
    --shadow: rgba(30, 20, 18, 0.35);
  }
  .s4.dark {
    --ink: #f5f5f3;
    --muted: #a7a8ae;
    --faint: #74757b;
    --bg: #121317;
    --surface: #1a1b20;
    --surface-2: #24262c;
    --line: rgba(255, 255, 255, 0.10);
    --shadow: rgba(0, 0, 0, 0.6);
  }

  /* forward-leaning featured frame (movimento) */
  .s4-shape {
    border-radius: 18px;
    clip-path: polygon(0 0, 100% 0, 100% 92%, 4% 100%, 0 96%);
  }

  .s4-card { box-shadow: 0 1px 0 var(--line); }
  .s4-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in oklab, var(--red) 45%, transparent);
    box-shadow: 0 26px 50px -30px var(--shadow);
  }

  .no-bar::-webkit-scrollbar { display: none; }
  .no-bar { -ms-overflow-style: none; scrollbar-width: none; }

  .rise { opacity: 0; transform: translateY(18px); transition: opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1); }
  :global(.rise.show) { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .rise { opacity: 1; transform: none; transition: none; } }
</style>
