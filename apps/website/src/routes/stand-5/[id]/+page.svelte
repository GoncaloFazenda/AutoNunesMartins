<!--
  ════════════════════════════════════════════════════════════════════════
  FICHA DE VIATURA — VERSÃO "GRAFITE"  (/stand-5/[id])
  ════════════════════════════════════════════════════════════════════════
  Identidade do logótipo: grafite + vermelho + branco, swoosh, itálico forte.
  Galeria, ficha técnica detalhada, simulador, equipamento, contacto e
  viaturas relacionadas. Escuro/Claro. Self-contained.
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

  let isDark = $state(true);
  onMount(() => { const s = localStorage.getItem('app-theme'); isDark = s ? s === 'dark' : true; });
  function toggleTheme() { isDark = !isDark; localStorage.setItem('app-theme', isDark ? 'dark' : 'light'); }

  let activeImage = $state(0);
  let months = $state(72);
  const monthly = $derived(car ? Math.round((car.price * 1.079) / months) : 0);
  const kmPct = (n: number) => Math.max(8, Math.min(100, Math.round((1 - n / 150000) * 100)));

  let cName = $state(''); let cContact = $state(''); let cMsg = $state('');
  $effect(() => { if (car) cMsg = `Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}).`; });

  const eur = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const km = (n: number) => n.toLocaleString('pt-PT');
</script>

<svelte:head>
  <title>{car ? `${car.brand} ${car.model} ${car.year} · Auto Nunes Martins` : 'Viatura não encontrada'}</title>
</svelte:head>

