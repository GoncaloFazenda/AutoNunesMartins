<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { photo } from './data';
  let { onContact }: { onContact: (message: string) => void } = $props();
</script>

<section class="orbit-details" data-scene data-approach aria-labelledby="details-heading">
  <div
    class="detail-composition"
    data-approach-target
    aria-label="Duas perspetivas do universo Porsche"
  >
    <div class="detail-grid" aria-hidden="true"></div>
    <figure class="detail-main">
      <img
        src={photo('photo-1503376780353-7e6692767b70', 1300)}
        alt="Porsche 911, vista traseira e perfil"
        loading="lazy"
      />
      <figcaption><span>01 — O PRIMEIRO OLHAR</span><ArrowUpRight size={20} /></figcaption>
    </figure>
    <figure class="detail-crop">
      <img
        src={photo('photo-1503376780353-7e6692767b70', 1300)}
        alt="Pormenor da traseira do Porsche 911"
        loading="lazy"
      />
      <figcaption>02 — MAIS DE PERTO</figcaption>
    </figure>
    <span class="detail-cross" aria-hidden="true">+</span>
    <span class="detail-index" aria-hidden="true">01 / 02</span>
  </div>
  <div class="detail-copy">
    <p class="eyebrow">03 / A ESCOLHA DE PERTO</p>
    <h2 id="details-heading">O primeiro olhar atrai.<br /><span>Os detalhes decidem.</span></h2>
    <p class="intro-copy">
      A fotografia desperta a vontade. Conhecer a viatura é descobrir se faz sentido para si.
    </p>
    <ol>
      <li>
        <span>01</span>
        <div>
          <h3>Veja o conjunto.</h3>
          <p>Proporções, espaço e presença. Imagine-o nos seus dias.</p>
        </div>
      </li>
      <li>
        <span>02</span>
        <div>
          <h3>Aproxime-se.</h3>
          <p>Explore o equipamento, os quilómetros e as características.</p>
        </div>
      </li>
      <li>
        <span>03</span>
        <div>
          <h3>Tire as suas dúvidas.</h3>
          <p>Fale connosco e combine uma visita para o conhecer de perto.</p>
        </div>
      </li>
    </ol>
    <button onclick={() => onContact('Gostava de conhecer uma viatura de perto.')}
      >Conhecer de perto <ArrowUpRight size={19} /></button
    >
  </div>
</section>

<style>
  .orbit-details {
    --approach: 1;
    --reveal-a: 1;
    --reveal-b: 1;
    --reveal-c: 1;
    width: 95%;
    max-width: 1640px;
    margin: 20px auto 70px;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
    gap: clamp(36px, 6vw, 100px);
    padding-block: 48px;
  }
  .detail-composition {
    height: clamp(430px, 38vw, 570px);
    position: relative;
    perspective: 1000px;
  }
  .detail-grid {
    position: absolute;
    inset: 3% 6% 7% 0;
    background-image:
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.23;
    mask-image: radial-gradient(ellipse, #000 10%, transparent 72%);
  }
  figure {
    margin: 0;
    position: absolute;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: #202022;
  }
  figure:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 55%, #0009);
    pointer-events: none;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .detail-main {
    width: 87%;
    height: 72%;
    left: 0;
    top: 3%;
  }
  .detail-crop {
    width: 48%;
    height: 46%;
    right: 0;
    bottom: 0;
    box-shadow: 0 22px 45px #0004;
  }
  .detail-crop img {
    object-position: 34% 63%;
    transform: scale(1.8);
    transform-origin: 25% 66%;
  }
  figcaption {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 10px;
    letter-spacing: 0.09em;
    z-index: 1;
  }
  .detail-cross {
    color: var(--red);
    position: absolute;
    top: 0;
    right: 0;
    font-size: 35px;
    font-weight: 300;
    line-height: 1;
  }
  .detail-index {
    position: absolute;
    bottom: 15px;
    left: 0;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.15em;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin: 0 0 25px;
  }
  h2 {
    font-size: clamp(30px, 3.1vw, 48px);
    letter-spacing: -0.05em;
    font-weight: 500;
    line-height: 1.14;
    margin: 0;
  }
  h2 span {
    color: var(--muted);
  }
  .intro-copy {
    font-size: 14px;
    line-height: 1.8;
    color: var(--muted);
    max-width: 47ch;
    margin: 22px 0 28px;
  }
  ol {
    list-style: none;
    margin: 0 0 28px;
    padding: 0 0 0 23px;
    position: relative;
  }
  ol:before,
  ol:after {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    bottom: 5px;
    width: 1px;
    background: var(--line);
  }
  ol:after {
    background: var(--red);
    transform-origin: top;
  }
  li {
    display: flex;
    gap: 18px;
    padding-block: 12px;
  }
  li > span {
    padding-top: 3px;
    font-size: 10px;
    color: var(--red);
  }
  h3 {
    margin: 0 0 5px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.025em;
  }
  li p {
    font-size: 13px;
    line-height: 1.65;
    margin: 0;
    color: var(--muted);
    max-width: 44ch;
  }
  button {
    font: inherit;
    font-size: 13px;
    display: inline-flex;
    gap: 26px;
    align-items: center;
    min-height: 46px;
    padding: 11px 0;
    border: 0;
    border-bottom: 1px solid var(--text);
    background: transparent;
    color: var(--text);
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 6px;
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .detail-main {
      clip-path: inset(0 calc((1 - var(--reveal-a)) * 75%) 0 0 round 5px);
      transform: translateY(calc((1 - var(--approach)) * 20px));
    }
    :global(.motion-on) .detail-crop {
      clip-path: inset(calc((1 - var(--reveal-b)) * 100%) 0 0 0 round 5px);
      transform: translateY(calc((1 - var(--reveal-b)) * 35px))
        rotate(calc((1 - var(--reveal-b)) * 6deg));
    }
    :global(.motion-on) ol:after {
      transform: scaleY(var(--approach));
    }
    :global(.motion-on) li:nth-child(1) {
      transform: translateX(calc((1 - var(--reveal-a)) * 16px));
    }
    :global(.motion-on) li:nth-child(2) {
      transform: translateX(calc((1 - var(--reveal-b)) * 16px));
    }
    :global(.motion-on) li:nth-child(3) {
      transform: translateX(calc((1 - var(--reveal-c)) * 16px));
    }
    :global(.motion-on) .detail-cross {
      transform: rotate(calc(var(--approach) * 90deg));
    }
  }
  @media (max-width: 1000px) {
    .orbit-details {
      gap: 30px;
      grid-template-columns: 1fr 1fr;
    }
    .detail-composition {
      height: 410px;
    }
    h2 {
      font-size: 33px;
    }
  }
  @media (max-width: 700px) {
    .orbit-details {
      width: 90%;
      display: flex;
      flex-direction: column;
      gap: 36px;
      padding-block: 25px;
      margin-bottom: 30px;
    }
    .detail-composition {
      height: clamp(310px, 75vw, 460px);
      width: 100%;
    }
    .detail-copy {
      width: 100%;
    }
    h2 {
      font-size: clamp(31px, 7.9vw, 43px);
    }
    .eyebrow {
      margin-bottom: 18px;
    }
    .intro-copy {
      margin-block: 18px;
    }
  }
</style>
