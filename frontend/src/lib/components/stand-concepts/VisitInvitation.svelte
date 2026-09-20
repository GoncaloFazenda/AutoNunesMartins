<script lang="ts">
  import { ArrowUpRight, ArrowRight, Check, CalendarDays } from 'lucide-svelte';
  let {
    onContact,
    logoSrc = '/logo.png',
  }: { onContact: (message: string) => void; logoSrc?: string } = $props();
  let choice = $state(0);
  const reasons = [
    {
      label: 'Conhecer uma viatura',
      short: 'O próximo carro.',
      detail: 'Ver ao vivo. Sentar-se. Fazer perguntas.',
      message: 'Gostava de combinar uma visita para conhecer uma viatura.',
    },
    {
      label: 'Falar sobre uma retoma',
      short: 'Uma nova companhia.',
      detail: 'Conte-nos o que conduz e o que procura.',
      message: 'Gostava de combinar uma visita para falar sobre a minha retoma.',
    },
    {
      label: 'Esclarecer as minhas dúvidas',
      short: 'Tudo mais claro.',
      detail: 'Equipamento, documentação e próximos passos.',
      message: 'Gostava de esclarecer algumas dúvidas antes de visitar o stand.',
    },
  ];
  const selected = $derived(reasons[choice]!);
</script>

<section
  class="visit-invitation"
  data-scene
  data-approach
  data-scan-delay="0.05"
  aria-labelledby="visit-heading"
