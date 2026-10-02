<script lang="ts">
  import { onMount } from 'svelte';
  import { reviewExcerpt } from './reviewExcerpt';

  let section: HTMLElement;
  let visible = false;
  let pageVisible = true;
  let expandedReviews: number[] = [];

  function toggleReview(index: number) {
    expandedReviews = expandedReviews.includes(index)
      ? expandedReviews.filter(value => value !== index)
      : [...expandedReviews, index];
  }

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
    });
    observer.observe(section);
    const updateVisibility = () => { pageVisible = !document.hidden; };
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  });

  const examples = [
    { name: 'Marta Silva', text: 'Explicaram tudo com calma e tive tempo para escolher. Gostei da atenção desde a primeira conversa. Antes de visitar o stand, tinha dúvidas sobre qual seria o carro mais adequado para o meu dia a dia e para as viagens em família. Durante a visita consegui comparar várias opções, conhecer os detalhes de cada uma e experimentar a que mais me interessava. Também me explicaram os passos seguintes de forma simples, sem me apressarem a tomar uma decisão. Voltei com algumas perguntas e encontrei a mesma disponibilidade para esclarecer tudo. O que mais valorizei foi poder fazer a escolha ao meu ritmo, com informação clara e atenção aos pormenores que, para mim, faziam a diferença.', rating: 5 },
    { name: 'Pedro Costa', text: 'Pude ver o carro ao detalhe e esclarecer as minhas dúvidas. Um processo simples, sem pressas.', rating: 5 },
    { name: 'Ana Martins', text: 'A visita ajudou-me a perceber o que procurava. Atendimento próximo e informação fácil de entender.', rating: 4 },
  ];
