<script lang="ts">
  import { ArrowUpRight, ArrowDown } from 'lucide-svelte';
  import { aboutContent as content } from './aboutContent';
  import { photo } from './data';
  import TeamContacts from './TeamContacts.svelte';
  import { entrance } from './designMotion';
  import OrbitPerspective from './OrbitPerspective.svelte';
  let { onContact }: { onContact: () => void } = $props();
</script>

<svelte:head>
  <title>Quem somos — Auto Nunes Martins</title>
  <meta
    name="description"
    content="Conheça a Auto Nunes Martins e encontre os contactos para esclarecer dúvidas sobre a escolha do seu próximo automóvel."
  />
</svelte:head>

<main class="company">
  <section class="company-hero frame" aria-labelledby="company-title">
    <div class="hero-copy">
      <p class="eyebrow">Quem somos</p>
      <h1 id="company-title">O seu próximo carro.<br /><span>A nossa atenção.</span></h1>
      <p class="hero-intro">{content.introduction}</p>
      <div class="hero-actions">
        <button class="action primary" onclick={onContact}
          >Vamos conversar <ArrowUpRight size={18} /></button
        >
        <a class="text-link" href="#a-nossa-historia">Conheça-nos melhor <ArrowDown size={17} /></a>
      </div>
    </div>
    <figure class="hero-photo">
      <img
        src={photo(content.heroImage.id, 960)}
        srcset={content.heroImage.srcset}
        sizes="(max-width: 760px) 90vw, 78vw"
        alt={content.heroImage.alt}
        width="1024"
        height="768"
        fetchpriority="high"
        decoding="async"
      />
    </figure>
  </section>

  <section id="a-nossa-historia" class="origins frame" aria-labelledby="origins-title">
    <div class="origins-intro">
      <div use:entrance>
        <p class="eyebrow">As nossas origens</p>
        <h2 id="origins-title">{content.origins.title}</h2>
      </div>
      <div class="prose" use:entrance>
        {#each content.origins.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      </div>
    </div>
    <div class="timeline" data-scene data-approach>
      <div class="timeline-track" aria-hidden="true"><span></span></div>
      <ol data-approach-target>
        {#each content.history as moment, i}
          <li style={`--chapter:var(--reveal-${['a', 'b', 'c'][i]}, 1)`}>
            <span class="milestone-dot" aria-hidden="true"></span>
            <p class="year">{moment.year}</p>
            <h3>{moment.title}</h3>
            <p class="milestone-description">{moment.text}</p>
          </li>
        {/each}
      </ol>
    </div>
  </section>

  <section class="approach frame" data-scene data-approach aria-labelledby="approach-title">
    <figure class="detail-photo" data-approach-target>
      <img
        src={photo(content.approach.image, 960)}
        srcset={content.approach.srcset}
        sizes="(max-width: 760px) 90vw, 46vw"
        alt={content.approach.alt}
        width="1024"
        height="768"
        loading="lazy"
        decoding="async"
      />
      <figcaption>O nosso segundo stand</figcaption>
    </figure>
    <div class="approach-copy" use:entrance>
      <p class="eyebrow">A nossa forma de trabalhar</p>
      <h2 id="approach-title">{content.approach.title}</h2>
      <div class="prose">
        {#each content.approach.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      </div>
      <a class="text-link" href="/viaturas"
        >Conheça a nossa seleção <ArrowUpRight size={19} /></a
      >
    </div>
  </section>

  <OrbitPerspective id="company-essence" {...content.essence} />

  <TeamContacts people={content.team} introduction={content.teamIntroduction} />

</main>

<style>
  .company {
    color: var(--text);
    overflow: clip;
    padding-bottom: 104px;
  }
  .frame {
    width: var(--orbit-frame);
    max-width: var(--orbit-frame-max);
    margin-inline: auto;
  }
  h1,
  h2,
  h3,
  p,
  figure {
    margin: 0;
  }
  section[id] {
    scroll-margin-top: calc(var(--company-nav-height, 80px) + 28px);
  }
  .company-hero {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 7%;
    align-items: center;
    padding-block: var(--orbit-space-section);
  }
  .eyebrow {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 22px;
  }
  h1 {
    font-size: clamp(38px, 4.3vw, 62px);
    line-height: 1.1;
    font-weight: 500;
    letter-spacing: -0.055em;
  }
  h1 span {
    color: var(--muted);
  }
  h2 {
    font-size: clamp(30px, 3.25vw, 46px);
    line-height: 1.15;
    font-weight: 500;
    letter-spacing: -0.045em;
  }
  .hero-intro {
    max-width: 450px;
    margin-top: 24px;
    font-size: 17px;
    line-height: 1.75;
    color: var(--muted);
  }
  .hero-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 24px;
    margin-top: 30px;
  }
  a,
  button {
    color: inherit;
  }
  button {
    cursor: pointer;
    font: inherit;
  }
  a {
    text-decoration: none;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  .action,
  .text-link {
    display: inline-flex;
    gap: 18px;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    font-size: 14px;
  }
  .action {
    padding: 12px 20px;
    border: 1px solid transparent;
    border-radius: 4px;
  }
  .primary {
    color: white;
    background: var(--red);
  }
  .primary:hover {
    background: #c90510;
  }
  .text-link {
    border: 0;
    background: transparent;
    padding: 0;
  }
  .text-link:hover {
    color: var(--red);
  }
  .hero-photo {
    height: clamp(245px, 26vw, 340px);
    border-radius: 5px;
    overflow: hidden;
    background: var(--surface);
  }
  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .origins {
    padding-block: var(--orbit-space-section) 0;
    border-top: 1px solid var(--line);
  }
  .origins-intro {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: 11%;
    align-items: start;
  }
  .origins h2 {
    max-width: 440px;
  }
  .prose {
    max-width: 66ch;
    font-size: 17px;
    line-height: 1.8;
    color: var(--muted);
  }
  .prose p + p {
    margin-top: 20px;
  }
  .timeline {
    position: relative;
    margin-top: calc(var(--orbit-space-section) * 0.8);
  }
  .timeline-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--line);
  }
  .timeline-track span {
    display: block;
    height: 100%;
    background: var(--red);
    transform-origin: left;
    box-shadow: 0 0 10px #e3061340;
  }
  .timeline ol {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7%;
    padding: 0;
    margin: 0;
  }
  .timeline li {
    position: relative;
    padding-top: 26px;
  }
  .milestone-dot {
    position: absolute;
    top: -3px;
    left: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--red);
  }
  .year {
    font-size: clamp(40px, 5vw, 68px);
    letter-spacing: -0.065em;
    font-weight: 500;
    line-height: 1.1;
    color: var(--text);
  }
  .timeline h3 {
    font-weight: 500;
    font-size: 18px;
    line-height: 1.45;
    letter-spacing: -0.025em;
    margin-top: 16px;
  }
  .milestone-description {
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    margin-top: 9px;
    max-width: 275px;
  }
  .approach {
    padding-block: var(--orbit-space-arrival);
    display: grid;
    grid-template-columns: 1.08fr 1fr;
    gap: 8%;
    align-items: center;
  }
  .detail-photo {
    position: relative;
    height: clamp(340px, 35vw, 480px);
    overflow: hidden;
    border-radius: 5px;
    background: var(--surface);
  }
  .detail-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 60%;
  }

  .approach-copy .prose {
    margin-top: 25px;
  }
  .approach-copy .text-link {
    margin-top: 23px;
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .timeline-track span {
      transform: scaleX(var(--approach, 1));
    }
    :global(.motion-on) .year {
      background: linear-gradient(90deg, var(--text) calc(var(--chapter) * 100%), var(--muted) 0);
      background-clip: text;
      -webkit-text-fill-color: transparent;
      transform: translateY(calc((1 - var(--chapter)) * 12px));
    }
    :global(.motion-on) .milestone-dot {
      transform: scale(calc(0.6 + var(--chapter) * 0.4));
    }

    .text-link :global(svg) {
      transition: transform 240ms ease;
    }
    .text-link:hover :global(svg) {
      transform: translate(3px, -3px);
    }
    @media (hover: hover) {
    }
  }
  @media (max-width: 1050px) {
    .company-hero {
      gap: 5%;
    }
    h1 {
      font-size: 42px;
    }
    .hero-intro,
    .prose {
      font-size: 16px;
    }
    .origins-intro {
      gap: 7%;
    }
    .approach {
      gap: 6%;
    }
  }
  @media (max-width: 760px) {
    .company-hero {
      grid-template-columns: 1fr;
      padding-block: var(--orbit-space-section);
      gap: 28px;
    }
    .eyebrow {
      margin-bottom: 16px;
      font-size: 14px;
    }
    h1 {
      font-size: clamp(32px, 8.7vw, 46px);
    }
    h2 {
      font-size: clamp(29px, 6.8vw, 37px);
    }
    .hero-intro {
      font-size: 16px;
      margin-top: 20px;
    }
    .hero-actions {
      gap: 10px 22px;
      margin-top: 22px;
    }
    .action,
    .text-link {
      font-size: 13px;
    }
    .hero-photo {
      height: 235px;
    }
    .origins {
      padding-top: var(--orbit-space-section);
    }
    .origins-intro {
      grid-template-columns: 1fr;
      gap: 23px;
    }
    .prose {
      font-size: 16px;
      line-height: 1.75;
    }
    .prose p + p {
      margin-top: 16px;
    }
    .timeline {
      margin-top: calc(var(--orbit-space-section) * 0.8);
    }
    .timeline ol {
      gap: 24px;
    }
    .timeline h3 {
      font-size: 16px;
    }
    .year {
      font-size: 40px;
    }
    .milestone-description {
      font-size: 14px;
    }
    .approach {
      padding-block: var(--orbit-space-section);
      grid-template-columns: 1fr;
      gap: 28px;
    }
    .detail-photo {
      height: 290px;
    }
    .approach-copy .prose {
      margin-top: 20px;
    }
    .approach-copy .text-link {
      margin-top: 16px;
    }
    .company { padding-bottom: 120px; }
  }
  @media (max-width: 600px) {
    .timeline ol {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .timeline-track {
      left: 3px;
      top: 7px;
      bottom: 0;
      right: auto;
      width: 1px;
      height: auto;
    }
    .timeline li {
      padding: 0 0 0 29px;
      display: grid;
      grid-template-columns: 83px 1fr;
      column-gap: 15px;
      align-items: start;
    }
    .milestone-dot {
      top: 14px;
    }
    .year {
      grid-row: span 2;
      font-size: 34px;
    }
    .timeline h3 {
      margin-top: 4px;
    }
    .milestone-description {
      margin-top: 6px;
      line-height: 1.6;
    }
    @media (prefers-reduced-motion: no-preference) {
      :global(.motion-on) .timeline-track span {
        transform: scaleY(var(--approach, 1));
        transform-origin: top;
      }
    }
  }

  /* A broad image, with the fade confined to the text-facing edge. */
  .company-hero {
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: clamp(540px, 49vw, 760px);
    padding-block: 70px;
    margin-block: 24px 48px;
  }
  .hero-copy {
    position: relative;
    z-index: 1;
    width: 53%;
  }
  .company-hero h1 {
    font-size: clamp(42px, 4.6vw, 68px);
  }
  .hero-photo {
    position: absolute;
    z-index: -1;
    inset: 0 0 0 auto;
    width: 79%;
    height: 100%;
    margin: 0;
    border-radius: 4px;
  }
  .hero-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--bg) 0%,
      var(--bg) 8%,
      color-mix(in srgb, var(--bg) 92%, transparent) 22%,
      color-mix(in srgb, var(--bg) 55%, transparent) 40%,
      transparent 65%
    );
  }
  .hero-photo img {
    object-position: 65% center;
  }
  .hero-intro {
    max-width: 36ch;
  }
  .detail-photo figcaption {
    position: absolute;
    z-index: 1;
    left: 24px;
    bottom: 24px;
    margin: 0;
    color: white;
    font-size: 13px;
    letter-spacing: 0.02em;
  }
  .detail-photo::after {
    content: '';
    position: absolute;
    inset: 55% 0 0;
    background: linear-gradient(transparent, #0009);
    pointer-events: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .detail-photo img {
      position: absolute;
      top: -6%;
      height: 112%;
      transform: translateY(calc((0.5 - var(--through, 0.5)) * 48px));
    }
  }
  @media (max-width: 760px) {
    .company-hero {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-height: 0;
      gap: 0;
      padding-block: 0;
      margin-block: 30px 40px;
    }
    .hero-copy {
      width: 100%;
    }
    .company-hero h1 {
      font-size: clamp(34px, 8.8vw, 52px);
    }
    .hero-photo {
      position: relative;
      inset: auto;
      width: 100%;
      height: clamp(280px, 65vw, 440px);
      margin-top: -12px;
    }
    .hero-photo::after {
      background: linear-gradient(180deg, var(--bg), transparent 26%);
    }
    .hero-intro {
      max-width: 42ch;
    }
    .hero-actions {
      position: relative;
      z-index: 2;
    }
  }
</style>
