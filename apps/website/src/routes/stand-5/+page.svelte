<!--
  ════════════════════════════════════════════════════════════════════════
  AUTO NUNES MARTINS · SITE PÚBLICO — VERSÃO "GRAFITE"  (/stand-5)
  ════════════════════════════════════════════════════════════════════════
  Identidade derivada exclusivamente do logótipo oficial, noutra direção:
    · Grafite dominante (#16171A) + vermelho do logo (#E2231A) + branco
    · Estrutura precisa, arestas vivas, réguas vermelhas finas (acento = swoosh)
    · Lettering itálico forte (eco do wordmark) e grandes números (credibilidade)
  Briefing: profissionalismo, DETALHE, diferenciação, facilidade de uso.
  Gama de viaturas: 5.000€ – 20.000€.

  · Paleta e temas próprios e auto-contidos (escuro por defeito; claro disponível).
  · Cards clicáveis → /stand-5/[id]. Self-contained → apagar /stand-5 remove tudo.
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

  // ── Tema (escuro por defeito) ──
  let isDark = $state(true);
  onMount(() => {
    const stored = localStorage.getItem('app-theme');
    isDark = stored ? stored === 'dark' : true;
    const io = new IntersectionObserver((en) => en.forEach((e) => e.isIntersecting && e.target.classList.add('show')), { threshold: 0.1 });
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  function toggleTheme() { isDark = !isDark; localStorage.setItem('app-theme', isDark ? 'dark' : 'light'); }

  // ── Filtros ──
  let q = $state('');
  let cat = $state('todos');
  let sort = $state('rel');
  const cats = [
    { id: 'todos', label: 'Todos' }, { id: 'citadino', label: 'Citadinos' },
    { id: 'utilitario', label: 'Utilitários' }, { id: 'familiar', label: 'Familiares' }, { id: 'suv', label: 'SUV' }
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
  <title>Auto Nunes Martins — Comércio de Automóveis | Stand de usados</title>
  <meta name="description" content="Automóveis usados revistos entre 5.000€ e 20.000€. Garantia, financiamento e retoma. Auto Nunes Martins — comércio de automóveis." />
</svelte:head>

<div class="s5 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style="font-family:'Inter',system-ui,sans-serif">

    <!-- top hairline accent -->
    <div class="h-1 w-full" style="background:linear-gradient(90deg,var(--red) 0%,var(--red) 22%,transparent 22%)"></div>

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 h-[68px] flex items-center justify-between gap-6">
        <a href="/stand-5" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          {@render swoosh('w-11 h-6')}
          <span class="leading-none select-none">
            <span class="block font-strong text-[18px] tracking-tight"><span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES MARTINS</span></span>
            <span class="block text-[8px] tracking-[0.38em] uppercase text-[var(--faint)] mt-[3px] italic">Comércio de Automóveis</span>
          </span>
        </a>
        <nav class="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[var(--muted)]">
          <a href="#stock" class="hover:text-[var(--ink)] transition-colors">Stock</a>
          <a href="#financiar" class="hover:text-[var(--ink)] transition-colors">Financiamento</a>
          <a href="#diferenca" class="hover:text-[var(--ink)] transition-colors">A Diferença</a>
          <a href="#visitar" class="hover:text-[var(--ink)] transition-colors">Contactos</a>
        </nav>
        <div class="flex items-center gap-2.5">
          <button type="button" onclick={toggleTheme} aria-label="Alternar tema" class="w-10 h-10 border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--red)] transition-colors">
            {#if isDark}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>{/if}
          </button>
          <a href="#stock" class="hidden sm:inline-flex items-center gap-2 bg-[var(--red)] text-white px-5 py-2.5 font-strong text-[13px] uppercase tracking-wide hover:bg-[var(--red-d)] transition-colors">Ver Stock</a>
        </div>
      </div>
    </header>

    <!-- ══ HERO ══ -->
    <section class="relative overflow-hidden border-b border-[var(--line)]">
      <div class="absolute -top-24 right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[var(--red)]/12 blur-[130px] pointer-events-none"></div>
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 py-14 md:py-20 grid lg:grid-cols-12 gap-12 items-center relative">
        <!-- statement -->
        <div class="lg:col-span-6 flex flex-col gap-6">
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span class="w-8 h-[2px] bg-[var(--red)]"></span> Comércio de automóveis · desde 2008
          </span>
          <h1 class="font-strong text-[clamp(2.8rem,6.5vw,5rem)] leading-[0.88] tracking-tight uppercase">
            Usados<br/>com <span class="text-[var(--red)]">palavra</span><br/>de honra.
          </h1>
          <p class="text-[15px] md:text-[16px] text-[var(--muted)] max-w-md leading-relaxed">
            Viaturas revistas ponto por ponto, dos <strong class="text-[var(--ink)]">5.000€ aos 20.000€</strong>.
            Cada negócio é fechado com o relatório de inspeção em mãos. É essa transparência
            que nos distingue de todos os outros.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <a href="#stock" class="group inline-flex items-center gap-2.5 bg-[var(--red)] text-white px-7 py-3.5 font-strong uppercase tracking-wide text-sm hover:bg-[var(--red-d)] transition-colors">
              Explorar stock
              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
            <a href="#financiar" class="inline-flex items-center gap-2 px-6 py-3.5 border border-[var(--line)] hover:border-[var(--red)] font-semibold text-sm transition-colors">Simular financiamento</a>
          </div>
        </div>

        <!-- framed featured -->
        <div class="lg:col-span-6 relative">
          <a href="/stand-5/{featured.id}" class="group block border border-[var(--line)] bg-[var(--surface)] p-2">
            <div class="relative overflow-hidden">
              <div class="aspect-[16/11] overflow-hidden">
                <img src={featured.image} alt="{featured.brand} {featured.model}" class="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.05]"/>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
              <span class="absolute top-3 left-3 bg-[var(--red)] text-white text-[10.5px] font-bold uppercase tracking-widest px-3 py-1">Destaque</span>
              <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <div class="text-[11px] uppercase tracking-widest text-white/70">{featured.brand} · {featured.year}</div>
                  <div class="font-strong text-2xl uppercase">{featured.model}</div>
                </div>
                <div class="text-right"><div class="text-[10px] uppercase tracking-wider text-white/60">desde</div><div class="font-strong text-xl">{eur(featured.monthly)}<span class="text-xs font-normal not-italic text-white/70">/mês</span></div></div>
              </div>
            </div>
            <div class="grid grid-cols-3 divide-x divide-[var(--line)] pt-2">
              <div class="px-3 py-3 text-center"><div class="font-strong text-lg">{km(featured.km)}</div><div class="text-[9px] uppercase tracking-widest text-[var(--faint)] mt-0.5">km</div></div>
              <div class="px-3 py-3 text-center"><div class="font-strong text-lg">{featured.fuel}</div><div class="text-[9px] uppercase tracking-widest text-[var(--faint)] mt-0.5">combustível</div></div>
              <div class="px-3 py-3 text-center"><div class="font-strong text-lg">{featured.power}cv</div><div class="text-[9px] uppercase tracking-widest text-[var(--faint)] mt-0.5">potência</div></div>
            </div>
          </a>
        </div>
      </div>

      <!-- credibility band -->
      <div class="border-t border-[var(--line)] bg-[var(--surface)]">
        <div class="mx-auto max-w-[1600px] px-5 md:px-9 grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--line)]">
          {#each [{n:'15+',l:'anos no mercado'},{n:'4.000+',l:'viaturas vendidas'},{n:'130',l:'pontos de inspeção'},{n:'4,9/5',l:'satisfação de clientes'}] as s}
            <div class="px-5 py-6 text-center">
              <div class="font-strong text-3xl md:text-4xl text-[var(--ink)] leading-none">{s.n}</div>
              <div class="text-[11px] text-[var(--faint)] mt-2 uppercase tracking-wider">{s.l}</div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ STOCK ══ -->
    <section id="stock" class="mx-auto max-w-[1600px] px-5 md:px-9 py-16 md:py-20">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-9 rise">
        <div class="flex items-start gap-4">
          <span class="w-[3px] self-stretch bg-[var(--red)] mt-1.5"></span>
          <div>
            <span class="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--red)] mb-1.5">Parque de viaturas</span>
            <h2 class="font-strong text-[clamp(2rem,4.5vw,3.2rem)] leading-none tracking-tight uppercase">O nosso stock</h2>
            <p class="text-[var(--muted)] mt-3 max-w-lg text-[15px]">Toda a informação à vista — ano, quilómetros, combustível e potência. Carregue numa viatura para a ficha completa.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-[13px] text-[var(--muted)] shrink-0"><span class="w-2 h-2 bg-emerald-500 animate-pulse"></span><strong class="text-[var(--ink)] font-strong text-base">{list.length}</strong> em stock</div>
      </div>

      <!-- toolbar -->
      <div class="flex flex-col lg:flex-row gap-3 mb-9">
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" bind:value={q} placeholder="Pesquisar marca, modelo ou versão…" class="w-full bg-[var(--surface)] border border-[var(--line)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] transition-colors"/>
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-bar pb-1 lg:pb-0">
          {#each cats as c (c.id)}
            <button type="button" onclick={() => (cat = c.id)} class="px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors {cat===c.id ? 'bg-[var(--red)] text-white border-[var(--red)]' : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--red)]'}">{c.label}</button>
          {/each}
        </div>
        <select bind:value={sort} class="bg-[var(--surface)] border border-[var(--line)] py-3 px-4 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] shrink-0">
          <option value="rel">Ordenar</option><option value="price-asc">Preço ↑</option><option value="price-desc">Preço ↓</option><option value="year">Mais recentes</option><option value="km">Menos km</option>
        </select>
      </div>

      {#if list.length}
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each list as car (car.id)}
            <a href="/stand-5/{car.id}" in:fade={{ duration: 220 }} class="s5-card group flex flex-col bg-[var(--surface)] border border-[var(--line)] transition-colors duration-300">
              <div class="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                <img src={car.image} alt="{car.brand} {car.model}" loading="lazy" class="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.06]"/>
                {#if car.tag}<span class="absolute top-0 left-0 bg-[var(--red)] text-white text-[10.5px] font-bold uppercase tracking-wider px-3 py-1">{car.tag}</span>{/if}
              </div>
              <div class="p-5 flex flex-col flex-1">
                <div class="flex items-baseline justify-between">
                  <div>
                    <div class="text-[10.5px] uppercase tracking-widest text-[var(--faint)]">{car.brand}</div>
                    <h3 class="font-strong text-xl uppercase leading-tight group-hover:text-[var(--red)] transition-colors">{car.model}</h3>
                  </div>
                  <span class="font-strong text-base text-[var(--muted)]">{car.year}</span>
                </div>
                <p class="text-[12.5px] text-[var(--muted)] truncate mt-0.5">{car.trim}</p>

                <!-- detailed spec grid -->
                <div class="grid grid-cols-4 divide-x divide-[var(--line)] border-y border-[var(--line)] my-4 -mx-1">
                  <div class="px-1 py-2 text-center"><div class="font-strong text-[13px]">{Math.round(car.km/1000)}k</div><div class="text-[8.5px] uppercase tracking-wide text-[var(--faint)]">km</div></div>
                  <div class="px-1 py-2 text-center"><div class="font-strong text-[13px]">{car.power}</div><div class="text-[8.5px] uppercase tracking-wide text-[var(--faint)]">cv</div></div>
                  <div class="px-1 py-2 text-center"><div class="font-strong text-[12px] truncate">{car.transmission==='Automática'?'Auto':'Man.'}</div><div class="text-[8.5px] uppercase tracking-wide text-[var(--faint)]">caixa</div></div>
                  <div class="px-1 py-2 text-center"><div class="font-strong text-[11px] truncate">{car.fuel.split(' ')[0]}</div><div class="text-[8.5px] uppercase tracking-wide text-[var(--faint)]">comb.</div></div>
                </div>

                <div class="mt-auto flex items-end justify-between">
                  <div>
                    <div class="font-strong text-2xl text-[var(--red)] leading-none">{eur(car.price)}</div>
                    <div class="text-[11.5px] text-[var(--faint)] mt-1">ou {eur(car.monthly)}/mês</div>
                  </div>
                  <span class="inline-flex items-center gap-1 text-[12px] font-strong uppercase tracking-wide text-[var(--muted)] group-hover:text-[var(--red)] transition-colors">
                    Ficha <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-20 border border-dashed border-[var(--line)]">
          <p class="text-[var(--muted)]">Nenhuma viatura corresponde à pesquisa.</p>
          <button type="button" onclick={() => { q=''; cat='todos'; }} class="mt-4 text-[var(--red)] font-semibold text-sm hover:underline">Limpar filtros</button>
        </div>
      {/if}
    </section>

    <!-- ══ FINANCIAMENTO ══ -->
    <section id="financiar" class="relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface)]">
      <div class="absolute -bottom-24 -left-20 w-[34rem] h-[34rem] rounded-full bg-[var(--red)]/10 blur-[120px] pointer-events-none"></div>
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center relative">
        <div>
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--red)] mb-2"><span class="w-8 h-[2px] bg-[var(--red)]"></span> Financiamento</span>
          <h2 class="font-strong text-[clamp(1.9rem,4.5vw,3rem)] leading-[0.9] tracking-tight uppercase">Conduza hoje,<br/>pague à sua medida.</h2>
          <p class="text-[var(--muted)] mt-4 leading-relaxed max-w-md">Parcerias com as principais instituições de crédito. Sem entrada obrigatória e aprovação em 24h. Mostramos sempre o valor real, sem custos escondidos.</p>
          <div class="grid grid-cols-3 gap-3 mt-8 max-w-md">
            {#each [{v:'0€',l:'entrada mínima'},{v:'120m',l:'prazo máximo'},{v:'24h',l:'aprovação'}] as s}
              <div class="border border-[var(--line)] bg-[var(--bg)] p-4 text-center"><div class="font-strong text-2xl text-[var(--red)]">{s.v}</div><div class="text-[9px] uppercase tracking-widest text-[var(--faint)] mt-1">{s.l}</div></div>
            {/each}
          </div>
        </div>
        <div class="border border-[var(--line)] bg-[var(--bg)] p-7">
          <div class="text-[11px] uppercase tracking-widest text-[var(--faint)] mb-5">Exemplo · Renault Clio 1.0 TCe</div>
          <div class="flex items-end justify-between mb-5"><span class="text-sm text-[var(--muted)]">Valor da viatura</span><span class="font-strong text-xl">{eur(13500)}</span></div>
          {#each [{m:48,v:319},{m:72,v:219},{m:96,v:169}] as row}
            <div class="flex items-center gap-4 py-2.5 border-t border-[var(--line)]">
              <span class="font-strong text-sm text-[var(--faint)] w-12">{row.m}m</span>
              <div class="flex-1 h-1.5 bg-[var(--surface-2)] overflow-hidden"><div class="h-full bg-[var(--red)]" style="width:{(row.v/320)*100}%"></div></div>
              <span class="font-strong text-base w-24 text-right">{eur(row.v)}/mês</span>
            </div>
          {/each}
          <p class="text-[10px] text-[var(--faint)] mt-4">TAEG indicativa 7,9% · Valores sujeitos a aprovação.</p>
          <a href="#visitar" class="block text-center mt-5 bg-[var(--red)] hover:bg-[var(--red-d)] text-white font-strong uppercase tracking-wide text-sm py-3 transition-colors">Pedir simulação</a>
        </div>
      </div>
    </section>

    <!-- ══ A DIFERENÇA ══ -->
    <section id="diferenca" class="mx-auto max-w-[1600px] px-5 md:px-9 py-16 md:py-20">
      <div class="flex items-start gap-4 mb-11 rise">
        <span class="w-[3px] self-stretch bg-[var(--red)] mt-1.5"></span>
        <div>
          <span class="block text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--red)] mb-1.5">Porque somos diferentes</span>
          <h2 class="font-strong text-[clamp(2rem,4.5vw,3.2rem)] leading-none tracking-tight uppercase">Profissionalismo<br/>até ao último detalhe</h2>
        </div>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)]">
        {#each [
          { n:'01', t:'Garantia real 24 meses', d:'Motor, caixa e componentes essenciais cobertos, com assistência em todo o país.' },
          { n:'02', t:'Relatório de inspeção', d:'130 pontos verificados. Entregamos a ficha ao cliente — sem nada escondido.' },
          { n:'03', t:'Crédito transparente', d:'Mostramos o valor real, a TAEG e o total a pagar antes de assinar fosse o que fosse.' },
          { n:'04', t:'Retoma justa', d:'Avaliamos o seu carro ao preço de mercado e abatemos no negócio na hora.' }
        ] as f}
          <div class="rise bg-[var(--surface)] p-7 flex flex-col gap-3 hover:bg-[var(--surface-2)] transition-colors">
            <div class="font-strong text-4xl text-[var(--red)] leading-none">{f.n}</div>
            <h3 class="font-semibold text-base mt-1">{f.t}</h3>
            <p class="text-[13px] text-[var(--muted)] leading-relaxed">{f.d}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- ══ TESTEMUNHOS ══ -->
    <section class="border-y border-[var(--line)] bg-[var(--surface)]">
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 py-16 md:py-20">
        <div class="flex items-end justify-between gap-4 mb-10">
          <h2 class="font-strong text-[clamp(1.7rem,3.5vw,2.5rem)] leading-none tracking-tight uppercase">O que dizem os clientes</h2>
          <div class="text-right shrink-0"><div class="font-strong text-3xl">4,9<span class="text-base text-[var(--muted)]">/5</span></div><div class="text-[11px] text-[var(--faint)] uppercase tracking-wider">+380 avaliações</div></div>
        </div>
        <div class="grid md:grid-cols-3 gap-5">
          {#each [
            { n:'Sofia M.', c:'Lisboa', q:'Comprei o meu primeiro carro aqui. Explicaram tudo com calma e o preço foi exatamente o combinado.' },
            { n:'Bruno R.', c:'Almada', q:'Trataram da retoma do meu antigo e do financiamento em dois dias. Profissionalismo do início ao fim.' },
            { n:'Helena C.', c:'Sintra', q:'O carro veio impecável e com a inspeção feita. Já passou um ano e nem um problema. Voltarei.' }
          ] as t}
            <figure class="border border-[var(--line)] bg-[var(--bg)] p-6 flex flex-col gap-4">
              <div class="flex gap-0.5 text-[var(--red)]">{#each Array(5) as _}<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z"/></svg>{/each}</div>
              <blockquote class="text-[14px] leading-relaxed">“{t.q}”</blockquote>
              <figcaption class="text-[12px] text-[var(--muted)] mt-auto pt-2 border-t border-[var(--line)]"><strong class="text-[var(--ink)]">{t.n}</strong> · {t.c}</figcaption>
            </figure>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ VISITAR ══ -->
    <section id="visitar" class="mx-auto max-w-[1600px] px-5 md:px-9 py-16 md:py-24">
      <div class="border border-[var(--line)] grid lg:grid-cols-2">
        <div class="p-9 md:p-12 flex flex-col gap-6 bg-[var(--surface)]">
          <h2 class="font-strong text-[clamp(1.9rem,4vw,2.8rem)] leading-[0.95] tracking-tight uppercase">Venha ao stand.<br/>O café é por nossa conta.</h2>
          <p class="text-[var(--muted)] leading-relaxed max-w-md">Test-drive sem compromisso, de Segunda a Sábado. Estamos na Rua do Comércio, 123 — Lisboa.</p>
          <div class="grid sm:grid-cols-2 gap-5 mt-1">
            <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">Horário</div><div class="text-sm font-semibold mt-1">Seg–Sex 9h–19h · Sáb 10h–17h</div></div>
            <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">Telefone</div><div class="text-sm font-semibold mt-1">+351 210 000 000</div></div>
          </div>
          <div class="flex flex-wrap gap-3 mt-2">
            <a href="https://wa.me/351210000000" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 font-semibold text-sm transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
              WhatsApp
            </a>
            <a href="tel:+351210000000" class="inline-flex items-center gap-2 border border-[var(--line)] hover:border-[var(--red)] px-6 py-3.5 font-semibold text-sm transition-colors">Ligar agora</a>
          </div>
        </div>
        <div class="bg-[var(--surface-2)]">
          <div class="bg-white px-6 py-7 flex items-center justify-center border-b border-[var(--line)]"><img src="/logo.png" alt="Auto Nunes Martins" class="h-16 w-auto"/></div>
          <div class="relative min-h-[200px]">
            <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1000&q=80" alt="Showroom" class="absolute inset-0 w-full h-full object-cover"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER (grande wordmark) ══ -->
    <footer class="border-t border-[var(--line)] bg-[var(--surface)]">
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 pt-14 pb-8">
        <div class="flex items-center gap-4 pb-10 border-b border-[var(--line)]">
          {@render swoosh('w-16 h-9')}
          <span class="font-strong text-[clamp(1.6rem,4vw,2.4rem)] tracking-tight"><span class="text-[var(--red)]">AUTO</span>NUNES MARTINS</span>
        </div>
        <div class="grid md:grid-cols-4 gap-10 py-12">
          <div><p class="text-[var(--muted)] text-[13px] leading-relaxed max-w-xs italic">comércio de automóveis usados de confiança desde 2008.</p></div>
          <div><h4 class="font-bold uppercase tracking-wider text-xs mb-4">Navegação</h4><ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]"><li><a href="#stock" class="hover:text-[var(--red)]">Stock</a></li><li><a href="#financiar" class="hover:text-[var(--red)]">Financiamento</a></li><li><a href="#diferenca" class="hover:text-[var(--red)]">A Diferença</a></li><li><a href="#visitar" class="hover:text-[var(--red)]">Contactos</a></li></ul></div>
          <div><h4 class="font-bold uppercase tracking-wider text-xs mb-4">Legal</h4><ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]"><li>Licença IMT nº 1234</li><li>Intermediário de Crédito</li><li>Livro de Reclamações</li><li>Política de Privacidade</li></ul></div>
          <div><h4 class="font-bold uppercase tracking-wider text-xs mb-4">Contactos</h4><ul class="flex flex-col gap-2.5 text-[13px] text-[var(--muted)]"><li class="font-bold text-[var(--ink)]">+351 210 000 000</li><li>geral@autonunesmartins.pt</li><li>Rua do Comércio, 123 — Lisboa</li></ul></div>
        </div>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-[var(--faint)] pt-2">
          <span>© 2026 Auto Nunes Martins. Todos os direitos reservados.</span><span class="italic">Comércio de automóveis</span>
        </div>
      </div>
    </footer>
  </div>
</div>

{#snippet swoosh(cls: string)}
  <svg class={cls} viewBox="0 0 110 34" fill="none" aria-hidden="true">
    <path d="M4 26 C 26 28 36 12 64 9 C 86 7 98 16 106 25" stroke="var(--red)" stroke-width="5" stroke-linecap="round"/>
    <path d="M8 31 C 22 31 30 27 44 25" stroke="var(--faint)" stroke-width="3" stroke-linecap="round"/>
  </svg>
{/snippet}

<style>
  .font-strong { font-family: 'Barlow', system-ui, sans-serif; font-weight: 900; font-style: italic; letter-spacing: -0.015em; }

  .s5 {
    --red:#e2231a; --red-d:#b3140d; --red-l:#ff5347; --color-red:#e2231a;
    --bg:#16171a; --surface:#1f2024; --surface-2:#272a30; --ink:#f4f4f2; --muted:#a4a5ab; --faint:#76777e; --line:rgba(255,255,255,.10); --shadow:rgba(0,0,0,.6);
  }
  .s5:not(.dark) {
    --bg:#efeee9; --surface:#ffffff; --surface-2:#f4f3ef; --ink:#191a1e; --muted:#56585f; --faint:#8b8d94; --line:rgba(20,20,25,.10); --shadow:rgba(30,20,18,.3);
  }

  .s5-card:hover { border-color: color-mix(in oklab, var(--red) 55%, transparent); box-shadow: 0 24px 50px -32px var(--shadow); transform: translateY(-3px); }
  .s5-card { transition: transform .3s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s; }

  .no-bar::-webkit-scrollbar { display: none; }
  .no-bar { -ms-overflow-style: none; scrollbar-width: none; }

  .rise { opacity: 0; transform: translateY(18px); transition: opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1); }
  :global(.rise.show) { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .rise { opacity: 1; transform: none; transition: none; } }
</style>
