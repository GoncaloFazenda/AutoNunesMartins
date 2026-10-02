<!--
  PUBLIC DEALERSHIP HOMEPAGE — V2
  ──────────────────────────────────────────────────────────────────────────
  Second attempt at the public site, this time aligned with the brand
  identity used in the admin panel: dark surfaces (#0a0a0b → #25262b),
  brand red #e30613 with the trademark red wedge on the right edge,
  ambient red radial glow, square-cornered chips (radius 0), italic
  uppercase Barlow display type, JetBrains Mono labels, and the spec-row
  pattern (icon | red divider | label).

  Differentiated from the original /stand (which also uses these brand
  colors but in a premium-supercar tone) by:
    • Much wider layout (full-bleed sections, max-width 1600px)
    • Modern interactions not in /stand: marquee, 3D-tilt cards, magnetic
      CTAs, animated process timeline, counter ribbon, "live" availability
    • Honest commercial tone (cars €13k–€27k, monthly payment up front)
    • A second accent — warm amber #e0a040 (already in the ERP as warning)
      for "Híbrido" badges, to add visual variety without breaking brand

  Self-contained — no $lib imports, scoped under `.site`. Delete this file
  (and the sibling [id]/+page.svelte) and /stand-v2 disappears.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut, expoOut } from 'svelte/easing';

  // ─── Inventory ──────────────────────────────────────────────────────────
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
    category: 'citadino' | 'compacto' | 'suv' | 'familiar';
    badges: string[];
  }

  const vehicles: Vehicle[] = [
    {
      id: 'renault-clio-2021',
      brand: 'Renault', model: 'Clio', trim: 'TCe 90 Intens',
      year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual',
      power: 90, price: 13500, monthly: 169,
      image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1400&q=80',
      category: 'citadino',
      badges: ['Garantia 24M', 'Único dono'],
    },
    {
      id: 'peugeot-208-2022',
      brand: 'Peugeot', model: '208', trim: '1.2 PureTech Allure',
      year: 2022, km: 32100, fuel: 'Gasolina', transmission: 'Manual',
      power: 100, price: 15500, monthly: 195,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80',
      category: 'citadino',
      badges: ['Garantia 24M'],
    },
    {
      id: 'vw-polo-2022',
      brand: 'Volkswagen', model: 'Polo', trim: '1.0 TSI Life',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Manual',
      power: 95, price: 17900, monthly: 225,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
      category: 'citadino',
      badges: ['Garantia 24M', 'Recém-chegado'],
    },
    {
      id: 'ford-focus-2022',
      brand: 'Ford', model: 'Focus Active', trim: '1.0 EcoBoost 125',
      year: 2022, km: 38900, fuel: 'Gasolina', transmission: 'Manual',
      power: 125, price: 18500, monthly: 235,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Garantia 24M'],
    },
    {
      id: 'opel-astra-2022',
      brand: 'Opel', model: 'Astra', trim: '1.2 T Edition',
      year: 2022, km: 26100, fuel: 'Gasolina', transmission: 'Manual',
      power: 110, price: 19500, monthly: 245,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Garantia 24M', 'IUC verde'],
    },
    {
      id: 'seat-leon-2021',
      brand: 'SEAT', model: 'Leon', trim: '1.5 TSI FR',
      year: 2021, km: 51800, fuel: 'Gasolina', transmission: 'Manual',
      power: 150, price: 19900, monthly: 249,
      image: 'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Garantia 24M'],
    },
    {
      id: 'renault-captur-2022',
      brand: 'Renault', model: 'Captur', trim: 'E-Tech Hybrid 145',
      year: 2022, km: 31400, fuel: 'Híbrido', transmission: 'Automática',
      power: 145, price: 21900, monthly: 275,
      image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=80',
      category: 'suv',
      badges: ['Híbrido', 'Garantia 24M'],
    },
    {
      id: 'bmw-serie1-2021',
      brand: 'BMW', model: 'Série 1', trim: '116d Sport',
      year: 2021, km: 47600, fuel: 'Diesel', transmission: 'Automática',
      power: 116, price: 23500, monthly: 295,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Garantia 24M', 'Caixa auto'],
    },
    {
      id: 'vw-golf-2022',
      brand: 'Volkswagen', model: 'Golf 8', trim: '1.5 eTSI Life DSG',
      year: 2022, km: 35100, fuel: 'Gasolina', transmission: 'Automática DSG',
      power: 130, price: 24900, monthly: 312,
      image: 'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Mild Hybrid', 'Garantia 24M'],
    },
    {
      id: 'audi-a3-2021',
      brand: 'Audi', model: 'A3 Sportback', trim: '30 TDI S tronic',
      year: 2021, km: 53400, fuel: 'Diesel', transmission: 'Automática S tronic',
      power: 116, price: 25900, monthly: 325,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80',
      category: 'compacto',
      badges: ['Garantia 24M', 'Caixa auto'],
    },
    {
      id: 'peugeot-3008-2021',
      brand: 'Peugeot', model: '3008', trim: '1.5 BlueHDi GT EAT8',
      year: 2021, km: 68200, fuel: 'Diesel', transmission: 'Automática EAT8',
      power: 130, price: 26500, monthly: 332,
      image: 'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=1400&q=80',
      category: 'familiar',
      badges: ['Garantia 24M', 'Pack GT'],
    },
    {
      id: 'hyundai-tucson-2022',
      brand: 'Hyundai', model: 'Tucson', trim: '1.6 T-GDi Hybrid',
      year: 2022, km: 42700, fuel: 'Híbrido', transmission: 'Automática',
      power: 230, price: 27500, monthly: 345,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=80',
      category: 'suv',
      badges: ['Híbrido', 'Garantia 24M', 'Premium'],
    },
  ];

  // ─── Brand marquee (logos as text, since we don't have SVGs) ───────────
  const brands = [
    'Renault', 'Peugeot', 'Volkswagen', 'Ford', 'Opel', 'SEAT',
    'BMW', 'Audi', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Toyota',
    'Citroën', 'Fiat', 'Nissan', 'Dacia', 'Škoda', 'Mazda',
  ];

  // ─── Reviews (fictional but realistic) ──────────────────────────────────
  const reviews = [
    {
      name: 'João Pereira',
      where: 'Sintra',
      rating: 5,
      car: 'VW Polo TSI · 2022',
      text: 'Comprei o meu primeiro carro aqui. Tudo explicado com calma, sem pressão. Garantia até cumprida quando precisei trocar uma peça nos primeiros meses.',
    },
    {
      name: 'Mariana Silva',
      where: 'Loures',
      rating: 5,
      car: 'Peugeot 208 · 2021',
      text: 'Estive a comparar três stands diferentes. Aqui tinham o melhor preço, financiamento aprovado em meio dia e ainda me aceitaram a retoma do meu antigo Corsa.',
    },
    {
      name: 'Ricardo Costa',
      where: 'Lisboa',
      rating: 5,
      car: 'Renault Captur Hybrid · 2022',
      text: 'Procurava um híbrido sem entrar nos preços absurdos dos novos. Mostraram-me três opções, deixaram conduzir todos. Atendimento honesto.',
    },
    {
      name: 'Ana Marques',
      where: 'Almada',
      rating: 5,
      car: 'Ford Focus Active · 2022',
      text: 'Aluguei um carro para experimentar uma semana antes de comprar. Que opção fantástica! Acabei por escolher e estou super satisfeita.',
    },
  ];

  // ─── Filter ─────────────────────────────────────────────────────────────
  type Filter = 'todos' | 'citadino' | 'compacto' | 'suv' | 'familiar' | 'hibridos' | 'auto';
  let activeFilter = $state<Filter>('todos');

  const filtered = $derived(
    activeFilter === 'todos'
      ? vehicles
      : activeFilter === 'hibridos'
        ? vehicles.filter((v) => v.fuel === 'Híbrido' || v.badges.includes('Mild Hybrid'))
        : activeFilter === 'auto'
          ? vehicles.filter((v) => v.transmission.toLowerCase().includes('autom') || v.transmission.toLowerCase().includes('dsg'))
          : vehicles.filter((v) => v.category === activeFilter),
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'citadino', label: 'Citadinos' },
    { key: 'compacto', label: 'Compactos' },
    { key: 'suv', label: 'SUV' },
    { key: 'familiar', label: 'Familiares' },
    { key: 'hibridos', label: 'Híbridos' },
    { key: 'auto', label: 'Caixa Automática' },
  ];

  // ─── Page state ─────────────────────────────────────────────────────────
  let mounted = $state(false);
  let scrollY = $state(0);
  let activeReview = $state(0);

  // ─── Widget de personalização (demonstração de layout) ────────────────────
  // navAligned = true  → a navegação partilha a mesma coluna (1600px) dos carros
  // navAligned = false → navegação "ponta a ponta" (comportamento original)
  let navAligned = $state(true);
  let custOpen = $state(false);

  onMount(() => {
    requestAnimationFrame(() => (mounted = true));
    // Auto-rotate testimonials every 6s
    const id = setInterval(() => {
      activeReview = (activeReview + 1) % reviews.length;
    }, 6000);
    return () => clearInterval(id);
  });

  // ─── Reveal action ──────────────────────────────────────────────────────
  function reveal(node: HTMLElement, params: { delay?: number; y?: number } = {}) {
    const delay = params.delay ?? 0;
    const y = params.y ?? 28;
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

  // ─── Count-up ─────────────────────────────────────────────────────────
  function countUp(node: HTMLElement, params: { target: number; duration?: number; suffix?: string; prefix?: string }) {
    const duration = params.duration ?? 1600;
    let played = false;
    function run() {
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(eased * params.target);
        node.textContent = (params.prefix ?? '') + current.toLocaleString('pt-PT') + (params.suffix ?? '');
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !played) {
            played = true;
            run();
            obs.unobserve(node);
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(node);
    return { destroy: () => obs.disconnect() };
  }

  // ─── 3D tilt action ───────────────────────────────────────────────────
  // Pointer-driven micro tilt on vehicle cards — adds depth without going
  // overboard. Disabled when prefers-reduced-motion is set (handled below).
  function tilt(node: HTMLElement, params: { max?: number } = {}) {
    const max = params.max ?? 6;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return { destroy: () => {} };
    }
    function onMove(e: PointerEvent) {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-4px)`;
    }
    function onLeave() {
      node.style.transform = '';
    }
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return {
      destroy: () => {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerleave', onLeave);
      },
    };
  }

  // ─── Formatters ─────────────────────────────────────────────────────────
  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const formatKm = (n: number) => new Intl.NumberFormat('pt-PT').format(n) + ' km';

  // ─── Live "open / closed" indicator ────────────────────────────────────
  // The pulsing green dot in the topbar shows visitors that the showroom
  // is currently open. Hours: Mon–Fri 9–19h, Sat 10–17h, Sun closed.
  const isOpenNow = $derived.by(() => {
    void scrollY; // tick on scroll so the badge stays fresh during a session
    const d = new Date();
    const day = d.getDay();
    const hour = d.getHours() + d.getMinutes() / 60;
    if (day === 0) return false;
    if (day === 6) return hour >= 10 && hour < 17;
    return hour >= 9 && hour < 19;
  });
</script>

<svelte:head>
  <title>Auto Nunes Martins · Carros usados com garantia e financiamento</title>
  <meta
    name="description"
    content="Stand de automóveis usados em Portugal — viaturas selecionadas a partir de €169/mês, garantia 24M, financiamento sem entrada e retoma no momento."
  />
</svelte:head>

<svelte:window bind:scrollY />

<div class="site" class:nav-wide={!navAligned}>
  <!-- Ambient red glow (brand DNA — same recipe as the ERP header-ambient) -->
  <div class="ambient" aria-hidden="true"></div>

  <!-- Red wedge on right edge (brand DNA — matches .app-wedge in the ERP) -->
  <div class="wedge" aria-hidden="true"></div>

  <!-- ─── Nav ──────────────────────────────────────────────────────── -->
  <header class="nav" class:scrolled={scrollY > 40}>
    <a href="/stand-v2" class="brand" aria-label="Auto Nunes Martins">
      <span class="wordmark">
        <span class="wm-red">AUTO</span><span class="wm-text">NUNES</span> <span class="wm-text">MARTINS</span>
      </span>
      <span class="wm-caption">Comércio de Automóveis</span>
    </a>

    <nav class="links">
      <a href="#inventario"><span class="link-dot"></span>Inventário</a>
      <a href="#beneficios"><span class="link-dot"></span>Porquê nós</a>
      <a href="#processo"><span class="link-dot"></span>Como funciona</a>
      <a href="#visitar"><span class="link-dot"></span>Visitar</a>
    </nav>

    <div class="nav-right">
      <div class="open-pill" class:open={isOpenNow} title={isOpenNow ? 'Aberto agora' : 'Fechado de momento'}>
        <span class="open-dot"></span>
        <span class="open-text">{isOpenNow ? 'Aberto agora' : 'Fechado'}</span>
      </div>
      <a href="tel:+351210000000" class="nav-phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span class="num-value">+351 210 000 000</span>
      </a>
      <a href="#inventario" class="nav-cta">
        Ver inventário
        <span class="arrow">→</span>
      </a>
    </div>
  </header>

  <!-- ─── Hero ─────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-photos" aria-hidden="true">
      <!-- Mosaic of three vehicle photos with subtle parallax. Each one
           translates at a slightly different rate as the user scrolls,
           creating depth without going full-on parallax circus. -->
      <div class="hero-photo p1" style="transform: translateY({scrollY * 0.18}px)">
        <img src={vehicles[2]?.image ?? ''} alt="" />
      </div>
      <div class="hero-photo p2" style="transform: translateY({scrollY * 0.32}px)">
        <img src={vehicles[6]?.image ?? ''} alt="" />
      </div>
      <div class="hero-photo p3" style="transform: translateY({scrollY * 0.12}px)">
        <img src={vehicles[8]?.image ?? ''} alt="" />
      </div>
      <div class="hero-grid"></div>
    </div>

    {#if mounted}
      <div class="hero-content">
        <div class="hero-eyebrow" in:fly={{ y: 16, duration: 600, delay: 80, easing: cubicOut }}>
          <span class="red-square"></span>
          <span>STAND · LISBOA · DESDE 2009</span>
          <span class="hero-eyebrow-sep"></span>
          <span class="num-value">{vehicles.length}+ viaturas em stock</span>
        </div>

        <h1 class="hero-title">
          <span class="line" in:fly={{ y: 70, duration: 900, easing: expoOut, delay: 200 }}>
            Carros usados,
          </span>
          <span class="line" in:fly={{ y: 70, duration: 900, easing: expoOut, delay: 320 }}>
            <em class="hero-red">sem</em> surpresas.
          </span>
        </h1>

        <p class="hero-sub" in:fly={{ y: 16, duration: 700, delay: 560, easing: cubicOut }}>
          Cada viatura é <strong>verificada</strong> em 130 pontos, sai com <strong>garantia 24 meses</strong>
          e pode ser financiada <strong>sem entrada</strong> em 24h. Preços
          honestos, da Renault ao BMW, entre <strong>€13k e €30k</strong>.
        </p>

        <div class="hero-ctas" in:fly={{ y: 16, duration: 700, delay: 720, easing: cubicOut }}>
          <a href="#inventario" class="btn btn-red">
            Explorar inventário
            <span class="arrow">→</span>
          </a>
          <a href="#visitar" class="btn btn-outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 22s-8-8-8-13a8 8 0 1 1 16 0c0 5-8 13-8 13z"/>
              <circle cx="12" cy="9" r="3"/>
            </svg>
            Visitar o stand
          </a>
        </div>

        <!-- Spec-row strip (brand DNA: icon | red divider | mono label) -->
        <div class="hero-specs" in:fly={{ y: 16, duration: 700, delay: 880, easing: cubicOut }}>
          <div class="spec-row">
            <span class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
            <span class="spec-sep"></span>
            <span class="spec-label">Garantia 24M</span>
          </div>
          <div class="spec-row">
            <span class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20M6 15h4"/>
              </svg>
            </span>
            <span class="spec-sep"></span>
            <span class="spec-label">Financiamento 24h</span>
          </div>
          <div class="spec-row">
            <span class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 12h13l-3-3M21 12h-1M3 6h18M3 18h18"/>
              </svg>
            </span>
            <span class="spec-sep"></span>
            <span class="spec-label">Retoma no momento</span>
          </div>
          <div class="spec-row">
            <span class="spec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="9"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
            <span class="spec-sep"></span>
            <span class="spec-label">Inspecção 130 pontos</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Scroll cue -->
    {#if mounted}
      <div class="hero-scroll" in:fly={{ y: -10, duration: 800, delay: 1200 }}>
        <span class="scroll-line"></span>
        <span class="scroll-label">SCROLL</span>
      </div>
    {/if}
  </section>

  <!-- ─── Brand marquee (infinite scroll) ─────────────────────────── -->
  <section class="marquee-wrap" aria-label="Marcas que trabalhamos">
    <div class="marquee">
      <div class="marquee-track">
        {#each [...brands, ...brands] as brand, i (i)}
          <span class="marquee-item">
            <span class="marquee-bullet"></span>
            {brand}
          </span>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── Stats ribbon ─────────────────────────────────────────────── -->
  <section class="stats">
    <div class="stat" use:reveal>
      <div class="stat-num num-value" use:countUp={{ target: 80, suffix: '+' }}>0</div>
      <div class="stat-label">Viaturas em stock</div>
    </div>
    <div class="stat" use:reveal={{ delay: 80 }}>
      <div class="stat-num num-value" use:countUp={{ target: 24, suffix: 'M' }}>0</div>
      <div class="stat-label">Garantia incluída</div>
    </div>
    <div class="stat" use:reveal={{ delay: 160 }}>
      <div class="stat-num num-value" use:countUp={{ target: 169, prefix: '€', suffix: '/m' }}>0</div>
      <div class="stat-label">Prestação desde</div>
    </div>
    <div class="stat" use:reveal={{ delay: 240 }}>
      <div class="stat-num num-value" use:countUp={{ target: 15 }}>0</div>
      <div class="stat-label">Anos a vender</div>
    </div>
    <div class="stat" use:reveal={{ delay: 320 }}>
      <div class="stat-num num-value" use:countUp={{ target: 2500, suffix: '+' }}>0</div>
      <div class="stat-label">Clientes satisfeitos</div>
    </div>
  </section>

  <!-- ─── Inventory ─────────────────────────────────────────────────── -->
  <section class="section inventory" id="inventario">
    <div class="section-head" use:reveal>
      <div>
        <div class="eyebrow">
          <span class="red-square"></span>
          INVENTÁRIO ATUAL
        </div>
        <h2 class="section-title">
          Escolha entre <em>{filtered.length} viaturas.</em>
        </h2>
        <p class="section-lead">
          Todas inspeccionadas, com garantia 24 meses e financiamento
          disponível. Preço total ou prestação mensal — visíveis lado a lado, sem letras pequenas.
        </p>
      </div>

      <div class="head-meta">
        <div class="head-meta-num num-value">{filtered.length.toString().padStart(2, '0')}</div>
        <div class="head-meta-lbl">
          {filtered.length === 1 ? 'viatura' : 'viaturas'}<br/>
          a mostrar
        </div>
      </div>
    </div>

    <!-- Square filter chips (brand DNA: radius-chip is 0) -->
    <div class="filters" use:reveal={{ delay: 80 }}>
      {#each filters as f (f.key)}
        <button
          type="button"
          class="chip"
          class:active={activeFilter === f.key}
          onclick={() => (activeFilter = f.key)}
        >
          {f.label}
          {#if activeFilter === f.key}
            <span class="chip-cross">×</span>
          {/if}
        </button>
      {/each}
    </div>

    <div class="vehicles-grid">
      {#each filtered as v, i (v.id)}
        <a
          href="/stand-v2/{v.id}"
          class="vcard"
          use:reveal={{ delay: (i % 4) * 60 }}
          use:tilt
        >
          <div class="vcard-photo">
            <img src={v.image} alt="{v.brand} {v.model}" loading="lazy" />
            <div class="vcard-shine"></div>
            {#if v.badges.length > 0}
              <div class="vcard-badges">
                {#each v.badges.slice(0, 2) as b (b)}
                  <span
                    class="vbadge"
                    class:vbadge-red={b === 'Recém-chegado'}
                    class:vbadge-amber={b === 'Híbrido' || b === 'Mild Hybrid'}
                  >{b}</span>
                {/each}
              </div>
            {/if}
            <div class="vcard-live">
              <span class="live-pulse"></span>
              <span class="num-value">DISPONÍVEL</span>
            </div>
          </div>

          <div class="vcard-body">
            <div class="vcard-head">
              <div class="vcard-brand">{v.brand}</div>
              <h3 class="vcard-model">
                {v.model}
                <span class="vcard-trim">{v.trim}</span>
              </h3>
            </div>

            <div class="vcard-specs">
              <div class="spec-row">
                <span class="spec-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <path d="M8 3v4M16 3v4M3 11h18"/>
                  </svg>
                </span>
                <span class="spec-sep"></span>
                <span class="spec-label num-value">{v.year}</span>
              </div>
              <div class="spec-row">
                <span class="spec-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 20a8 8 0 1 1 8-8"/>
                    <path d="m12 12 5-3"/>
                  </svg>
                </span>
                <span class="spec-sep"></span>
                <span class="spec-label num-value">{formatKm(v.km)}</span>
              </div>
              <div class="spec-row">
                <span class="spec-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M2 22h16"/>
                    <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2"/>
                  </svg>
                </span>
                <span class="spec-sep"></span>
                <span class="spec-label">{v.fuel}</span>
              </div>
              <div class="spec-row">
                <span class="spec-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 5v2M12 17v2M5 12h2M17 12h2"/>
                  </svg>
                </span>
                <span class="spec-sep"></span>
                <span class="spec-label">{v.transmission}</span>
              </div>
            </div>

            <div class="vcard-foot">
              <div class="vcard-pricing">
                <div class="vcard-monthly">
                  <span class="from">desde</span>
                  <span class="amount num-value">{formatEUR(v.monthly)}<small>/mês</small></span>
                </div>
                <div class="vcard-total">ou {formatEUR(v.price)} pronto</div>
              </div>
              <span class="vcard-cta">
                Ver
                <span class="arrow">→</span>
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>

    {#if filtered.length === 0}
      <div class="empty">
        Sem viaturas nesta categoria. <button class="link" onclick={() => (activeFilter = 'todos')}>Ver todas</button>
      </div>
    {/if}
  </section>

  <!-- ─── Benefits split ────────────────────────────────────────────── -->
  <section class="section benefits" id="beneficios">
    <div class="benefits-grid">
      <div class="benefits-text" use:reveal>
        <div class="eyebrow">
          <span class="red-square"></span>
          PORQUÊ AUTO NUNES MARTINS
        </div>
        <h2 class="section-title">
          Quinze anos a <em>vender confiança.</em>
        </h2>
        <p class="section-lead">
          Somos um stand familiar com tudo o que isso implica: cara da empresa, atendimento direto,
          decisões rápidas. Mas com a tecnologia, garantias e financiamento de uma rede grande.
        </p>

        <a href="#visitar" class="btn btn-red">
          Falar connosco
          <span class="arrow">→</span>
        </a>
      </div>

      <div class="benefits-list">
        {#each [
          { icon: 'shield', title: '130 pontos verificados', meta: 'Inspecção mecânica', text: 'Cada viatura passa por uma vistoria de 130 pontos em motor, caixa, suspensão, travões, eletrónica e carroçaria antes de entrar no stand.' },
          { icon: 'cert', title: 'Garantia 24 meses', meta: 'Sem letras pequenas', text: 'Motor e caixa cobertos durante 24 meses em todas as viaturas, sem custos extra e sem limite de quilometragem na maioria.' },
          { icon: 'bank', title: 'Financiamento próprio', meta: '5 bancos parceiros', text: 'Tratamos da pré-aprovação connosco. Resposta em 24 horas, sem entrada obrigatória e até 96 meses.' },
          { icon: 'swap', title: 'Retoma honesta', meta: 'Avaliação em 15 min', text: 'Avaliamos o seu carro no momento. Se aceitar, abatemos no preço final — sem promessas vagas, sem ginásticas de proposta.' },
        ] as b, i (b.title)}
          <div class="benefit" use:reveal={{ delay: i * 80 }}>
            <span class="benefit-icon">
              {#if b.icon === 'shield'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              {:else if b.icon === 'cert'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <circle cx="12" cy="9" r="6"/>
                  <path d="M9 14v8l3-2 3 2v-8"/>
                </svg>
              {:else if b.icon === 'bank'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M3 10 12 4l9 6M5 10v10h14V10M9 14h6"/>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M3 12h13l-3-3M21 12h-1M3 6h18M3 18h18"/>
                </svg>
              {/if}
            </span>
            <div class="benefit-body">
              <div class="benefit-meta">{b.meta}</div>
              <h3 class="benefit-title">{b.title}</h3>
              <p>{b.text}</p>
            </div>
            <span class="benefit-arrow">→</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── Process timeline ────────────────────────────────────────── -->
  <section class="section process" id="processo">
    <div use:reveal>
      <div class="eyebrow">
        <span class="red-square"></span>
        COMO FUNCIONA
      </div>
      <h2 class="section-title">
        Da escolha às chaves em <em>quatro passos.</em>
      </h2>
    </div>

    <div class="timeline">
      <div class="timeline-track">
        <span class="timeline-progress"></span>
      </div>
      {#each [
        { num: '01', title: 'Escolha', text: 'Filtre o inventário online ou apareça no stand. Fotografias reais e histórico de cada carro disponível.' },
        { num: '02', title: 'Visita & test drive', text: 'Conduza sem compromisso. Pode trazer um amigo mecânico se quiser segunda opinião.' },
        { num: '03', title: 'Financiamento', text: 'Tratamos da pré-aprovação em 24h. Se já tem o seu, fazemos a transferência por si.' },
        { num: '04', title: 'Entrega', text: 'Levantamento no stand ou entrega ao domicílio. Inspeção feita e chave na mão.' },
      ] as step, i (step.num)}
        <div class="timeline-step" use:reveal={{ delay: i * 100, y: 36 }}>
          <span class="step-marker">
            <span class="step-marker-inner num-value">{step.num}</span>
            <span class="step-marker-ring"></span>
          </span>
          <h3 class="step-title">{step.title}</h3>
          <p class="step-text">{step.text}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- ─── Reviews carousel ──────────────────────────────────────── -->
  <section class="section reviews">
    <div class="reviews-grid">
      <div class="reviews-head" use:reveal>
        <div class="eyebrow">
          <span class="red-square"></span>
          O QUE DIZEM OS CLIENTES
        </div>
        <h2 class="section-title">
          <em>{reviews.length} histórias</em><br/>de quem já comprou.
        </h2>
        <div class="reviews-rating">
          <div class="stars">
            {#each Array(5) as _, i (i)}
              <span class="star">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
              </span>
            {/each}
          </div>
          <div class="rating-meta">
            <span class="num-value">4,9</span>/5 · 247 avaliações
          </div>
        </div>

        <div class="reviews-nav">
          {#each reviews as r, i (r.name)}
            <button
              type="button"
              class="rdot"
              class:active={activeReview === i}
              onclick={() => (activeReview = i)}
              aria-label="Ver testemunho de {r.name}"
            ></button>
          {/each}
        </div>
      </div>

      <div class="reviews-stage">
        {#each reviews as r, i (r.name)}
          {#if activeReview === i}
            <article class="review" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
              <div class="review-quote">"</div>
              <p class="review-text">{r.text}</p>
              <div class="review-foot">
                <div class="review-avatar">
                  <span>{r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                </div>
                <div class="review-info">
                  <div class="review-name">{r.name}</div>
                  <div class="review-meta">
                    <span>{r.where}</span>
                    <span class="sep"></span>
                    <span>{r.car}</span>
                  </div>
                </div>
                <div class="review-stars">
                  {#each Array(r.rating) as _, j (j)}
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                  {/each}
                </div>
              </div>
            </article>
          {/if}
        {/each}
      </div>
    </div>
  </section>

  <!-- ─── Visit CTA ────────────────────────────────────────────── -->
  <section class="visit" id="visitar">
    <div class="visit-bg" aria-hidden="true">
      <img src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2200&q=85" alt="" />
      <div class="visit-overlay"></div>
    </div>

    <div class="visit-inner" use:reveal>
      <div class="eyebrow">
        <span class="red-square"></span>
        VISITAR O STAND
      </div>
      <h2 class="visit-title">
        Veja, conduza,<br/>
        <em>leve para casa.</em>
      </h2>
      <p>
        Café à porta, parque privado, tempo para experimentar à vontade. Apareça sem marcação
        ou avise-nos antes para reservarmos a viatura.
      </p>

      <div class="visit-grid">
        <div class="visit-info">
          <div class="info-label">MORADA</div>
          <div class="info-val">Rua do Comércio, 123<br/>2700-000 Lisboa</div>
        </div>
        <div class="visit-info">
          <div class="info-label">TELEFONE</div>
          <div class="info-val num-value">+351 210 000 000</div>
        </div>
        <div class="visit-info">
          <div class="info-label">EMAIL</div>
          <div class="info-val">geral@autonunesmartins.pt</div>
        </div>
        <div class="visit-info">
          <div class="info-label">HORÁRIO</div>
          <div class="info-val">Seg–Sex · 9h–19h<br/>Sáb · 10h–17h</div>
        </div>
      </div>

      <div class="visit-ctas">
        <a href="tel:+351210000000" class="btn btn-red big">
          Ligar agora
          <span class="arrow">→</span>
        </a>
        <a href="mailto:geral@autonunesmartins.pt" class="btn btn-outline big">
          Enviar email
        </a>
      </div>
    </div>
  </section>

  <!-- ─── Footer ─────────────────────────────────────────────── -->
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
            <li><a href="#inventario">Inventário</a></li>
            <li><a href="#beneficios">Porquê nós</a></li>
            <li><a href="#processo">Como funciona</a></li>
            <li><a href="#visitar">Visitar</a></li>
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
            <strong>Navegação alinhada</strong>
            <small>Alinha o logótipo e os links à mesma coluna dos carros (1600px). Desligue para ver a navegação “ponta a ponta”.</small>
          </span>
          <button type="button" class="cust-switch" class:on={navAligned} role="switch" aria-checked={navAligned} aria-label="Alternar navegação alinhada" onclick={() => (navAligned = !navAligned)}>
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
  /*
    ─── Scope + brand tokens ────────────────────────────────────────────
    Mirror of the ERP's app.css tokens, scoped under .site so this file
    stays independent. Dark theme by default — the public site doesn't
    inherit the user's app theme preference, but it shares the palette.
  */
  .site {
    --red: #e30613;
    --red-soft: #ff3b49;
    --red-deep: #a8030d;
    --amber: #e0a040;            /* warning color from the ERP — reused as a 2nd accent for "Híbrido" only */

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
    --r-chip: 0px;   /* brand DNA — chips are square */

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
  .site :global(* ) { transition-timing-function: var(--ease); }
  .site a { color: inherit; text-decoration: none; }
  .site h1, .site h2, .site h3, .site h4 { margin: 0; }
  .site p { margin: 0; }
  .site button { font-family: inherit; }

  /* JetBrains Mono recipe for numeric values (mirrors .num-value in app.css) */
  .num-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-feature-settings: 'tnum' 1;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-style: normal;
  }

  /* ─── Brand DNA: red wedge on right edge (mirrors .app-wedge) ─────── */
  .wedge {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    width: 12px;
    background: linear-gradient(180deg, #e30613 0%, #b30410 100%);
    z-index: 6;
    opacity: 0.8;
    pointer-events: none;
  }
  @media (max-width: 767px) {
    .wedge { width: 6px; }
  }

  /* ─── Brand DNA: ambient red glow (mirrors .header-ambient::before) ─── */
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

  /* ─── Shared bits ─────────────────────────────────────────────────── */
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
  .btn:hover .arrow,
  a:hover .arrow { transform: translateX(3px); }

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

  /* ─── Spec-row pattern (brand DNA — see app.css line 329) ──────── */
  .spec-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .spec-row .spec-icon {
    color: var(--text);
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
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
  .spec-row .spec-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }

  /* ─── Nav ─────────────────────────────────────────────────────── */
  .nav {
    position: fixed;
    inset: 0 12px auto 0;
    z-index: 50;
    height: 76px;
    /*
      ALINHADO (por defeito): o conteúdo da barra (logo + links + ações) passa a
      partilhar a mesma coluna de 1600px das secções. O fundo/blur da barra
      continua a ir de ponta a ponta — só o miolo é que encosta à coluna.
      O gutter vive no padding, por isso não foi preciso mexer no markup.
    */
    padding: 0 max(clamp(20px, 3vw, 48px), calc((100% - 1600px) / 2 + clamp(20px, 4vw, 56px)));
    display: flex;
    align-items: center;
    gap: 32px;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background 280ms, border-color 280ms, backdrop-filter 280ms, padding 280ms;
  }
  /* OFF (widget): navegação volta a esticar de ponta a ponta (original). */
  .site.nav-wide .nav {
    padding: 0 clamp(20px, 3vw, 48px);
  }

  /* ─── Widget de personalização (demo on/off do alinhamento) ─────────────── */
  .site .cust {
    position: fixed; left: 22px; bottom: 22px; z-index: 70;
    display: flex; flex-direction: column; align-items: flex-start; gap: 12px;
  }
  .site .cust-fab {
    width: 50px; height: 50px; border-radius: 999px;
    background: var(--red); color: #fff; border: none;
    display: grid; place-items: center; cursor: pointer;
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.6);
    transition: transform 0.2s var(--ease);
  }
  .site .cust-fab:hover { transform: translateY(-2px); }
  .site .cust-fab svg { width: 22px; height: 22px; }
  .site .cust-panel {
    width: 300px; background: var(--bg-1);
    border: 1px solid var(--border); border-radius: var(--r-card);
    padding: 16px; box-shadow: 0 28px 70px -24px rgba(0, 0, 0, 0.75);
  }
  .site .cust-head {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
    font-family: 'Barlow', system-ui, sans-serif; font-weight: 800; font-style: italic;
    text-transform: uppercase; letter-spacing: 0.02em; font-size: 13px; color: var(--text);
  }
  .site .cust-x { background: none; border: none; color: var(--faint); font-size: 22px; line-height: 1; cursor: pointer; padding: 0 4px; }
  .site .cust-x:hover { color: var(--text); }
  .site .cust-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
  .site .cust-text strong { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
  .site .cust-text small { display: block; margin-top: 4px; font-size: 11.5px; line-height: 1.5; color: var(--muted); }
  .site .cust-switch {
    flex-shrink: 0; width: 44px; height: 26px; margin-top: 2px; padding: 0;
    border-radius: 999px; background: var(--bg-3); border: 1px solid var(--border);
    position: relative; cursor: pointer; transition: background 0.2s var(--ease), border-color 0.2s;
  }
  .site .cust-switch.on { background: var(--red); border-color: var(--red); }
  .site .cust-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 999px; background: #fff; transition: transform 0.2s var(--ease); }
  .site .cust-switch.on .cust-knob { transform: translateX(18px); }
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
  .links a {
    display: inline-flex;
    align-items: center;
    transition: color 180ms;
  }
  .link-dot {
    display: inline-block;
    width: 0;
    height: 1px;
    background: var(--red);
    margin-right: 0;
    transition: width 280ms var(--ease), margin-right 280ms var(--ease);
  }
  .links a:hover { color: var(--text); }
  .links a:hover .link-dot { width: 14px; margin-right: 8px; }
  @media (min-width: 1000px) {
    .links { display: inline-flex; }
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: auto;
  }
  @media (min-width: 1000px) {
    .nav-right { margin-left: 0; }
  }
  .open-pill {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 6px 12px 6px 10px;
    border: 1px solid var(--border);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  @media (min-width: 800px) { .open-pill { display: inline-flex; } }
  .open-pill.open { color: var(--text); border-color: var(--border-strong); }
  .open-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--faint);
    box-shadow: 0 0 0 0 transparent;
  }
  .open-pill.open .open-dot {
    background: #34c480;
    box-shadow: 0 0 8px rgba(52, 196, 128, 0.6);
    animation: open-pulse 2.2s var(--ease) infinite;
  }
  @keyframes open-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 196, 128, 0.5); }
    50% { box-shadow: 0 0 0 6px rgba(52, 196, 128, 0); }
  }

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

  /* ─── Hero ───────────────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    padding: 140px clamp(20px, 4vw, 56px) 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    isolation: isolate;
  }
  .hero-photos {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
  }
  .hero-photo {
    position: absolute;
    overflow: hidden;
    border: 1px solid var(--border);
    filter: brightness(0.55) saturate(0.85);
    will-change: transform;
  }
  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* Mosaic positioning — three photos in a hidden quasi-grid */
  .hero-photo.p1 {
    top: -8%;
    right: -4%;
    width: 46%;
    aspect-ratio: 16 / 11;
  }
  .hero-photo.p2 {
    top: 38%;
    right: 18%;
    width: 28%;
    aspect-ratio: 4 / 3;
  }
  .hero-photo.p3 {
    bottom: -6%;
    right: -2%;
    width: 36%;
    aspect-ratio: 16 / 11;
  }
  @media (max-width: 1100px) {
    .hero-photo.p1 { width: 58%; right: -8%; }
    .hero-photo.p2 { display: none; }
    .hero-photo.p3 { display: none; }
  }
  @media (max-width: 700px) {
    .hero-photo.p1 { width: 100%; right: 0; top: 0; opacity: 0.5; }
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse at 40% center, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at 40% center, black 30%, transparent 80%);
    opacity: 0.45;
  }
  .hero::after {
    /* Left-side darkening so the hero text always reads on top of photos */
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, var(--bg-0) 0%, rgba(10, 10, 11, 0.7) 50%, transparent 80%),
      linear-gradient(180deg, transparent 40%, var(--bg-0) 100%);
    pointer-events: none;
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
  }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 32px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text);
  }
  .hero-eyebrow-sep {
    width: 24px;
    height: 1px;
    background: var(--border-strong);
  }

  .hero-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.025em;
    font-size: clamp(48px, 8.5vw, 128px);
    line-height: 1;
    margin-bottom: 36px;
    color: var(--text);
  }
  .hero-title .line { display: block; overflow: hidden; }
  .hero-title em {
    font-style: italic;
    font-weight: 800;
  }
  .hero-red { color: var(--red); }

  .hero-sub {
    font-size: clamp(15px, 1.3vw, 18px);
    color: var(--muted);
    max-width: 580px;
    margin-bottom: 40px;
    line-height: 1.6;
  }
  .hero-sub strong { color: var(--text); font-weight: 600; }

  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 56px;
  }
  .hero-specs {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(20px, 3vw, 40px);
    padding: 22px 26px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(10, 10, 11, 0.4);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  /* Scroll cue */
  .hero-scroll {
    position: absolute;
    left: 50%;
    bottom: 36px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 1;
  }
  .scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(180deg, transparent, var(--red));
    animation: scroll-pulse 2.4s var(--ease) infinite;
    transform-origin: top;
  }
  @keyframes scroll-pulse {
    0% { transform: scaleY(0); }
    50% { transform: scaleY(1); }
    100% { transform: scaleY(0); transform-origin: bottom; }
  }
  .scroll-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.3em;
    color: var(--faint);
  }

  /* ─── Buttons ────────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: 0;
    font-size: 14px;
    border-radius: var(--r-btn);
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 180ms, background 180ms, border-color 180ms, color 180ms, box-shadow 220ms;
    justify-content: center;
  }
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
  .btn-outline svg { width: 16px; height: 16px; color: var(--red); }
  .btn-outline:hover {
    border-color: var(--red);
    color: var(--red);
    transform: translateY(-1px);
  }

  /* ─── Marquee ────────────────────────────────────────────────── */
  .marquee-wrap {
    position: relative;
    padding: 20px 0;
    background: var(--bg-1);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    overflow: hidden;
    z-index: 1;
  }
  .marquee {
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  }
  .marquee-track {
    display: inline-flex;
    align-items: center;
    gap: 56px;
    animation: marquee-scroll 50s linear infinite;
    will-change: transform;
  }
  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .marquee-item {
    display: inline-flex;
    align-items: center;
    gap: 18px;
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 600;
    font-size: 20px;
    color: var(--muted);
    letter-spacing: -0.005em;
    transition: color 200ms;
  }
  .marquee-item:hover { color: var(--text); }
  .marquee-bullet {
    width: 6px;
    height: 6px;
    background: var(--red);
    flex-shrink: 0;
  }

  /* ─── Stats ribbon ───────────────────────────────────────────── */
  .stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    background: var(--bg-0);
    border-bottom: 1px solid var(--border);
  }
  @media (min-width: 760px) { .stats { grid-template-columns: repeat(5, 1fr); } }
  .stat {
    padding: 36px 28px;
    text-align: center;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .stat::before {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 1px;
    background: var(--red);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 360ms var(--ease);
  }
  .stat:hover::before { transform: scaleX(1); }
  .stat:nth-child(2n) { border-right: none; }
  @media (min-width: 760px) {
    .stat:nth-child(2n) { border-right: 1px solid var(--border); }
    .stat:last-child { border-right: none; }
    .stat { border-bottom: none; }
  }
  .stat-num {
    font-size: clamp(36px, 4vw, 52px);
    line-height: 1;
    color: var(--text);
  }
  .stat-label {
    margin-top: 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }

  /* ─── Section primitives ─────────────────────────────────────── */
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
    font-size: clamp(32px, 4.4vw, 60px);
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
  .head-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border: 1px solid var(--border);
    background: var(--bg-1);
  }
  .head-meta-num {
    font-size: 36px;
    color: var(--red);
    line-height: 1;
  }
  .head-meta-lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    line-height: 1.4;
  }

  /* ─── Filter chips (brand DNA — square corners) ──────────────── */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 36px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    background: var(--bg-1);
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: var(--r-chip);
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: background 180ms, border-color 180ms, color 180ms;
  }
  .chip:hover { color: var(--text); border-color: var(--border-strong); }
  .chip.active {
    background: var(--red);
    color: white;
    border-color: var(--red);
    font-weight: 600;
  }
  .chip-cross {
    opacity: 0.7;
    font-size: 14px;
    line-height: 1;
  }

  /* ─── Vehicle cards ──────────────────────────────────────────── */
  .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    gap: 20px;
  }
  .vcard {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
    transition: border-color 240ms, box-shadow 360ms, transform 360ms var(--ease);
    will-change: transform;
    transform-style: preserve-3d;
  }
  .vcard:hover {
    border-color: var(--border-strong);
    box-shadow:
      0 24px 60px -20px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(227, 6, 19, 0.1);
  }
  .vcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    background: var(--bg-2);
    overflow: hidden;
  }
  .vcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms var(--ease), filter 320ms;
    filter: brightness(0.92);
  }
  .vcard:hover .vcard-photo img {
    transform: scale(1.08);
    filter: brightness(1);
  }
  .vcard-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255, 255, 255, 0.14) 50%,
      transparent 70%
    );
    transition: left 800ms var(--ease);
    pointer-events: none;
  }
  .vcard:hover .vcard-shine { left: 150%; }

  .vcard-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .vbadge {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background: rgba(10, 10, 11, 0.78);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--r-chip);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .vbadge-red {
    background: var(--red);
    color: white;
    border-color: var(--red);
  }
  .vbadge-amber {
    background: var(--amber);
    color: #1c1408;
    border-color: var(--amber);
  }

  .vcard-live {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: rgba(10, 10, 11, 0.78);
    border: 1px solid var(--border);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--text);
  }
  .live-pulse {
    width: 7px;
    height: 7px;
    background: #34c480;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(52, 196, 128, 0.7);
    animation: live-pulse 1.8s var(--ease) infinite;
  }
  @keyframes live-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 196, 128, 0.6); }
    50% { box-shadow: 0 0 0 5px rgba(52, 196, 128, 0); }
  }

  .vcard-body {
    padding: 20px 22px 22px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .vcard-head {
    margin-bottom: 18px;
  }
  .vcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .vcard-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 21px;
    line-height: 1.2;
    color: var(--text);
    transition: color 180ms;
  }
  .vcard:hover .vcard-model { color: var(--red); }
  .vcard-trim {
    display: block;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 500;
    font-style: normal;
    font-size: 12.5px;
    color: var(--muted);
    text-transform: none;
    letter-spacing: 0;
    margin-top: 4px;
  }
  .vcard-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
    padding: 16px 0;
    margin-bottom: 18px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .vcard-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  }
  .vcard-pricing {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .vcard-monthly {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .vcard-monthly .from {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .vcard-monthly .amount {
    font-size: 26px;
    color: var(--red);
    letter-spacing: -0.02em;
  }
  .vcard-monthly .amount small {
    font-size: 13px;
    color: var(--muted);
    font-weight: 600;
  }
  .vcard-total {
    margin-top: 4px;
    font-size: 11.5px;
    color: var(--faint);
  }
  .vcard-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text);
    padding: 6px 0;
  }
  .vcard:hover .vcard-cta { color: var(--red); }

  .empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--muted);
    font-size: 14.5px;
  }
  .link {
    background: none;
    border: none;
    color: var(--red);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* ─── Benefits split ─────────────────────────────────────────── */
  .benefits {
    border-top: 1px solid var(--border);
  }
  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 56px;
    align-items: start;
  }
  @media (min-width: 980px) {
    .benefits-grid { grid-template-columns: 1fr 1.4fr; gap: 80px; }
  }
  .benefits-text { padding-top: 12px; }
  .benefits-text .btn { margin-top: 32px; }

  .benefits-list {
    display: flex;
    flex-direction: column;
  }
  .benefit {
    position: relative;
    display: grid;
    grid-template-columns: 56px 1fr auto;
    gap: 22px;
    align-items: center;
    padding: 28px 4px;
    border-top: 1px solid var(--border);
    transition: padding 240ms, background 240ms;
  }
  .benefit:last-child { border-bottom: 1px solid var(--border); }
  .benefit:hover {
    background: linear-gradient(90deg, rgba(227, 6, 19, 0.04), transparent 70%);
    padding-left: 14px;
  }
  .benefit-icon {
    width: 56px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    color: var(--red);
    background: rgba(227, 6, 19, 0.06);
    border-radius: var(--r-card);
    transition: background 240ms, border-color 240ms;
  }
  .benefit-icon svg { width: 26px; height: 26px; }
  .benefit:hover .benefit-icon {
    background: rgba(227, 6, 19, 0.14);
    border-color: rgba(227, 6, 19, 0.4);
  }
  .benefit-body { min-width: 0; }
  .benefit-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .benefit-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 20px;
    margin-bottom: 6px;
    color: var(--text);
  }
  .benefit p {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
    max-width: 540px;
  }
  .benefit-arrow {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 22px;
    color: var(--red);
    transition: transform 280ms var(--ease);
  }
  .benefit:hover .benefit-arrow { transform: translateX(6px); }

  /* ─── Process timeline ──────────────────────────────────────── */
  .process { border-top: 1px solid var(--border); }
  .timeline {
    position: relative;
    margin-top: 64px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }
  @media (min-width: 880px) {
    .timeline { grid-template-columns: repeat(4, 1fr); gap: 32px; }
  }
  .timeline-track {
    display: none;
    position: absolute;
    top: 26px;
    left: 8%;
    right: 8%;
    height: 1px;
    background: var(--border);
    z-index: 0;
  }
  @media (min-width: 880px) { .timeline-track { display: block; } }
  .timeline-progress {
    position: absolute;
    inset: 0 auto 0 0;
    width: 100%;
    background: linear-gradient(90deg, var(--red), var(--red-soft));
    transform-origin: left;
    transform: scaleX(0);
    animation: tl-fill 2.2s var(--ease) forwards;
    animation-play-state: paused;
  }
  /* Trigger via in-view (CSS only — IntersectionObserver-driven would be cleaner but this is enough for a marketing page) */
  .timeline:hover .timeline-progress { animation-play-state: running; }
  @keyframes tl-fill { to { transform: scaleX(1); } }

  .timeline-step {
    position: relative;
    z-index: 1;
    text-align: left;
  }
  .step-marker {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    margin-bottom: 22px;
  }
  .step-marker-inner {
    position: relative;
    z-index: 1;
    width: 52px;
    height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-0);
    border: 1px solid var(--red);
    color: var(--red);
    font-size: 14px;
    border-radius: 50%;
  }
  .step-marker-ring {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 1px solid rgba(227, 6, 19, 0.18);
  }
  .step-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
    color: var(--text);
  }
  .step-text {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
    max-width: 280px;
  }

  /* ─── Reviews ────────────────────────────────────────────── */
  .reviews {
    border-top: 1px solid var(--border);
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 56px;
    align-items: start;
  }
  @media (min-width: 980px) {
    .reviews-grid { grid-template-columns: 1fr 1.3fr; gap: 80px; }
  }
  .reviews-rating {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .stars { display: inline-flex; gap: 2px; color: var(--amber); }
  .stars svg { width: 18px; height: 18px; }
  .rating-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--muted);
  }
  .reviews-nav {
    display: flex;
    gap: 8px;
    margin-top: 24px;
  }
  .rdot {
    width: 28px;
    height: 4px;
    background: var(--border);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: background 200ms, width 200ms;
  }
  .rdot.active {
    background: var(--red);
    width: 44px;
  }

  .reviews-stage {
    position: relative;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    padding: clamp(32px, 4vw, 56px);
    min-height: 320px;
    overflow: hidden;
  }
  .reviews-stage::before {
    /* faint red glow in corner */
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(227, 6, 19, 0.18), transparent 70%);
    pointer-events: none;
  }
  .review {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 28px;
    height: 100%;
  }
  .review-quote {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 56px;
    line-height: 0.7;
    color: var(--red);
    opacity: 0.5;
  }
  .review-text {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 400;
    font-size: clamp(17px, 1.4vw, 21px);
    line-height: 1.55;
    color: var(--text);
    max-width: 580px;
  }
  .review-foot {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .review-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--red), var(--red-deep));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    color: white;
    font-size: 14px;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }
  .review-info { flex: 1; min-width: 0; }
  .review-name {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
  }
  .review-meta {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .review-meta .sep {
    width: 3px;
    height: 3px;
    background: var(--faint);
    border-radius: 50%;
  }
  .review-stars {
    display: inline-flex;
    gap: 1px;
    color: var(--amber);
  }
  .review-stars svg { width: 14px; height: 14px; }

  /* ─── Visit ────────────────────────────────────────────── */
  .visit {
    position: relative;
    margin-top: 80px;
    padding: clamp(100px, 12vw, 160px) clamp(20px, 4vw, 56px);
    overflow: hidden;
    isolation: isolate;
  }
  .visit-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
  }
  .visit-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.4) saturate(0.85);
  }
  .visit-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(10, 10, 11, 0.95) 0%, rgba(10, 10, 11, 0.6) 70%),
      radial-gradient(900px 500px at 90% 30%, rgba(227, 6, 19, 0.22), transparent 60%);
  }
  .visit-inner {
    max-width: 1600px;
    margin: 0 auto;
  }
  .visit-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-size: clamp(38px, 5.4vw, 76px);
    line-height: 1.02;
    margin-bottom: 28px;
    max-width: 900px;
    color: var(--text);
  }
  .visit-title em { color: var(--red); font-style: italic; font-weight: 800; }
  .visit-inner p {
    color: var(--muted);
    font-size: 16.5px;
    margin-bottom: 48px;
    max-width: 560px;
  }
  .visit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 28px 40px;
    padding: 32px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 40px;
  }
  .info-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.25em;
    color: var(--faint);
    margin-bottom: 10px;
  }
  .info-val {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 17px;
    line-height: 1.45;
  }
  .visit-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* ─── Footer ─────────────────────────────────────────── */
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

  /* ─── Reduced motion ─────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .site, .site * {
      animation: none !important;
      transition: none !important;
    }
    .marquee-track { animation: none !important; }
  }
</style>
