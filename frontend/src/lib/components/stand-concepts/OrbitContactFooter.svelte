<script lang="ts">
  import { ArrowUpRight, ArrowUp, Phone, Mail } from 'lucide-svelte';
  import { standContact } from './standContact';
  import { photo } from './data';
  const demoDescription = standContact.isDemo ? 'contact-demo-note' : undefined;
</script>

<section class="contact" id="contactos" aria-labelledby="stand-contact-heading">
  <img
    class="contact-photo"
    src={photo('photo-1576212767334-9e289e294c77', 2200)}
    alt=""
    loading="lazy"
  />
  <div class="contact-inner">
    <div class="contact-heading">
      <p class="eyebrow"><span aria-hidden="true"></span> VISITAR O STAND</p>
      <h2 id="stand-contact-heading">Venha <span>conhecer-nos.</span></h2>
      <p class="contact-intro">Encontre-nos, fale connosco e planeie a sua visita.</p>
    </div>

    <div class="contact-grid">
      <div class="info">
        <h3>Morada</h3>
        <address>{standContact.address ?? 'Por confirmar.'}</address>
      </div>
      <div class="info">
        <h3>Telefone</h3>
        {#if standContact.phone}
          <a
            class="info-value"
            href={`tel:${standContact.phone.international}`}
            aria-describedby={demoDescription}>{standContact.phone.display}</a
          >
        {:else}<p>Por confirmar.</p>{/if}
      </div>
      <div class="info">
        <h3>Email</h3>
        {#if standContact.email}
          <a
            class="info-value"
            href={`mailto:${standContact.email}`}
            aria-describedby={demoDescription}>{standContact.email}</a
          >
        {:else}<p>Por confirmar.</p>{/if}
      </div>
      <div class="info hours">
        <h3>Horário</h3>
        {#if standContact.hours.length}
          <dl>
            {#each standContact.hours as row}
              <div>
                <dt>{row.days}</dt>
                <dd>{row.time}</dd>
              </div>
            {/each}
          </dl>
        {:else}<p>Por confirmar.</p>{/if}
      </div>
    </div>

    <div class="contact-actions">
      {#if standContact.phone}
        <a
          class="button primary"
          href={`tel:${standContact.phone.international}`}
          aria-describedby={demoDescription}
          ><Phone size={16} aria-hidden="true" /> Telefonar agora</a
        >
      {/if}
      {#if standContact.email}
        <a class="button" href={`mailto:${standContact.email}`} aria-describedby={demoDescription}
          ><Mail size={16} aria-hidden="true" /> Enviar email</a
        >
      {/if}
      {#if standContact.directionsUrl}
        <a
          class="map-link"
          href={standContact.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={demoDescription}
        >
          {standContact.isDemo ? 'Mapa de demonstração' : 'Obter direções'}
          <ArrowUpRight size={17} aria-hidden="true" />
          <span class="sr-only"> (abre num novo separador)</span>
        </a>
      {/if}
    </div>
    {#if standContact.isDemo}
      <p class="demo-note" id="contact-demo-note">
        <span>DEMONSTRAÇÃO</span> Morada, contactos e horário fictícios. Substituir antes da publicação.
      </p>
    {/if}
  </div>
</section>

<footer class="orbit-footer">
  <div class="footer-inner">
    <div class="footer-heading">
      <div class="footer-brand">
        <a class="wordmark" href="/stand-orbit" aria-label="Auto Nunes Martins — início"
          ><img src="/logo-transparent-white-v3.png" alt={standContact.name} width="180" height="80" /></a
        >
        <p class="brand-caption">{standContact.description}</p>
      </div>
      <p class="brand-note">O caminho<br />é seu<span>.</span></p>
      <a class="footer-discover" href="/stand-orbit/viaturas">Encontre o seu próximo carro <ArrowUpRight size={22} aria-hidden="true" /></a>
    </div>
    <div class="footer-columns">
      <nav aria-label="Navegação do rodapé">
        <h3>Explore</h3>
        <ul>
          <li><a href="/stand-orbit/viaturas">Viaturas</a></li>
          <li><a href="/stand-orbit#sobre">A nossa perspetiva</a></li>
          <li><a href="#contactos">Visitar e contactar</a></li>
          <li><a href="/stand-orbit/politica-de-privacidade">Política de privacidade</a></li>
        </ul>
      </nav>
      <div class="footer-contact">
        <h3>Fale connosco</h3>
        <ul>
          {#if standContact.phone}<li>
              <a href={`tel:${standContact.phone.international}`} aria-describedby={demoDescription}
                >{standContact.phone.display}</a
              >
            </li>{/if}
          {#if standContact.email}<li>
              <a href={`mailto:${standContact.email}`} aria-describedby={demoDescription}
                >{standContact.email}</a
              >
            </li>{/if}
          {#if standContact.address}<li><address>{standContact.address}</address></li>{/if}
        </ul>
      </div>
      <div class="footer-hours">
        <h3>Horário</h3>
        {#if standContact.hours.length}
          <dl>
            {#each standContact.hours as row}<div>
                <dt>{row.days}</dt>
                <dd>{row.time}</dd>
              </div>{/each}
          </dl>
        {:else}<p>Por confirmar.</p>{/if}
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>
      © {new Date().getFullYear()}
      {standContact.name}{#if standContact.isDemo}<span>Site de demonstração · Dados fictícios</span
        >{/if}
    </p>
    <a href="/stand-orbit#inicio">Voltar ao início <ArrowUp size={15} aria-hidden="true" /></a>
  </div>
</footer>

<style>
  .contact,
  .orbit-footer,
  .contact *,
  .orbit-footer * {
    box-sizing: border-box;
  }
  h2,
  h3,
  p,
  ul,
  dl,
  dd {
    margin: 0;
  }
  ul {
    padding: 0;
    list-style: none;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  address {
    font-style: normal;
    white-space: pre-line;
  }
  .contact {
    --text: #f5f5f1;
    --muted: #ececef;
    --line: #ffffff30;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    margin-top: 48px;
    background: #111214;
    color: var(--text);
    scroll-margin-top: 24px;
  }
  .contact-photo {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 58%;
    filter: saturate(0.45);
  }
  .contact::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(90deg, #101114a6 0%, #10111480 48%, #10111433 100%),
      linear-gradient(0deg, #0c0c0e99, #0c0c0e0d 75%);
  }
  .contact-inner {
    width: var(--orbit-frame, 95%);
    max-width: var(--orbit-frame-max, 1640px);
    margin-inline: auto;
    padding: clamp(64px, 7vw, 110px) 0;
  }
  .eyebrow,
  .info h3,
  .orbit-footer h3 {
    font-size: 10px;
    font-weight: 500;
    line-height: 1.5;
    text-transform: uppercase;
    letter-spacing: 0.13em;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--muted);
  }
  .eyebrow > span {
    width: 5px;
    height: 5px;
    background: var(--red);
  }
  h2 {
    margin-top: 16px;
    font-size: clamp(38px, 4.6vw, 68px);
    font-weight: 500;
    letter-spacing: -0.045em;
    line-height: 1.15;
  }
  .contact-intro {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.65;
    color: var(--muted);
  }
  h2 > span {
    white-space: nowrap;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: 0.95fr 0.8fr 1.3fr 1.1fr;
    gap: 28px;
    margin-top: 44px;
    padding: 32px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .info {
    min-width: 0;
  }
  .info h3 {
    margin-bottom: 12px;
    color: var(--muted);
  }
  .info address,
  .info-value,
  .info > p {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }
  .info-value {
    display: inline-block;
  }
  .hours dl {
    display: grid;
    gap: 7px;
    font-size: 12px;
    line-height: 1.6;
  }
  .hours dl > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }
  .contact-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
  }
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    min-height: 48px;
    padding: 12px 22px;
    border: 1px solid var(--line);
    border-radius: 3px;
    color: var(--text);
    font-size: 13px;
    font-weight: 500;
  }
  .button.primary {
    background: #d90612;
    border-color: #d90612;
    color: #fff;
  }
  .map-link {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    min-height: 48px;
    margin-left: 12px;
    font-size: 12px;
    color: var(--muted);
  }
  .demo-note {
    margin-top: 22px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.65;
  }
  .demo-note > span {
    margin-right: 10px;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.1em;
  }
  .orbit-footer {
    --text: #f5f5f1;
    --muted: #a6a6ae;
    --line: #ffffff24;
    border-top: 1px solid var(--line);
    background: #0c0c0e;
    color: var(--text);
  }
  .footer-inner,
  .footer-bottom {
    width: var(--orbit-frame, 95%);
    max-width: var(--orbit-frame-max, 1640px);
    margin-inline: auto;
  }
  .footer-inner {
    padding-top: clamp(64px, 7vw, 108px);
  }
  .footer-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding-bottom: 56px;
    border-bottom: 1px solid var(--line);
  }
  .wordmark {
    display: inline-block;
    font-size: clamp(26px, 2.4vw, 36px);
    font-weight: 500;
    letter-spacing: -0.055em;
    line-height: 1.2;
  }
  .brand-caption {
    margin-top: 14px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .brand-note {
    font-size: clamp(25px, 2.8vw, 42px);
    font-weight: 400;
    letter-spacing: -0.05em;
    line-height: 1.2;
    color: #c0c0c6;
  }
  .footer-columns {
    display: grid;
    grid-template-columns: 1fr 1.15fr 1fr;
    gap: clamp(40px, 6vw, 100px);
    padding-block: 60px 76px;
  }
  .footer-columns > * {
    min-width: 0;
  }
  .orbit-footer h3 {
    margin-bottom: 25px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
  }
  .footer-columns ul {
    display: grid;
    gap: 12px;
  }
  .footer-columns nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: clamp(19px, 1.65vw, 24px);
    font-weight: 400;
    letter-spacing: -0.025em;
    line-height: 1.35;
  }
  .footer-contact li {
    font-size: 15px;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }
  .footer-contact a {
    display: inline-block;
    padding-block: 8px;
    margin-block: -8px;
  }
  .footer-contact address {
    margin-top: 18px;
    color: var(--muted);
  }
  .footer-hours dl {
    display: grid;
    gap: 0;
    font-size: 14px;
    line-height: 1.65;
  }
  .footer-hours dl > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
  }
  .footer-hours dl > div:first-child {
    padding-top: 2px;
  }
  .footer-hours dt {
    color: var(--muted);
  }
  .footer-hours dd {
    color: var(--text);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .footer-hours > p {
    color: var(--muted);
    font-size: 14px;
  }
  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding-block: 28px;
    border-top: 1px solid var(--line);
    color: var(--muted);
    font-size: 11px;
    line-height: 1.7;
  }
  .footer-bottom p > span {
    display: block;
    margin-top: 5px;
    font-size: 10px;
  }
  .footer-bottom a {
    display: inline-flex;
    align-items: center;
    gap: 18px;
    min-height: 44px;
    color: var(--text);
    font-size: 12px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @media (hover: hover) {
    a:hover {
      color: var(--red);
    }
    .button:hover {
      border-color: var(--text);
      color: var(--text);
    }
    .button.primary:hover {
      background: #b5050f;
      border-color: #b5050f;
      color: #fff;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    a {
      transition:
        color 180ms ease,
        background-color 180ms ease,
        border-color 180ms ease;
    }
  }
  @media (max-width: 1100px) {
    .contact-grid {
      grid-template-columns: 1fr 1fr;
      gap: 28px 40px;
    }
  }
  @media (max-width: 700px) {
    .contact {
      margin-top: 32px;
    }
    .contact-inner {
      width: 90%;
      padding-block: 52px;
    }
    .contact-photo {
      object-position: 62% center;
    }
    .contact::before {
      background:
        linear-gradient(90deg, #101114a6, #10111473), linear-gradient(0deg, #0c0c0e99, transparent);
    }
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 24px;
      padding-block: 24px;
      margin-top: 24px;
    }
    .info h3 {
      margin-bottom: 8px;
    }
    .hours dl {
      max-width: 340px;
      font-size: 13px;
    }
    .contact-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
    }
    .button {
      padding-inline: 12px;
      font-size: 12px;
    }
    .map-link {
      grid-column: 1 / -1;
      margin-left: 0;
      min-height: 44px;
      width: fit-content;
    }
  }
  @media (max-width: 360px) {
    .contact-actions {
      grid-template-columns: 1fr;
    }
    .button {
      width: 100%;
    }
  }
  @media (max-width: 1000px) {
    .footer-columns {
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .footer-columns nav {
      grid-column: 1 / -1;
    }
    .footer-columns nav ul {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 40px;
    }
  }
  @media (max-width: 700px) {
    .footer-inner,
    .footer-bottom {
      width: 90%;
    }
    .footer-inner {
      padding-top: 56px;
    }
    .footer-heading {
      align-items: start;
      flex-direction: column;
      gap: 28px;
      padding-bottom: 36px;
    }
    .wordmark {
      font-size: clamp(25px, 7vw, 32px);
    }
    .brand-note {
      font-size: 28px;
    }
    .footer-columns {
      display: grid;
      grid-template-columns: 1fr;
      gap: 38px;
      padding-block: 38px 48px;
    }
    .footer-columns nav {
      grid-column: auto;
    }
    .footer-columns nav ul {
      display: grid;
      gap: 6px;
    }
    .orbit-footer h3 {
      margin-bottom: 18px;
    }
    .footer-contact li {
      font-size: 14px;
    }
    .footer-hours dl {
      font-size: 13px;
    }
    .footer-bottom {
      align-items: start;
      gap: 24px;
      padding-block: 24px;
    }
    .footer-bottom p {
      max-width: 23ch;
    }
    .footer-bottom a {
      white-space: nowrap;
      font-size: 11px;
      gap: 10px;
    }
  }
  /* A quieter, asymmetric closing chapter. Contact section above remains independent. */
  .orbit-footer { background: #101012; border-top: 0; }
  .footer-inner { display: grid; grid-template-columns: .9fr 1.3fr; gap: clamp(48px,8vw,128px); padding-block: clamp(56px,6vw,92px); }
  .footer-heading { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 0; border: 0; padding: 0; }
  .wordmark { width: 168px; line-height: 0; }
  .wordmark img { display: block; width: 100%; height: auto; }
  .brand-caption { margin-top: 10px; font-size: 9px; }
  .brand-note { margin-top: 38px; font-size: clamp(48px,5.2vw,78px); line-height: .98; font-weight: 500; letter-spacing: -.065em; color: var(--text); }
  .brand-note span { color: var(--red); }
  .footer-discover { display: flex; align-items: center; gap: 30px; min-height: 48px; margin-top: 30px; padding-bottom: 8px; border-bottom: 1px solid var(--line); font-size: 13px; }
  .footer-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 38px 44px; padding: 8px 0 0; }
  .footer-columns nav { grid-column: 1 / -1; }
  .footer-columns nav ul { display: grid; grid-template-columns: 1fr 1fr; gap: 0 30px; }
  .footer-columns nav li { border-bottom: 1px solid var(--line); }
  .footer-columns nav a { width: 100%; min-height: 56px; font-size: 18px; letter-spacing: -.03em; justify-content: space-between; }
  .footer-columns nav a::after { content: '↗'; font-size: 18px; color: var(--muted); }
  .orbit-footer h3 { font-size: 10px; text-transform: uppercase; letter-spacing: .14em; margin-bottom: 18px; }
  .footer-contact li { font-size: 13px; }
  .footer-hours dl { font-size: 12px; }
  .footer-hours dl > div { display: grid; gap: 2px; padding-block: 8px; border: 0; }
  .footer-bottom { padding-block: 22px; }
  .footer-bottom p > span { display: inline; margin-left: 18px; }
  .orbit-footer a:focus-visible { outline: 2px solid var(--text); outline-offset: 5px; }
  @media (hover: hover) { .footer-discover:hover, .footer-columns nav a:hover { color: var(--text); border-color: var(--text); } }
  @media (max-width: 1000px) {
    .footer-inner { grid-template-columns: .8fr 1.2fr; gap: 38px; }
    .footer-columns { gap: 32px 24px; }
    .footer-columns nav a { font-size: 16px; }
  }
  @media (max-width: 700px) {
    .footer-inner { grid-template-columns: 1fr; gap: 48px; padding-block: 48px; }
    .footer-heading { align-items: start; }
    .brand-note { margin-top: 28px; font-size: 58px; }
    .footer-discover { margin-top: 22px; width: 100%; justify-content: space-between; }
    .footer-columns { grid-template-columns: 1fr; gap: 32px; padding: 0; }
    .footer-columns nav ul { gap: 0 20px; }
    .footer-contact, .footer-hours { grid-column: 1; }
    .footer-hours dl > div { display: flex; justify-content: space-between; }
    .footer-bottom { flex-wrap: wrap; gap: 16px; }
    .footer-bottom p { max-width: none; }
    .footer-bottom p > span { display: block; margin: 5px 0 0; }
  }
</style>