<div class="s5 {isDark ? 'dark' : ''}">
  <div class="min-h-screen bg-[var(--bg)] text-[var(--ink)]" style="font-family:'Inter',system-ui,sans-serif">
    <div class="h-1 w-full" style="background:linear-gradient(90deg,var(--red) 0%,var(--red) 22%,transparent 22%)"></div>

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 h-[68px] flex items-center justify-between gap-6">
        <a href="/stand-5" class="flex items-center gap-3 shrink-0" aria-label="Auto Nunes Martins — início">
          {@render swoosh('w-11 h-6')}
          <span class="leading-none select-none">
            <span class="block font-strong text-[18px] tracking-tight"><span class="text-[var(--red)]">AUTO</span><span class="text-[var(--ink)]">NUNES MARTINS</span></span>
            <span class="block text-[8px] tracking-[0.38em] uppercase text-[var(--faint)] mt-[3px] italic">Comércio de Automóveis</span>
          </span>
        </a>
        <div class="flex items-center gap-2.5">
          <button type="button" onclick={toggleTheme} aria-label="Alternar tema" class="w-10 h-10 border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--red)] transition-colors">
            {#if isDark}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.71.71M6.34 17.66l-.71.71m0-12.73l.71.71m12.02 12.02l.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            {:else}<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>{/if}
          </button>
          <a href="/stand-5#stock" class="hidden sm:inline-flex items-center gap-2 bg-[var(--red)] text-white px-5 py-2.5 font-strong text-[13px] uppercase tracking-wide hover:bg-[var(--red-d)] transition-colors">Stock</a>
        </div>
      </div>
    </header>

    {#if car}
      <main class="mx-auto max-w-[1600px] px-5 md:px-9 py-8 md:py-11">
        <a href="/stand-5#stock" class="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--red)] transition-colors mb-7">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7m-7 7h18"/></svg> Voltar ao stock
        </a>

        <div class="grid lg:grid-cols-12 gap-8 items-start">
          <!-- gallery + telemetry -->
          <div class="lg:col-span-7 flex flex-col gap-5">
            <div class="border border-[var(--line)] bg-[var(--surface)] p-2">
              <div class="relative aspect-[16/10] overflow-hidden">
                {#key activeImage}<img src={car.gallery[activeImage]} alt="{car.brand} {car.model}" in:fade={{ duration: 220 }} class="w-full h-full object-cover"/>{/key}
                {#if car.tag}<span class="absolute top-0 left-0 bg-[var(--red)] text-white text-[10.5px] font-bold uppercase tracking-wider px-3 py-1">{car.tag}</span>{/if}
                <span class="absolute bottom-3 right-3 bg-black/60 text-white text-[12px] font-semibold px-2.5 py-1">{activeImage + 1} / {car.gallery.length}</span>
              </div>
            </div>
            {#if car.gallery.length > 1}
              <div class="grid grid-cols-4 gap-2.5">
                {#each car.gallery as img, i}
                  <button type="button" onclick={() => (activeImage = i)} class="aspect-[4/3] overflow-hidden border transition-all {activeImage===i ? 'border-[var(--red)]' : 'border-[var(--line)] hover:border-[var(--ink)]/30'}"><img src={img} alt="Vista {i+1}" class="w-full h-full object-cover"/></button>
                {/each}
              </div>
            {/if}
            <div class="border border-[var(--line)] bg-[var(--surface)] p-5">
              <div class="text-[11px] uppercase tracking-widest text-[var(--faint)] mb-4">Resumo</div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {#each [{l:'Ano',v:String(car.year)},{l:'Potência',v:`${car.power}cv`},{l:'Combustível',v:car.fuel},{l:'Caixa',v:car.transmission}] as g}
                  <div class="text-center"><div class="font-strong text-xl">{g.v}</div><div class="text-[9px] uppercase tracking-widest text-[var(--faint)] mt-1">{g.l}</div></div>
                {/each}
              </div>
              <div class="mt-5 pt-5 border-t border-[var(--line)]">
                <div class="flex justify-between text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2"><span>Quilometragem</span><span class="font-strong text-[var(--ink)]">{km(car.km)} km</span></div>
                <div class="h-2 bg-[var(--surface-2)] overflow-hidden"><div class="h-full bg-[var(--red)]" style="width:{kmPct(car.km)}%"></div></div>
              </div>
            </div>
          </div>

          <!-- purchase + simulator -->
          <aside class="lg:col-span-5 lg:sticky lg:top-[84px] flex flex-col gap-5">
            <div class="border border-[var(--line)] bg-[var(--surface)] p-6 md:p-7">
              <div class="text-[11px] uppercase tracking-widest text-[var(--faint)] flex items-center gap-2">{car.brand} · {car.year}{#if car.tag}<span class="bg-[var(--red)] text-white px-2 py-0.5 tracking-wider">{car.tag}</span>{/if}</div>
              <h1 class="font-strong text-[clamp(1.9rem,4vw,2.7rem)] uppercase leading-none tracking-tight mt-1.5">{car.model}</h1>
              <p class="text-[var(--muted)] text-sm mt-1.5">{car.trim}</p>
              <div class="flex items-end justify-between mt-6 pt-5 border-t border-[var(--line)]">
                <div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">Preço</div><div class="font-strong text-4xl text-[var(--red)] leading-none mt-1">{eur(car.price)}</div></div>
                <span class="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"/></svg> Garantia 24m</span>
              </div>
              <div class="mt-5 border border-[var(--line)] bg-[var(--bg)] p-5">
                <div class="flex items-center justify-between text-[12px] uppercase tracking-wider mb-3"><span class="text-[var(--muted)]">Prazo · {months}m</span><span class="font-strong text-[var(--red)] text-lg">{eur(monthly)}/mês</span></div>
                <input type="range" min="24" max="120" step="12" bind:value={months} class="w-full accent-[var(--red)] cursor-pointer" aria-label="Prazo em meses"/>
                <div class="flex justify-between text-[9px] uppercase tracking-widest text-[var(--faint)] mt-1"><span>24m</span><span>72m</span><span>120m</span></div>
                <p class="text-[10px] text-[var(--faint)] mt-3">TAEG indicativa 7,9% · sem entrada obrigatória.</p>
              </div>
              <div class="flex flex-col gap-2.5 mt-5">
                <a href={`https://wa.me/351210000000?text=${encodeURIComponent(`Olá! Tenho interesse no ${car.brand} ${car.model} (${car.year}) por ${eur(car.price)}.`)}`} target="_blank" rel="noopener noreferrer"
                  class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.176 5.18.003 11.538.003c3.082.001 5.98 1.2 8.156 3.376 2.176 2.175 3.373 5.07 3.371 8.154-.005 6.36-5.182 11.533-11.54 11.533-1.999-.001-3.96-.521-5.707-1.516L0 24zm6.59-4.846c1.6.95 3.197 1.453 4.937 1.454 5.31-.001 9.632-4.319 9.635-9.629.002-2.572-1.002-4.99-2.825-6.814-1.821-1.822-4.24-2.826-6.816-2.828-5.313 0-9.635 4.318-9.638 9.63-.001 1.832.484 3.619 1.408 5.185L1.87 21.082l4.777-1.928z"/></svg>
                  Falar por WhatsApp
                </a>
                <a href="tel:+351210000000" class="w-full border border-[var(--line)] hover:border-[var(--red)] py-3.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005 5l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 6V5z"/></svg>
                  Ligar 210 000 000
                </a>
              </div>
            </div>
            <div class="border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col gap-3">
              <h2 class="font-strong uppercase tracking-wide text-base">Pedir informações</h2>
              <input type="text" bind:value={cName} placeholder="Nome" class="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)]"/>
              <input type="text" bind:value={cContact} placeholder="Telemóvel ou email" class="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)]"/>
              <textarea bind:value={cMsg} rows="3" class="w-full bg-[var(--bg)] border border-[var(--line)] p-3 text-sm outline-none focus:border-[var(--red)] text-[var(--ink)] resize-none"></textarea>
              <button type="button" class="bg-[var(--red)] hover:bg-[var(--red-d)] text-white font-strong uppercase tracking-wide text-sm py-3 transition-colors">Enviar pedido</button>
            </div>
          </aside>
        </div>

        <!-- description + specs + equipment -->
        <div class="grid lg:grid-cols-12 gap-10 pt-12 mt-12 border-t border-[var(--line)]">
          <div class="lg:col-span-7 flex flex-col gap-10">
            <div><h2 class="font-strong text-2xl uppercase tracking-tight mb-3">Sobre a viatura</h2><p class="text-[var(--muted)] leading-relaxed text-[15px]">{car.description}</p></div>
            <div>
              <h2 class="font-strong text-2xl uppercase tracking-tight mb-5">Especificações</h2>
              <div class="grid sm:grid-cols-2 gap-x-10">
                {#each [
                  {l:'Matrícula',v:car.registration},{l:'Combustível',v:car.fuel},{l:'Caixa',v:car.transmission},{l:'Potência',v:`${car.power} cv`},
                  {l:'Cor',v:car.color},{l:'Portas',v:String(car.doors)},{l:'CO₂',v:car.co2},{l:'Consumo',v:car.consumption},
                  {l:'Bagageira',v:car.capacity},{l:'Estado',v:'Inspeccionada'}
                ] as s}
                  <div class="flex items-center justify-between py-3 border-b border-[var(--line)]"><span class="text-[11px] uppercase tracking-wider text-[var(--faint)]">{s.l}</span><span class="font-semibold text-[14px]">{s.v}</span></div>
                {/each}
              </div>
            </div>
          </div>
          <div class="lg:col-span-5">
            <h2 class="font-strong text-2xl uppercase tracking-tight mb-5">Equipamento</h2>
            <div class="border border-[var(--line)] bg-[var(--surface)] p-6">
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5">
                {#each car.equipment as eq}
                  <li class="flex items-start gap-2.5 text-[13px] text-[var(--muted)]"><svg class="w-4 h-4 text-[var(--red)] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7"/></svg>{eq}</li>
                {/each}
              </ul>
            </div>
          </div>
        </div>

        <!-- related -->
        <div class="pt-12 mt-12 border-t border-[var(--line)]">
          <h2 class="font-strong text-2xl uppercase tracking-tight mb-6">Stock relacionado</h2>
          <div class="grid sm:grid-cols-3 gap-5">
            {#each related as r}
              <a href="/stand-5/{r.id}" class="s5-card group flex flex-col bg-[var(--surface)] border border-[var(--line)] transition-colors">
                <div class="aspect-[16/10] overflow-hidden bg-[var(--surface-2)] relative"><img src={r.gallery[0]} alt={r.model} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div>
                <div class="p-4 flex items-end justify-between"><div><div class="text-[10px] uppercase tracking-widest text-[var(--faint)]">{r.brand} · {r.year}</div><h3 class="font-strong text-lg uppercase group-hover:text-[var(--red)] transition-colors">{r.model}</h3></div><span class="font-strong text-[15px] text-[var(--red)]">{eur(r.price)}</span></div>
              </a>
            {/each}
          </div>
        </div>
      </main>
    {:else}
      <div class="max-w-md mx-auto text-center py-28 px-6">
        <h1 class="font-strong text-2xl uppercase">Viatura não encontrada</h1>
        <p class="text-[var(--muted)] text-sm mt-2">Esta viatura poderá já ter sido vendida.</p>
        <a href="/stand-5#stock" class="inline-block mt-6 bg-[var(--red)] hover:bg-[var(--red-d)] text-white px-6 py-3 font-strong uppercase tracking-wide text-sm transition-colors">Ver stock</a>
      </div>
    {/if}

    <footer class="border-t border-[var(--line)] bg-[var(--surface)] mt-16">
      <div class="mx-auto max-w-[1600px] px-5 md:px-9 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2.5">{@render swoosh('w-11 h-6')}<span class="font-strong text-lg"><span class="text-[var(--red)]">AUTO</span>NUNES MARTINS</span></div>
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
  .font-strong { font-family: 'Barlow', system-ui, sans-serif; font-weight: 900; font-style: italic; letter-spacing: -0.015em; }
  .s5 { --red:#e2231a; --red-d:#b3140d; --red-l:#ff5347; --color-red:#e2231a; --bg:#16171a; --surface:#1f2024; --surface-2:#272a30; --ink:#f4f4f2; --muted:#a4a5ab; --faint:#76777e; --line:rgba(255,255,255,.10); --shadow:rgba(0,0,0,.6); }
  .s5:not(.dark) { --bg:#efeee9; --surface:#ffffff; --surface-2:#f4f3ef; --ink:#191a1e; --muted:#56585f; --faint:#8b8d94; --line:rgba(20,20,25,.10); --shadow:rgba(30,20,18,.3); }
  .s5-card:hover { border-color: color-mix(in oklab, var(--red) 55%, transparent); box-shadow: 0 24px 50px -32px var(--shadow); transform: translateY(-3px); }
  .s5-card { transition: transform .3s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s; }
</style>
