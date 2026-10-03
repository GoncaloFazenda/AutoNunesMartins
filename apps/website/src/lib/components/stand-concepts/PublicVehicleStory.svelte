<script lang="ts">
  import type { PublicVehicle } from '$lib/publicVehicles';
  import OrbitAccordion from './OrbitAccordion.svelte';

  let { vehicle }: { vehicle: PublicVehicle } = $props();
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
  {#if paragraphs.length}
    <section class="story-section description" aria-labelledby="vehicle-story-title">
      <p class="eyebrow">O ANÚNCIO EM DETALHE</p>
      <h2 id="vehicle-story-title">Sobre esta viatura.</h2>
      <div class="description-copy">
        {#each paragraphs as paragraph, index}<p class:lead={index === 0}>{paragraph}</p>{/each}
      </div>
    </section>
  {/if}

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
  .public-story { grid-column: 1; min-width: 0; }
  .story-section { padding-block: var(--detail-space, 56px); border-top: 1px solid var(--line); }
  .eyebrow { margin: 0 0 20px; color: var(--muted); font-size: 10px; letter-spacing: .12em; }
  h2 { margin: 0 0 32px; font-size: clamp(34px, 3.4vw, 56px); font-weight: 500; line-height: 1.14; letter-spacing: -.045em; }
  h2 span { color: var(--muted); }
  .description-copy { max-width: 66ch; }
  .description-copy p { margin: 20px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--muted); line-height: 1.8; font-size: 16px; }
  .description-copy .lead { color: var(--text); font-size: clamp(20px, 2vw, 26px); line-height: 1.55; letter-spacing: -.025em; }
  ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; list-style: none; padding: 0; margin: 0; }
  li { display: flex; gap: 16px; padding-block: 20px; border-bottom: 1px solid var(--line); line-height: 1.5; overflow-wrap: anywhere; min-width: 0; }
  li span { color: var(--red); }
  .intro { max-width: 56ch; margin: 0 0 36px; font-size: 16px; line-height: 1.8; color: var(--muted); }
  @media (max-width: 700px) {
    h2 { font-size: clamp(32px, 8.8vw, 44px); }
    ul { grid-template-columns: 1fr; }
  }
</style>
