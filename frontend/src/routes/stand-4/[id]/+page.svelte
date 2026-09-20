<!--
  ════════════════════════════════════════════════════════════════════════
  FICHA DE VIATURA — VERSÃO "EM MOVIMENTO"  (/stand-4/[id])
  ════════════════════════════════════════════════════════════════════════
  Identidade do logótipo: vermelho + grafite + branco, swoosh, itálico forte.
  Galeria, ficha técnica detalhada, simulador de financiamento, equipamento,
  pedido de contacto e viaturas relacionadas. Light / Dark. Self-contained.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Vehicle {
    id: string; brand: string; model: string; trim: string;
    year: number; km: number; fuel: string; transmission: string; power: number;
    doors: number; color: string; price: number; monthly: number; tag?: string;
    gallery: string[]; description: string; equipment: string[];
    co2: string; consumption: string; capacity: string; registration: string;
  }

  const vehicles: Vehicle[] = [
    { id: 'volkswagen-up-2018', brand: 'Volkswagen', model: 'up!', trim: '1.0 MPI Move', year: 2018, km: 61200, fuel: 'Gasolina', transmission: 'Manual', power: 60, doors: 5, color: 'Branco Puro', price: 7900, monthly: 109, tag: '1º Carro',
      gallery: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80'],
      description: 'O citadino ideal para a cidade e para quem tira a carta. Compacto, fácil de estacionar e muito económico. Nacional, com revisões em dia e pronto a usar.',
      equipment: ['Ar Condicionado','Som com Bluetooth','Computador de Bordo','Vidros Elétricos','Direção Assistida','Fecho Centralizado','Airbags Frontais e Laterais','ABS + ESP'],
      co2: '108 g/km', consumption: '4.8 L/100km', capacity: '251 L', registration: '05/2018' },
    { id: 'opel-corsa-2018', brand: 'Opel', model: 'Corsa', trim: '1.2 Edition', year: 2018, km: 72400, fuel: 'Gasolina', transmission: 'Manual', power: 70, doors: 5, color: 'Cinza Sovereign', price: 9400, monthly: 129, tag: 'Económico',
      gallery: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80'],
      description: 'Corsa fiável e equilibrado, com baixos consumos e custos de manutenção reduzidos. Espaço suficiente para o dia-a-dia e para viagens. Inspeção válida.',
      equipment: ['Ar Condicionado','Ecrã com Apple CarPlay','Sensores de Estacionamento','Cruise Control','Volante Multifunções','Faróis de Nevoeiro','Bluetooth & USB','Jantes 16"'],
      co2: '119 g/km', consumption: '5.2 L/100km', capacity: '285 L', registration: '03/2018' },
    { id: 'fiat-500-2021', brand: 'Fiat', model: '500', trim: '1.0 Mild Hybrid Lounge', year: 2021, km: 28400, fuel: 'Híbrido', transmission: 'Manual', power: 70, doors: 3, color: 'Branco Gelato', price: 11900, monthly: 149,
      gallery: ['https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80'],
      description: 'O icónico citadino italiano na versão Mild Hybrid, reduzindo consumos na cidade. Tecto panorâmico em vidro e jantes especiais. Ideal para circulação urbana diária.',
      equipment: ['Uconnect com Apple CarPlay','Tecto Panorâmico','Jantes 15"','Volante em Pele','Painel Digital','Mild Hybrid 12V','Ar Condicionado','Sensores Traseiros'],
      co2: '105 g/km', consumption: '4.6 L/100km', capacity: '185 L', registration: '02/2021' },
    { id: 'renault-clio-2021', brand: 'Renault', model: 'Clio', trim: '1.0 TCe Intens', year: 2021, km: 45200, fuel: 'Gasolina', transmission: 'Manual', power: 90, doors: 5, color: 'Azul Iron', price: 13500, monthly: 169, tag: 'Mais Procurado',
      gallery: ['https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80'],
      description: 'Clio Intens em excelente estado, nacional e com um único proprietário. Histórico completo de revisões. EasyLink (Apple CarPlay / Android Auto), câmara traseira, AC automático e faróis LED.',
      equipment: ['EasyLink Multimédia','Câmara de Marcha-Atrás','Sensores de Estacionamento','Faróis 100% LED','AC Automático','Alerta de Faixa','Cruise Control & Limitador','Jantes 16"'],
      co2: '116 g/km', consumption: '5.1 L/100km', capacity: '391 L', registration: '04/2021' },
    { id: 'dacia-sandero-2021', brand: 'Dacia', model: 'Sandero Stepway', trim: '1.0 TCe Eco-G', year: 2021, km: 38500, fuel: 'GPL / Gasolina', transmission: 'Manual', power: 100, doors: 5, color: 'Laranja Atacama', price: 12800, monthly: 159, tag: 'Custo Baixo',
      gallery: ['https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80'],
      description: 'Sandero Stepway bi-fuel GPL/Gasolina de fábrica — custos de combustível muito baixos. Visual crossover, maior altura ao solo e barras de tejadilho. Único proprietário nacional.',
      equipment: ['Media Display','Barras de Tejadilho','Sensores Traseiros','Luzes LED','Ar Condicionado','Modo ECO','Bluetooth & USB','Bi-Fuel (GPL / Gasolina)'],
      co2: '109 g/km', consumption: '6.5 L/100km (GPL)', capacity: '328 L', registration: '09/2021' },
    { id: 'seat-ibiza-2020', brand: 'Seat', model: 'Ibiza', trim: '1.0 TSI FR', year: 2020, km: 54100, fuel: 'Gasolina', transmission: 'Manual', power: 95, doors: 5, color: 'Vermelho Desire', price: 14200, monthly: 179,
      gallery: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80'],
      description: 'Ibiza no acabamento desportivo FR, com visual agressivo, jantes específicas e excelente comportamento. Motor 1.0 TSI ágil e eficiente. Viatura jovem com poucos quilómetros.',
      equipment: ['Pack Desportivo FR','Ecrã Tátil 8"','Climatização Automática','Jantes 17"','Faróis Full LED','Cruise Adaptativo','Sensores de Estacionamento','Volante FR'],
      co2: '113 g/km', consumption: '5.0 L/100km', capacity: '355 L', registration: '06/2020' },
    { id: 'ford-focus-2020', brand: 'Ford', model: 'Focus', trim: '1.0 EcoBoost ST-Line', year: 2020, km: 64500, fuel: 'Gasolina', transmission: 'Manual', power: 125, doors: 5, color: 'Vermelho Race', price: 14900, monthly: 189, tag: 'Desportivo',
      gallery: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'],
      description: 'Versão desportiva ST-Line com suspensão calibrada, soleiras exclusivas e dupla saída de escape. Motor EcoBoost de 125cv. Excelente comportamento dinâmico.',
      equipment: ['Pack ST-Line','Suspensão Desportiva','Jantes 17"','Volante Base Plana','SYNC 3 Tátil','Sensores Frente/Trás','Climatização Automática','Costuras Vermelhas'],
      co2: '124 g/km', consumption: '5.4 L/100km', capacity: '375 L', registration: '06/2020' },
    { id: 'toyota-yaris-2020', brand: 'Toyota', model: 'Yaris', trim: '1.5 Hybrid Active', year: 2020, km: 52400, fuel: 'Híbrido', transmission: 'Automática', power: 116, doors: 5, color: 'Cinzento Prata', price: 16800, monthly: 209, tag: 'Fiabilidade',
      gallery: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=900&q=80'],
      description: 'Yaris de quarta geração com tecnologia híbrida auto-recarregável — dispensa cabos. Muito fiável, caixa automática suave e consumos reais abaixo dos 4L/100km em cidade.',
      equipment: ['Toyota Safety Sense','Cruise Adaptativo','Ecrã Tátil 8"','Máximos Automáticos','Pré-Colisão com Radar','Câmara Traseira','Climatizador Automático','Transmissão e-CVT'],
      co2: '92 g/km', consumption: '3.8 L/100km', capacity: '286 L', registration: '10/2020' },
    { id: 'nissan-qashqai-2019', brand: 'Nissan', model: 'Qashqai', trim: '1.5 dCi N-Connecta', year: 2019, km: 89200, fuel: 'Diesel', transmission: 'Manual', power: 115, doors: 5, color: 'Cinzento Escuro', price: 18900, monthly: 239, tag: 'Familiar',
      gallery: ['https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1519440552087-77ddc4bb0fdc?auto=format&fit=crop&w=900&q=80'],
      description: 'Líder dos SUVs familiares em Portugal. Motor 1.5 dCi muito fiável e económico. Tecto panorâmico, câmaras 360º e jantes de 18". Viatura nacional, impecável, com garantia.',
      equipment: ['Câmara 360º','Tecto Panorâmico','Jantes 18"','Navegação GPS 3D','Acesso Sem Chave','Reconhecimento de Sinais','Sensores de Chuva/Luz','Climatização Dual-Zone'],
      co2: '121 g/km', consumption: '4.2 L/100km', capacity: '430 L', registration: '11/2019' }
  ];

  const carId = $derived($page.params.id);
  const car = $derived(vehicles.find((v) => v.id === carId));
  const related = $derived(car ? vehicles.filter((v) => v.id !== car.id).sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price)).slice(0, 3) : []);

  let isDark = $state(false);
  onMount(() => { isDark = localStorage.getItem('app-theme') === 'dark'; });
  function toggleTheme() { isDark = !isDark; localStorage.setItem('app-theme', isDark ? 'dark' : 'light'); }

  let activeImage = $state(0);
  let months = $state(72);
  const monthly = $derived(car ? Math.round((car.price * 1.079) / months) : 0);

  let cName = $state(''); let cContact = $state(''); let cMsg = $state('');
  $effect(() => { if (car) cMsg = `Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}).`; });

  const eur = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const km = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>{car ? `${car.brand} ${car.model} ${car.year} · Auto Nunes Martins` : 'Viatura não encontrada'}</title>
