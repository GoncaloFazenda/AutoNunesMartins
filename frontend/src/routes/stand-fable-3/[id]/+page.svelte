<!--
  ════════════════════════════════════════════════════════════════════════
  FICHA DE VIATURA — VERSÃO "PISTA"  (/stand-fable-3/[id])
  ════════════════════════════════════════════════════════════════════════
  Galeria cinematográfica com filmstrip, tabela técnica em mono, simulador,
  barra de ação fixa em mobile e viaturas na mesma faixa de preço.
  Escuro/claro. Self-contained.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { findVehicle, related, CONTACT, eur, fmtKm } from '../data';

  const car = $derived(findVehicle($page.params.id ?? ''));
  const others = $derived(car ? related(car) : []);

  // ── Tema (escuro por defeito, partilhado com a homepage) ──
  let isDark = $state(true);
  onMount(() => {
    isDark = localStorage.getItem('sf3-theme') !== 'light';
  });
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('sf3-theme', isDark ? 'dark' : 'light');
  }

  // ── Galeria ──
  let activeImage = $state(0);
  $effect(() => {
    void car?.id;
    activeImage = 0;
  });

  // ── Simulador (meramente indicativo) ──
  let months = $state(72);
  let down = $state(0);
  const monthly = $derived(car ? Math.max(0, Math.round(((car.price - down) * 1.07) / months)) : 0);

  const specs = $derived(
    car
      ? [
          ['Ano', String(car.year)],
          ['1ª matrícula', car.registration],
          ['Quilómetros', fmtKm(car.km)],
          ['Combustível', car.fuel],
          ['Caixa', car.transmission],
          ['Potência', `${car.power} cv`],
          ['Portas', String(car.doors)],
          ['Cor', car.color],
          ['Consumo médio', car.consumption],
          ['Emissões CO₂', car.co2],
          ['Mala', car.trunk],
          ['Garantia', '18 meses incluída'],
        ]
      : [],
  );
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
  <title>{car ? `${car.brand} ${car.model} ${car.trim} · ${car.year} — Auto Nunes Martins` : 'Viatura não encontrada — Auto Nunes Martins'}</title>
  {#if car}
    <meta name="description" content="{car.brand} {car.model} {car.trim}, {car.year}, {fmtKm(car.km)}, {car.fuel}. {eur(car.price)} com garantia de 18 meses. Auto Nunes Martins." />
  {/if}
</svelte:head>

<div class="sf3 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased pb-20 lg:pb-0">

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/88 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1480px] px-5 md:px-9 h-[70px] flex items-center justify-between gap-6">
        <a href="/stand-fable-3" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
          {@render wordmark()}
        </a>
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
            class="hidden sm:inline-flex items-center gap-2.5 bg-[var(--red)] text-white px-5 h-10 font-display font-black italic uppercase text-[13px] tracking-wide hover:bg-[var(--red-d)] transition-colors"
          >{CONTACT.phone}</a>
        </div>
      </div>
    </header>

    {#if !car}
      <!-- ══ 404 ══ -->
      <section class="mx-auto max-w-[1480px] px-5 md:px-9 py-28 text-center">
        <p class="font-display font-black italic uppercase text-[clamp(3rem,8vw,6rem)] leading-none">Vendido<span class="text-[var(--red)] not-italic">.</span></p>
        <p class="text-[15px] text-[var(--muted)] mt-5 max-w-md mx-auto">
          Esta viatura já não está em pista — os bons negócios não esperam. Veja o que ainda temos disponível.
        </p>
        <a href="/stand-fable-3#stock" class="inline-flex items-center gap-2.5 mt-9 bg-[var(--red)] text-white px-7 h-12 items-center font-display font-black italic uppercase text-[14px] tracking-wide hover:bg-[var(--red-d)] transition-colors">
          Ver stock atual
        </a>
      </section>
    {:else}
      <main class="mx-auto max-w-[1480px] px-5 md:px-9 py-7 md:py-10">

        <!-- breadcrumb -->
        <a href="/stand-fable-3#stock" class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--red)] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
          Stock
        </a>

        <!-- título -->
        <div class="flex flex-wrap items-end justify-between gap-6 mt-5 mb-7">
          <div>
            {#if car.tag}
              <p class="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)] mb-2"><span class="text-[var(--red)]">//</span> {car.tag}</p>
            {/if}
            <h1 class="font-display font-black italic uppercase text-[clamp(2rem,5vw,3.6rem)] leading-[0.95] tracking-tight">
              {car.brand} {car.model}<span class="text-[var(--red)] not-italic">.</span>
            </h1>
            <p class="text-[14.5px] text-[var(--muted)] mt-2.5">{car.trim} · {car.color}</p>
          </div>
          <div class="text-right">
            <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--faint)]">Preço fechado</p>
            <p class="font-display font-black italic text-[clamp(2rem,4vw,3rem)] leading-none mt-1.5">{eur(car.price)}</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <!-- ── coluna principal ── -->
          <div class="lg:col-span-8 flex flex-col gap-10">

            <!-- galeria -->
            <div>
              {#key activeImage}
                <div class="relative aspect-[16/9] overflow-hidden border border-[var(--line)] bg-[var(--panel)]" transition:fade={{ duration: 200 }}>
                  <img src={car.gallery[activeImage] ?? car.gallery[0]} alt="{car.brand} {car.model} — fotografia {activeImage + 1}" class="w-full h-full object-cover" />
                  <span class="absolute bottom-4 right-4 font-mono text-[11px] text-white bg-black/55 backdrop-blur px-3 py-1.5">
                    {activeImage + 1} / {car.gallery.length}
                  </span>
                </div>
              {/key}
              {#if car.gallery.length > 1}
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-px bg-[var(--line)] border border-[var(--line)] border-t-0">
                  {#each car.gallery as src, i (src)}
                    <button
                      type="button"
                      onclick={() => (activeImage = i)}
                      class="relative aspect-[16/10] overflow-hidden bg-[var(--bg)] transition-opacity {activeImage === i ? '' : 'opacity-45 hover:opacity-90'}"
                      aria-label="Ver fotografia {i + 1}"
                    >
                      <img {src} alt="" class="w-full h-full object-cover" loading="lazy" />
                      {#if activeImage === i}
                        <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--red)]" aria-hidden="true"></span>
                      {/if}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- descrição -->
            <section>
              <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)] mb-4"><span class="text-[var(--red)]">//</span> Sobre este carro</p>
              <p class="text-[15px] text-[var(--muted)] leading-relaxed max-w-2xl">{car.description}</p>
            </section>

            <!-- ficha técnica -->
            <section>
              <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)] mb-4"><span class="text-[var(--red)]">//</span> Ficha técnica</p>
              <dl class="border-t border-[var(--line)]">
                {#each specs as [label, value] (label)}
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3.5 border-b border-[var(--line)]">
                    <dt class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--faint)] self-center">{label}</dt>
                    <dd class="sm:col-span-2 text-[14px] font-semibold">{value}</dd>
                  </div>
                {/each}
              </dl>
            </section>

            <!-- equipamento -->
            <section>
              <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)] mb-4"><span class="text-[var(--red)]">//</span> Equipamento</p>
              <ul class="grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
                {#each car.equipment as item (item)}
                  <li class="flex items-center gap-3 bg-[var(--bg)] px-4 py-3 text-[13.5px] text-[var(--muted)]">
                    <span class="w-1.5 h-1.5 bg-[var(--red)] shrink-0" aria-hidden="true"></span>
                    {item}
                  </li>
                {/each}
              </ul>
            </section>
          </div>

          <!-- ── painel lateral ── -->
          <aside class="lg:col-span-4">
            <div class="lg:sticky lg:top-[94px] flex flex-col gap-px bg-[var(--line)] border border-[var(--line)]">

              <!-- simulador -->
              <div class="bg-[var(--panel)] p-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--faint)]">Simulador de financiamento</p>
                <p class="font-display font-black italic text-[34px] leading-none mt-3">{eur(monthly)}<span class="text-[16px] text-[var(--muted)] not-italic font-sans font-medium">/mês*</span></p>
                <div class="mt-6 flex flex-col gap-5">
                  <div>
                    <div class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2">
                      <label for="sf3-months">Prazo</label><span class="text-[var(--red)] font-semibold">{months} meses</span>
                    </div>
                    <input id="sf3-months" type="range" min="12" max="84" step="12" bind:value={months} class="w-full accent-[var(--red)]" />
                  </div>
                  <div>
                    <div class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2">
                      <label for="sf3-down">Entrada</label><span class="text-[var(--red)] font-semibold">{eur(down)}</span>
                    </div>
                    <input id="sf3-down" type="range" min="0" max={Math.floor(car.price * 0.5 / 500) * 500} step="500" bind:value={down} class="w-full accent-[var(--red)]" />
                  </div>
                  <p class="text-[11px] text-[var(--faint)] leading-relaxed">* Valor meramente indicativo, sujeito a aprovação. Pedimos as propostas reais às financeiras por si — resposta em 24h.</p>
                </div>
              </div>

              <!-- CTAs -->
              <div class="bg-[var(--panel)] p-6">
                <a href={CONTACT.phoneHref} class="flex items-center justify-center gap-2.5 h-12 bg-[var(--red)] text-white font-display font-black italic uppercase text-[14px] tracking-wide hover:bg-[var(--red-d)] transition-colors shadow-[0_0_30px_-8px_rgba(226,35,26,.5)]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                  Ligar agora
                </a>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="mt-3 flex items-center justify-center gap-2.5 h-12 border border-[var(--line-strong)] font-display font-black italic uppercase text-[14px] tracking-wide hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">
                  WhatsApp
                </a>
                <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)] text-center mt-4">{CONTACT.hours}</p>
              </div>

              <!-- incluído -->
              <div class="bg-[var(--panel)] p-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--faint)] mb-4">Incluído no preço</p>
                <ul class="space-y-2.5">
                  {#each ['Garantia de 18 meses', 'Revisão de 120 pontos feita', 'Documentação tratada por nós', 'Retoma do seu usado possível'] as g (g)}
                    <li class="flex items-center gap-3 text-[13.5px] text-[var(--muted)]">
                      <svg class="w-4 h-4 shrink-0 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                      {g}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <!-- ── na mesma faixa ── -->
        {#if others.length > 0}
          <section class="mt-16 pt-10 border-t border-[var(--line)]">
            <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]"><span class="text-[var(--red)]">//</span> Na mesma faixa de preço</p>
            <h2 class="font-display font-black italic uppercase text-[clamp(1.5rem,3vw,2.2rem)] tracking-tight mt-3 mb-7">Compare antes de decidir<span class="text-[var(--red)] not-italic">.</span></h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
              {#each others as v (v.id)}
                <a href="/stand-fable-3/{v.id}" class="group relative flex flex-col bg-[var(--bg)] hover:bg-[var(--panel)] transition-colors">
                  <div class="relative aspect-[16/10] overflow-hidden">
                    <img src={v.gallery[0]} alt="{v.brand} {v.model} {v.trim}" class="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out" loading="lazy" />
                  </div>
                  <div class="p-5 flex items-end justify-between gap-3">
                    <div>
                      <h3 class="font-display font-black italic uppercase text-[16.5px] tracking-tight">{v.brand} {v.model}</h3>
                      <p class="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--muted)] mt-1.5">{v.year} <span class="text-[var(--red)]">/</span> {fmtKm(v.km)} <span class="text-[var(--red)]">/</span> {v.fuel}</p>
                    </div>
                    <p class="font-display font-black italic text-[19px] shrink-0">{eur(v.price)}</p>
                  </div>
                  <span class="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--red)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" aria-hidden="true"></span>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      </main>

      <!-- ══ FOOTER COMPACTO ══ -->
      <footer class="border-t border-[var(--line)] mt-10">
        <div class="mx-auto max-w-[1480px] px-5 md:px-9 h-14 flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
          <p>© {new Date().getFullYear()} Auto Nunes Martins</p>
          <p>{CONTACT.address}</p>
        </div>
      </footer>

      <!-- ══ BARRA FIXA MOBILE ══ -->
      <div class="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[var(--panel)]/95 backdrop-blur-xl border-t border-[var(--line)]">
        <div class="px-5 h-16 flex items-center justify-between gap-4">
          <div>
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--faint)]">Preço fechado</p>
            <p class="font-display font-black italic text-[20px] leading-tight">{eur(car.price)}</p>
          </div>
          <a href={CONTACT.phoneHref} class="inline-flex items-center gap-2 bg-[var(--red)] text-white px-6 h-11 font-display font-black italic uppercase text-[13px] tracking-wide">
            Ligar agora
          </a>
        </div>
      </div>
    {/if}
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
</style>
