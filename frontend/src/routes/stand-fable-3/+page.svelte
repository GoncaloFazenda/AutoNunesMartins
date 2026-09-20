<!--
  ════════════════════════════════════════════════════════════════════════
  AUTO NUNES MARTINS · SITE PÚBLICO — VERSÃO "PISTA"  (/stand-fable-3)
  ════════════════════════════════════════════════════════════════════════
  Direção: cinematográfica, escuro por defeito, arestas vivas, energia.
    · Grafite profundo + vermelho do logo com brilho · hairlines precisas
    · Display Barlow 900 ITÁLICO maiúsculo (eco direto do wordmark)
    · Números e etiquetas em mono (precisão de oficina)
  Cards clicáveis → /stand-fable-3/[id]. Tema escuro/claro próprio.
  Self-contained: apagar a pasta /stand-fable-3 remove tudo.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { VEHICLES, CONTACT, MAX_PRICE, eur, fmtKm, monthlyFrom } from './data';

  // ── Tema (escuro por defeito) ──
  let isDark = $state(true);
  onMount(() => {
    isDark = localStorage.getItem('sf3-theme') !== 'light';
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('show')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('sf3-theme', isDark ? 'dark' : 'light');
  }

  // ── Filtros ──
  let q = $state('');
  let fuel = $state('todos');
  let maxPrice = $state(Math.ceil(MAX_PRICE / 500) * 500);
  let sort = $state('rel');

  const fuels = ['todos', 'Gasolina', 'Diesel', 'Híbrido', 'GPL / Gasolina'];

  const list = $derived(
    VEHICLES.filter(
      (v) =>
        `${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q.trim().toLowerCase()) &&
        v.price <= maxPrice &&
        (fuel === 'todos' || v.fuel === fuel),
    ).sort((a, b) =>
      sort === 'price-asc' ? a.price - b.price
      : sort === 'price-desc' ? b.price - a.price
      : sort === 'year' ? b.year - a.year
      : sort === 'km' ? a.km - b.km
      : 0,
    ),
  );

  const brands = ['Volkswagen', 'Renault', 'Opel', 'Toyota', 'Nissan', 'Peugeot', 'Seat', 'Ford', 'Fiat', 'Dacia'];

  const stats = [
    { n: '15+', l: 'anos de estrada' },
    { n: '120', l: 'pontos de revisão' },
    { n: '18', l: 'meses de garantia' },
    { n: '24h', l: 'resposta de crédito' },
  ];

  const commitments = [
    { n: '01', t: 'Transparência total', d: 'O relatório da revisão de 120 pontos é entregue em mãos antes de qualquer negócio. O que o carro tem — e o que já teve — está lá escrito.' },
    { n: '02', t: 'Preço fechado', d: 'O preço anunciado é o preço final. Sem "despesas administrativas" à última hora, sem extras obrigatórios, sem teatro de descontos.' },
    { n: '03', t: 'Garantia que funciona', d: '18 meses de garantia em todos os carros, com oficina de confiança. Se algo falhar, resolve-se — não se discute.' },
    { n: '04', t: 'Pós-venda que atende', d: 'O nosso número continua a atender depois de entregarmos as chaves. É assim que os clientes voltam — e trazem a família.' },
  ];
</script>

{#snippet swoosh(cls: string)}
  <svg class={cls} viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 28C24 10 52 2 74 8c14 4 28 12 40 10-8 8-26 11-42 6C56 18 30 16 6 28Z" fill="#E2231A" />
    <path d="M2 38c18-7 44-8 66-2-22-2-48-1-66 2Z" fill="currentColor" opacity="0.5" />
  </svg>
{/snippet}

{#snippet wordmark()}
  <span class="leading-none select-none">
    <span class="block font-display font-black italic text-[17px] tracking-tight uppercase">
      <span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES&nbsp;MARTINS</span>
    </span>
    <span class="block font-mono text-[7.5px] tracking-[0.42em] uppercase text-[var(--faint)] mt-1">Comércio de Automóveis</span>
  </span>
{/snippet}

<svelte:head>
  <title>Auto Nunes Martins — Usados a sério, dos 5.000€ aos 20.000€</title>
  <meta
    name="description"
    content="Stand de automóveis usados revistos em 120 pontos, garantia de 18 meses e preço fechado. Dos 5.000€ aos 20.000€. Auto Nunes Martins — comércio de automóveis."
  />
</svelte:head>

<div class="sf3 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased">

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/88 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 h-[70px] flex items-center justify-between gap-6">
        <a href="/stand-fable-3" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
          {@render wordmark()}
        </a>
        <nav class="hidden lg:flex items-center gap-9 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          <a href="#stock" class="hover:text-[var(--red)] transition-colors">Stock</a>
          <a href="#compromisso" class="hover:text-[var(--red)] transition-colors">Compromisso</a>
          <a href="#financiamento" class="hover:text-[var(--red)] transition-colors">Financiamento</a>
          <a href="#contactos" class="hover:text-[var(--red)] transition-colors">Contactos</a>
        </nav>
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            onclick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
            class="w-10 h-10 border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--red)] transition-colors"
          >
            {#if isDark}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            {/if}
          </button>
          <a
            href={CONTACT.phoneHref}
            class="hidden sm:inline-flex items-center gap-2.5 bg-[var(--red)] text-white px-5 h-10 font-display font-black italic uppercase text-[13px] tracking-wide hover:bg-[var(--red-d)] transition-colors shadow-[0_0_28px_-6px_rgba(226,35,26,.55)]"
          >{CONTACT.phone}</a>
        </div>
      </div>
    </header>

    <!-- ══ HERO ══ -->
    <section class="relative overflow-hidden border-b border-[var(--line)]">
      <!-- linhas de velocidade -->
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute top-[18%] -left-20 w-[55%] h-[2px] bg-gradient-to-r from-transparent via-[var(--red)]/60 to-transparent -rotate-[8deg]"></div>
        <div class="absolute top-[30%] -left-32 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-[var(--red)]/30 to-transparent -rotate-[8deg]"></div>
        <div class="absolute -top-32 right-[-12%] w-[36rem] h-[36rem] rounded-full bg-[var(--red)]/10 blur-[120px]"></div>
      </div>

      <div class="mx-auto max-w-[1480px] px-5 md:px-9 pt-16 md:pt-24 pb-12 md:pb-16 relative">
        <p class="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted)]">
          <span class="text-[var(--red)]">//</span> Comércio de automóveis · usados revistos
        </p>
        <h1 class="font-display font-black italic uppercase text-[clamp(3rem,9vw,7.5rem)] leading-[0.88] tracking-tight mt-5">
          Usados<br />a sério<span class="text-[var(--red)] not-italic">.</span>
        </h1>
        <p class="text-[15.5px] md:text-[17px] text-[var(--muted)] max-w-xl leading-relaxed mt-6">
          Dos <strong class="text-[var(--ink)] font-semibold">5.000€ aos 20.000€</strong> — todos revistos em 120 pontos,
          todos com <strong class="text-[var(--ink)] font-semibold">18 meses de garantia</strong>, todos com preço fechado.
          A sério quer dizer isto.
        </p>

        <!-- stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] mt-12 max-w-3xl">
          {#each stats as s (s.l)}
            <div class="bg-[var(--bg)] px-5 py-4">
              <p class="font-display font-black italic text-[26px] leading-none text-[var(--red)]">{s.n}</p>
              <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mt-2">{s.l}</p>
            </div>
          {/each}
        </div>

        <!-- rail de pesquisa -->
        <div class="mt-12 bg-[var(--panel)] border border-[var(--line)] p-5 md:p-6 grid md:grid-cols-12 gap-5 items-end shadow-[0_30px_70px_-40px_rgba(0,0,0,.6)]">
          <label class="md:col-span-4 block">
            <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] block mb-2">Pesquisa</span>
            <input
              type="search"
              bind:value={q}
              placeholder="Marca ou modelo…"
              class="w-full h-12 bg-[var(--bg)] border border-[var(--line)] px-4 text-[14px] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--red)] transition-colors"
            />
          </label>
          <label class="md:col-span-3 block">
            <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] block mb-2">Combustível</span>
            <select bind:value={fuel} class="w-full h-12 bg-[var(--bg)] border border-[var(--line)] px-3.5 text-[13.5px] text-[var(--ink)] focus:outline-none focus:border-[var(--red)]">
              {#each fuels as f (f)}
                <option value={f}>{f === 'todos' ? 'Todos' : f}</option>
              {/each}
            </select>
          </label>
          <div class="md:col-span-3">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Preço máx.</span>
              <span class="font-mono text-[12px] text-[var(--red)] font-semibold">≤ {eur(maxPrice)}</span>
            </div>
            <input type="range" min="6000" max={Math.ceil(MAX_PRICE / 500) * 500} step="500" bind:value={maxPrice} class="w-full accent-[var(--red)] h-12" aria-label="Preço máximo" />
          </div>
          <a
            href="#stock"
            class="md:col-span-2 inline-flex items-center justify-center gap-2 h-12 bg-[var(--red)] text-white font-display font-black italic uppercase text-[13.5px] tracking-wide hover:bg-[var(--red-d)] transition-colors"
          >
            {list.length} {list.length === 1 ? 'carro' : 'carros'} ↓
          </a>
        </div>
      </div>

      <!-- marquee de marcas -->
      <div class="border-t border-[var(--line)] overflow-hidden py-3.5 select-none" aria-hidden="true">
        <div class="marquee flex gap-12 w-max">
          {#each [...brands, ...brands] as b, i (i)}
            <span class="font-display font-black italic uppercase text-[15px] tracking-wide text-[var(--faint)] whitespace-nowrap">
              {b} <span class="text-[var(--red)] not-italic ml-10">/</span>
            </span>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ STOCK ══ -->
    <section id="stock" class="scroll-mt-20">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 py-14 md:py-20">
        <div class="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted)]"><span class="text-[var(--red)]">//</span> Stock atual</p>
            <h2 class="font-display font-black italic uppercase text-[clamp(2rem,4.6vw,3.4rem)] leading-none tracking-tight mt-3">
              {list.length} em pista<span class="text-[var(--red)] not-italic">.</span>
            </h2>
          </div>
          <select bind:value={sort} aria-label="Ordenar" class="h-11 bg-[var(--panel)] border border-[var(--line)] px-3.5 font-mono text-[11.5px] uppercase tracking-wider text-[var(--muted)] focus:outline-none focus:border-[var(--red)]">
            <option value="rel">Relevância</option>
            <option value="price-asc">Preço ↑</option>
            <option value="price-desc">Preço ↓</option>
            <option value="year">Ano recente</option>
            <option value="km">Menos kms</option>
          </select>
        </div>

        {#if list.length === 0}
          <div class="border border-dashed border-[var(--line)] bg-[var(--panel)] p-14 text-center" transition:fade>
            <p class="font-display font-black italic uppercase text-[24px]">Sem resultados<span class="text-[var(--red)] not-italic">.</span></p>
            <p class="text-[14px] text-[var(--muted)] mt-3 max-w-md mx-auto">Afrouxe os filtros — ou diga-nos o que procura e nós vamos buscá-lo ao mercado.</p>
            <div class="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" onclick={() => { q = ''; fuel = 'todos'; maxPrice = Math.ceil(MAX_PRICE / 500) * 500; }} class="border border-[var(--line)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:border-[var(--red)] transition-colors">Limpar filtros</button>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="bg-[var(--red)] text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-[var(--red-d)] transition-colors">Pedir por WhatsApp</a>
            </div>
          </div>
        {:else}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
            {#each list as v (v.id)}
              <a href="/stand-fable-3/{v.id}" class="rise group relative flex flex-col bg-[var(--bg)] hover:bg-[var(--panel)] transition-colors">
                <div class="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={v.gallery[0]}
                    alt="{v.brand} {v.model} {v.trim}"
                    class="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity"></div>
                  {#if v.tag}
                    <span class="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white bg-black/55 backdrop-blur px-3 py-1.5">
                      <span class="text-[var(--red)]">//</span> {v.tag}
                    </span>
                  {/if}
                </div>
                <div class="flex flex-col gap-3.5 p-6 grow">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="font-display font-black italic uppercase text-[19px] tracking-tight leading-tight">{v.brand} {v.model}</h3>
                      <p class="text-[12.5px] text-[var(--muted)] mt-1">{v.trim}</p>
                    </div>
                    <span class="w-9 h-9 shrink-0 border border-[var(--line)] grid place-items-center text-[var(--muted)] group-hover:bg-[var(--red)] group-hover:border-[var(--red)] group-hover:text-white transition-colors" aria-hidden="true">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                    </span>
                  </div>
                  <p class="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                    {v.year} <span class="text-[var(--red)]">/</span> {fmtKm(v.km)} <span class="text-[var(--red)]">/</span> {v.fuel} <span class="text-[var(--red)]">/</span> {v.power} cv
                  </p>
                  <div class="mt-auto pt-4 border-t border-[var(--line)] flex items-end justify-between gap-3">
                    <p class="font-display font-black italic text-[24px] leading-none">{eur(v.price)}</p>
                    <p class="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--faint)]">desde {eur(monthlyFrom(v.price))}/mês*</p>
                  </div>
                </div>
                <!-- hairline vermelho que cresce no hover -->
                <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--red)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" aria-hidden="true"></span>
              </a>
            {/each}
          </div>
          <p class="font-mono text-[10.5px] text-[var(--faint)] mt-4">* Simulação indicativa a 84 meses, sujeita a aprovação de crédito.</p>
        {/if}
      </div>
    </section>

    <!-- ══ COMPROMISSO ══ -->
    <section id="compromisso" class="border-t border-[var(--line)] bg-[var(--panel)] scroll-mt-20">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 py-14 md:py-20">
        <p class="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted)]"><span class="text-[var(--red)]">//</span> O nosso compromisso</p>
        <h2 class="font-display font-black italic uppercase text-[clamp(2rem,4.6vw,3.4rem)] leading-none tracking-tight mt-3 max-w-3xl">
          Vender barato não é desculpa para vender mal<span class="text-[var(--red)] not-italic">.</span>
        </h2>
        <div class="mt-12 border-t border-[var(--line)]">
          {#each commitments as c (c.n)}
            <article class="rise grid md:grid-cols-12 gap-4 md:gap-8 items-start py-7 border-b border-[var(--line)] group">
              <span class="md:col-span-2 font-display font-black italic text-[clamp(2rem,4vw,3rem)] leading-none text-[var(--line-strong)] group-hover:text-[var(--red)] transition-colors">{c.n}</span>
              <h3 class="md:col-span-4 font-display font-black italic uppercase text-[19px] tracking-tight pt-1.5">{c.t}</h3>
              <p class="md:col-span-6 text-[14.5px] text-[var(--muted)] leading-relaxed pt-1.5 max-w-xl">{c.d}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ FINANCIAMENTO + RETOMA ══ -->
    <section id="financiamento" class="border-t border-[var(--line)] scroll-mt-20">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 py-14 md:py-20 grid lg:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
        <div class="rise bg-[var(--panel)] p-8 md:p-12 relative overflow-hidden">
          <span class="absolute top-0 left-0 w-14 h-[3px] bg-[var(--red)]" aria-hidden="true"></span>
          <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Financiamento</p>
          <h2 class="font-display font-black italic uppercase text-[clamp(1.5rem,2.8vw,2.1rem)] tracking-tight mt-3">Resposta em 24 horas<span class="text-[var(--red)] not-italic">.</span></h2>
          <p class="text-[14.5px] text-[var(--muted)] leading-relaxed mt-4 max-w-md">
            Trabalhamos com várias financeiras e pedimos as propostas por si. Prazos até 84 meses,
            entrada zero possível, e a simulação que mostramos é a real — não a de marketing.
          </p>
          <a href={CONTACT.phoneHref} class="inline-flex items-center gap-2.5 mt-7 bg-[var(--red)] text-white px-6 h-11 items-center font-display font-black italic uppercase text-[13px] tracking-wide hover:bg-[var(--red-d)] transition-colors">
            Simular já
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
          </a>
        </div>
        <div class="rise bg-[var(--panel)] p-8 md:p-12 relative overflow-hidden">
          <span class="absolute top-0 left-0 w-14 h-[3px] bg-[var(--red)]" aria-hidden="true"></span>
          <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Retoma</p>
          <h2 class="font-display font-black italic uppercase text-[clamp(1.5rem,2.8vw,2.1rem)] tracking-tight mt-3">O seu carro vale entrada<span class="text-[var(--red)] not-italic">.</span></h2>
          <p class="text-[14.5px] text-[var(--muted)] leading-relaxed mt-4 max-w-md">
            Avaliamos o seu usado na hora, com base no mercado real. O valor é descontado
            diretamente no carro que escolher — e tratamos nós da papelada da transferência.
          </p>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 mt-7 border border-[var(--line-strong)] px-6 h-11 items-center font-display font-black italic uppercase text-[13px] tracking-wide hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">
            Pedir avaliação
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER ══ -->
    <footer id="contactos" class="border-t border-[var(--line)] overflow-hidden scroll-mt-20">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 pt-14 md:pt-20 pb-8">
        <div class="grid lg:grid-cols-12 gap-10">
          <div class="lg:col-span-5">
            <div class="flex items-center gap-3">
              <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
              {@render wordmark()}
            </div>
            <p class="text-[13.5px] text-[var(--muted)] leading-relaxed mt-5 max-w-sm">
              Comércio de automóveis usados revistos e com garantia, dos 5.000€ aos 20.000€.
              Preço fechado, palavra dada.
            </p>
          </div>
          <div class="lg:col-span-3">
            <h3 class="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--faint)] mb-4">Contactos</h3>
            <ul class="space-y-2.5 text-[14px] text-[var(--muted)]">
              <li><a href={CONTACT.phoneHref} class="hover:text-[var(--red)] transition-colors font-semibold text-[var(--ink)]">{CONTACT.phone}</a></li>
              <li><a href="mailto:{CONTACT.email}" class="hover:text-[var(--red)] transition-colors">{CONTACT.email}</a></li>
              <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="hover:text-[var(--red)] transition-colors">WhatsApp</a></li>
            </ul>
          </div>
          <div class="lg:col-span-4">
            <h3 class="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--faint)] mb-4">Stand</h3>
            <p class="text-[14px] text-[var(--muted)] leading-relaxed">{CONTACT.address}</p>
            <p class="text-[14px] text-[var(--muted)] leading-relaxed mt-2">{CONTACT.hours}</p>
          </div>
        </div>
      </div>
      <!-- wordmark gigante -->
      <p class="font-display font-black italic uppercase text-[clamp(3.5rem,11vw,9rem)] leading-[0.8] tracking-tight whitespace-nowrap text-[var(--ghost)] select-none px-5 md:px-9 translate-y-[18%]" aria-hidden="true">
        Nunes Martins
      </p>
      <div class="border-t border-[var(--line)] relative bg-[var(--bg)]">
        <div class="mx-auto max-w-[1480px] px-5 md:px-9 h-14 flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
          <p>© {new Date().getFullYear()} Auto Nunes Martins</p>
          <p>Livro de Reclamações · Privacidade</p>
        </div>
      </div>
    </footer>
  </div>
</div>

<style>
  .sf3 {
    --bg: #f4f4f5;
    --panel: #ffffff;
    --ink: #16171b;
    --muted: #5c5e66;
    --faint: #9b9da6;
    --line: #e4e5e8;
    --line-strong: #c9cbd1;
    --ghost: rgba(22, 23, 27, 0.06);
    --red: #e2231a;
    --red-d: #c01d15;
    color-scheme: light;
  }
  .sf3.dark {
    --bg: #0b0c0e;
    --panel: #121316;
    --ink: #f4f4f6;
    --muted: #8e9097;
    --faint: #5d5f66;
    --line: #222329;
    --line-strong: #34363e;
    --ghost: rgba(244, 244, 246, 0.05);
    --red: #e2231a;
    --red-d: #f0382f;
    color-scheme: dark;
  }

  .marquee {
    animation: sf3-scroll 36s linear infinite;
  }
  @keyframes sf3-scroll {
    to {
      transform: translateX(-50%);
    }
  }

  .rise {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  :global(.sf3 .rise.show) {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .rise {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .marquee {
      animation: none;
    }
  }
</style>