</svelte:head>

<div class="s4 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style="font-family:'Inter',system-ui,sans-serif">

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 h-[70px] flex items-center justify-between gap-6">
        <a href="/stand-4" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          {@render swoosh('w-12 h-7')}
          <span class="leading-none select-none">
            <span class="block font-italic-strong text-[19px] tracking-tight"><span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES MARTINS</span></span>
            <span class="block text-[8px] tracking-[0.36em] uppercase text-[var(--faint)] mt-[3px] italic">Comércio de Automóveis</span>
          </span>
        </a>
        <div class="flex items-center gap-2.5">
          <button type="button" onclick={toggleTheme} aria-label="Alternar tema" class="w-10 h-10 rounded-full border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30 transition-colors">
            {#if isDark}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>{/if}
          </button>
          <a href="/stand-4#viaturas" class="hidden sm:inline-flex items-center gap-2 bg-[var(--red)] text-white px-5 py-2.5 rounded-full font-semibold text-[13px] hover:bg-[var(--red-d)] transition-colors">Ver stock</a>
        </div>
      </div>
    </header>

    {#if car}
      <main class="mx-auto max-w-[1240px] px-5 md:px-8 py-8 md:py-11">
        <nav class="flex items-center gap-2 text-[12px] text-[var(--faint)] mb-7">
          <a href="/stand-4" class="hover:text-[var(--red)] transition-colors">Início</a><span>/</span>
          <a href="/stand-4#viaturas" class="hover:text-[var(--red)] transition-colors">Viaturas</a><span>/</span>
          <span class="text-[var(--muted)]">{car.brand} {car.model}</span>
        </nav>

        <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <div class="text-[12px] uppercase tracking-widest text-[var(--faint)] flex items-center gap-2">
              {car.brand}{#if car.tag}<span class="bg-[var(--red)] text-white px-2 py-0.5 rounded-full tracking-wider not-italic">{car.tag}</span>{/if}
            </div>
            <h1 class="font-italic-strong text-[clamp(2.2rem,5vw,3.4rem)] leading-none tracking-tight mt-1.5">{car.model}</h1>
            <p class="text-[var(--muted)] mt-1.5">{car.trim} · {car.year} · {km(car.km)} km</p>
          </div>
          <div class="text-left md:text-right">
            <div class="font-italic-strong text-[clamp(2rem,5vw,3rem)] text-[var(--red)] leading-none">{eur(car.price)}</div>
            <div class="text-[13px] text-[var(--muted)] mt-1">desde {eur(car.monthly)}/mês · TAEG 7,9%</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-12 gap-8 items-start">
          <!-- gallery -->
          <div class="lg:col-span-7 flex flex-col gap-4">
            <div class="s4-shape relative aspect-[16/11] overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
              {#key activeImage}<img src={car.gallery[activeImage]} alt="{car.brand} {car.model}" in:fade={{ duration: 220 }} class="w-full h-full object-cover"/>{/key}
              <span class="absolute bottom-4 right-5 bg-black/60 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">{activeImage + 1} / {car.gallery.length}</span>
            </div>
            {#if car.gallery.length > 1}
              <div class="grid grid-cols-4 gap-3">
                {#each car.gallery as img, i}
                  <button type="button" onclick={() => (activeImage = i)} class="aspect-[4/3] rounded-xl overflow-hidden border transition-all {activeImage===i ? 'border-[var(--red)] ring-2 ring-[var(--red)]/25' : 'border-[var(--line)] hover:border-[var(--ink)]/30'}">
                    <img src={img} alt="Vista {i+1}" class="w-full h-full object-cover"/>
                  </button>
                {/each}
              </div>
            {/if}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              {#each [{l:'Ano',v:String(car.year)},{l:'Quilómetros',v:km(car.km)},{l:'Combustível',v:car.fuel},{l:'Caixa',v:car.transmission}] as s}
                <div class="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4">
                  <div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">{s.l}</div>
                  <div class="font-italic-strong text-[15px] mt-1">{s.v}</div>
                </div>
              {/each}
            </div>
          </div>

          <!-- purchase + simulator -->
          <aside class="lg:col-span-5 lg:sticky lg:top-[86px] flex flex-col gap-5">
            <div class="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-7 flex flex-col gap-5">
              <div class="flex items-end justify-between">
                <div><div class="text-[11px] uppercase tracking-widest text-[var(--faint)]">Preço final</div><div class="font-italic-strong text-3xl">{eur(car.price)}</div></div>
                <span class="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg> Garantia 24m</span>
              </div>
              <div class="rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] p-5 flex flex-col gap-4">
                <div class="flex items-center justify-between text-[13px]"><span class="text-[var(--muted)] font-medium">Simulador · {months} meses</span><span class="font-italic-strong text-[var(--red)] text-lg">{eur(monthly)}/mês</span></div>
                <input type="range" min="24" max="120" step="12" bind:value={months} class="w-full accent-[var(--red)] cursor-pointer" aria-label="Prazo em meses"/>
                <div class="flex justify-between text-[10px] uppercase tracking-wider text-[var(--faint)]"><span>24m</span><span>72m</span><span>120m</span></div>
                <p class="text-[11px] text-[var(--faint)] leading-relaxed">Valor indicativo · TAEG 7,9% · sem entrada obrigatória. Sujeito a aprovação.</p>
              </div>
              <div class="flex flex-col gap-2.5">
                <a href={`https://wa.me/351210000000?text=${encodeURIComponent(`Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}) por ${eur(car.price)}.`)}`} target="_blank" rel="noopener noreferrer"
                  class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
                  Falar por WhatsApp
                </a>
                <a href="tel:+351210000000" class="w-full border border-[var(--ink)]/15 hover:border-[var(--ink)]/40 py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
                  Ligar 210 000 000
                </a>
              </div>
            </div>
            <div class="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col gap-3">
              <h2 class="font-semibold text-base">Pedir mais informações</h2>
              <p class="text-[12px] text-[var(--faint)] -mt-1">Respondemos em menos de 24h.</p>
              <input type="text" bind:value={cName} placeholder="O seu nome" class="w-full bg-[var(--bg)] border border-[var(--line)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)]"/>
              <input type="text" bind:value={cContact} placeholder="Telemóvel ou email" class="w-full bg-[var(--bg)] border border-[var(--line)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)]"/>
              <textarea bind:value={cMsg} rows="3" class="w-full bg-[var(--bg)] border border-[var(--line)] rounded-[10px] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] resize-none"></textarea>
              <button type="button" class="bg-[var(--red)] hover:bg-[var(--red-d)] text-white font-semibold text-sm py-3 rounded-full transition-colors">Enviar pedido</button>
            </div>
          </aside>
        </div>

        <!-- description + specs + equipment -->
        <div class="grid lg:grid-cols-12 gap-10 pt-12 mt-12 border-t border-[var(--line)]">
          <div class="lg:col-span-7 flex flex-col gap-10">
            <div>
              <h2 class="font-italic-strong text-2xl tracking-tight mb-3">Sobre esta viatura</h2>
              <p class="text-[var(--muted)] leading-relaxed text-[15px]">{car.description}</p>
            </div>
            <div>
              <h2 class="font-italic-strong text-2xl tracking-tight mb-5">Ficha técnica</h2>
              <div class="grid sm:grid-cols-2 gap-x-10">
                {#each [
                  {l:'Matrícula',v:car.registration},{l:'Combustível',v:car.fuel},{l:'Caixa',v:car.transmission},{l:'Potência',v:`${car.power} cv`},
                  {l:'Cor exterior',v:car.color},{l:'Portas',v:String(car.doors)},{l:'Emissões CO₂',v:car.co2},{l:'Consumo médio',v:car.consumption},
                  {l:'Bagageira',v:car.capacity},{l:'Estado',v:'Inspeccionada'}
                ] as s}
                  <div class="flex items-center justify-between py-3 border-b border-[var(--line)]">
                    <span class="text-[13px] text-[var(--muted)]">{s.l}</span>
                    <span class="font-semibold text-[14px]">{s.v}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
          <div class="lg:col-span-5">
            <h2 class="font-italic-strong text-2xl tracking-tight mb-5">Equipamento</h2>
            <div class="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                {#each car.equipment as eq}
                  <li class="flex items-start gap-2.5 text-[13px] text-[var(--muted)]">
                    <svg class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7"/></svg>{eq}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>

        <!-- related -->
        <div class="pt-12 mt-12 border-t border-[var(--line)]">
          <h2 class="font-italic-strong text-2xl tracking-tight mb-6">Também lhe pode interessar</h2>
          <div class="grid sm:grid-cols-3 gap-6">
            {#each related as r}
              <a href="/stand-4/{r.id}" class="s4-card group flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[14px] overflow-hidden transition-all">
                <div class="aspect-[16/11] overflow-hidden bg-[var(--surface-2)]"><img src={r.gallery[0]} alt={r.model} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div>
                <div class="p-4 flex items-end justify-between">
                  <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">{r.brand} · {r.year}</div><h3 class="font-italic-strong text-lg group-hover:text-[var(--red)] transition-colors">{r.model}</h3></div>
                  <span class="font-italic-strong text-[15px]">{eur(r.price)}</span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </main>
    {:else}
      <div class="max-w-md mx-auto text-center py-28 px-6">
        <h1 class="font-italic-strong text-2xl">Viatura não encontrada</h1>
        <p class="text-[var(--muted)] text-sm mt-2">Esta viatura poderá já ter sido vendida ou não estar disponível.</p>
        <a href="/stand-4#viaturas" class="inline-block mt-6 bg-[var(--red)] hover:bg-[var(--red-d)] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors">Ver stock disponível</a>
      </div>
    {/if}

    <footer class="border-t border-[var(--line)] bg-[var(--surface)] mt-16">
      <div class="mx-auto max-w-[1240px] px-5 md:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2.5">{@render swoosh('w-10 h-5')}<span class="font-italic-strong text-lg"><span class="text-[var(--red)]">AUTO</span>NUNES MARTINS</span></div>
        <div class="text-[12px] text-[var(--faint)]">© 2026 · Rua do Comércio, 123 — Lisboa · +351 210 000 000</div>
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
  .font-italic-strong { font-family: 'Barlow', system-ui, sans-serif; font-weight: 900; font-style: italic; letter-spacing: -0.02em; }
  .s4 { --red:#e2231a; --red-d:#b3140d; --red-l:#ff5347; --color-red:#e2231a; --ink:#1b1c21; --muted:#5d5f67; --faint:#9a9ca3; --bg:#f7f6f3; --surface:#ffffff; --surface-2:#f0efeb; --line:rgba(20,20,28,.10); --shadow:rgba(30,20,18,.35); }
  .s4.dark { --ink:#f5f5f3; --muted:#a7a8ae; --faint:#74757b; --bg:#121317; --surface:#1a1b20; --surface-2:#24262c; --line:rgba(255,255,255,.10); --shadow:rgba(0,0,0,.6); }
  .s4-shape { border-radius: 18px; clip-path: polygon(0 0, 100% 0, 100% 92%, 4% 100%, 0 96%); }
  .s4-card { box-shadow: 0 1px 0 var(--line); }
  .s4-card:hover { transform: translateY(-4px); border-color: color-mix(in oklab, var(--red) 45%, transparent); box-shadow: 0 26px 50px -30px var(--shadow); }
</style>
