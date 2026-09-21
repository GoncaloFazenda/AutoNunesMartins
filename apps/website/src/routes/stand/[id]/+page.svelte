<!--
  PUBLIC VEHICLE DETAIL PAGE
  ──────────────────────────────────────────────────────────────────────────
  Companion to /stand. Reads the vehicle id from the URL, looks it up in a
  local hardcoded inventory (intentionally duplicated from the homepage so
  this file stays self-contained), and renders a premium product-page-style
  layout: gallery, italic uppercase hero, spec rows in the brand DNA
  pattern, description, equipment list, inquiry CTA, related cars, footer.

  Delete this file (and the parent `+page.svelte` if you also want the
  homepage gone) and the public site disappears from the app.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut, expoOut } from 'svelte/easing';

  // ─── Inventory data ────────────────────────────────────────────────────
  // Same shape as /stand. The detail page adds a few fields used only here
  // (description, equipment, gallery). Each vehicle's `gallery` is a small
  // set of Unsplash photos — same hero photo on the homepage + 2 detail
  // angles. If a gallery photo 404s the browser shows the dark photo well.
  interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    fuel: string;
    transmission: string;
    power: number;
    doors: number;
    color: string;
    price: number;
    tag?: string;
    gallery: string[];
    description: string;
    equipment: string[];
  }

  const vehicles: Vehicle[] = [
    {
      id: 'audi-rs6-2023',
      brand: 'Audi', model: 'RS6 Avant',
      year: 2023, km: 12500, fuel: 'Gasolina', transmission: 'Tiptronic 8v',
      power: 600, doors: 5, color: 'Cinzento Daytona Nardo', price: 145000,
      tag: 'Novo no stand',
      gallery: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Unidade nacional, com manutenção exclusivamente em concessionário Audi. Equipada com pack Sport, suspensão pneumática adaptativa e direcção integral. Estado impecável, livre de embates, com IUC e inspecção em dia.',
      equipment: [
        'Bancos desportivos em pele Valcona',
        'Quattro Sport AWD com diferencial activo',
        'Suspensão pneumática adaptativa',
        'Bang & Olufsen 3D Premium Sound',
        'Câmara 360° com vista superior',
        'Head-up display + Virtual Cockpit Plus',
        'Tecto panorâmico eléctrico',
        'Pack de assistência à condução (ACC, LKA)',
      ],
    },
    {
      id: 'bmw-m3-2022',
      brand: 'BMW', model: 'M3 Competition',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Steptronic 8v',
      power: 510, doors: 4, color: 'Isle of Man Green', price: 96500,
      tag: 'Garantia 24M',
      gallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Berlina desportiva em estado de exposição. Cor exclusiva Isle of Man Green, pack M Performance integral, bancos em pele Merino. Garantia oficial BMW válida até Maio de 2027.',
      equipment: [
        'Pack M Performance integral',
        'Bancos M em pele Merino estendida',
        'Travões M Carbon Ceramic',
        'Harman Kardon Surround Sound',
        'Live Cockpit Professional 12.3"',
        'Driving Assistant Professional',
        'Pack iluminação ambiente',
        'Llantas forjadas 19/20" two-tone',
      ],
    },
    {
      id: 'porsche-911-2021',
      brand: 'Porsche', model: '911 Carrera S',
      year: 2021, km: 18900, fuel: 'Gasolina', transmission: 'PDK 8v',
      power: 450, doors: 2, color: 'Branco Cristal Metalizado', price: 132000,
      gallery: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1530016884097-31166cc3c0ff?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        '911 Carrera S 992 com Sport Chrono Package e escape desportivo. Manutenção integral em concessionário Porsche, histórico documentado. Pneus Michelin Pilot Sport 4S recentes.',
      equipment: [
        'Sport Chrono Package',
        'Escape desportivo Porsche (PSE)',
        'Bancos adaptativos 18-way',
        'BOSE Surround Sound 12 colunas',
        'PASM (suspensão activa)',
        'Faróis LED Matrix com PDLS+',
        'Llantas Carrera Classic 20/21"',
        'Volante GT desportivo em alcântara',
      ],
    },
    {
      id: 'mercedes-e63s-2022',
      brand: 'Mercedes-AMG', model: 'E 63 S',
      year: 2022, km: 31200, fuel: 'Gasolina', transmission: 'AMG Speedshift 9v',
      power: 612, doors: 4, color: 'Preto Obsidiana', price: 118500,
      gallery: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'AMG E 63 S 4MATIC+ com pack Night e tracção integral. Berlina executiva com motor V8 biturbo 4.0 e tudo o que o Mercedes oferece em conforto e segurança.',
      equipment: [
        'AMG Performance 4MATIC+',
        'Pack Night Edition',
        'Bancos AMG em pele Nappa',
        'Burmester 3D Surround Sound',
        'MBUX Hyperscreen',
        'Suspensão AMG Ride Control+',
        'Tecto solar panorâmico',
        'Drive Pilot autónomo nível 3',
      ],
    },
    {
      id: 'range-rover-sport-2023',
      brand: 'Range Rover', model: 'Sport HSE Dynamic',
      year: 2023, km: 14800, fuel: 'Híbrido', transmission: 'Automática 8v',
      power: 440, doors: 5, color: 'Verde Tourmaline', price: 108000,
      tag: 'Híbrido',
      gallery: [
        'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Range Rover Sport P440e híbrido plug-in com mais de 100km em modo eléctrico. Configuração HSE Dynamic, bancos refrigerados, pack off-road completo.',
      equipment: [
        'Híbrido plug-in 100km autonomia',
        'Bancos refrigerados e massajadores',
        'Terrain Response 2 (off-road)',
        'Meridian Signature 25 colunas',
        'Pivi Pro 13.1" + co-piloto',
        'Suspensão pneumática Dynamic',
        'Tecto panorâmico eléctrico',
        'Pacote ADAS completo',
      ],
    },
    {
      id: 'tesla-model-s-2022',
      brand: 'Tesla', model: 'Model S Plaid',
      year: 2022, km: 22100, fuel: 'Elétrico', transmission: 'Direct Drive',
      power: 1020, doors: 5, color: 'Vermelho Multicapa', price: 89000,
      tag: 'Elétrico',
      gallery: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=1400&q=80',
      ],
      description:
        'Model S Plaid tri-motor com 1020cv e 0-100 em 2.1s. Pack Full Self-Driving incluído, autonomia WLTP de 637km. Manutenção centralizada Tesla.',
      equipment: [
        'Full Self-Driving Capability',
        '1020cv tri-motor (Plaid)',
        '0-100 em 2.1 segundos',
        'Autonomia WLTP 637km',
        'Ecrã 17" com gaming integrado',
        'Som premium 22 colunas',
        'HEPA bio-defense mode',
        'Yoke steering opcional',
      ],
    },
  ];

  // ─── URL param + lookup ─────────────────────────────────────────────────
  const vehicleId = $derived($page.params.id);
  const vehicle = $derived(vehicles.find((v) => v.id === vehicleId));
  const related = $derived(
    vehicle
      ? vehicles.filter((v) => v.id !== vehicle.id).slice(0, 3)
      : [],
  );

  // ─── Page state ─────────────────────────────────────────────────────────
  let mounted = $state(false);
  let scrollY = $state(0);
  let activePhoto = $state(0);

  // When the URL changes (navigating between detail pages via the related
  // strip) reset to the first photo. Otherwise a deep-clicked second car
  // would render with the previous car's selected index.
  $effect(() => {
    void vehicleId;
    activePhoto = 0;
  });

  onMount(() => {
    requestAnimationFrame(() => (mounted = true));
  });

  // ─── Reveal action (duplicate of /stand to keep this file standalone) ──
  function reveal(node: HTMLElement, params: { delay?: number; y?: number } = {}) {
    const delay = params.delay ?? 0;
    const y = params.y ?? 28;
    node.style.opacity = '0';
    node.style.transform = `translateY(${y}px)`;
    node.style.transition = `opacity 800ms cubic-bezier(.2,.8,.2,1) ${delay}ms, transform 800ms cubic-bezier(.2,.8,.2,1) ${delay}ms`;

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

  // ─── Formatters ─────────────────────────────────────────────────────────
  const formatEUR = (n: number) =>
    new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n);

  const formatInt = (n: number) => new Intl.NumberFormat('pt-PT').format(n);
