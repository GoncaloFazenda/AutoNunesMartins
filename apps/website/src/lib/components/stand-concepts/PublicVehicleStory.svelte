<script lang="ts">
  import { publicPhoto, type PublicVehicle } from '$lib/publicVehicles';
  import { ArrowUpRight } from 'lucide-svelte';
  import OrbitAccordion from './OrbitAccordion.svelte';

  let { vehicle, onContact }: { vehicle: PublicVehicle; onContact: () => void } = $props();
  const bannerPhoto = $derived(vehicle.photos.length ? publicPhoto(vehicle.slug, 0) : null);
  let failedPhoto = $state<string | null>(null);
  const paragraphs = $derived((vehicle.description ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean));
  const equipment = $derived([...new Set((vehicle.specifications?.equipment ?? []).map(item => item.trim()).filter(Boolean))]);
  const questions = $derived([
    {
      question: vehicle.availability === 'RESERVED' ? 'Esta viatura está reservada. E agora?' : 'Como preparar uma visita?',
      answer: vehicle.availability === 'RESERVED'
        ? 'Antes de se deslocar, pergunte ao stand se a reserva se mantém. Pode também explorar as viaturas com preços próximos no fim desta página.'
        : `Confirme a disponibilidade do ${vehicle.brand} ${vehicle.model} e combine o dia e a hora com o stand. Se pretende fazer um ensaio de condução, pergunte antecipadamente pelas condições.`,
    },
    {
      question: ['ELECTRIC', 'PLUGIN_HYBRID'].includes(vehicle.fuel) ? 'O que perguntar sobre a bateria e o carregamento?' : vehicle.fuel === 'HYBRID' ? 'O que perguntar sobre o sistema híbrido?' : vehicle.fuel === 'LPG' ? 'O que confirmar sobre o sistema GPL?' : 'Que informação de manutenção devo pedir?',
      answer: ['ELECTRIC', 'PLUGIN_HYBRID'].includes(vehicle.fuel)
        ? 'Peça informação sobre o estado da bateria, os cabos incluídos e as opções de carregamento desta unidade. Confirme a autonomia e as condições de qualquer cobertura aplicável.'
        : vehicle.fuel === 'HYBRID'
          ? 'Peça os registos de manutenção e informação sobre o estado da bateria do sistema híbrido. Confirme as condições de qualquer cobertura aplicável a esta unidade.'
          : vehicle.fuel === 'LPG'
            ? 'Pergunte pelos registos de manutenção do sistema GPL e pela documentação e inspeções aplicáveis ao depósito e à instalação.'
            : 'Peça os registos de manutenção disponíveis, a data e a quilometragem da última intervenção e as próximas operações previstas. Confirme também a inspeção e a documentação da viatura.',
    },
    {
      question: 'O que confirmar antes de decidir?',
      answer: `${vehicle.price === null ? 'Peça o preço e as condições de venda por escrito.' : 'Confirme por escrito o preço final e o que está incluído.'} Esclareça as condições de entrega e de garantia aplicáveis. Na visita, verifique o estado da viatura e experimente os equipamentos que são importantes para si.`,
    },
  ]);
</script>

