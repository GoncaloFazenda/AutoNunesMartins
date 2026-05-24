<!--
  PUBLIC DEALERSHIP HOMEPAGE
  ──────────────────────────────────────────────────────────────────────────
  Self-contained marketing page for clients browsing the car lot. Completely
  independent of the ERP `(app)` routes — no `$lib` imports, no shared
  utilities, no modifications to global files. Delete this file (and the
  sibling `[id]/+page.svelte`) and the public site disappears with zero
  cleanup needed in the rest of the codebase.

  Stack used: Svelte 5 runes, Tailwind utility classes (already in the
  project), inline SVG icons, Unsplash photo URLs, Barlow/Inter/JetBrains
  Mono (loaded by app.css at the root layout).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut, expoOut } from 'svelte/easing';

  // ─── Inventory data ────────────────────────────────────────────────────
  // Hardcoded so the page is fully self-contained. The detail page has its
  // own copy of this list keyed by `id`; if you change one, change the other
  // (or extract to a sibling .ts file — that would be a third file though).
  interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    fuel: string;
    transmission: string;
    power: number;
    price: number;
    image: string;
    tag?: string;
  }

  const vehicles: Vehicle[] = [
    {
      id: 'audi-rs6-2023',
      brand: 'Audi',
      model: 'RS6 Avant',
      year: 2023, km: 12500, fuel: 'Gasolina', transmission: 'Automática', power: 600, price: 145000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80',
      tag: 'Novo no stand',
    },
    {
      id: 'bmw-m3-2022',
      brand: 'BMW',
      model: 'M3 Competition',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Automática', power: 510, price: 96500,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80',
      tag: 'Garantia 24M',
    },
    {
      id: 'porsche-911-2021',
      brand: 'Porsche',
      model: '911 Carrera S',
      year: 2021, km: 18900, fuel: 'Gasolina', transmission: 'PDK', power: 450, price: 132000,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'mercedes-e63s-2022',
      brand: 'Mercedes-AMG',
      model: 'E 63 S',
      year: 2022, km: 31200, fuel: 'Gasolina', transmission: 'Automática', power: 612, price: 118500,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'range-rover-sport-2023',
      brand: 'Range Rover',
      model: 'Sport HSE Dynamic',
      year: 2023, km: 14800, fuel: 'Híbrido', transmission: 'Automática', power: 440, price: 108000,
      image: 'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=1400&q=80',
      tag: 'Híbrido',
    },
    {
      id: 'tesla-model-s-2022',
      brand: 'Tesla',
      model: 'Model S Plaid',
      year: 2022, km: 22100, fuel: 'Elétrico', transmission: 'Automática', power: 1020, price: 89000,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1400&q=80',
      tag: 'Elétrico',
    },
  ];

  // ─── Page state ─────────────────────────────────────────────────────────
  let mounted = $state(false);
  let scrollY = $state(0);

  onMount(() => {
    // Tiny delay so the hero stagger starts after the first paint —
    // otherwise Svelte's in: transitions render mid-paint and skip frames.
    requestAnimationFrame(() => (mounted = true));
  });

  // ─── Custom actions ─────────────────────────────────────────────────────
  /**
   * use:reveal — fades + slides a node up when it enters the viewport.
   * Disconnects the observer on first reveal so the animation only plays
   * once per page load. `delay` lets us stagger siblings via item index.
   */
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

  /**
   * use:countUp — animates a number from 0 to `target` when the element
   * scrolls into view. Used for the stats row.
   */
  function countUp(node: HTMLElement, params: { target: number; duration?: number; suffix?: string }) {
    const duration = params.duration ?? 1800;
    let played = false;
    function run() {
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(eased * params.target);
        node.textContent = current.toLocaleString('pt-PT') + (params.suffix ?? '');
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
      { threshold: 0.5 },
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

  const formatKm = (n: number) => new Intl.NumberFormat('pt-PT').format(n) + ' km';
</script>

<svelte:head>
  <title>Auto Nunes Martins · Stand de Automóveis Premium</title>
  <meta
    name="description"
    content="Comércio de automóveis usados premium em Portugal. Importação, financiamento e garantia até 24 meses."
  />
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
      <a href="#destaques">Destaques</a>
      <a href="#servicos">Serviços</a>
      <a href="#visitar">Visitar</a>
      <a href="#contacto">Contacto</a>
    </nav>
    <a href="#contacto" class="nav-cta">
      Falar connosco
      <span class="arrow">→</span>
    </a>
  </header>

  <!-- ─── Hero ─────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-bg">
      <img
        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2200&q=85"
        alt=""
        aria-hidden="true"
        class="hero-image"
        style="transform: translateY({scrollY * 0.3}px) scale(1.05);"
      />
      <div class="hero-overlay"></div>
      <div class="hero-grid"></div>
    </div>

    {#if mounted}
      <div class="hero-content">
        <div
          class="hero-eyebrow"
          in:fly={{ y: 16, duration: 600, easing: cubicOut, delay: 80 }}
        >
          <span class="red-dot"></span>
          COMÉRCIO DE AUTOMÓVEIS · DESDE 2009
        </div>

        <h1 class="hero-title">
          <span
            class="line"
            in:fly={{ y: 60, duration: 900, easing: expoOut, delay: 200 }}
          >
            A SUA
          </span>
          <span
            class="line red"
            in:fly={{ y: 60, duration: 900, easing: expoOut, delay: 320 }}
          >
            VIATURA
          </span>
          <span
            class="line"
            in:fly={{ y: 60, duration: 900, easing: expoOut, delay: 440 }}
          >
            IDEAL.
          </span>
        </h1>

        <p
          class="hero-sub"
          in:fly={{ y: 16, duration: 700, easing: cubicOut, delay: 700 }}
        >
          Importação, financiamento e garantia até 24 meses — tudo num só sítio.
          Mais de <strong>500 viaturas verificadas</strong> à sua espera.
        </p>

        <div
          class="hero-ctas"
          in:fly={{ y: 16, duration: 700, easing: cubicOut, delay: 900 }}
        >
          <a href="#destaques" class="btn btn-primary">
            Ver inventário
            <span class="arrow">→</span>
          </a>
          <a href="#contacto" class="btn btn-outline">
            Pedir avaliação
          </a>
        </div>

        <div
          class="hero-meta"
          in:fly={{ y: 16, duration: 700, easing: cubicOut, delay: 1100 }}
        >
          <div class="meta-cell">
            <span class="meta-num">500+</span>
            <span class="meta-lbl">Viaturas vendidas</span>
          </div>
          <div class="meta-sep"></div>
          <div class="meta-cell">
            <span class="meta-num">24M</span>
            <span class="meta-lbl">Garantia</span>
          </div>
          <div class="meta-sep"></div>
          <div class="meta-cell">
            <span class="meta-num">15</span>
            <span class="meta-lbl">Anos no mercado</span>
          </div>
        </div>
      </div>

      <div class="hero-scroll" in:fly={{ y: -10, duration: 800, delay: 1400 }}>
        <span class="scroll-line"></span>
        <span class="scroll-label">SCROLL</span>
      </div>
    {/if}
  </section>

  <!-- ─── Featured vehicles ───────────────────────────────────────── -->
  <section class="section" id="destaques">
    <div class="section-head">
      <div use:reveal>
        <span class="eyebrow">
          <span class="red-dot"></span>
          DESTAQUES DA SEMANA
        </span>
        <h2 class="section-title">
          Em <em>destaque.</em>
        </h2>
        <p class="section-lead">
          Selecção curada da nossa frota. Disponíveis para visita imediata.
        </p>
      </div>
      <a href="#visitar" class="view-all" use:reveal={{ delay: 120 }}>
        Ver inventário completo
        <span class="arrow">→</span>
      </a>
    </div>

    <div class="vehicles-grid">
      {#each vehicles as v, i (v.id)}
        <a
          href="/stand/{v.id}"
          class="vcard"
          use:reveal={{ delay: (i % 3) * 100 }}
        >
          <div class="vcard-photo">
            <img src={v.image} alt="{v.brand} {v.model}" loading="lazy" />
            {#if v.tag}
              <span class="vcard-tag">{v.tag}</span>
            {/if}
            <div class="vcard-shine"></div>
          </div>
          <div class="vcard-body">
            <div class="vcard-brand">{v.brand}</div>
            <h3 class="vcard-model">{v.model}</h3>
            <div class="vcard-specs">
              <span>{v.year}</span>
              <span class="dot"></span>
              <span>{formatKm(v.km)}</span>
              <span class="dot"></span>
              <span>{v.fuel}</span>
            </div>
            <div class="vcard-foot">
              <div class="vcard-price">{formatEUR(v.price)}</div>
              <div class="vcard-cta">
                Ver ficha
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <!-- ─── Services / trust strip ─────────────────────────────────── -->
  <section class="section services-section" id="servicos">
    <div use:reveal>
      <span class="eyebrow">
        <span class="red-dot"></span>
        SERVIÇOS
      </span>
      <h2 class="section-title">Cuidamos de <em>tudo.</em></h2>
    </div>

    <div class="services">
      <div class="service" use:reveal={{ delay: 0 }}>
        <div class="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="2" y="6" width="20" height="14" rx="2"/>
            <path d="M2 10h20M7 14h4"/>
          </svg>
        </div>
        <h3>Financiamento</h3>
        <p>
          Aprovação em 24 horas com taxas competitivas. Parceiros bancários para
          todos os perfis de crédito.
        </p>
        <span class="service-meta">PROPOSTAS · 5 BANCOS</span>
      </div>
      <div class="service" use:reveal={{ delay: 120 }}>
        <div class="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <h3>Garantia 24M</h3>
        <p>
          Todas as viaturas com garantia até 24 meses, motor e caixa incluídos.
          Sem letras pequenas.
        </p>
        <span class="service-meta">REVISÃO · 130 PONTOS</span>
      </div>
      <div class="service" use:reveal={{ delay: 240 }}>
        <div class="service-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M3 12h13l-3-3M21 12h-1M3 6h18M3 18h18"/>
          </svg>
        </div>
        <h3>Retoma</h3>
        <p>
          Avaliamos a sua viatura actual em 15 minutos e abatemos no preço final.
          Sem burocracias.
        </p>
        <span class="service-meta">AVALIAÇÃO · NO MOMENTO</span>
      </div>
    </div>
  </section>

  <!-- ─── Stats row ──────────────────────────────────────────────── -->
  <section class="stats">
    <div class="stat" use:reveal>
      <div class="stat-num" use:countUp={{ target: 15 }}>0</div>
      <div class="stat-label">Anos no mercado</div>
    </div>
    <div class="stat-sep"></div>
    <div class="stat" use:reveal={{ delay: 100 }}>
      <div class="stat-num" use:countUp={{ target: 500, suffix: '+' }}>0</div>
      <div class="stat-label">Viaturas vendidas</div>
    </div>
    <div class="stat-sep"></div>
    <div class="stat" use:reveal={{ delay: 200 }}>
      <div class="stat-num" use:countUp={{ target: 2500, suffix: '+' }}>0</div>
      <div class="stat-label">Clientes satisfeitos</div>
    </div>
    <div class="stat-sep"></div>
    <div class="stat" use:reveal={{ delay: 300 }}>
      <div class="stat-num" use:countUp={{ target: 24, suffix: 'h' }}>0</div>
      <div class="stat-label">Resposta garantida</div>
    </div>
  </section>

  <!-- ─── Showroom CTA ───────────────────────────────────────────── -->
  <section class="visit" id="visitar">
    <div class="visit-bg">
      <img
        src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2200&q=85"
        alt=""
        aria-hidden="true"
      />
      <div class="visit-overlay"></div>
    </div>

    <div class="visit-inner" use:reveal>
      <span class="eyebrow">
        <span class="red-dot"></span>
        VISITE O STAND
      </span>
      <h2 class="visit-title">
        Veja, conduza,<br />
        <em>leve para casa.</em>
      </h2>
      <p>
        Estamos abertos de Segunda a Sábado. Marque uma visita ou apareça
        simplesmente — temos café à sua espera.
      </p>

      <div class="visit-info">
        <div>
          <div class="info-label">MORADA</div>
          <div class="info-val">Rua do Comércio, 123 — Lisboa</div>
        </div>
        <div>
          <div class="info-label">TELEFONE</div>
          <div class="info-val">+351 210 000 000</div>
        </div>
        <div>
          <div class="info-label">EMAIL</div>
          <div class="info-val">geral@autonunesmartins.pt</div>
        </div>
      </div>

      <a href="mailto:geral@autonunesmartins.pt" class="btn btn-primary big">
        Agendar visita
        <span class="arrow">→</span>
      </a>
    </div>
  </section>

  <!-- ─── Footer ─────────────────────────────────────────────────── -->
  <footer class="footer" id="contacto">
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
            <li><a href="#destaques">Destaques</a></li>
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#visitar">Visitar</a></li>
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
    ─── Scope + tokens ──────────────────────────────────────────────────
    Everything is scoped under `.site` so this file doesn't leak styles
    elsewhere. Tokens are redeclared locally (rather than reusing the ERP's
    --color-* tokens) so the public site is visually independent — change
    the ERP palette and this file stays the same.
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

  /* ─── Brand text helpers ──────────────────────────────────────────── */
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
  a:hover .arrow,
  .btn:hover .arrow {
    transform: translateX(4px);
  }

  /* ─── Nav ──────────────────────────────────────────────────────────── */
  .nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    height: 72px;
    padding: 0 clamp(20px, 4vw, 56px);
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
  .brand-mark {
    color: var(--text);
  }
  .brand-red {
    color: var(--acc);
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
  .links a:hover {
    color: var(--text);
  }
  .links a:hover::after {
    transform: scaleX(1);
  }
  @media (min-width: 900px) {
    .links {
      display: inline-flex;
    }
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
    .nav-cta {
      margin-left: 0;
    }
  }
  .nav-cta:hover {
    border-color: var(--acc);
    color: var(--acc);
    background: rgba(227, 6, 19, 0.06);
  }

  /* ─── Hero ─────────────────────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    padding: 120px clamp(20px, 4vw, 56px) 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
    will-change: transform;
    filter: brightness(0.6) saturate(0.85);
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(7, 7, 10, 0.6) 0%, transparent 35%, rgba(7, 7, 10, 0.85) 100%),
      linear-gradient(90deg, rgba(7, 7, 10, 0.7) 0%, transparent 60%),
      radial-gradient(1200px 600px at 80% 30%, rgba(227, 6, 19, 0.15), transparent 60%);
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    opacity: 0.5;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 980px;
  }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text);
    margin-bottom: 32px;
  }
  .hero-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    font-size: clamp(56px, 11vw, 156px);
    line-height: 0.9;
    margin-bottom: 32px;
  }
  .hero-title .line {
    display: block;
    overflow: hidden;
  }
  .hero-title .red {
    color: var(--acc);
  }
  .hero-sub {
    font-size: clamp(15px, 1.4vw, 19px);
    color: var(--muted);
    max-width: 520px;
    margin-bottom: 40px;
  }
  .hero-sub strong {
    color: var(--text);
    font-weight: 600;
  }
  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 60px;
  }

  /* ─── Buttons ──────────────────────────────────────────────────────── */
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
  }
  .btn.big {
    padding: 18px 28px;
    font-size: 14px;
  }
  .btn-primary {
    background: var(--acc);
    color: white;
    border: 1px solid var(--acc);
    box-shadow: 0 0 0 0 rgba(227, 6, 19, 0);
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
    border: 1px solid var(--line-strong);
  }
  .btn-outline:hover {
    border-color: var(--acc);
    color: var(--acc);
    transform: translateY(-1px);
  }

  /* ─── Hero meta strip ─────────────────────────────────────────────── */
  .hero-meta {
    display: inline-flex;
    align-items: center;
    gap: clamp(20px, 4vw, 48px);
    padding: 24px 28px;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .meta-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .meta-num {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 28px;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .meta-lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .meta-sep {
    width: 1px;
    height: 32px;
    background: var(--line);
  }

  .hero-scroll {
    position: absolute;
    left: 50%;
    bottom: 32px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 1;
  }
  .scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(180deg, transparent, var(--acc));
    animation: scroll-pulse 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
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

  /* ─── Section primitives ──────────────────────────────────────────── */
  .section {
    padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 56px);
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
    font-size: clamp(40px, 6vw, 76px);
    line-height: 0.95;
  }
  .section-title em {
    font-style: italic;
    color: var(--acc);
  }
  .section-lead {
    margin-top: 16px;
    color: var(--muted);
    max-width: 520px;
    font-size: 16px;
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

  /* ─── Vehicle cards ───────────────────────────────────────────────── */
  .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 24px;
  }
  .vcard {
    position: relative;
    display: block;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    transition:
      transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 280ms,
      box-shadow 380ms;
  }
  .vcard:hover {
    transform: translateY(-6px);
    border-color: var(--line-strong);
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  }
  .vcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    overflow: hidden;
    background: var(--bg-2);
  }
  .vcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .vcard:hover .vcard-photo img {
    transform: scale(1.08);
  }
  .vcard-tag {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 5px 10px;
    background: var(--acc);
    color: white;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    border-radius: 2px;
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
      rgba(255, 255, 255, 0.12) 50%,
      transparent 70%
    );
    transition: left 800ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .vcard:hover .vcard-shine {
    left: 150%;
  }
  .vcard-body {
    padding: 20px 22px 22px;
  }
  .vcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .vcard-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 800;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    font-size: 24px;
    line-height: 1;
    margin-bottom: 14px;
    transition: color 180ms;
  }
  .vcard:hover .vcard-model {
    color: var(--acc);
  }
  .vcard-specs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.05em;
    color: var(--muted);
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }
  .vcard-specs .dot {
    display: inline-block;
    width: 3px;
    height: 3px;
    background: var(--faint);
    border-radius: 50%;
  }
  .vcard-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .vcard-price {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 24px;
    letter-spacing: -0.02em;
    color: var(--acc);
  }
  .vcard-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    transition: color 180ms;
  }
  .vcard:hover .vcard-cta {
    color: var(--text);
  }

  /* ─── Services ────────────────────────────────────────────────────── */
  .services-section {
    border-top: 1px solid var(--line);
  }
  .services {
    margin-top: 56px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
  }
  .service {
    padding: 40px 32px;
    background: var(--bg-1);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: background 280ms;
  }
  .service:hover {
    background: var(--bg-2);
  }
  .service-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(227, 6, 19, 0.08);
    border: 1px solid rgba(227, 6, 19, 0.25);
    border-radius: 4px;
    color: var(--acc);
  }
  .service-icon svg {
    width: 22px;
    height: 22px;
  }
  .service h3 {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 800;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    font-size: 22px;
  }
  .service p {
    color: var(--muted);
    font-size: 14.5px;
    flex: 1;
  }
  .service-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.22em;
    color: var(--faint);
    text-transform: uppercase;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }

  /* ─── Stats row ───────────────────────────────────────────────────── */
  .stats {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: clamp(24px, 5vw, 80px);
    padding: 60px clamp(20px, 4vw, 56px);
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background:
      radial-gradient(1200px 400px at 50% -10%, rgba(227, 6, 19, 0.08), transparent 60%),
      var(--bg-0);
  }
  .stat {
    text-align: center;
  }
  .stat-num {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 1;
    letter-spacing: -0.03em;
    background: linear-gradient(180deg, var(--text) 0%, var(--muted) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .stat-label {
    margin-top: 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .stat-sep {
    width: 1px;
    background: var(--line);
    align-self: stretch;
  }

  /* ─── Visit / showroom CTA ────────────────────────────────────────── */
  .visit {
    position: relative;
    padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 56px);
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
    filter: brightness(0.45) saturate(0.85);
  }
  .visit-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(7, 7, 10, 0.92) 0%, rgba(7, 7, 10, 0.6) 70%),
      radial-gradient(900px 500px at 80% 30%, rgba(227, 6, 19, 0.2), transparent 60%);
  }
  .visit-inner {
    max-width: 720px;
  }
  .visit-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    font-size: clamp(40px, 7vw, 84px);
    line-height: 0.95;
    margin-bottom: 24px;
  }
  .visit-title em {
    color: var(--acc);
    font-style: italic;
  }
  .visit-inner p {
    color: var(--muted);
    font-size: 16px;
    margin-bottom: 40px;
    max-width: 520px;
  }
  .visit-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 32px;
    padding: 32px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    margin-bottom: 40px;
  }
  .info-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.25em;
    color: var(--faint);
    margin-bottom: 8px;
  }
  .info-val {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    font-size: 16px;
  }

  /* ─── Footer ──────────────────────────────────────────────────────── */
  .footer {
    background: var(--bg-1);
    border-top: 1px solid var(--line);
  }
  .footer-inner {
    padding: 60px clamp(20px, 4vw, 56px) 40px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
  }
  @media (min-width: 760px) {
    .footer-inner {
      grid-template-columns: 1.2fr 2fr;
    }
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
  .footer-cols a {
    transition: color 180ms;
  }
  .footer-cols a:hover {
    color: var(--acc);
  }
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
    .site,
    .site * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