</script>

<svelte:head>
  <title>
    {vehicle
      ? `${vehicle.brand} ${vehicle.model} · Auto Nunes Martins`
      : 'Viatura não encontrada · Auto Nunes Martins'}
  </title>
  {#if vehicle}
    <meta
      name="description"
      content="{vehicle.brand} {vehicle.model} {vehicle.year} · {formatInt(vehicle.km)} km · {formatEUR(vehicle.price)} — em stock no Auto Nunes Martins."
    />
  {/if}
</svelte:head>

<svelte:window bind:scrollY />

<div class="site">
  <!-- ─── Top nav ──────────────────────────────────────────────────── -->
  <header class="nav" class:scrolled={scrollY > 60}>
    <a href="/stand" class="brand">
      <span class="brand-mark">AUTO</span>
      <span class="brand-red">NUNES MARTINS</span>
    </a>
    <nav class="links">
      <a href="/stand#destaques">Destaques</a>
      <a href="/stand#servicos">Serviços</a>
      <a href="/stand#visitar">Visitar</a>
      <a href="/stand#contacto">Contacto</a>
    </nav>
    <a href="#inquerito" class="nav-cta">
      Pedir info
      <span class="arrow">→</span>
    </a>
  </header>

  {#if vehicle}
    <!-- ─── Hero / gallery ────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-photo">
          {#key vehicle.gallery[activePhoto]}
            <img
              src={vehicle.gallery[activePhoto]}
              alt="{vehicle.brand} {vehicle.model}"
              in:fade={{ duration: 500, easing: cubicOut }}
            />
          {/key}
        </div>
        <div class="hero-overlay"></div>
      </div>

      {#if mounted}
        <div class="hero-content">
          <a href="/stand" class="back-link" in:fly={{ y: -10, duration: 600, delay: 80 }}>
            <span class="arrow rev">←</span>
            Voltar ao stand
          </a>

          <div class="hero-tags" in:fly={{ y: 16, duration: 600, easing: cubicOut, delay: 200 }}>
            {#if vehicle.tag}
              <span class="tag tag-red">{vehicle.tag}</span>
            {/if}
            <span class="tag">{vehicle.year}</span>
            <span class="tag">{formatInt(vehicle.km)} km</span>
            <span class="tag">{vehicle.fuel}</span>
          </div>

          <div class="hero-title-row">
            <div class="hero-brand" in:fly={{ y: 16, duration: 600, easing: cubicOut, delay: 320 }}>
              {vehicle.brand}
            </div>
            <h1 class="hero-model">
              <span
                class="line"
                in:fly={{ y: 60, duration: 900, easing: expoOut, delay: 440 }}
              >
                {vehicle.model}
              </span>
            </h1>
          </div>

          <div class="hero-price-row" in:fly={{ y: 16, duration: 700, easing: cubicOut, delay: 700 }}>
            <div>
              <div class="price-label">PVP NEGOCIÁVEL</div>
              <div class="price-value">{formatEUR(vehicle.price)}</div>
            </div>
            <div class="hero-ctas">
              <a href="#inquerito" class="btn btn-primary">
                Pedir informações
                <span class="arrow">→</span>
              </a>
              <a href="tel:+351210000000" class="btn btn-outline">
                Ligar agora
              </a>
            </div>
          </div>

          <!-- Thumbnail strip -->
          <div class="thumbs" in:fly={{ y: 16, duration: 700, easing: cubicOut, delay: 900 }}>
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
        </div>
      {/if}
    </section>

    <!-- ─── Specs grid ─────────────────────────────────────────────── -->
    <section class="section specs">
      <div use:reveal>
        <span class="eyebrow">
          <span class="red-dot"></span>
          FICHA TÉCNICA
        </span>
        <h2 class="section-title">
          Especificações <em>completas.</em>
        </h2>
      </div>

      <div class="spec-grid">
        {#each [
          { label: 'Ano', value: String(vehicle.year), icon: 'calendar' },
          { label: 'Quilometragem', value: `${formatInt(vehicle.km)} km`, icon: 'gauge' },
          { label: 'Combustível', value: vehicle.fuel, icon: 'fuel' },
          { label: 'Caixa', value: vehicle.transmission, icon: 'gear' },
          { label: 'Potência', value: `${vehicle.power} cv`, icon: 'bolt' },
          { label: 'Portas', value: String(vehicle.doors), icon: 'door' },
          { label: 'Cor', value: vehicle.color, icon: 'droplet' },
          { label: 'Estado', value: 'Disponível', icon: 'check' },
        ] as spec, i (spec.label)}
          <div class="spec-cell" use:reveal={{ delay: i * 40 }}>
            <span class="spec-icon" aria-hidden="true">
              <!-- Inline icons keep this file independent of any library -->
              {#if spec.icon === 'calendar'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4M16 3v4M3 11h18" />
                </svg>
              {:else if spec.icon === 'gauge'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M12 20a8 8 0 1 1 8-8" />
                  <path d="M12 12l5-3" />
                </svg>
              {:else if spec.icon === 'fuel'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M2 22h16" />
                  <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2" />
                </svg>
              {:else if spec.icon === 'gear'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.18.66.49.85.85" />
                </svg>
              {:else if spec.icon === 'bolt'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              {:else if spec.icon === 'door'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M4 22h16M6 2h12v20H6zM14 11v2" />
                </svg>
              {:else if spec.icon === 'droplet'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M12 2.7s5.4 6.3 5.4 10.3a5.4 5.4 0 0 1-10.8 0c0-4 5.4-10.3 5.4-10.3z" />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="m4 12 6 6L20 6" />
                </svg>
              {/if}
            </span>
            <span class="spec-bar"></span>
            <div>
              <div class="spec-label">{spec.label}</div>
              <div class="spec-value">{spec.value}</div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- ─── Description + equipment ────────────────────────────────── -->
    <section class="section about">
      <div class="about-grid">
        <div class="about-text" use:reveal>
          <span class="eyebrow">
            <span class="red-dot"></span>
            SOBRE ESTA VIATURA
          </span>
          <h2 class="section-title">A história <em>desta unidade.</em></h2>
          <p class="about-body">
            {vehicle.description}
          </p>
          <div class="about-extras">
            <div>
              <div class="info-label">VIN</div>
              <div class="info-val">WAUZZZ4G{vehicle.year}A123456</div>
            </div>
            <div>
              <div class="info-label">Registo</div>
              <div class="info-val">Portugal · IMT</div>
            </div>
            <div>
              <div class="info-label">Próxima IPO</div>
              <div class="info-val">Mai · {vehicle.year + 4}</div>
            </div>
          </div>
        </div>

        <div class="equipment" use:reveal={{ delay: 120 }}>
          <span class="eyebrow">
            <span class="red-dot"></span>
            EQUIPAMENTO
          </span>
          <ul class="equipment-list">
            {#each vehicle.equipment as item (item)}
              <li>
                <span class="check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="m5 12 5 5 9-11" />
                  </svg>
                </span>
                {item}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </section>

    <!-- ─── Inquiry form (mailto, no backend) ──────────────────────── -->
    <section class="section inquiry" id="inquerito">
      <div class="inquiry-inner" use:reveal>
        <span class="eyebrow">
          <span class="red-dot"></span>
          INTERESSADO?
        </span>
        <h2 class="section-title">
          Vamos <em>conversar.</em>
        </h2>
        <p class="inquiry-lead">
          Preencha os campos e envie — respondemos no mesmo dia útil. Sem
          compromissos.
        </p>

        <form
          class="inquiry-form"
          action="mailto:geral@autonunesmartins.pt?subject=Interesse · {vehicle.brand} {vehicle.model}"
          method="POST"
          enctype="text/plain"
        >
          <label>
            <span>Nome</span>
            <input type="text" name="nome" required placeholder="O seu nome" />
          </label>
          <label>
            <span>Telefone</span>
            <input type="tel" name="telefone" required placeholder="+351 …" />
          </label>
          <label class="span-2">
            <span>Email</span>
            <input type="email" name="email" required placeholder="voce@email.pt" />
          </label>
          <label class="span-2">
            <span>Mensagem (opcional)</span>
            <textarea
              name="mensagem"
              rows="4"
              placeholder="Estou interessado em agendar uma visita / test drive."
            ></textarea>
          </label>
          <div class="form-foot">
            <span class="form-meta">RESPOSTA · ATÉ 24H</span>
            <button type="submit" class="btn btn-primary big">
              Enviar pedido
              <span class="arrow">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- ─── Related vehicles ──────────────────────────────────────── -->
    {#if related.length > 0}
      <section class="section related">
        <div class="section-head">
          <div use:reveal>
            <span class="eyebrow">
              <span class="red-dot"></span>
              TAMBÉM PODE GOSTAR
            </span>
            <h2 class="section-title">Outros <em>destaques.</em></h2>
          </div>
          <a href="/stand#destaques" class="view-all" use:reveal={{ delay: 120 }}>
            Ver inventário completo
            <span class="arrow">→</span>
          </a>
        </div>

        <div class="related-grid">
          {#each related as r, i (r.id)}
            <a href="/stand/{r.id}" class="rcard" use:reveal={{ delay: i * 100 }}>
              <div class="rcard-photo">
                <img src={r.gallery[0]} alt="{r.brand} {r.model}" loading="lazy" />
                <div class="rcard-shine"></div>
              </div>
              <div class="rcard-body">
                <div class="rcard-brand">{r.brand}</div>
                <h3 class="rcard-model">{r.model}</h3>
                <div class="rcard-foot">
                  <span class="rcard-meta">{r.year} · {formatInt(r.km)} km</span>
                  <span class="rcard-price">{formatEUR(r.price)}</span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}
  {:else}
    <!-- ─── 404-ish empty state for unknown ids ────────────────────── -->
    <section class="notfound">
      <span class="eyebrow">
        <span class="red-dot"></span>
        VIATURA NÃO ENCONTRADA
      </span>
      <h1 class="hero-model">
        Esta viatura<br /><em>já não está disponível.</em>
      </h1>
      <p>
        Pode ter sido vendida ou a referência expirou. Veja outros destaques
        ou contacte-nos directamente.
      </p>
      <a href="/stand" class="btn btn-primary big">
        Voltar ao stand
        <span class="arrow">→</span>
      </a>
    </section>
  {/if}

  <!-- ─── Footer ─────────────────────────────────────────────────── -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand-mark">
          AUTO <span class="brand-red">NUNES MARTINS</span>
        </div>
        <p>
          Comércio de automóveis usados premium desde 2009.<br />
          Qualidade, confiança e transparência em cada negócio.
        </p>
      </div>
      <div class="footer-cols">
        <div>
          <h4>Stand</h4>
          <ul>
            <li><a href="/stand#destaques">Destaques</a></li>
            <li><a href="/stand#servicos">Serviços</a></li>
            <li><a href="/stand#visitar">Visitar</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li>+351 210 000 000</li>
            <li>geral@autonunesmartins.pt</li>
            <li>Rua do Comércio, 123 — Lisboa</li>
          </ul>
        </div>
        <div>
          <h4>Horário</h4>
          <ul>
            <li>Seg – Sex · 9h – 19h</li>
            <li>Sábado · 10h – 17h</li>
            <li>Domingo · Encerrado</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Auto Nunes Martins · Todos os direitos reservados</span>
      <span>Lic. IMT · 1234</span>
    </div>
  </footer>
</div>

<style>
  /*
    Styles are scoped under `.site`. The token palette is repeated from
    /stand so the two files can be deleted independently without breaking
    each other — slight duplication is the price of self-containment.
  */
  .site {
    --acc: #e30613;
    --acc-soft: #ff3b49;
    --bg-0: #07070a;
    --bg-1: #0e0e12;
    --bg-2: #15151a;
    --text: #f4f4f2;
    --muted: #a8a8a4;
    --faint: #6e6f73;
    --line: rgba(255, 255, 255, 0.08);
    --line-strong: rgba(255, 255, 255, 0.16);

    background: var(--bg-0);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  .site :global(*) {
    box-sizing: border-box;
  }
  .site a {
    color: inherit;
    text-decoration: none;
  }
  .site h1,
  .site h2,
  .site h3,
  .site h4 {
    margin: 0;
  }
  .site p {
    margin: 0;
  }

  .red-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--acc);
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 0 12px var(--acc);
  }

  .arrow {
    display: inline-block;
    transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .arrow.rev {
    margin-right: 4px;
  }
  a:hover .arrow:not(.rev),
  .btn:hover .arrow:not(.rev) {
    transform: translateX(4px);
  }
  a:hover .arrow.rev {
    transform: translateX(-4px);
  }

  /* ─── Nav (matches /stand) ───────────────────────────────────────── */
  .nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    height: 72px;
    /* Navegação alinhada à coluna de 1600px (fundo continua full-bleed). */
    padding: 0 max(clamp(20px, 4vw, 56px), calc((100% - 1600px) / 2 + clamp(20px, 4vw, 56px)));
    display: flex;
    align-items: center;
    gap: 32px;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition:
      background 320ms ease,
      border-color 320ms ease,
      backdrop-filter 320ms ease;
  }
  .nav.scrolled {
    background: rgba(7, 7, 10, 0.78);
    border-bottom-color: var(--line);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .brand {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    font-size: 18px;
  }
  .brand-mark { color: var(--text); }
  .brand-red { color: var(--acc); }

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
  }
  .links a {
    transition: color 180ms;
    position: relative;
  }
  .links a::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -6px;
    height: 1px;
    background: var(--acc);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .links a:hover { color: var(--text); }
  .links a:hover::after { transform: scaleX(1); }
  @media (min-width: 900px) {
    .links { display: inline-flex; }
  }

  .nav-cta {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: 1px solid var(--line-strong);
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 12px;
    border-radius: 4px;
    transition:
      border-color 180ms,
      background 180ms,
      color 180ms;
  }
  @media (min-width: 900px) {
    .nav-cta { margin-left: 0; }
  }
  .nav-cta:hover {
    border-color: var(--acc);
    color: var(--acc);
    background: rgba(227, 6, 19, 0.06);
  }

  /* ─── Hero ───────────────────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    padding: 110px clamp(20px, 4vw, 56px) 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero-photo {
    position: absolute;
    inset: 0;
  }
  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.65) saturate(0.9);
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(7, 7, 10, 0.55) 0%, transparent 30%, rgba(7, 7, 10, 0.95) 100%),
      linear-gradient(90deg, rgba(7, 7, 10, 0.55) 0%, transparent 60%),
      radial-gradient(1200px 600px at 80% 80%, rgba(227, 6, 19, 0.15), transparent 60%);
  }
  .hero-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1600px;
    margin-inline: auto;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 32px;
    transition: color 180ms;
  }
  .back-link:hover { color: var(--text); }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--line-strong);
    background: rgba(7, 7, 10, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 3px;
  }
  .tag-red {
    background: var(--acc);
    border-color: var(--acc);
    color: white;
    font-weight: 600;
  }

  .hero-title-row {
    margin-bottom: 40px;
  }
  .hero-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text);
    margin-bottom: 12px;
  }
  .hero-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    font-size: clamp(52px, 10vw, 144px);
    line-height: 0.9;
    color: var(--text);
  }
  .hero-model .line {
    display: block;
    overflow: hidden;
  }
  .hero-model em {
    color: var(--acc);
    font-style: italic;
  }

  .hero-price-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    padding: 24px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    margin-bottom: 24px;
  }
  .price-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .price-value {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: clamp(36px, 5vw, 56px);
    line-height: 1;
    letter-spacing: -0.025em;
    color: var(--acc);
  }
  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* ─── Buttons ─────────────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    transition:
      transform 180ms,
      background 180ms,
      border-color 180ms,
      color 180ms,
      box-shadow 220ms;
    border: 1px solid transparent;
  }
  .btn.big {
    padding: 18px 28px;
    font-size: 14px;
  }
  .btn-primary {
    background: var(--acc);
    color: white;
    border-color: var(--acc);
  }
  .btn-primary:hover {
    background: var(--acc-soft);
    border-color: var(--acc-soft);
    box-shadow: 0 12px 40px -8px rgba(227, 6, 19, 0.55);
    transform: translateY(-1px);
  }
  .btn-outline {
    background: transparent;
    color: var(--text);
    border-color: var(--line-strong);
  }
  .btn-outline:hover {
    border-color: var(--acc);
    color: var(--acc);
    transform: translateY(-1px);
  }

  /* ─── Thumbnail strip ─────────────────────────────────────────────── */
  .thumbs {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }
  .thumb {
    position: relative;
    width: 90px;
    height: 60px;
    padding: 0;
    border: 2px solid transparent;
    background: var(--bg-1);
    cursor: pointer;
    overflow: hidden;
    border-radius: 4px;
    transition: border-color 180ms, transform 180ms;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 280ms;
  }
  .thumb:hover img { transform: scale(1.06); }
  .thumb.active {
    border-color: var(--acc);
    box-shadow: 0 0 0 1px var(--acc), 0 8px 24px -8px rgba(227, 6, 19, 0.4);
  }

  /* ─── Section primitives ──────────────────────────────────────────── */
  .section {
    padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 56px);
    max-width: 1600px;
    margin-inline: auto;
  }
  .section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 56px;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text);
    margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    font-size: clamp(36px, 6vw, 72px);
    line-height: 0.95;
  }
  .section-title em {
    font-style: italic;
    color: var(--acc);
  }
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
    border-bottom: 1px solid var(--line);
    transition: color 180ms, border-color 180ms;
  }
  .view-all:hover {
    color: var(--acc);
    border-bottom-color: var(--acc);
  }

  /* ─── Specs grid (brand DNA pattern) ─────────────────────────────── */
  .specs {
    border-top: 1px solid var(--line);
    background: var(--bg-1);
  }
  .spec-grid {
    margin-top: 56px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
  }
  .spec-cell {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 24px 22px;
    background: var(--bg-1);
    transition: background 280ms;
  }
  .spec-cell:hover { background: var(--bg-2); }
  .spec-icon {
    width: 22px;
    height: 22px;
    color: var(--acc);
    flex-shrink: 0;
  }
  .spec-icon svg { width: 22px; height: 22px; }
  .spec-bar {
    width: 1.5px;
    height: 22px;
    background: var(--acc);
    flex-shrink: 0;
  }
  .spec-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 4px;
  }
  .spec-value {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--text);
  }

  /* ─── About / equipment ──────────────────────────────────────────── */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
  }
  @media (min-width: 900px) {
    .about-grid {
      grid-template-columns: 1.3fr 1fr;
      gap: 80px;
    }
  }
  .about-body {
    font-size: 17px;
    color: var(--muted);
    margin-top: 24px;
    max-width: 580px;
    line-height: 1.65;
  }
  .about-extras {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 24px;
    padding-top: 28px;
    border-top: 1px solid var(--line);
  }
  .info-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .info-val {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 15px;
  }

  .equipment-list {
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .equipment-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 4px;
    font-size: 14px;
    color: var(--text);
    transition: border-color 220ms, background 220ms, transform 220ms;
  }
  .equipment-list li:hover {
    border-color: var(--line-strong);
    background: var(--bg-2);
    transform: translateX(2px);
  }
  .check {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(227, 6, 19, 0.12);
    color: var(--acc);
    border-radius: 2px;
    margin-top: 1px;
  }
  .check svg { width: 12px; height: 12px; }

  /* ─── Inquiry form ────────────────────────────────────────────────── */
  .inquiry {
    border-top: 1px solid var(--line);
    background:
      radial-gradient(900px 500px at 80% 0%, rgba(227, 6, 19, 0.08), transparent 60%),
      var(--bg-0);
  }
  .inquiry-inner { max-width: 820px; }
  .inquiry-lead {
    margin-top: 16px;
    color: var(--muted);
    font-size: 17px;
    max-width: 480px;
  }
  .inquiry-form {
    margin-top: 40px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
  }
  @media (min-width: 720px) {
    .inquiry-form { grid-template-columns: 1fr 1fr; }
  }
  .inquiry-form .span-2 { grid-column: 1 / -1; }
  .inquiry-form label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .inquiry-form span {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .inquiry-form input,
  .inquiry-form textarea {
    width: 100%;
    padding: 14px 16px;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 4px;
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    transition: border-color 180ms, background 180ms;
    outline: none;
  }
  .inquiry-form input:focus,
  .inquiry-form textarea:focus {
    border-color: var(--acc);
    background: var(--bg-2);
  }
  .inquiry-form textarea {
    resize: vertical;
    min-height: 100px;
  }
  .form-foot {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .form-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .form-foot button {
    border: 1px solid var(--acc);
    cursor: pointer;
  }

  /* ─── Related vehicles ────────────────────────────────────────────── */
  .related { border-top: 1px solid var(--line); }
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 24px;
  }
  .rcard {
    position: relative;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    transition:
      transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 280ms,
      box-shadow 380ms;
  }
  .rcard:hover {
    transform: translateY(-6px);
    border-color: var(--line-strong);
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  }
  .rcard-photo {
    aspect-ratio: 16 / 11;
    overflow: hidden;
    position: relative;
  }
  .rcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .rcard:hover .rcard-photo img { transform: scale(1.08); }
  .rcard-shine {
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
    transition: left 800ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .rcard:hover .rcard-shine { left: 150%; }
  .rcard-body { padding: 18px 20px 20px; }
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
    font-weight: 800;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    font-size: 22px;
    line-height: 1;
    margin-bottom: 14px;
    transition: color 180ms;
  }
  .rcard:hover .rcard-model { color: var(--acc); }
  .rcard-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }
  .rcard-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--muted);
  }
  .rcard-price {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: var(--acc);
  }

  /* ─── Not found ───────────────────────────────────────────────────── */
  .notfound {
    padding: 160px clamp(20px, 4vw, 56px) 120px;
    text-align: left;
    max-width: 720px;
  }
  .notfound p {
    color: var(--muted);
    font-size: 17px;
    margin: 24px 0 40px;
    max-width: 480px;
  }

  /* ─── Footer (matches /stand) ────────────────────────────────────── */
  .footer {
    background: var(--bg-1);
    border-top: 1px solid var(--line);
  }
  .footer-inner {
    padding: 60px clamp(20px, 4vw, 56px) 40px;
    max-width: 1600px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }
  @media (min-width: 760px) {
    .footer-inner { grid-template-columns: 1.2fr 2fr; }
  }
  .footer-brand .brand-mark {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    font-size: 22px;
    margin-bottom: 16px;
  }
  .footer-brand p {
    color: var(--muted);
    font-size: 14px;
    max-width: 320px;
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
    text-transform: uppercase;
    color: var(--text);
    margin-bottom: 14px;
  }
  .footer-cols ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--muted);
    font-size: 14px;
  }
  .footer-cols a { transition: color 180ms; }
  .footer-cols a:hover { color: var(--acc); }
  .footer-bottom {
    padding: 20px clamp(20px, 4vw, 56px);
    border-top: 1px solid var(--line);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
  }

  /* ─── Reduced motion ──────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .site, .site * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
