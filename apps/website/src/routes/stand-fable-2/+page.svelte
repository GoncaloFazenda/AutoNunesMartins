<!--
  ════════════════════════════════════════════════════════════════════════
  AUTO NUNES MARTINS · SITE PÚBLICO — VERSÃO "ASSINATURA"  (/stand-fable-2)
  ════════════════════════════════════════════════════════════════════════
  Direção: editorial, claro por defeito, acolhedor e de confiança.
    · Branco/papel + grafite do logótipo + vermelho usado com intenção
    · Cantos suaves, sombras leves, tipografia Barlow forte (eco do wordmark)
    · Navegação por ORÇAMENTO — pensada para a gama 5.000€–20.000€
  Cards clicáveis → /stand-fable-2/[id]. Tema claro/escuro próprio.
  Self-contained: apagar a pasta /stand-fable-2 remove tudo.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { VEHICLES, BUDGETS, CONTACT, eur, fmtKm, monthlyFrom, type BudgetId } from './data';

  // ── Tema (claro por defeito) ──
  let isDark = $state(false);
  onMount(() => {
    isDark = localStorage.getItem('sf2-theme') === 'dark';
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('show')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('sf2-theme', isDark ? 'dark' : 'light');
  }

  // ── Filtros ──
  let q = $state('');
  let budget = $state<BudgetId>('all');
  let fuel = $state('todos');
  let sort = $state('rel');

  const fuels = ['todos', 'Gasolina', 'Diesel', 'Híbrido', 'GPL / Gasolina'];

  const list = $derived.by(() => {
    const b = BUDGETS.find((x) => x.id === budget) ?? BUDGETS[0];
    return VEHICLES.filter(
      (v) =>
        `${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q.trim().toLowerCase()) &&
        v.price >= b.min &&
        v.price < b.max &&
        (fuel === 'todos' || v.fuel === fuel),
    ).sort((a, b2) =>
      sort === 'price-asc' ? a.price - b2.price
      : sort === 'price-desc' ? b2.price - a.price
      : sort === 'year' ? b2.year - a.year
      : sort === 'km' ? a.km - b2.km
      : 0,
    );
  });

  const featured = VEHICLES.find((v) => v.tag === 'Mais Procurado') ?? VEHICLES[0]!;

  function resetFilters() {
    q = '';
    budget = 'all';
    fuel = 'todos';
    sort = 'rel';
  }

  const pillars = [
    {
      t: 'Revisão de 120 pontos',
      d: 'Cada carro é verificado ponto por ponto na oficina antes de entrar no stand. O relatório é seu.',
      icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
      t: 'Garantia de 18 meses',
      d: 'Todos os carros saem com garantia incluída no preço. Sem letras pequenas, sem custos escondidos.',
      icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.96 11.96 0 0 1 3.6 6 12 12 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.62 5.176-1.33 9-6.028 9-11.62 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Z',
    },
    {
      t: 'Financiamento em 24h',
      d: 'Tratamos de tudo com várias financeiras e damos-lhe a resposta no próprio dia. Entrada zero possível.',
      icon: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
      t: 'Retoma do seu usado',
      d: 'Avaliamos o seu carro atual na hora e descontamos diretamente no negócio. Sem complicações.',
      icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    },
  ];

  const steps = [
    { n: '1', t: 'Escolha e marque', d: 'Veja o stock online e marque a visita por telefone ou WhatsApp. O carro fica reservado para si.' },
    { n: '2', t: 'Venha experimentar', d: 'Test-drive sem compromisso e relatório de revisão em mãos. Faça todas as perguntas — gostamos delas.' },
    { n: '3', t: 'Leve o carro', d: 'Tratamos do registo, seguro e financiamento. Na maioria dos casos, leva o carro no próprio dia.' },
  ];

  const testimonials = [
    { name: 'Marta S.', car: 'Renault Clio · 2021', text: 'Comprei o meu primeiro carro aqui e explicaram-me tudo com uma paciência enorme. Zero pressão, só ajuda.' },
    { name: 'João P.', car: 'Nissan Qashqai · 2019', text: 'Deram-me mais pela retoma do que dois stands grandes da zona. O negócio ficou fechado numa tarde.' },
    { name: 'Carla M.', car: 'Toyota Yaris · 2020', text: 'Apareceu um barulho ao fim de um mês — resolveram na garantia em dois dias, sem discussão. Recomendo.' },
  ];
</script>

{#snippet swoosh(cls: string)}
  <svg class={cls} viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M6 28C24 10 52 2 74 8c14 4 28 12 40 10-8 8-26 11-42 6C56 18 30 16 6 28Z"
      fill="#E2231A"
    />
    <path d="M2 38c18-7 44-8 66-2-22-2-48-1-66 2Z" fill="currentColor" opacity="0.5" />
  </svg>
{/snippet}

{#snippet wordmark()}
  <span class="leading-none select-none">
    <span class="block font-display font-black italic text-[17px] tracking-tight">
      <span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES&nbsp;MARTINS</span>
    </span>
    <span class="block text-[8px] tracking-[0.34em] uppercase text-[var(--faint)] mt-[3px]">Comércio de Automóveis</span>
  </span>
{/snippet}

<svelte:head>
  <title>Auto Nunes Martins — Carros usados revistos dos 5.000€ aos 20.000€</title>
  <meta
    name="description"
    content="Stand de automóveis usados com revisão de 120 pontos, garantia de 18 meses e financiamento em 24h. Carros entre 5.000€ e 20.000€. Auto Nunes Martins — comércio de automóveis."
  />
</svelte:head>

<div class="sf2 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased">

    <!-- ══ FAIXA DE CONFIANÇA ══ -->
    <div class="bg-[var(--ink-flip)] text-[var(--bg-flip)] text-[12px]">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 h-9 flex items-center justify-between gap-4">
        <p class="truncate opacity-80">{CONTACT.hours} · {CONTACT.address}</p>
        <a href={CONTACT.phoneHref} class="shrink-0 font-semibold hover:text-[var(--red)] transition-colors">{CONTACT.phone}</a>
      </div>
    </div>

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 h-[72px] flex items-center justify-between gap-6">
        <a href="/stand-fable-2" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
          {@render wordmark()}
        </a>
        <nav class="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-[var(--muted)]">
          <a href="#viaturas" class="hover:text-[var(--ink)] transition-colors">Viaturas</a>
          <a href="#vantagens" class="hover:text-[var(--ink)] transition-colors">Vantagens</a>
          <a href="#como-funciona" class="hover:text-[var(--ink)] transition-colors">Como funciona</a>
          <a href="#contactos" class="hover:text-[var(--ink)] transition-colors">Contactos</a>
        </nav>
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            onclick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
            class="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--red)] transition-colors"
          >
            {#if isDark}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            {/if}
          </button>
          <a
            href={CONTACT.phoneHref}
            class="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--red)] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[var(--red-d)] transition-colors shadow-[0_8px_24px_-10px_rgba(226,35,26,.55)]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
            {CONTACT.phone}
          </a>
        </div>
      </div>
    </header>

    <!-- ══ HERO ══ -->
    <section class="relative overflow-hidden">
      <div class="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-[var(--red)]/8 blur-[110px] pointer-events-none"></div>
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 pt-12 md:pt-20 pb-14 md:pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
        <div class="lg:col-span-7 flex flex-col gap-6">
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span class="w-8 h-[2px] bg-[var(--red)] rounded-full"></span> Stand de usados · Comércio de automóveis
          </span>
          <h1 class="font-display font-extrabold text-[clamp(2.4rem,5.4vw,4.1rem)] leading-[1.02] tracking-tight text-balance">
            O seu próximo carro,<br /><em class="not-italic text-[var(--red)]">sem surpresas.</em>
          </h1>
          <p class="text-[15.5px] md:text-[17px] text-[var(--muted)] max-w-xl leading-relaxed">
            Carros usados entre <strong class="text-[var(--ink)] font-semibold">5.000€ e 20.000€</strong>, todos revistos na nossa
            oficina e entregues com <strong class="text-[var(--ink)] font-semibold">garantia de 18 meses</strong>.
            O que vê no preço é o que paga.
          </p>

          <!-- pesquisa + orçamento -->
          <div class="flex flex-col gap-3 max-w-xl">
            <label class="relative block">
              <span class="sr-only">Pesquisar viatura</span>
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
              <input
                type="search"
                bind:value={q}
                placeholder="Procure por marca ou modelo — ex.: Clio, Yaris…"
                class="w-full h-[54px] rounded-2xl bg-[var(--surface)] border border-[var(--line)] pl-12 pr-4 text-[14.5px] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--red)]/10 transition shadow-sm"
              />
            </label>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por orçamento">
              {#each BUDGETS as b (b.id)}
                <a
                  href="#viaturas"
                  onclick={() => (budget = b.id)}
                  class="px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-colors
                    {budget === b.id
                      ? 'bg-[var(--red)] border-[var(--red)] text-white'
                      : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:border-[var(--red)] hover:text-[var(--ink)]'}"
                >{b.label}</a>
              {/each}
            </div>
          </div>

          <ul class="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--muted)] pt-1">
            {#each ['Garantia 18 meses incluída', 'Revisão de 120 pontos', 'Retoma na hora'] as item (item)}
              <li class="inline-flex items-center gap-2">
                <svg class="w-4 h-4 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                {item}
              </li>
            {/each}
          </ul>
        </div>

        <!-- destaque -->
        <div class="lg:col-span-5">
          <a
            href="/stand-fable-2/{featured.id}"
            class="group block rounded-3xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden shadow-[0_28px_60px_-32px_rgba(0,0,0,.35)] hover:-translate-y-1 transition-transform duration-300"
          >
            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                src={featured.gallery[0]}
                alt="{featured.brand} {featured.model} {featured.trim}"
                class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                loading="eager"
              />
              <span class="absolute top-4 left-4 rounded-full bg-[var(--red)] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">
                Carro da semana
              </span>
            </div>
            <div class="p-5 flex items-end justify-between gap-4">
              <div>
                <h2 class="font-display font-extrabold text-[19px] tracking-tight">{featured.brand} {featured.model}</h2>
                <p class="text-[13px] text-[var(--muted)] mt-0.5">{featured.trim} · {featured.year} · {fmtKm(featured.km)}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-display font-extrabold text-[22px] text-[var(--red)] leading-none">{eur(featured.price)}</p>
                <p class="text-[11.5px] text-[var(--faint)] mt-1">desde {eur(monthlyFrom(featured.price))}/mês*</p>
              </div>
            </div>
          </a>
          <p class="mt-4 text-center text-[12px] text-[var(--faint)]">
            * Simulação indicativa a 84 meses, sujeita a aprovação de crédito.
          </p>
        </div>
      </div>
    </section>

    <!-- ══ STOCK ══ -->
    <section id="viaturas" class="border-t border-[var(--line)] bg-[var(--surface-2)] scroll-mt-20">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20">
        <div class="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span class="w-8 h-[2px] bg-[var(--red)] rounded-full"></span> Stock atual
            </span>
            <h2 class="font-display font-extrabold text-[clamp(1.7rem,3.2vw,2.4rem)] tracking-tight mt-2">
              {list.length} {list.length === 1 ? 'viatura disponível' : 'viaturas disponíveis'}
            </h2>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <select bind:value={fuel} aria-label="Filtrar por combustível" class="h-11 rounded-xl bg-[var(--surface)] border border-[var(--line)] px-3.5 text-[13px] font-medium text-[var(--muted)] focus:outline-none focus:border-[var(--red)]">
              {#each fuels as f (f)}
                <option value={f}>{f === 'todos' ? 'Combustível: todos' : f}</option>
              {/each}
            </select>
            <select bind:value={sort} aria-label="Ordenar" class="h-11 rounded-xl bg-[var(--surface)] border border-[var(--line)] px-3.5 text-[13px] font-medium text-[var(--muted)] focus:outline-none focus:border-[var(--red)]">
              <option value="rel">Ordenar: relevância</option>
              <option value="price-asc">Preço: mais baixo</option>
              <option value="price-desc">Preço: mais alto</option>
              <option value="year">Ano: mais recente</option>
              <option value="km">Kms: menos rodados</option>
            </select>
          </div>
        </div>

        {#if list.length === 0}
          <div class="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-12 text-center" transition:fade>
            <p class="font-display font-extrabold text-[20px]">Nenhuma viatura corresponde à pesquisa.</p>
            <p class="text-[14px] text-[var(--muted)] mt-2 max-w-md mx-auto">
              Experimente limpar os filtros — ou diga-nos o que procura e nós encontramos por si.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onclick={resetFilters} class="rounded-full border border-[var(--line)] px-5 py-2.5 text-[13px] font-semibold hover:border-[var(--red)] transition-colors">Limpar filtros</button>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="rounded-full bg-[var(--red)] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[var(--red-d)] transition-colors">Pedir por WhatsApp</a>
            </div>
          </div>
        {:else}
          <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {#each list as v (v.id)}
              <a
                href="/stand-fable-2/{v.id}"
                class="rise group flex flex-col rounded-3xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)] hover:border-[var(--red)]/40 transition-all duration-300"
              >
                <div class="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={v.gallery[0]}
                    alt="{v.brand} {v.model} {v.trim}"
                    class="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                    loading="lazy"
                  />
                  {#if v.tag}
                    <span class="absolute top-3.5 left-3.5 rounded-full bg-[var(--surface)]/92 backdrop-blur text-[var(--red)] text-[10.5px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[var(--red)]/25">
                      {v.tag}
                    </span>
                  {/if}
                </div>
                <div class="flex flex-col gap-3 p-5 grow">
                  <div>
                    <h3 class="font-display font-extrabold text-[18px] tracking-tight leading-snug">{v.brand} {v.model}</h3>
                    <p class="text-[13px] text-[var(--muted)] mt-0.5">{v.trim}</p>
                  </div>
                  <ul class="flex flex-wrap gap-1.5 text-[11.5px] font-medium text-[var(--muted)]">
                    {#each [String(v.year), fmtKm(v.km), v.fuel, v.transmission] as chip (chip)}
                      <li class="rounded-lg bg-[var(--chip)] px-2.5 py-1">{chip}</li>
                    {/each}
                  </ul>
                  <div class="mt-auto pt-3 border-t border-[var(--line)] flex items-end justify-between gap-3">
                    <div>
                      <p class="font-display font-extrabold text-[21px] leading-none">{eur(v.price)}</p>
                      <p class="text-[11.5px] text-[var(--faint)] mt-1">desde {eur(monthlyFrom(v.price))}/mês*</p>
                    </div>
                    <span class="w-10 h-10 shrink-0 rounded-full border border-[var(--line)] grid place-items-center text-[var(--muted)] group-hover:bg-[var(--red)] group-hover:border-[var(--red)] group-hover:text-white transition-colors" aria-hidden="true">
                      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                    </span>
                  </div>
                  <p class="text-[11.5px] text-[var(--muted)] inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Revisto · Garantia 18 meses incluída
                  </p>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <!-- ══ VANTAGENS ══ -->
    <section id="vantagens" class="border-t border-[var(--line)] scroll-mt-20">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20">
        <div class="max-w-2xl mb-10">
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span class="w-8 h-[2px] bg-[var(--red)] rounded-full"></span> Porquê comprar aqui
          </span>
          <h2 class="font-display font-extrabold text-[clamp(1.7rem,3.2vw,2.4rem)] tracking-tight mt-2 text-balance">
            Um usado só é um bom negócio quando não traz sustos.
          </h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {#each pillars as p (p.t)}
            <article class="rise rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6 flex flex-col gap-4">
              <span class="w-12 h-12 rounded-2xl bg-[var(--red)]/10 text-[var(--red)] grid place-items-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d={p.icon}/></svg>
              </span>
              <h3 class="font-display font-extrabold text-[16.5px] tracking-tight">{p.t}</h3>
              <p class="text-[13.5px] text-[var(--muted)] leading-relaxed">{p.d}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ COMO FUNCIONA ══ -->
    <section id="como-funciona" class="border-t border-[var(--line)] bg-[var(--surface-2)] scroll-mt-20">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20 grid lg:grid-cols-12 gap-12">
        <div class="lg:col-span-4">
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span class="w-8 h-[2px] bg-[var(--red)] rounded-full"></span> Simples de propósito
          </span>
          <h2 class="font-display font-extrabold text-[clamp(1.7rem,3.2vw,2.4rem)] tracking-tight mt-2 text-balance">
            Do clique às chaves em três passos.
          </h2>
          <p class="text-[14.5px] text-[var(--muted)] leading-relaxed mt-4">
            Sem burocracia desnecessária e sem o empurrão comercial do costume.
            Compramos e vendemos carros há mais de 15 anos — sabemos que a confiança
            é o que faz os clientes voltarem.
          </p>
        </div>
        <div class="lg:col-span-8 grid sm:grid-cols-3 gap-5">
          {#each steps as s (s.n)}
            <article class="rise rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6">
              <span class="font-display font-black italic text-[40px] leading-none text-[var(--red)]/90">{s.n}</span>
              <h3 class="font-display font-extrabold text-[16.5px] tracking-tight mt-4">{s.t}</h3>
              <p class="text-[13.5px] text-[var(--muted)] leading-relaxed mt-2">{s.d}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ RETOMA ══ -->
    <section class="border-t border-[var(--line)]">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20">
        <div class="rise relative overflow-hidden rounded-3xl bg-[var(--ink-flip)] text-[var(--bg-flip)] p-8 md:p-14">
          <div class="absolute -right-24 -bottom-32 w-[26rem] h-[26rem] rounded-full bg-[var(--red)]/25 blur-[100px] pointer-events-none"></div>
          <div class="relative grid lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-8">
              <h2 class="font-display font-extrabold text-[clamp(1.6rem,3vw,2.3rem)] tracking-tight text-balance">
                Tem um carro para dar à troca?
              </h2>
              <p class="text-[15px] opacity-75 leading-relaxed mt-3 max-w-xl">
                Avaliamos o seu carro atual na hora — com base no mercado real, não em tabelas pessimistas —
                e descontamos o valor diretamente no carro que escolher.
              </p>
            </div>
            <div class="lg:col-span-4 flex lg:justify-end">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2.5 rounded-full bg-[var(--red)] text-white px-7 py-3.5 text-[14px] font-semibold hover:bg-[var(--red-d)] transition-colors shadow-[0_14px_34px_-12px_rgba(226,35,26,.65)]"
              >
                Pedir avaliação grátis
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ TESTEMUNHOS ══ -->
    <section class="border-t border-[var(--line)] bg-[var(--surface-2)]">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-20">
        <div class="max-w-2xl mb-10">
          <span class="inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            <span class="w-8 h-[2px] bg-[var(--red)] rounded-full"></span> Quem já comprou
          </span>
          <h2 class="font-display font-extrabold text-[clamp(1.7rem,3.2vw,2.4rem)] tracking-tight mt-2">
            A palavra dos nossos clientes.
          </h2>
        </div>
        <div class="grid md:grid-cols-3 gap-5">
          {#each testimonials as t (t.name)}
            <figure class="rise rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6 flex flex-col gap-4">
              <div class="flex gap-1 text-[var(--red)]" aria-label="5 estrelas">
                {#each Array(5) as _, i (i)}
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.5c.16-.39.88-.39 1.04 0l2.13 5.11 5.51.44c.42.04.6.57.27.85l-4.2 3.6 1.28 5.38c.1.41-.35.74-.71.52L12 16.51l-4.8 2.9c-.36.21-.81-.12-.71-.53l1.28-5.38-4.2-3.6c-.32-.28-.15-.81.27-.85l5.52-.44 2.12-5.1Z"/></svg>
                {/each}
              </div>
              <blockquote class="text-[14px] leading-relaxed text-[var(--muted)]">"{t.text}"</blockquote>
              <figcaption class="mt-auto pt-3 border-t border-[var(--line)]">
                <p class="font-semibold text-[13.5px]">{t.name}</p>
                <p class="text-[12px] text-[var(--faint)]">{t.car}</p>
              </figcaption>
            </figure>
          {/each}
        </div>
      </div>
    </section>

    <!-- ══ CONTACTOS / FOOTER ══ -->
    <footer id="contactos" class="border-t border-[var(--line)] scroll-mt-20">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 py-14 md:py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
            {@render wordmark()}
          </div>
          <p class="text-[13.5px] text-[var(--muted)] leading-relaxed mt-4 max-w-xs">
            Comércio de automóveis usados revistos e com garantia,
            entre os 5.000€ e os 20.000€. Honestidade primeiro — sempre.
          </p>
        </div>
        <div>
          <h3 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--faint)] mb-4">Contactos</h3>
          <ul class="space-y-2.5 text-[14px] text-[var(--muted)]">
            <li><a href={CONTACT.phoneHref} class="hover:text-[var(--red)] transition-colors font-medium">{CONTACT.phone}</a></li>
            <li><a href="mailto:{CONTACT.email}" class="hover:text-[var(--red)] transition-colors">{CONTACT.email}</a></li>
            <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="hover:text-[var(--red)] transition-colors">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--faint)] mb-4">Onde estamos</h3>
          <p class="text-[14px] text-[var(--muted)] leading-relaxed">{CONTACT.address}</p>
          <p class="text-[14px] text-[var(--muted)] leading-relaxed mt-2">{CONTACT.hours}</p>
        </div>
        <div>
          <h3 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--faint)] mb-4">Navegação</h3>
          <ul class="space-y-2.5 text-[14px] text-[var(--muted)]">
            <li><a href="#viaturas" class="hover:text-[var(--red)] transition-colors">Viaturas</a></li>
            <li><a href="#vantagens" class="hover:text-[var(--red)] transition-colors">Vantagens</a></li>
            <li><a href="#como-funciona" class="hover:text-[var(--red)] transition-colors">Como funciona</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-[var(--line)]">
        <div class="mx-auto max-w-[1320px] px-5 md:px-8 h-14 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--faint)]">
          <p>© {new Date().getFullYear()} Auto Nunes Martins — Comércio de Automóveis</p>
          <p>Livro de Reclamações · Política de Privacidade</p>
        </div>
      </div>
    </footer>
  </div>
</div>

<style>
  .sf2 {
    --bg: #f6f6f7;
    --surface: #ffffff;
    --surface-2: #fbfbfc;
    --chip: #f1f1f3;
    --ink: #1a1b1e;
    --muted: #5c5e66;
    --faint: #9b9da6;
    --line: #e6e7ea;
    --red: #e2231a;
    --red-d: #c01d15;
    /* inversos — usados nos painéis "dark dentro do claro" */
    --ink-flip: #1a1b1e;
    --bg-flip: #f6f6f7;
    color-scheme: light;
  }
  .sf2.dark {
    --bg: #0f1012;
    --surface: #17181c;
    --surface-2: #131417;
    --chip: #1f2026;
    --ink: #f3f4f6;
    --muted: #a2a5ae;
    --faint: #6b6e78;
    --line: #26282e;
    --red: #e2231a;
    --red-d: #f0382f;
    --ink-flip: #f3f4f6;
    --bg-flip: #101114;
    color-scheme: dark;
  }

  /* reveal on scroll */
  .rise {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  :global(.sf2 .rise.show) {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .rise {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
