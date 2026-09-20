<!--
  ════════════════════════════════════════════════════════════════════════
  FICHA DE VIATURA — VERSÃO "ASSINATURA"  (/stand-fable-2/[id])
  ════════════════════════════════════════════════════════════════════════
  Galeria, painel de compra fixo com simulador, ficha técnica, equipamento,
  pedido de visita e viaturas relacionadas. Claro/escuro. Self-contained.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { findVehicle, related, CONTACT, eur, fmtKm } from '../data';

  const car = $derived(findVehicle($page.params.id ?? ''));
  const others = $derived(car ? related(car) : []);

  // ── Tema (claro por defeito, partilhado com a homepage) ──
  let isDark = $state(false);
  onMount(() => {
    isDark = localStorage.getItem('sf2-theme') === 'dark';
  });
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('sf2-theme', isDark ? 'dark' : 'light');
  }

  // ── Galeria ──
  let activeImage = $state(0);
  $effect(() => {
    // ao navegar entre viaturas relacionadas, volta à primeira foto
    void car?.id;
    activeImage = 0;
  });

  // ── Simulador (meramente indicativo) ──
  let months = $state(72);
  let down = $state(0);
  const monthly = $derived(car ? Math.max(0, Math.round(((car.price - down) * 1.07) / months)) : 0);

  // ── Pedido de visita (demo — sem backend) ──
  let vName = $state('');
  let vContact = $state('');
  let vSent = $state(false);
  function submitVisit(e: SubmitEvent) {
    e.preventDefault();
    vSent = true;
  }

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
    <span class="block font-display font-black italic text-[17px] tracking-tight">
      <span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES&nbsp;MARTINS</span>
    </span>
    <span class="block text-[8px] tracking-[0.34em] uppercase text-[var(--faint)] mt-[3px]">Comércio de Automóveis</span>
  </span>
{/snippet}

