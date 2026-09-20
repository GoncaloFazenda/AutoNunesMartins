<script lang="ts">
  import { ArrowUpRight, Plus, Minus } from 'lucide-svelte';
  import { photo } from './data';
  let active = $state(0);
  const points = [
    {
      label: 'Ao volante',
      title: 'Tudo começa aqui.',
      text: 'A posição de condução, o toque do volante e a forma como tudo fica à mão.',
    },
    {
      label: 'O seu espaço',
      title: 'Sinta-se no seu lugar.',
      text: 'Os materiais, a luz e o espaço. Há detalhes que só se percebem quando nos sentamos.',
    },
    {
      label: 'Cada detalhe',
      title: 'Olhe uma segunda vez.',
      text: 'Comandos, acabamentos e equipamento. Traga as suas perguntas para a visita.',
    },
  ];
  const current = $derived(points[active]!);
  const interior = photo('photo-1652453822981-653a9a522a5b', 2200);
</script>

<section class="cabin-reveal" data-scene data-approach aria-labelledby="cabin-heading">
  <div class="cabin-heading">
    <div>
      <p class="eyebrow">POR DENTRO DA ESCOLHA</p>
      <h2 id="cabin-heading">O melhor lugar.<br /><span>O seu.</span></h2>
    </div>
    <p class="cabin-intro">Não é só sobre chegar.<br />É sobre como se sente pelo caminho.</p>
  </div>
  <div class="cabin-stage" data-approach-target>
    <div class="cabin-light" aria-hidden="true"></div>
    <div
      class="panorama"
      role="img"
      aria-label="Habitáculo Mercedes-Benz com volante e consola central, fotografia ilustrativa"
    >
      {#each [0, 1, 2] as panel}
        <div class="cabin-panel panel-{panel}" aria-hidden="true">
          <img src={interior} alt="" loading="lazy" style={`left: ${panel * -100}%`} />
          <div class="fold-shade"></div>
        </div>
      {/each}
    </div>
    <div class="panorama-caption">
      <span>UM OUTRO PONTO DE VISTA</span><span>INTERIOR / SELEÇÃO AUTOMÓVEL</span>
    </div>
    <div class="cabin-points" aria-label="Explorar o habitáculo">
      {#each points as point, index}
        <button
          class:active={active === index}
          aria-label={point.label}
          aria-pressed={active === index}
          aria-controls="cabin-description"
          onclick={() => (active = index)}
        >
          <span class="point-icon"
            >{#if active === index}<Minus size={15} />{:else}<Plus size={15} />{/if}</span
          >
          <span class="point-label">{point.label}</span>
        </button>
      {/each}
    </div>
    <span
      class="cabin-coordinate"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Perspetiva ${active + 1} de ${points.length}: ${current.label}`}
      ><span class="coordinate-active">{String(active + 1).padStart(2, '0')}</span> de {String(
        points.length,
      ).padStart(2, '0')}</span
    >
  </div>
  <div class="cabin-caption">
    <div class="cabin-tabs" aria-label="Perspetivas do interior">
      {#each points as point, index}
        <button
          class:active={active === index}
          aria-pressed={active === index}
          aria-controls="cabin-description"
          onclick={() => (active = index)}><span>0{index + 1}</span>{point.label}</button
        >
      {/each}
    </div>
    <div class="cabin-description" id="cabin-description" aria-live="polite" aria-atomic="true">
      {#key active}<div class="description-message">
          <h3>{current.title}</h3>
          <p>{current.text}</p>
        </div>{/key}
    </div>
    <a href="#selecao" class="cabin-link"
      >Encontrar o meu próximo carro <ArrowUpRight size={18} /></a
    >
  </div>
</section>

<style>
  .cabin-reveal {
    --approach: 1;
    --reveal-a: 1;
    --reveal-b: 1;
    --reveal-c: 1;
    --unfold: 1;
    width: 95%;
    max-width: 1640px;
    margin: 22px auto 78px;
    padding-block: 38px;
  }
  .cabin-reveal * {
    box-sizing: border-box;
  }
  .cabin-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 30px;
    margin-bottom: 30px;
  }
  .eyebrow {
    margin: 0 0 18px;
    font-size: 11px;
    letter-spacing: 0.13em;
    color: var(--muted);
  }
  h2 {
    margin: 0;
    font-size: clamp(36px, 4vw, 62px);
    font-weight: 500;
    letter-spacing: -0.065em;
    line-height: 1.06;
  }
  h2 > span {
    color: var(--muted);
  }
  .cabin-intro {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.7;
    margin: 0 0 3px;
  }
  .cabin-stage {
    position: relative;
    height: clamp(350px, 35vw, 505px);
    perspective: 1600px;
  }
  .cabin-light {
    position: absolute;
    inset: -25% -5%;
    pointer-events: none;
    background: radial-gradient(
      ellipse,
      color-mix(in srgb, var(--red) 5%, transparent),
      transparent 65%
    );
  }
  .panorama {
    position: absolute;
    inset: 0;
    display: flex;
    transform-style: preserve-3d;
  }
  .cabin-panel {
    position: relative;
    width: calc(100% / 3);
    height: 100%;
    overflow: hidden;
    background: #19191b;
    backface-visibility: hidden;
  }
  .cabin-panel img {
    position: absolute;
    top: 0;
    width: 300%;
    max-width: none;
    height: 100%;
    object-fit: cover;
    object-position: center 53%;
    display: block;
  }
  .cabin-panel:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(#0003, transparent 28%, transparent 50%, #000b);
    pointer-events: none;
  }
  .panel-0 {
    transform-origin: right center;
    border-radius: 6px 0 0 6px;
  }
  .panel-2 {
    transform-origin: left center;
    border-radius: 0 6px 6px 0;
  }
  .fold-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #0007, transparent);
    opacity: 0;
  }
  .panel-2 .fold-shade {
    background: linear-gradient(270deg, #0007, transparent);
  }
  .panorama-caption {
    position: absolute;
    top: 24px;
    left: 26px;
    right: 26px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    color: #fff;
    font-size: 9px;
    letter-spacing: 0.14em;
    pointer-events: none;
  }
  .cabin-points {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .cabin-points button {
    position: absolute;
    translate: -50% 0;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 11px;
    align-items: center;
    min-width: 80px;
    min-height: 70px;
    padding: 5px;
    color: white;
    font: inherit;
    font-size: 10px;
    background: none;
    border: 0;
    cursor: pointer;
  }
  .cabin-points button:nth-child(1) {
    left: 14%;
    top: 24%;
  }
  .cabin-points button:nth-child(2) {
    left: 49%;
    top: 65%;
  }
  .cabin-points button:nth-child(3) {
    left: 83%;
    top: 43%;
  }
  .point-icon {
    position: relative;
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 1px solid #ffffff80;
    background: #1414167a;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 0 5px #ffffff0d;
    transition:
      color 220ms,
      border-color 220ms;
  }
  .point-icon::after {
    content: '';
    position: absolute;
    inset: -5px;
    border: 1px solid #ffffff70;
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .point-icon::after {
      animation: hotspot-pulse 3.4s ease-out infinite;
    }
    .cabin-points button:nth-child(2) .point-icon::after {
      animation-delay: 0.65s;
    }
    .cabin-points button:nth-child(3) .point-icon::after {
      animation-delay: 1.3s;
    }
    .cabin-points button:hover .point-icon::after,
    .cabin-points button:focus-visible .point-icon::after {
      /* Remove the ring as well as its motion, even when hover begins mid-pulse. */
      animation: none;
      opacity: 0;
    }
    @keyframes hotspot-pulse {
      0%,
      65%,
      100% {
        opacity: 0;
        transform: scale(1);
      }
      12% {
        opacity: 0.45;
      }
      55% {
        opacity: 0;
        transform: scale(1.95);
      }
    }
  }
  .cabin-points .active .point-icon {
    background: var(--red);
    border-color: var(--red);
    color: white;
    box-shadow: 0 0 0 6px #e3061320;
  }
  .point-label {
    padding: 5px 10px;
    background: #1119;
    border-radius: 3px;
    letter-spacing: 0.03em;
  }
  .cabin-points button:focus-visible .point-icon {
    border-color: #fff;
    box-shadow: 0 0 0 6px #ffffff26;
  }
  @media (hover: hover) {
    .cabin-points button:not(.active):hover .point-icon {
      border-color: var(--red);
      color: var(--red);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .point-icon {
      transition: none;
    }
  }
  .cabin-coordinate {
    position: absolute;
    left: 26px;
    bottom: 23px;
    color: #fff9;
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .coordinate-active {
    color: var(--red);
  }
  .cabin-caption {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr auto;
    gap: 30px;
    align-items: start;
    padding-top: 28px;
  }
  .cabin-tabs {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
  }
  .cabin-tabs button {
    position: relative;
    background: none;
    border: 0;
    color: var(--muted);
    display: flex;
    gap: 16px;
    align-items: center;
    font: inherit;
    font-size: 14px;
    line-height: 1.25;
    text-align: left;
    padding: 8px 0 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }
  .cabin-tabs button::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    translate: 0 -50%;
    width: 2px;
    height: 24px;
    background: var(--red);
    opacity: 0;
  }
  .cabin-tabs button > span {
    color: var(--muted);
    font-size: 9px;
  }
  .cabin-tabs button.active {
    color: var(--text);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.025em;
  }
  .cabin-tabs button.active::before {
    opacity: 1;
  }
  .cabin-tabs button.active > span {
    color: var(--red);
  }
  .cabin-description {
    min-height: 100px;
    padding-top: 8px;
  }
  h3 {
    font-size: 21px;
    font-weight: 500;
    letter-spacing: -0.035em;
    margin: 0 0 9px;
  }
  .cabin-description p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    max-width: 47ch;
    line-height: 1.75;
  }
  .cabin-link {
    color: var(--text);
    text-decoration: none;
    min-height: 46px;
    padding: 10px 0;
    border-bottom: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    gap: 24px;
    font-size: 12px;
    white-space: nowrap;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  .cabin-points button:focus-visible {
    outline: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .description-message {
      animation: description-arrive 320ms ease-out;
    }
    @keyframes description-arrive {
      from {
        opacity: 0.25;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    :global(.motion-on) .cabin-reveal {
      --unfold: var(--approach);
    }
    :global(.motion-on) .panel-0 {
      transform: rotateY(calc((1 - var(--unfold)) * 49deg));
    }
    :global(.motion-on) .panel-2 {
      transform: rotateY(calc((1 - var(--unfold)) * -49deg));
    }
    :global(.motion-on) .panorama {
      transform: rotateX(calc((1 - var(--unfold)) * 8deg)) scale(calc(0.94 + var(--unfold) * 0.06));
    }
    :global(.motion-on) .fold-shade {
      opacity: calc(1 - var(--unfold));
    }
    :global(.motion-on) .panorama-caption {
      opacity: calc(0.55 + var(--unfold) * 0.45);
    }
    :global(.motion-on) .cabin-points button:nth-child(1) {
      transform: translateY(calc((1 - var(--reveal-a)) * 20px));
    }
    :global(.motion-on) .cabin-points button:nth-child(2) {
      transform: translateY(calc((1 - var(--reveal-b)) * 20px));
    }
    :global(.motion-on) .cabin-points button:nth-child(3) {
      transform: translateY(calc((1 - var(--reveal-c)) * 20px));
    }
    :global(.motion-on) .cabin-reveal:focus-within {
      --unfold: 1;
    }
  }
  @media (max-width: 1000px) {
    .cabin-caption {
      grid-template-columns: 0.8fr 1.2fr;
    }
    .cabin-link {
      grid-column: 2;
      justify-self: start;
    }
    .cabin-caption {
      gap: 8px 30px;
    }
  }
  @media (max-width: 700px) {
    .cabin-reveal {
      width: 90%;
      margin: 15px auto 45px;
      padding-block: 30px;
    }
    .cabin-heading {
      gap: 20px;
      align-items: start;
      flex-direction: column;
      margin-bottom: 24px;
    }
    h2 {
      font-size: clamp(35px, 8.8vw, 48px);
    }
    .cabin-intro {
      font-size: 13px;
    }
    .cabin-stage {
      height: clamp(270px, 68vw, 390px);
    }
    .panorama-caption {
      top: 17px;
      left: 15px;
      font-size: 8px;
    }
    .panorama-caption > span:last-child {
      display: none;
    }
    .cabin-points {
      inset: 0;
    }
    .cabin-points button {
      min-width: 44px;
      min-height: 44px;
    }
    .point-label {
      display: none;
    }
    .cabin-coordinate {
      bottom: 15px;
      left: 15px;
      font-size: 9px;
    }
    .cabin-caption {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 20px;
    }
    .cabin-tabs {
      width: 100%;
      flex-direction: column;
      gap: 0;
    }
    .cabin-tabs button {
      gap: 7px;
      min-height: 48px;
      font-size: 13px;
    }
    .cabin-tabs button.active {
      font-size: 21px;
    }
    .cabin-description {
      min-height: 90px;
      padding-top: 0;
    }
    .cabin-link {
      font-size: 12px;
    }
  }
</style>
