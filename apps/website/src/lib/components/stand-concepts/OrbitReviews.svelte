<script lang="ts">
  const examples = [
    { name: 'Marta Silva', text: 'Explicaram tudo com calma e tive tempo para escolher. Gostei da atenção desde a primeira conversa.', rating: 5 },
    { name: 'Pedro Costa', text: 'Pude ver o carro ao detalhe e esclarecer as minhas dúvidas. Um processo simples, sem pressas.', rating: 5 },
    { name: 'Ana Martins', text: 'A visita ajudou-me a perceber o que procurava. Atendimento próximo e informação fácil de entender.', rating: 4 },
  ];
</script>
<section class="reviews" aria-labelledby="reviews-heading">
  <div class="heading"><h2 id="reviews-heading">Os nossos clientes falam por si</h2><p class="preview-note">Avaliações fictícias para demonstração</p></div>
  <div class="review-grid">
    {#each examples as review}
      <article><div class="review-top"><span class="stars" aria-label={`Avaliação fictícia: ${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}<span class="empty">{'☆'.repeat(5 - review.rating)}</span></span><span class="quote" aria-hidden="true">“</span></div><div class="review-person"><span class="avatar" aria-hidden="true">{review.name.split(' ').map(part => part[0]).join('')}</span><div><h3>{review.name}</h3><span class="verification" title="Selo ilustrativo numa avaliação fictícia; sem verificação real."><svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 2 6 3v5c0 4-6 7-6 7s-6-3-6-7V5l6-3Z" stroke="currentColor"/><path d="m7 9 2 2 4-4" stroke="currentColor"/></svg>Verificado</span></div></div><p>{review.text}</p></article>
    {/each}
  </div>
</section>

<style>
  .reviews { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin: auto; padding-block: var(--orbit-space-section); }
  .heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-bottom: 32px; }
  p, h2, h3 { margin: 0; }
  h2 { max-width: 18ch; font-size: var(--orbit-title-section); line-height: 1.06; letter-spacing: -.05em; font-weight: 500; }
  .preview-note { max-width: 38ch; color: var(--muted); font-size: 11px; line-height: 1.8; }
  .review-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; }
  article { min-width: 0; padding: clamp(24px, 2.5vw, 38px); background: var(--orbit-panel-bg); border: 1px solid var(--line); border-radius: 12px; }
  .stars { display: block; color: #b8860b; font-size: 15px; letter-spacing: .15em; margin-bottom: 20px; }
  :global(.dark) .stars { color: #e8b94f; }
  .empty { color: inherit; }
  .review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
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
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    article { --tilt: -1deg; transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
    article:nth-child(2) { --tilt: .7deg; }
    article:nth-child(3) { --tilt: -0.5deg; }
    article:hover { transform: perspective(1000px) translateY(-5px) rotateZ(var(--tilt)) rotateX(1deg); box-shadow: 0 16px 30px #00000012; border-color: color-mix(in srgb, var(--text) 22%, var(--line)); }
  }
  @media (max-width: 850px) { .heading { display: block; } .preview-note { margin-top: 22px; } .review-grid { grid-template-columns: 1fr; } }
</style>
