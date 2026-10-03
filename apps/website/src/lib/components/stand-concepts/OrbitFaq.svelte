<script lang="ts">
  import OrbitAccordion from './OrbitAccordion.svelte';
  const defaultQuestions = [
    {
      question: 'Como posso visitar o stand?',
      answer:
        'Indique a viatura que quer conhecer e a sua disponibilidade no formulário. Combinamos consigo o próximo passo.',
    },
    {
      question: 'Posso guardar uma viatura?',
      answer:
        'Sim. Use o coração junto de cada carro. A seleção fica guardada neste navegador e pode consultá-la no filtro Guardadas.',
    },
    {
      question: 'Como posso saber mais sobre uma viatura?',
      answer:
        'Abra a página da viatura para ver os detalhes. Se quiser esclarecer alguma questão, fale connosco pelo formulário ou pelos contactos do stand.',
    },
  ];
  let {
    questions = defaultQuestions,
    heading = 'Perguntas frequentes',
    showIntro = false,
  }: {
    questions?: { question: string; answer: string }[];
    heading?: string;
    showIntro?: boolean;
  } = $props();
</script>

<section class="orbit-faq" aria-labelledby="faq-heading">
  <div class="faq-heading">
    <h2 id="faq-heading">{heading}<span>.</span></h2>
    {#if showIntro}<p>Visitar, guardar, conhecer melhor.<br />O essencial, sem complicar.</p>{/if}
  </div>
  <OrbitAccordion items={questions} idPrefix="faq" />
</section>

<style>
  .orbit-faq {
    width: var(--orbit-frame, 90%);
    max-width: var(--orbit-frame-max, 1720px);
    margin: auto;
    padding-block: var(--orbit-space-section, 86px);
  }
  .faq-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 40px;
    margin-bottom: var(--orbit-space-heading, 40px);
  }
  h2,
  p {
    margin: 0;
  }
  h2 {
    font-size: var(--orbit-title-section, clamp(38px, 4.1vw, 64px));
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 1.12;
  }
  h2 > span {
    color: var(--red);
  }
  .faq-heading > p {
    color: var(--muted);
    font-size: var(--orbit-type-reading, 16px);
    line-height: var(--orbit-leading-reading, 1.7);
    flex-shrink: 0;
  }
  @media (max-width: 850px) {
    .faq-heading {
      display: block;
      margin-bottom: 36px;
    }
    .faq-heading > p {
      margin-top: 22px;
    }
  }
  @media (max-width: 700px) {
    h2 {
      max-width: 13ch;
    }
  }
</style>