<svelte:head>
  <title>{car ? `${car.brand} ${car.model} ${car.trim} · ${car.year} — Auto Nunes Martins` : 'Viatura não encontrada — Auto Nunes Martins'}</title>
  {#if car}
    <meta name="description" content="{car.brand} {car.model} {car.trim}, {car.year}, {fmtKm(car.km)}, {car.fuel}. {eur(car.price)} com garantia de 18 meses. Auto Nunes Martins." />
  {/if}
</svelte:head>

<div class="sf2 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased">

    <!-- ══ HEADER ══ -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1320px] px-5 md:px-8 h-[72px] flex items-center justify-between gap-6">
        <a href="/stand-fable-2" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          <span class="text-[var(--muted)]">{@render swoosh('w-12 h-7')}</span>
          {@render wordmark()}
        </a>
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
            class="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--red)] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[var(--red-d)] transition-colors"
          >{CONTACT.phone}</a>
        </div>
      </div>
    </header>

    {#if !car}
      <!-- ══ 404 ══ -->
      <section class="mx-auto max-w-[1320px] px-5 md:px-8 py-24 text-center">
        <p class="font-display font-black italic text-[64px] leading-none text-[var(--red)]">Ups.</p>
        <h1 class="font-display font-extrabold text-[26px] tracking-tight mt-4">Esta viatura já não está disponível.</h1>
        <p class="text-[14.5px] text-[var(--muted)] mt-2 max-w-md mx-auto">
          Provavelmente foi vendida — os bons negócios não duram. Veja o que ainda temos no stand.
        </p>
        <a href="/stand-fable-2#viaturas" class="inline-flex items-center gap-2 mt-8 rounded-full bg-[var(--red)] text-white px-6 py-3 text-[14px] font-semibold hover:bg-[var(--red-d)] transition-colors">
          Ver viaturas disponíveis
        </a>
      </section>
    {:else}
      <main class="mx-auto max-w-[1320px] px-5 md:px-8 py-8 md:py-12">

        <!-- breadcrumb -->
        <a href="/stand-fable-2#viaturas" class="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--red)] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
          Voltar ao stock
        </a>

        <div class="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-5">
          <!-- ── coluna principal ── -->
          <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">

            <!-- galeria -->
            <div>
              {#key activeImage}
                <div class="relative aspect-[16/10] rounded-3xl overflow-hidden border border-[var(--line)] bg-[var(--surface)]" transition:fade={{ duration: 200 }}>
                  <img src={car.gallery[activeImage] ?? car.gallery[0]} alt="{car.brand} {car.model} — fotografia {activeImage + 1}" class="w-full h-full object-cover" />
                  {#if car.tag}
                    <span class="absolute top-4 left-4 rounded-full bg-[var(--red)] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5">{car.tag}</span>
                  {/if}
                </div>
              {/key}
              {#if car.gallery.length > 1}
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-3">
                  {#each car.gallery as src, i (src)}
                    <button
                      type="button"
                      onclick={() => (activeImage = i)}
                      class="aspect-[16/10] rounded-xl overflow-hidden border-2 transition-colors {activeImage === i ? 'border-[var(--red)]' : 'border-transparent opacity-70 hover:opacity-100'}"
                      aria-label="Ver fotografia {i + 1}"
                    >
                      <img {src} alt="" class="w-full h-full object-cover" loading="lazy" />
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- título (mobile aparece antes do painel via order no grid do pai — aqui fica para desktop) -->
            <div>
              <h1 class="font-display font-extrabold text-[clamp(1.7rem,3.4vw,2.5rem)] tracking-tight leading-tight">
                {car.brand} {car.model} <span class="text-[var(--muted)] font-bold">{car.trim}</span>
              </h1>
              <ul class="flex flex-wrap gap-2 mt-4 text-[12.5px] font-medium text-[var(--muted)]">
                {#each [String(car.year), fmtKm(car.km), car.fuel, car.transmission, `${car.power} cv`] as chip (chip)}
                  <li class="rounded-lg bg-[var(--chip)] px-3 py-1.5">{chip}</li>
                {/each}
              </ul>
            </div>

            <!-- descrição -->
            <section>
              <h2 class="font-display font-extrabold text-[19px] tracking-tight mb-3">Sobre este carro</h2>
              <p class="text-[14.5px] text-[var(--muted)] leading-relaxed max-w-2xl">{car.description}</p>
            </section>

            <!-- ficha técnica -->
            <section>
              <h2 class="font-display font-extrabold text-[19px] tracking-tight mb-4">Ficha técnica</h2>
              <dl class="grid grid-cols-2 md:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--line)]">
                {#each specs as [label, value] (label)}
                  <div class="bg-[var(--surface)] px-4 py-3.5">
                    <dt class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">{label}</dt>
                    <dd class="text-[14px] font-semibold mt-1">{value}</dd>
                  </div>
                {/each}
              </dl>
            </section>

            <!-- equipamento -->
            <section>
              <h2 class="font-display font-extrabold text-[19px] tracking-tight mb-4">Equipamento</h2>
              <ul class="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                {#each car.equipment as item (item)}
                  <li class="flex items-center gap-2.5 text-[14px] text-[var(--muted)]">
                    <svg class="w-4 h-4 shrink-0 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    {item}
                  </li>
                {/each}
              </ul>
            </section>

            <!-- garantias -->
            <section class="rounded-3xl bg-[var(--ink-flip)] text-[var(--bg-flip)] p-6 md:p-8">
              <h2 class="font-display font-extrabold text-[18px] tracking-tight">Incluído no preço, sempre:</h2>
              <ul class="grid sm:grid-cols-3 gap-4 mt-5 text-[13.5px]">
                {#each ['Garantia de 18 meses', 'Revisão de 120 pontos feita', 'Documentação tratada por nós'] as g (g)}
                  <li class="flex items-start gap-2.5">
                    <svg class="w-4.5 h-4.5 shrink-0 text-[var(--red)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    <span class="opacity-90">{g}</span>
                  </li>
                {/each}
              </ul>
            </section>
          </div>

          <!-- ── painel de compra ── -->
          <aside class="lg:col-span-5 xl:col-span-4">
            <div class="lg:sticky lg:top-[96px] flex flex-col gap-5">
              <div class="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6 shadow-[0_24px_50px_-30px_rgba(0,0,0,.3)]">
                <p class="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">Preço final, sem surpresas</p>
                <p class="font-display font-extrabold text-[38px] leading-none mt-2">{eur(car.price)}</p>
                <p class="text-[13px] text-[var(--muted)] mt-2">ou <strong class="text-[var(--ink)]">{eur(monthly)}/mês*</strong> com a simulação abaixo</p>

                <!-- simulador -->
                <div class="mt-6 pt-5 border-t border-[var(--line)] flex flex-col gap-4">
                  <div>
                    <div class="flex items-center justify-between text-[12.5px] font-medium text-[var(--muted)] mb-2">
                      <label for="sf2-months">Prazo</label><span class="font-semibold text-[var(--ink)]">{months} meses</span>
                    </div>
                    <input id="sf2-months" type="range" min="12" max="84" step="12" bind:value={months} class="w-full accent-[var(--red)]" />
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-[12.5px] font-medium text-[var(--muted)] mb-2">
                      <label for="sf2-down">Entrada</label><span class="font-semibold text-[var(--ink)]">{eur(down)}</span>
                    </div>
                    <input id="sf2-down" type="range" min="0" max={Math.floor(car.price * 0.5 / 500) * 500} step="500" bind:value={down} class="w-full accent-[var(--red)]" />
                  </div>
                  <p class="text-[11px] text-[var(--faint)] leading-relaxed">* Simulação meramente indicativa, sujeita a aprovação de crédito. Pedimos a proposta real às financeiras por si — resposta em 24h.</p>
                </div>

                <!-- CTAs -->
                <div class="mt-5 grid grid-cols-2 gap-3">
                  <a href={CONTACT.phoneHref} class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--red)] text-white h-12 text-[14px] font-semibold hover:bg-[var(--red-d)] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>
                    Ligar
                  </a>
                  <a href={CONTACT.whatsapp} target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] h-12 text-[14px] font-semibold hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">
                    WhatsApp
                  </a>
                </div>
              </div>

              <!-- marcar visita -->
              <div class="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6">
                {#if vSent}
                  <div class="text-center py-4" transition:fade>
                    <span class="mx-auto w-12 h-12 rounded-full bg-[var(--red)]/10 text-[var(--red)] grid place-items-center">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    </span>
                    <p class="font-display font-extrabold text-[17px] mt-3">Pedido enviado!</p>
                    <p class="text-[13px] text-[var(--muted)] mt-1.5">Entramos em contacto em menos de 2 horas úteis para confirmar a visita.</p>
                  </div>
                {:else}
                  <h2 class="font-display font-extrabold text-[17px] tracking-tight">Marcar visita sem compromisso</h2>
                  <p class="text-[12.5px] text-[var(--muted)] mt-1.5">O carro fica reservado para a sua visita. Resposta em menos de 2h úteis.</p>
                  <form class="mt-4 flex flex-col gap-3" onsubmit={submitVisit}>
                    <input required bind:value={vName} placeholder="O seu nome" class="h-11 rounded-xl bg-[var(--bg)] border border-[var(--line)] px-3.5 text-[13.5px] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--red)]" />
                    <input required bind:value={vContact} placeholder="Telemóvel ou email" class="h-11 rounded-xl bg-[var(--bg)] border border-[var(--line)] px-3.5 text-[13.5px] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--red)]" />
                    <button type="submit" class="h-11 rounded-xl bg-[var(--ink-flip)] text-[var(--bg-flip)] text-[13.5px] font-semibold hover:opacity-90 transition-opacity">
                      Quero ver o {car.brand} {car.model}
                    </button>
                  </form>
                {/if}
              </div>
            </div>
          </aside>
        </div>

        <!-- ── relacionadas ── -->
        {#if others.length > 0}
          <section class="mt-16 pt-10 border-t border-[var(--line)]">
            <h2 class="font-display font-extrabold text-[clamp(1.4rem,2.6vw,1.9rem)] tracking-tight mb-6">Também lhe pode interessar</h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {#each others as v (v.id)}
                <a href="/stand-fable-2/{v.id}" class="group flex flex-col rounded-3xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)] hover:border-[var(--red)]/40 transition-all duration-300">
                  <div class="relative aspect-[16/10] overflow-hidden">
                    <img src={v.gallery[0]} alt="{v.brand} {v.model} {v.trim}" class="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" loading="lazy" />
                    {#if v.tag}
                      <span class="absolute top-3.5 left-3.5 rounded-full bg-[var(--surface)]/92 backdrop-blur text-[var(--red)] text-[10.5px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[var(--red)]/25">{v.tag}</span>
                    {/if}
                  </div>
                  <div class="p-5 flex items-end justify-between gap-3">
                    <div>
                      <h3 class="font-display font-extrabold text-[16.5px] tracking-tight">{v.brand} {v.model}</h3>
                      <p class="text-[12.5px] text-[var(--muted)] mt-0.5">{v.year} · {fmtKm(v.km)} · {v.fuel}</p>
                    </div>
                    <p class="font-display font-extrabold text-[18px] text-[var(--red)] shrink-0">{eur(v.price)}</p>
                  </div>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      </main>

      <!-- ══ FOOTER COMPACTO ══ -->
      <footer class="border-t border-[var(--line)] mt-8">
        <div class="mx-auto max-w-[1320px] px-5 md:px-8 h-16 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--faint)]">
          <p>© {new Date().getFullYear()} Auto Nunes Martins — Comércio de Automóveis</p>
          <p>{CONTACT.address} · <a href={CONTACT.phoneHref} class="font-medium hover:text-[var(--red)] transition-colors">{CONTACT.phone}</a></p>
        </div>
      </footer>
    {/if}
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
</style>