</script>
<section class="reviews" bind:this={section} aria-labelledby="reviews-heading">
  <div class="heading"><h2 id="reviews-heading">Quem veio, conta.</h2></div>
  <div class="review-viewport">
  <div id="reviews-track" class="review-track" class:paused={!visible || !pageVisible || expandedReviews.length > 0}>
  {#each [false, true] as duplicate}
  <div class="review-grid" class:duplicate aria-hidden={duplicate ? 'true' : undefined}>
    {#each examples as review, index}
      {@const preview = reviewExcerpt(review.text)}
      {@const expanded = expandedReviews.includes(index)}
      <article>
        <div class="review-header">
          <div class="review-top">
            <span class="stars" aria-label={`Avaliação fictícia: ${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}<span class="empty">{'☆'.repeat(5 - review.rating)}</span></span>
            <span class="quote" aria-hidden="true">“</span>
          </div>
          <div class="review-person">
            <span class="avatar" aria-hidden="true">{review.name.split(' ').map(part => part[0]).join('')}</span>
            <div class="person-meta">
              <h3>{review.name}</h3>
              <span class="verification" title="Selo ilustrativo numa avaliação fictícia; sem verificação real.">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 2 6 3v5c0 4-6 7-6 7s-6-3-6-7V5l6-3Z" stroke="currentColor"/><path d="m7 9 2 2 4-4" stroke="currentColor"/></svg>Verificado
              </span>
            </div>
          </div>
        </div>
        <p><span id={`review-text-${duplicate ? 'copy' : 'original'}-${index}`}>{expanded ? review.text : preview.text}</span>{' '}
        {#if preview.truncated}
          <button
            type="button"
            class="review-more"
            aria-expanded={expanded}
            aria-controls={`review-text-${duplicate ? 'copy' : 'original'}-${index}`}
            aria-label={`${expanded ? 'Ver menos' : 'Ver mais'} da avaliação de ${review.name}`}
            tabindex={duplicate ? -1 : 0}
            on:click={() => toggleReview(index)}
          >{expanded ? 'Ver menos' : 'Ver mais'}</button>
        {/if}
        </p>
      </article>
    {/each}
  </div>
  {/each}
  </div>
  </div>
</section>

<style>
  .reviews { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin: auto; padding-block: var(--orbit-space-section); }
  .heading { margin-bottom: var(--orbit-space-heading, 36px); }
  p, h2, h3 { margin: 0; }
  h2 { max-width: 21ch; font-size: max(32px, calc(var(--orbit-title-section, 48px) * .9)); line-height: 1.12; letter-spacing: -.05em; font-weight: 500; text-wrap: balance; }
  .review-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; align-items: start; }
  .duplicate { display: none; }
  article { min-width: 0; padding: clamp(24px, 2.5vw, 38px); background: var(--orbit-panel-bg); border: 1px solid var(--line); border-radius: 12px; }
  .stars { display: block; color: #b8860b; font-size: 15px; letter-spacing: .15em; margin-bottom: 20px; }
  :global(.dark) .stars { color: #e8b94f; }
  .empty { color: inherit; }
  .review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .review-header { display: contents; }
  .review-top .stars { margin-bottom: 0; }
  .quote { color: var(--muted); opacity: .35; font-family: Georgia, serif; font-size: 42px; line-height: .7; }
  .review-person { display: flex; align-items: center; gap: 11px; margin-bottom: 16px; }
  .avatar { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%; background: color-mix(in srgb,var(--text) 6%,transparent); color: var(--muted); font-size: 11px; letter-spacing: .02em; }
  .review-person h3 { margin-bottom: 0; }
  .verification { display: inline-flex; align-items: center; gap: 5px; margin-top: 5px; color: #637b6d; font-size: 10px; }
  .verification svg { width: 14px; height: 14px; flex-shrink: 0; }
  :global(.dark) .verification { color: #899e91; }
  h3 { font-size: 16px; letter-spacing: -.02em; font-weight: 500; margin-bottom: 10px; }
  article > p { font-size: var(--orbit-type-body); line-height: 1.8; color: var(--muted); }
  .review-more {
    display: inline; margin: 0; padding: 0; background: none; border: 0;
    color: var(--text); font: inherit; font-size: .9em; font-weight: 500;
    white-space: nowrap; cursor: pointer;
  }
  .review-more:hover { text-decoration: underline; text-underline-offset: 4px; }
  .review-more:focus-visible { outline: 2px solid var(--text); outline-offset: 4px; border-radius: 2px; }
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    article { --tilt: -1deg; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
    article:nth-child(2) { --tilt: .7deg; }
    article:nth-child(3) { --tilt: -0.5deg; }
    article:hover { transform: perspective(1000px) translateY(-5px) rotateZ(var(--tilt)) rotateX(1deg); box-shadow: 0 16px 30px #00000012; border-color: color-mix(in srgb, var(--text) 22%, var(--line)); }
  }
  @media (max-width: 1200px) {
    .review-header {
      position: relative;
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      grid-template-areas: 'avatar name' 'meta meta';
      gap: 6px 11px;
      align-items: center;
      margin-bottom: 16px;
    }
    .review-top,
    .review-person,
    .person-meta { display: contents; }
    .avatar { grid-area: avatar; }
    .review-person h3 { grid-area: name; padding-right: 26px; }
    .quote { position: absolute; top: 4px; right: 0; }
    .stars { grid-area: meta; justify-self: end; font-size: 14px; letter-spacing: .1em; }
    .verification { grid-area: meta; justify-self: start; margin-top: 0; }
  }
  @keyframes reviews-pass {
    to { transform: translateX(-50%); }
  }
  @media (max-width: 1100px) {
    .reviews { width: 100%; max-width: none; }
    .heading { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin-inline: auto; }
    .review-viewport {
      --edge-fade: clamp(20px, 5vw, 52px);
      overflow: hidden;
      padding-block: 7px 12px;
      mask-image: linear-gradient(to right, transparent, #000 var(--edge-fade), #000 calc(100% - var(--edge-fade)), transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--edge-fade), #000 calc(100% - var(--edge-fade)), transparent);
    }
    .review-track { display: flex; width: max-content; animation: reviews-pass 42s linear infinite; }
    .review-track.paused, .review-viewport:active .review-track, .review-viewport:focus-within .review-track { animation-play-state: paused; }
    .review-grid, .duplicate { display: flex; flex: none; gap: 16px; padding-right: 16px; }
    article { flex: 0 0 auto; width: clamp(270px, 42vw, 360px); box-sizing: border-box; }
  }
  @media (max-width: 1100px) and (hover: hover) {
    .review-viewport:hover .review-track { animation-play-state: paused; }
  }
  @media (max-width: 700px) {
    article { width: min(82vw, 340px); }
  }
  @media (max-width: 1100px) and (prefers-reduced-motion: reduce) {
    .review-track { animation: none; }
    .duplicate { display: none; }
    .review-viewport { overflow-x: auto; scroll-snap-type: x mandatory; mask-image: none; -webkit-mask-image: none; }
    .review-grid { padding-right: 0; }
    article { scroll-snap-align: start; }
  }
</style>