>
  <div class="invitation-copy">
    <p class="eyebrow">O DIGITAL É SÓ O COMEÇO</p>
    <h2 id="visit-heading">Uma visita.<br /><span>À sua medida.</span></h2>
    <p class="invitation-intro">
      Uma boa escolha começa com uma boa conversa. Diga-nos o que o traz por cá.
    </p>
    <div class="visit-reasons" role="group" aria-label="Motivo da visita">
      {#each reasons as reason, index}
        <button
          class:chosen={choice === index}
          aria-pressed={choice === index}
          onclick={() => (choice = index)}
          ><span class="reason-index">0{index + 1}</span>{reason.label}<span class="reason-check"
            >{#if choice === index}<Check size={15} />{:else}<ArrowUpRight size={15} />{/if}</span
          ></button
        >
      {/each}
    </div>
    <button class="visit-cta" onclick={() => onContact(selected.message)}
      >Vamos combinar <ArrowUpRight size={19} /></button
    >
  </div>
  <div class="invitation-scene" data-approach-target>
    <div class="invitation-glow" aria-hidden="true"></div>
    <div class="invitation-baseline" aria-hidden="true">
      <span>DA IDEIA</span><i>
        <span class="journey-car">
          <svg viewBox="0 0 44 17" width="36" height="14" fill="none" focusable="false">
            <path
              class="car-contour"
              d="M0 15H4L6 10L13 9L18 4Q19 3 22 3H27Q30 3 33 8L39 10Q41 10 41 13V15H44"
            />
            <circle cx="11" cy="13" r="2" /><circle cx="34" cy="13" r="2" />
          </svg>
        </span>
      </i><span>AO ENCONTRO</span>
    </div>
    <div class="invitation-sleeve" aria-hidden="true">
      <span>AUTO NUNES MARTINS</span><ArrowRight size={28} />
    </div>
    <div class="visit-ticket">
      <div class="ticket-top">
        <img src={logoSrc} alt="Auto Nunes Martins" width="145" height="64" /><span
          >CONVITE<br />PARA CONVERSAR</span
        >
      </div>
      <div class="ticket-main" aria-live="polite" aria-atomic="true">
        {#key choice}<div class="ticket-message">
            <span class="ticket-kicker">É SOBRE ISTO.</span>
            <h3>{selected.short}</h3>
            <p>{selected.detail}</p>
          </div>{/key}
      </div>
      <div class="ticket-tear" aria-hidden="true">
        <i></i><span>O PRÓXIMO PASSO É SEU</span><i></i>
      </div>
      <div class="ticket-bottom">
        <CalendarDays size={23} />
        <div><span>A SUA DISPONIBILIDADE</span><strong>Combinamos consigo.</strong></div>
        <ArrowUpRight size={25} />
      </div>
      <div class="ticket-end"><span>UMA CONVERSA DE CADA VEZ.</span><span>ANM ↗</span></div>
      <div class="ticket-scan" aria-hidden="true"></div>
    </div>
    <span class="invitation-caption">O SEU PEDIDO COMEÇA AQUI. A VISITA FICA A COMBINAR.</span>
  </div>
</section>

<style>
  .visit-invitation {
    --approach: 1;
    --reveal-a: 1;
    --reveal-b: 1;
    --reveal-c: 1;
    width: 95%;
    max-width: 1640px;
    margin: 70px auto 45px;
    padding: 35px 0;
    display: grid;
    grid-template-columns: 0.95fr 1.05fr;
    gap: clamp(45px, 7vw, 125px);
    align-items: center;
  }
  .visit-invitation * {
    box-sizing: border-box;
  }
  .eyebrow {
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.12em;
    margin: 0 0 23px;
  }
  h2 {
    font-size: clamp(36px, 4vw, 60px);
    font-weight: 500;
    letter-spacing: -0.06em;
    line-height: 1.1;
    margin: 0;
  }
  h2 > span {
    color: var(--muted);
  }
  .invitation-intro {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.8;
    max-width: 40ch;
    margin: 23px 0 26px;
  }
  .visit-reasons {
    display: flex;
    flex-direction: column;
    max-width: 465px;
  }
  button {
    font: inherit;
    cursor: pointer;
  }
  .visit-reasons button {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    text-align: left;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: none;
    color: var(--muted);
    font-size: 14px;
    padding: 18px 0;
    min-height: 57px;
    transition: color 200ms;
  }
  .visit-reasons button.chosen {
    color: var(--text);
  }
  .reason-index {
    font-size: 10px;
    color: var(--muted);
  }
  .chosen .reason-index {
    color: var(--red);
  }
  .reason-check {
    margin-left: auto;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: 50%;
  }
  .chosen .reason-check {
    color: white;
    background: var(--red);
  }
  .visit-cta {
    display: inline-flex;
    align-items: center;
    gap: 32px;
    font-size: 13px;
    min-height: 48px;
    margin-top: 28px;
    padding: 13px 23px;
    border: 1px solid var(--text);
    border-radius: 30px;
    background: var(--text);
    color: var(--bg);
  }
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  .invitation-scene {
    position: relative;
    height: 570px;
    perspective: 1500px;
    display: grid;
    place-items: center;
  }
  .invitation-glow {
    position: absolute;
    inset: -10%;
    background: radial-gradient(
      ellipse,
      color-mix(in srgb, var(--red) 5%, transparent),
      transparent 67%
    );
    pointer-events: none;
  }
  .invitation-baseline {
    position: absolute;
    left: 0;
    right: 0;
    top: 12px;
    display: flex;
    align-items: center;
    gap: 18px;
    color: var(--muted);
    font-size: 9px;
    letter-spacing: 0.13em;
  }
  .invitation-baseline i {
    height: 1px;
    flex: 1;
    background: var(--line);
    position: relative;
  }
  .invitation-baseline i:after {
    content: '';
    position: absolute;
    inset: 0;
    left: 0;
    right: auto;
    width: 100%;
    background: var(--red);
    transform-origin: left;
  }
  .journey-car {
    z-index: 1;
    position: absolute;
    left: 100%;
    bottom: -1px;
    translate: -50% 0;
    color: var(--red);
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .journey-car svg {
    display: block;
    overflow: visible;
  }
  .journey-car path,
  .journey-car circle {
    stroke: currentColor;
    stroke-width: 1.35;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .journey-car circle {
    fill: var(--bg);
  }
  .invitation-sleeve {
    position: absolute;
    bottom: 58px;
    width: 85%;
    max-width: 500px;
    height: 190px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    transform: rotate(5deg);
    display: flex;
    justify-content: space-between;
    align-items: end;
    padding: 24px;
    color: var(--muted);
    box-shadow: 0 25px 45px #0001;
  }
  .invitation-sleeve > span {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .visit-ticket {
    position: relative;
    width: 81%;
    max-width: 455px;
    background: #f6f4ef;
    color: #171719;
    border: 1px solid #fff8;
    border-radius: 7px;
    padding: 26px 30px 19px;
    box-shadow: 0 22px 60px #0003;
    transform: translateY(-12px) rotate(-3deg);
    overflow: hidden;
  }
  .ticket-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  .ticket-top img {
    width: 145px;
    height: auto;
    mix-blend-mode: multiply;
  }
  .ticket-top > span {
    font-size: 8px;
    line-height: 1.6;
    letter-spacing: 0.1em;
    text-align: right;
    color: #747479;
  }
  .ticket-main {
    min-height: 179px;
    padding-top: 27px;
  }
  .ticket-kicker {
    display: block;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: #8a5457;
    margin-bottom: 10px;
  }
  h3 {
    font-size: clamp(28px, 2.55vw, 39px);
    line-height: 1.08;
    font-weight: 500;
    letter-spacing: -0.05em;
    margin: 0;
    max-width: 12ch;
  }
  .ticket-main p {
    font-size: 12px;
    line-height: 1.6;
    color: #6b6b70;
    max-width: 32ch;
    min-height: 39px;
    margin: 12px 0 0;
  }
  .ticket-tear {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
  }
  .ticket-tear > span {
    color: #8c8c90;
    font-size: 7px;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }
  .ticket-tear i {
    flex: 1;
    border-top: 1px dashed #c8c6c1;
  }
  .ticket-bottom {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 26px;
  }
  .ticket-bottom > :global(svg:first-child) {
    color: var(--red);
  }
  .ticket-bottom > :global(svg:last-child) {
    margin-left: auto;
  }
  .ticket-bottom div > span {
    display: block;
    font-size: 8px;
    letter-spacing: 0.08em;
    color: #8c8c90;
    margin-bottom: 6px;
  }
  .ticket-bottom strong {
    display: block;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: -0.025em;
  }
  .ticket-end {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    border-top: 1px solid #dedcd7;
    padding-top: 15px;
    color: #939397;
    font-size: 7px;
    letter-spacing: 0.07em;
  }
  .ticket-end > span:last-child {
    color: #e30613;
  }
  .invitation-caption {
    position: absolute;
    bottom: 9px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    letter-spacing: 0.07em;
    color: var(--muted);
  }
  .ticket-scan {
    display: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .ticket-message {
      animation: message-arrive 320ms ease-out;
    }
    @keyframes message-arrive {
      from {
        opacity: 0.25;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    :global(.motion-on) .visit-ticket {
      transform: translateY(calc(34px - var(--approach) * 46px))
        rotateY(calc((1 - var(--approach)) * -22deg)) rotate(calc(8deg - var(--approach) * 11deg));
    }
    :global(.motion-on) .invitation-sleeve {
      transform: translateY(calc((1 - var(--approach)) * -8px))
        rotate(calc(-4deg + var(--approach) * 9deg));
    }
    :global(.motion-on) .invitation-baseline {
      /* Snap only the line's subpixel scrub tolerance to its exact endpoints. */
      --journey: clamp(0, calc((var(--scan, var(--approach)) - 0.0005) / 0.999), 1);
    }
    :global(.motion-on) .invitation-baseline i:after {
      /* One fill, one origin, one head shared with the car. The scan is untouched. */
      width: calc(var(--journey) * 100%);
    }
    :global(.motion-on) .journey-car {
      left: calc(var(--journey) * 100%);
    }
    :global(.motion-on) .ticket-scan {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      height: 64px;
      top: calc(var(--scan, var(--approach)) * 110% - 64px);
      background: linear-gradient(transparent 0%, #e3061305 35%, #e3061324 100%);
      border-bottom: 2px solid #c8071480;
      box-shadow: 0 9px 18px -12px #d3061380;
      pointer-events: none;
    }
    :global(.motion-on) .ticket-scan::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: linear-gradient(90deg, #e306132b, #fff9 48%, #e3061360);
      box-shadow: 0 0 7px #e3061348;
    }
    :global(.motion-on) .ticket-scan::after {
      content: 'A LER';
      position: absolute;
      right: 18px;
      bottom: 8px;
      padding: 3px 6px;
      border: 1px solid #c8071426;
      border-radius: 2px;
      background: #f6f4efe6;
      color: #9c1820;
      font-size: 7px;
      font-weight: 500;
      letter-spacing: 0.12em;
      line-height: 1.4;
    }
    :global(.motion-on) .ticket-end {
      background: linear-gradient(90deg, #e3061399, #e3061399) left top /
        calc(var(--approach) * 100%) 1px no-repeat;
    }
  }
  @media (max-width: 1100px) {
    .visit-invitation {
      gap: 36px;
      grid-template-columns: 1fr 1fr;
    }
    .visit-ticket {
      width: 95%;
      padding: 22px;
    }
    .invitation-sleeve {
      width: 95%;
    }
    .ticket-top img {
      width: 125px;
    }
  }
  @media (max-width: 700px) {
    .visit-invitation {
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
      margin: 40px auto 20px;
      padding-block: 28px;
    }
    h2 {
      font-size: clamp(35px, 9vw, 48px);
    }
    .invitation-intro {
      font-size: 13px;
      margin: 19px 0;
    }
    .visit-reasons {
      max-width: none;
    }
    .visit-reasons button {
      font-size: 13px;
      gap: 12px;
    }
    .invitation-scene {
      height: 520px;
      width: 100%;
    }
    .visit-ticket {
      width: 90%;
      padding: 22px;
    }
    .ticket-top {
      gap: 12px;
    }
    .ticket-top img {
      width: 116px;
    }
    .ticket-top > span {
      font-size: 7px;
    }
    h3 {
      font-size: 32px;
    }
    .ticket-main {
      min-height: 170px;
    }
    .ticket-bottom {
      gap: 11px;
    }
    .ticket-bottom strong {
      font-size: 13px;
    }
    .ticket-bottom div > span {
      font-size: 7px;
    }
    .invitation-sleeve {
      width: 93%;
      bottom: 53px;
    }
    .invitation-caption {
      font-size: 7px;
    }
  }
</style>