<div class="public-story">
    <section class="story-section description" aria-labelledby="vehicle-story-title">
      {#if bannerPhoto && failedPhoto !== bannerPhoto}
        <img class="banner-photo" src={bannerPhoto} alt="" loading="lazy" onerror={() => failedPhoto = bannerPhoto} />
      {/if}
      <span class="banner-arrow" aria-hidden="true">↗</span>
      <div class="banner-content">
      <p class="eyebrow">O ANÚNCIO EM DETALHE</p>
      <h2 id="vehicle-story-title">Sobre esta viatura.</h2>
      <div class="description-copy">
        {#each paragraphs as paragraph, index}<p class:lead={index === 0}>{paragraph}</p>{/each}
      </div>
      <button class="banner-contact" onclick={onContact}>Vamos falar <ArrowUpRight size={18} aria-hidden="true" /></button>
      </div>
    </section>

  {#if equipment.length}
    <section class="story-section" aria-labelledby="vehicle-equipment-title">
      <p class="eyebrow">A BORDO DESTA VIATURA</p>
      <h2 id="vehicle-equipment-title">Equipamento.</h2>
      <ul>{#each equipment as item}<li><span aria-hidden="true">↗</span>{item}</li>{/each}</ul>
    </section>
  {/if}

  <section class="story-section visit" aria-labelledby="vehicle-visit-title">
    <p class="eyebrow">DA FICHA À VISITA</p>
    <h2 id="vehicle-visit-title">Conhecer melhor.<br /><span>Decidir com confiança.</span></h2>
    <p class="intro">Há detalhes que se esclarecem de perto. Leve estas perguntas para a conversa sobre o {vehicle.brand} {vehicle.model}.</p>
    {#key vehicle.slug}<OrbitAccordion items={questions} idPrefix={'visit-' + vehicle.slug} />{/key}
  </section>
</div>

<style>
  .public-story { grid-column: 1; min-width: 0; --orbit-leading-reading: 1.8; }
  .story-section { padding-block: clamp(64px, 5vw, 88px); border-top: 1px solid var(--line); }
  .eyebrow { margin: 0 0 20px; color: var(--muted); font-size: 10px; letter-spacing: .12em; }
  h2 { margin: 0 0 32px; font-size: clamp(34px, 3.4vw, 56px); font-weight: 500; line-height: 1.14; letter-spacing: -.045em; }
  h2 span { color: var(--muted); }
  .description-copy { max-width: 60ch; }
  .description-copy p { margin: 24px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--muted); line-height: 1.8; font-size: 16px; }
  .description-copy p:first-child { margin-top: 0; }
  .description-copy .lead { color: var(--text); font-size: clamp(20px, 2vw, 26px); line-height: 1.55; letter-spacing: -.025em; }
  .description { position: relative; isolation: isolate; overflow: hidden; min-height: 420px; box-sizing: border-box; padding: clamp(28px, 4vw, 56px); border: 0; color: #fff; background: linear-gradient(135deg, #24272b, #101012 75%); }
  .banner-photo { position: absolute; inset: 0; z-index: -3; width: 100%; height: 100%; object-fit: cover; }
  .description::before { content: ''; position: absolute; inset: 0; z-index: -2; background: linear-gradient(90deg, rgb(0 0 0 / .88) 0%, rgb(0 0 0 / .67) 66%, rgb(0 0 0 / 0) 100%); }
  .description { display: flex; }
  .banner-content { position: relative; display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
  .description-copy { margin-bottom: 32px; }
  .banner-arrow { position: absolute; z-index: -1; right: 18px; bottom: 8px; font-size: clamp(100px, 15vw, 200px); line-height: 1; color: color-mix(in srgb, var(--red) 18%, transparent); pointer-events: none; }
  .description .eyebrow { color: #ddd; }
  .description-copy p, .description-copy .lead { color: #fff; }
  .banner-contact { display: inline-flex; align-items: center; gap: 24px; margin-top: auto; min-height: 46px; padding: 12px 22px; border: 0; border-radius: 50px; background: #fff; color: #101012; font: inherit; font-size: 13px; cursor: pointer; }
  .banner-contact:hover, .banner-contact:focus-visible { background: var(--red); color: #fff; }
  .banner-contact:focus-visible { outline: 2px solid #fff; outline-offset: 5px; }
  @media (prefers-reduced-motion: no-preference) {
    .banner-contact { transition: transform .25s ease, background .25s ease; }
    .banner-contact:hover, .banner-contact:focus-visible { transform: translateY(-3px); }
  }
  ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 40px; list-style: none; padding: 0; margin: 0; }
  li { display: flex; gap: 16px; padding-block: 24px; border-bottom: 1px solid var(--line); line-height: 1.7; overflow-wrap: anywhere; min-width: 0; }
  li span { color: var(--red); }
  .intro { max-width: 56ch; margin: 0 0 40px; font-size: 16px; line-height: 1.8; color: var(--muted); }
  .visit :global(.answer > p) { max-width: 58ch; }
  @media (max-width: 700px) {
    .story-section { padding-block: 48px; }
    .description { margin-inline: -5.5555556%; padding: 28px 5%; min-height: 280px; }
    .description h2 { margin-bottom: 20px; }
    .description .eyebrow { margin-bottom: 14px; }
    .description-copy { margin-bottom: 24px; }
    li { padding-block: 22px; }
    h2 { font-size: clamp(28px, 7.7vw, 34px); }
    ul { grid-template-columns: 1fr; }
  }
</style>
