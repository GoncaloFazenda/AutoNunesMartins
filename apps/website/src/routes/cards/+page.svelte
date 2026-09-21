<!--
  CARDS COMPARISON PAGE
  ──────────────────────────────────────────────────────────────────────────
  Side-by-side gallery of every vehicle-card design tried across the public
  stand mockups (/stand, /stand-v2). Lets us pick one before committing.

  Same self-contained pattern as the stand pages: no $lib imports, no
  modifications to global files. Each card variant is rendered with its
  own CSS scoped under .variant-* so the three designs can co-exist on
  the same page without bleeding into each other.

  Cards are non-interactive here (href="#") — this is a visual reference,
  not navigation.
-->
<script lang="ts">
  import { onMount } from 'svelte';

  // ─── Shared sample inventory ────────────────────────────────────────────
  // A spread of price ranges + tags so every card variant has something
  // interesting to render (premium for V1, family-priced for V2/V3).
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
    tag?: string;       // V1 uses a single tag
    badges: string[];   // V2/V3 use a list of badges
  }

  const vehicles: Vehicle[] = [
    {
      id: 'bmw-m3-2022',
      brand: 'BMW', model: 'M3 Competition', trim: '510 CV · M xDrive',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Automática',
      power: 510, price: 96500, monthly: 1205,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80',
      tag: 'Garantia 24M',
      badges: ['Garantia 24M', 'Recém-chegado'],
    },
    {
      id: 'vw-polo-2022',
      brand: 'Volkswagen', model: 'Polo', trim: '1.0 TSI Life',
      year: 2022, km: 28400, fuel: 'Gasolina', transmission: 'Manual',
      power: 95, price: 17900, monthly: 225,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
      tag: 'Novo no stand',
      badges: ['Garantia 24M', 'Recém-chegado'],
    },
    {
      id: 'range-rover-sport-2023',
      brand: 'Range Rover', model: 'Sport HSE Dynamic', trim: 'P440e Híbrido',
      year: 2023, km: 14800, fuel: 'Híbrido', transmission: 'Automática',
      power: 440, price: 108000, monthly: 1350,
      image: 'https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=1400&q=80',
      tag: 'Híbrido',
      badges: ['Garantia 24M', 'Híbrido'],
    },
  ];

  // ─── Reveal action (shared by all variants) ─────────────────────────────
  function reveal(node: HTMLElement, params: { delay?: number; y?: number } = {}) {
    const delay = params.delay ?? 0;
    const y = params.y ?? 24;
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

  // ─── 3D tilt action (used by V2) ────────────────────────────────────────
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

  let mounted = $state(false);
  let theme = $state<'dark' | 'light'>('dark');

  onMount(() => {
    requestAnimationFrame(() => (mounted = true));
    const saved = localStorage.getItem('cards-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('cards-theme', theme);
    } catch {}
  }
</script>

<svelte:head>
  <title>Cards · Comparação de designs</title>
  <meta name="description" content="Comparação lado-a-lado dos cards de viatura dos três stands mock." />
</svelte:head>

<div class="page" class:mounted data-theme={theme}>
  <button
    type="button"
    class="theme-toggle"
    onclick={toggleTheme}
    aria-label="Alternar tema"
    title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
  >
    {#if theme === 'dark'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
      <span>Tema claro</span>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <span>Tema escuro</span>
    {/if}
  </button>

  <header class="page-head">
    <div class="page-eyebrow">
      <span class="dot"></span>
      DESIGN COMPARISON
    </div>
    <h1 class="page-title">
      Cards de viatura — <em>todas as variantes.</em>
    </h1>
    <p class="page-lead">
      As três versões dos cards usados nas páginas mock <code>/stand</code>,
      <code>/stand-v2</code> e <code>/stand-v3</code>, lado-a-lado com o mesmo
      inventário de exemplo. Esta página é apenas uma referência visual —
      os cards aqui não navegam.
    </p>
  </header>

  <!-- ╔════════════════════════════════════════════════════════════════╗ -->
  <!-- ║ V1 — /stand (premium supercar tone, single tag, large price)   ║ -->
  <!-- ╚════════════════════════════════════════════════════════════════╝ -->
  <section class="variant variant-v1">
    <div class="variant-head" use:reveal>
      <div class="variant-label">
        <span class="variant-tag">V1</span>
        <span class="variant-route">/stand</span>
      </div>
      <h2 class="variant-title">Premium supercar — preço em destaque</h2>
      <p class="variant-notes">
        Tag única, especificações inline com separadores ponto, preço total em
        vermelho grande, sem indicação mensal. Hover faz "shine" + scale na
        imagem. Tipografia Barlow italic uppercase.
      </p>
    </div>

    <div class="v1-site" data-theme={theme}>
      <div class="vehicles-grid">
        {#each vehicles as v, i (v.id)}
          <a
            href="#"
            class="vcard"
            use:reveal={{ delay: (i % 3) * 100 }}
            onclick={(e) => e.preventDefault()}
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
    </div>
  </section>

  <!-- ╔════════════════════════════════════════════════════════════════╗ -->
  <!-- ║ V2 — /stand-v2 (commercial, spec-row pattern, monthly upfront) ║ -->
  <!-- ╚════════════════════════════════════════════════════════════════╝ -->
  <section class="variant variant-v2">
    <div class="variant-head" use:reveal>
      <div class="variant-label">
        <span class="variant-tag">V2</span>
        <span class="variant-route">/stand-v2</span>
      </div>
      <h2 class="variant-title">Comercial — mensal em destaque + 3D tilt</h2>
      <p class="variant-notes">
        Múltiplos badges sobrepostos (incluindo âmbar para "Híbrido"), live
        pulse "disponível", spec-rows com ícone + divisor vermelho + label, e
        valor mensal em primeiro plano com preço pronto secundário. Cards
        respondem ao cursor com tilt 3D.
      </p>
    </div>

    <div class="v2-site" data-theme={theme}>
      <div class="vehicles-grid">
        {#each vehicles as v, i (v.id)}
          <a
            href="#"
            class="vcard"
            use:reveal={{ delay: (i % 4) * 60 }}
            use:tilt
            onclick={(e) => e.preventDefault()}
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
    </div>
  </section>

  <!-- ╔════════════════════════════════════════════════════════════════╗ -->
  <!-- ║ V3 — /stand-v3 (editorial, light theme, condensed display)     ║ -->
  <!-- ╚════════════════════════════════════════════════════════════════╝ -->
  <section class="variant variant-v3">
    <div class="variant-head" use:reveal>
      <div class="variant-label">
        <span class="variant-tag">V3</span>
        <span class="variant-route">/stand-v3</span>
      </div>
      <h2 class="variant-title">Editorial — tema claro, condensed display</h2>
      <p class="variant-notes">
        Fundo branco, Antonio Condensed para os modelos, especificações
        simples com bullet points, badges arejados em vidro fosco, sem tilt
        nem live-pulse. Foco em legibilidade tipográfica.
      </p>
    </div>

    <div class="v3-site" data-theme={theme}>
      <div class="vehicles-grid">
        {#each vehicles as v, i (v.id)}
          <a
            href="#"
            class="vcard"
            use:reveal={{ delay: (i % 3) * 60 }}
            onclick={(e) => e.preventDefault()}
          >
            <div class="vcard-photo">
              <img src={v.image} alt="{v.brand} {v.model}" loading="lazy" />
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
            </div>
            <div class="vcard-body">
              <div class="vcard-brand">{v.brand}</div>
              <h3 class="vcard-model">{v.model}</h3>
              <div class="vcard-trim">{v.trim}</div>

              <div class="vcard-specs">
                <span class="vspec"><span class="num-value">{v.year}</span></span>
                <span class="vsep"></span>
                <span class="vspec"><span class="num-value">{formatKm(v.km)}</span></span>
                <span class="vsep"></span>
                <span class="vspec">{v.fuel}</span>
                <span class="vsep"></span>
                <span class="vspec">{v.transmission}</span>
              </div>

              <div class="vcard-foot">
                <div class="vcard-pricing">
                  <div class="vcard-monthly">
                    <span class="from">desde</span>
                    <span class="amount num-value">{formatEUR(v.monthly)}<small>/mês</small></span>
                  </div>
                  <div class="vcard-total">ou {formatEUR(v.price)}</div>
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
    </div>
  </section>
</div>

<style>
  /*
    Each variant lives under its own scope (.v1-site / .v2-site / .v3-site)
    so the three sets of CSS tokens (--red, --bg-1, etc) don't collide on
    the same page. Token definitions and helper rules are duplicated from
    the source stand pages — kept verbatim so the cards render exactly the
    same as in their original context.
  */
  :global(body) {
    background: #0a0a0b;
    transition: background 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  :global(body:has(.page[data-theme='light'])) {
    background: #faf7f0;
  }

  .page {
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    padding: clamp(48px, 8vw, 96px) clamp(20px, 4vw, 56px) clamp(96px, 12vw, 160px);
    position: relative;
    transition: background 320ms cubic-bezier(0.2, 0.8, 0.2, 1), color 320ms;
  }
  .page[data-theme='dark'] {
    color: #f4f4f2;
    background:
      radial-gradient(1100px 600px at 50% 0%, rgba(227, 6, 19, 0.10), transparent 60%),
      #0a0a0b;
  }
  .page[data-theme='light'] {
    color: #1a1a1a;
    background:
      radial-gradient(1100px 600px at 50% 0%, rgba(227, 6, 19, 0.06), transparent 60%),
      #faf7f0;
  }

  /* ─── Theme toggle ─────────────────────────────────────────────── */
  .theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    border-radius: 4px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: border-color 200ms, color 200ms, background 200ms, transform 200ms;
  }
  .page[data-theme='dark'] .theme-toggle {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #f4f4f2;
  }
  .page[data-theme='light'] .theme-toggle {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(20, 20, 20, 0.14);
    color: #1a1a1a;
  }
  .theme-toggle:hover {
    border-color: #e30613;
    color: #e30613;
    transform: translateY(-1px);
  }
  .theme-toggle svg {
    width: 14px;
    height: 14px;
  }

  .page-head {
    max-width: 880px;
    margin: 0 auto 72px;
    text-align: center;
  }
  .page-eyebrow {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .page[data-theme='dark'] .page-eyebrow { color: #f4f4f2; }
  .page[data-theme='light'] .page-eyebrow { color: #1a1a1a; }
  .page-eyebrow .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #e30613;
    border-radius: 50%;
    margin-right: 10px;
    box-shadow: 0 0 12px #e30613;
  }
  .page-title {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.025em;
    font-size: clamp(36px, 5.5vw, 64px);
    line-height: 1;
    margin: 0 0 20px;
  }
  .page-title em {
    color: #e30613;
    font-style: italic;
  }
  .page-lead {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }
  .page[data-theme='dark'] .page-lead { color: #a8a8a4; }
  .page[data-theme='light'] .page-lead { color: #5a5a5a; }
  .page-lead code {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .page[data-theme='dark'] .page-lead code {
    background: rgba(255, 255, 255, 0.06);
    color: #f4f4f2;
  }
  .page[data-theme='light'] .page-lead code {
    background: rgba(20, 20, 20, 0.06);
    color: #1a1a1a;
  }

  /* ─── Per-variant section frame ──────────────────────────────────── */
  .variant {
    max-width: 1400px;
    margin: 0 auto 96px;
  }
  .variant:last-of-type {
    margin-bottom: 0;
  }
  .variant-head {
    margin-bottom: 36px;
    padding-bottom: 28px;
  }
  .page[data-theme='dark'] .variant-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  }
  .page[data-theme='light'] .variant-head {
    border-bottom: 1px solid rgba(20, 20, 20, 0.10);
  }
  .variant-label {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .variant-tag {
    padding: 4px 10px;
    background: #e30613;
    color: white;
    font-weight: 700;
    border-radius: 2px;
  }
  .page[data-theme='dark'] .variant-route { color: #a8a8a4; }
  .page[data-theme='light'] .variant-route { color: #5a5a5a; }
  .variant-title {
    margin: 0 0 12px;
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 800;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    font-size: clamp(22px, 3vw, 32px);
  }
  .page[data-theme='dark'] .variant-title { color: #f4f4f2; }
  .page[data-theme='light'] .variant-title { color: #1a1a1a; }
  .variant-notes {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    max-width: 720px;
  }
  .page[data-theme='dark'] .variant-notes { color: #a8a8a4; }
  .page[data-theme='light'] .variant-notes { color: #5a5a5a; }

  /* Shared helpers for cards (mirrors num-value / arrow from source pages) */
  .num-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-feature-settings: 'tnum' 1;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-style: normal;
  }
  .arrow {
    display: inline-block;
    transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  a:hover .arrow {
    transform: translateX(4px);
  }

  /* ───────────────────────────────────────────────────────────────── */
  /* ─── V1 — /stand ───────────────────────────────────────────────── */
  /* ───────────────────────────────────────────────────────────────── */
  .v1-site {
    --acc: #e30613;
  }
  .v1-site[data-theme='dark'] {
    --bg-1: #0e0e12;
    --bg-2: #15151a;
    --text: #f4f4f2;
    --muted: #a8a8a4;
    --faint: #6e6f73;
    --line: rgba(255, 255, 255, 0.08);
    --line-strong: rgba(255, 255, 255, 0.16);
  }
  .v1-site[data-theme='light'] {
    --bg-1: #ffffff;
    --bg-2: #f0ede5;
    --text: #1a1a1a;
    --muted: #5a5a5a;
    --faint: #8a8a8a;
    --line: rgba(20, 20, 20, 0.10);
    --line-strong: rgba(20, 20, 20, 0.22);
  }
  .v1-site .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 24px;
  }
  .v1-site .vcard {
    position: relative;
    display: block;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    color: inherit;
    text-decoration: none;
    transition: transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 280ms, box-shadow 380ms;
  }
  .v1-site .vcard:hover {
    transform: translateY(-6px);
    border-color: var(--line-strong);
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  }
  .v1-site .vcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    overflow: hidden;
    background: var(--bg-2);
  }
  .v1-site .vcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .v1-site .vcard:hover .vcard-photo img {
    transform: scale(1.08);
  }
  .v1-site .vcard-tag {
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
  .v1-site .vcard-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.12) 50%, transparent 70%);
    transition: left 800ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .v1-site .vcard:hover .vcard-shine {
    left: 150%;
  }
  .v1-site .vcard-body {
    padding: 20px 22px 22px;
  }
  .v1-site .vcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .v1-site .vcard-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 800;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    font-size: 24px;
    line-height: 1;
    margin: 0 0 14px;
    transition: color 180ms;
    color: var(--text);
  }
  .v1-site .vcard:hover .vcard-model {
    color: var(--acc);
  }
  .v1-site .vcard-specs {
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
  .v1-site .vcard-specs .dot {
    display: inline-block;
    width: 3px;
    height: 3px;
    background: var(--faint);
    border-radius: 50%;
  }
  .v1-site .vcard-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .v1-site .vcard-price {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 24px;
    letter-spacing: -0.02em;
    color: var(--acc);
  }
  .v1-site .vcard-cta {
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
  .v1-site .vcard:hover .vcard-cta {
    color: var(--text);
  }

  /* ───────────────────────────────────────────────────────────────── */
  /* ─── V2 — /stand-v2 ────────────────────────────────────────────── */
  /* ───────────────────────────────────────────────────────────────── */
  .v2-site {
    --red: #e30613;
    --amber: #e0a040;
    --r-card: 6.6px;
    --r-chip: 0px;
    --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .v2-site[data-theme='dark'] {
    --bg-1: #131316;
    --bg-2: #1b1c20;
    --text: #f4f4f2;
    --muted: #a8a8a4;
    --faint: #6e6f73;
    --border: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.22);
    --overlay-bg: rgba(10, 10, 11, 0.78);
    --img-filter: brightness(0.92);
    --img-filter-hover: brightness(1);
  }
  .v2-site[data-theme='light'] {
    --bg-1: #ffffff;
    --bg-2: #f0ede5;
    --text: #1a1a1a;
    --muted: #5a5a5a;
    --faint: #8a8a8a;
    --border: rgba(20, 20, 20, 0.10);
    --border-strong: rgba(20, 20, 20, 0.22);
    --overlay-bg: rgba(255, 255, 255, 0.86);
    --img-filter: brightness(1);
    --img-filter-hover: brightness(1.04);
  }
  .v2-site .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    gap: 20px;
  }
  .v2-site .vcard {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
    color: inherit;
    text-decoration: none;
    transition: border-color 240ms, box-shadow 360ms, transform 360ms var(--ease);
    will-change: transform;
    transform-style: preserve-3d;
  }
  .v2-site .vcard:hover {
    border-color: var(--border-strong);
    box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(227, 6, 19, 0.1);
  }
  .v2-site .vcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    background: var(--bg-2);
    overflow: hidden;
  }
  .v2-site .vcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms var(--ease), filter 320ms;
    filter: var(--img-filter);
  }
  .v2-site .vcard:hover .vcard-photo img {
    transform: scale(1.08);
    filter: var(--img-filter-hover);
  }
  .v2-site .vcard-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.14) 50%, transparent 70%);
    transition: left 800ms var(--ease);
    pointer-events: none;
  }
  .v2-site .vcard:hover .vcard-shine {
    left: 150%;
  }
  .v2-site .vcard-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .v2-site .vbadge {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background: var(--overlay-bg);
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
  .v2-site .vbadge-red {
    background: var(--red);
    color: white;
    border-color: var(--red);
  }
  .v2-site .vbadge-amber {
    background: var(--amber);
    color: #1c1408;
    border-color: var(--amber);
  }
  .v2-site .vcard-live {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: var(--overlay-bg);
    border: 1px solid var(--border);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--text);
  }
  .v2-site .live-pulse {
    width: 7px;
    height: 7px;
    background: #34c480;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(52, 196, 128, 0.7);
    animation: v2-live-pulse 1.8s var(--ease) infinite;
  }
  @keyframes v2-live-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 196, 128, 0.6); }
    50% { box-shadow: 0 0 0 5px rgba(52, 196, 128, 0); }
  }
  .v2-site .vcard-body {
    padding: 20px 22px 22px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .v2-site .vcard-head {
    margin-bottom: 18px;
  }
  .v2-site .vcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .v2-site .vcard-model {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 21px;
    line-height: 1.2;
    color: var(--text);
    transition: color 180ms;
    margin: 0;
  }
  .v2-site .vcard:hover .vcard-model {
    color: var(--red);
  }
  .v2-site .vcard-trim {
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
  .v2-site .vcard-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
    padding: 16px 0;
    margin-bottom: 18px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .v2-site .spec-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .v2-site .spec-row .spec-icon {
    color: var(--text);
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .v2-site .spec-row .spec-icon svg {
    width: 22px;
    height: 22px;
  }
  .v2-site .spec-row .spec-sep {
    width: 1.5px;
    height: 22px;
    background: var(--red);
    flex: 0 0 1.5px;
  }
  .v2-site .spec-row .spec-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  .v2-site .vcard-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  }
  .v2-site .vcard-pricing {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .v2-site .vcard-monthly {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .v2-site .vcard-monthly .from {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .v2-site .vcard-monthly .amount {
    font-size: 26px;
    color: var(--red);
    letter-spacing: -0.02em;
  }
  .v2-site .vcard-monthly .amount small {
    font-size: 13px;
    color: var(--muted);
    font-weight: 600;
  }
  .v2-site .vcard-total {
    margin-top: 4px;
    font-size: 11.5px;
    color: var(--faint);
  }
  .v2-site .vcard-cta {
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
  .v2-site .vcard:hover .vcard-cta {
    color: var(--red);
  }

  /* ───────────────────────────────────────────────────────────────── */
  /* ─── V3 — /stand-v3 (editorial light) ─────────────────────────── */
  /* ───────────────────────────────────────────────────────────────── */
  .v3-site {
    --red: #e30613;
    --r-card: 8px;
    --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .v3-site[data-theme='dark'] {
    --amber: #e0a040;
    --bg-2: #1d1e23;
    --bg-card: #14141a;
    --text: #f4f4f2;
    --muted: #a8a8a4;
    --faint: #6e6f73;
    --border: rgba(255, 255, 255, 0.10);
    --border-strong: rgba(255, 255, 255, 0.20);
    --shadow-2: 0 16px 40px -16px rgba(0, 0, 0, 0.6);
    --vbadge-bg: rgba(20, 20, 25, 0.78);
  }
  .v3-site[data-theme='light'] {
    --amber: #c8851a;
    --bg-2: #f0ede5;
    --bg-card: #ffffff;
    --text: #1a1a1a;
    --muted: #5a5a5a;
    --faint: #8a8a8a;
    --border: rgba(20, 20, 20, 0.10);
    --border-strong: rgba(20, 20, 20, 0.22);
    --shadow-2: 0 16px 40px -16px rgba(20, 20, 20, 0.18);
    --vbadge-bg: rgba(255, 255, 255, 0.92);
  }
  .v3-site .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 20px;
  }
  .v3-site .vcard {
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--r-card);
    overflow: hidden;
    color: var(--text);
    text-decoration: none;
    transition: transform 320ms var(--ease), border-color 240ms, box-shadow 320ms;
  }
  .v3-site .vcard:hover {
    transform: translateY(-4px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-2);
  }
  .v3-site .vcard-photo {
    position: relative;
    aspect-ratio: 16 / 11;
    background: var(--bg-2);
    overflow: hidden;
  }
  .v3-site .vcard-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 600ms var(--ease);
  }
  .v3-site .vcard:hover .vcard-photo img {
    transform: scale(1.05);
  }
  .v3-site .vcard-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .v3-site .vbadge {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background: var(--vbadge-bg);
    color: var(--text);
    border: 1px solid var(--border);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .v3-site .vbadge-red {
    background: var(--red);
    color: white;
    border-color: var(--red);
  }
  .v3-site .vbadge-amber {
    background: var(--amber);
    color: #14110a;
    border-color: var(--amber);
  }
  .v3-site .vcard-body {
    padding: 22px 22px 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .v3-site .vcard-brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .v3-site .vcard-model {
    font-family: 'Antonio', 'Barlow Condensed', sans-serif;
    font-weight: 600;
    font-size: 26px;
    line-height: 1.05;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.005em;
    transition: color 180ms;
    margin: 0;
  }
  .v3-site .vcard:hover .vcard-model {
    color: var(--red);
  }
  .v3-site .vcard-trim {
    margin-top: 4px;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 16px;
  }
  .v3-site .vcard-specs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 0;
    margin-bottom: 16px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    font-size: 12.5px;
    color: var(--muted);
  }
  .v3-site .vsep {
    width: 3px;
    height: 3px;
    background: var(--faint);
    border-radius: 50%;
  }
  .v3-site .vspec {
    line-height: 1;
  }
  .v3-site .vcard-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  }
  .v3-site .vcard-pricing {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .v3-site .vcard-monthly {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .v3-site .vcard-monthly .from {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .v3-site .vcard-monthly .amount {
    font-size: 24px;
    color: var(--red);
    line-height: 1;
  }
  .v3-site .vcard-monthly .amount small {
    font-size: 12px;
    color: var(--muted);
    font-weight: 600;
  }
  .v3-site .vcard-total {
    margin-top: 4px;
    font-size: 11.5px;
    color: var(--faint);
  }
  .v3-site .vcard-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text);
  }
  .v3-site .vcard:hover .vcard-cta {
    color: var(--red);
  }

  /* ─── Reduced motion ──────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .page,
    .page * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
