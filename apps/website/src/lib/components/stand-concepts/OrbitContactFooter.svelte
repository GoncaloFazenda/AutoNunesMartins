<script lang="ts">
  import OrbitVisitLabel from './OrbitVisitLabel.svelte';
  import { ArrowUpRight, Phone, Mail } from 'lucide-svelte';
  import { standContact } from './standContact';
  import OrbitCompactFooter from './OrbitCompactFooter.svelte';
  import FormSelectField from './FormSelectField.svelte';
  let { includeFooter = true }: { includeFooter?: boolean } = $props();
  import { photo } from './data';
  import { responsivePhoto } from './images';
  const demoDescription = standContact.isDemo ? 'contact-demo-note' : undefined;
  let formTested = $state(false);
</script>

<section class="contact" id="contactos" aria-labelledby="stand-contact-heading">
  <img
    class="contact-photo"
    src={photo('photo-1576212767334-9e289e294c77', 2200)}
    srcset={responsivePhoto('photo-1576212767334-9e289e294c77')}
    sizes="100vw"
    decoding="async"
    alt=""
    loading="lazy"
  />
  <div class="contact-inner">
    <div class="visit-info">
      <div class="contact-heading">
        <OrbitVisitLabel />
        <h2 id="stand-contact-heading">Venha <span>conhecer-nos.</span></h2>
        <p class="contact-intro">Encontre-nos, fale connosco e planeie a sua visita.</p>
      </div>

      <div class="contact-grid">
        <div class="info address-card">
          <svg
            viewBox="0 0 640 220"
            class="address-map"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="640" height="220" fill="#dce2d8" />
            <path
              d="M0 0H160L140 65 65 91 0 73ZM470 0H640V92L570 75 528 38ZM0 166L115 148 141 220H0ZM433 166L492 135 559 159 586 220H445Z"
              fill="#bacbb5"
            />
            <path
              d="M564-20C512 53 597 123 543 240"
              fill="none"
              stroke="#a9c7cc"
              stroke-width="36"
            />
            <g fill="#cbd2c7" stroke="#bfc8bc" stroke-width="1">
              <path
                d="M182 14H244V56H173ZM275 9H340V55H275ZM373 9H445V57H373ZM161 102H226V140H150ZM255 100H303V144H255ZM347 103H406V139H347ZM438 104H490V137H438ZM177 177H236V214H189ZM270 180H332V220H270ZM359 176H416V215H359Z"
              />
            </g>
            <g fill="none" stroke="#f9f8f1" stroke-width="12">
              <path
                d="M-20 112L165 78 386 80 660 113M117-20L147 83 119 150 164 240M256-20V79L238 163 249 240M354-20L331 78 328 163 351 240M462-20L425 80 432 167 476 240M-20 180L235 163 442 163 660 201"
              />
            </g>
            <path
              d="M-20 112L165 78 386 80 660 113"
              fill="none"
              stroke="#e9d6a5"
              stroke-width="5"
            />
            <circle cx="329" cy="109" r="38" fill="#e30613" opacity=".09" />
            <circle cx="329" cy="109" r="23" fill="#e30613" opacity=".13" />
            <path
              d="M329 65c-13 0-23 10-23 23 0 17 23 36 23 36s23-19 23-36c0-13-10-23-23-23Z"
              fill="#e30613"
              stroke="#fff"
              stroke-width="3"
            />
            <circle cx="329" cy="88" r="7" fill="#fff" />
          </svg>
          <div class="address-copy">
            <h3>Morada</h3>
            <address>{standContact.address ?? 'Por confirmar.'}</address>
          </div>
          {#if standContact.directionsUrl}
            <a
              class="address-map-link"
              href={standContact.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={demoDescription}
              >Abrir no mapa <ArrowUpRight size={12} aria-hidden="true" /><span class="sr-only">
                (abre num novo separador)</span
              ></a
            >
          {/if}
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
      </div>

      <div class="contact-actions">
        {#if standContact.phone}
          <a
            class="button primary"
            href={`tel:${standContact.phone.international}`}
            aria-describedby={demoDescription}
            ><Phone size={16} aria-hidden="true" /> Ligar agora</a
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
            Abrir no mapa
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
    <form
      class="inline-contact"
      aria-labelledby="inline-contact-heading"
      aria-describedby="inline-contact-note"
      onsubmit={(event) => {
        event.preventDefault();
        formTested = true;
      }}
    >
      <p class="eyebrow">COMECE A CONVERSA</p>
      <h3 id="inline-contact-heading">O que tem em mente?</h3>
      <p class="form-intro">Uma dúvida, uma viatura ou uma visita. Conte-nos.</p>
      <div class="form-row">
        <label
          >Nome<input name="name" autocomplete="name" placeholder="O seu nome" required /></label
        >
        <label
          >Email<input
            name="email"
            type="email"
            autocomplete="email"
            placeholder="nome@exemplo.pt"
            required
          /></label
        >
      </div>
      <label
        >Assunto<FormSelectField><select name="subject"
          ><option>Informações gerais</option><option>Conhecer uma viatura</option><option
            >Marcar uma visita</option
          ><option>Falar sobre uma retoma</option></select
        ></FormSelectField></label
      >
      <label
        >Mensagem<textarea name="message" rows="3" placeholder="Como podemos ajudar?" required
        ></textarea></label
      >
      <div class="form-bottom">
        <p id="inline-contact-note">Demonstração. Não envia mensagens nem guarda dados.</p>
        <button type="submit" class="button primary"
          >Experimentar pedido <ArrowUpRight size={17} aria-hidden="true" /></button
        >
      </div>
      <p class="form-status" role="status">
        {formTested ? 'Pedido experimentado. Nenhuma mensagem foi enviada.' : ''}
      </p>
    </form>
  </div>
</section>

{#if includeFooter}<OrbitCompactFooter showContacts={false} />{/if}

<style>
  .address-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid #ffffff30;
    border-radius: 5px;
    padding: 12px 14px;
  }
  .address-map {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
  }
  .address-card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, #101913f2 0%, #101913df 48%, #10191373 100%);
  }
  .address-copy {
    position: relative;
  }
  .address-card .address-copy h3 {
    margin-bottom: 6px;
  }
  .address-card .address-copy address {
    font-size: 12px;
    line-height: 1.6;
  }
  .address-map-link {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    width: fit-content;
    margin: 4px 0 0 auto;
    min-height: 28px;
    color: #f5f5f1;
    font-size: 10px;
    line-height: 1.4;
  }
  .contact-inner {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    align-items: start;
    gap: clamp(36px, 5vw, 80px);
  }
  .visit-info {
    min-width: 0;
  }
  .visit-info .contact-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 28px;
    padding-block: 24px;
  }
  .visit-info h2 {
    font-size: clamp(36px, 3.6vw, 58px);
  }
  .inline-contact {
    min-width: 0;
    padding: clamp(24px, 2.6vw, 40px);
    border: 1px solid #ffffff30;
    border-radius: 8px;
    background: #101913c9;
    backdrop-filter: blur(12px);
  }
  .inline-contact h3 {
    margin-top: 12px;
    font-size: clamp(26px, 2.3vw, 36px);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.04em;
  }
  .form-intro {
    margin-top: 10px;
    color: #d0d6d1;
    font-size: 13px;
    line-height: 1.65;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .inline-contact label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    font-size: 12px;
    color: #ececef;
  }
  .inline-contact input,
  .inline-contact select,
  .inline-contact textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #ffffff38;
    border-radius: 4px;
    background: #ffffff09;
    color: #f5f5f1;
    padding: 12px 14px;
    font: inherit;
    font-size: var(--orbit-type-control, 16px);
    line-height: 1.5;
  }
  .inline-contact input::placeholder,
  .inline-contact textarea::placeholder {
    color: #b7c1b9;
    opacity: 1;
  }
  .inline-contact option {
    background: #17221b;
    color: #f5f5f1;
  }
  .inline-contact textarea {
    resize: vertical;
    min-height: 96px;
  }
  .inline-contact :is(input, select, textarea, button):focus-visible {
    outline: 2px solid #f5f5f1;
    outline-offset: 3px;
  }
  .inline-contact :is(input, select, textarea) {
    border-width: 1px;
  }
  .inline-contact :is(input, select, textarea):focus-visible {
    outline: none;
  }
  @media (hover: hover) {
    .inline-contact :is(input, select, textarea):hover {
      background: #ffffff13;
      border-color: #ffffff70;
      box-shadow: 0 0 12px #ffffff08;
    }
  }
  .inline-contact :is(input, select, textarea):focus {
    background: #ffffff16;
    border-color: #f5f5f1;
    box-shadow: inset 0 0 0 0.35px #f5f5f1;
    outline: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .inline-contact :is(input, select, textarea) {
      transition:
        background-color 180ms ease,
        border-color 180ms ease,
        box-shadow 180ms ease;
    }
  }
  .form-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 24px;
  }
  .form-bottom p {
    flex: 1 1 140px;
    color: #b7c1b9;
    font-size: 11px;
    line-height: 1.6;
  }
  .form-bottom button {
    cursor: pointer;
    font-family: inherit;
  }
  .form-status {
    margin-top: 12px;
    color: #f5f5f1;
    font-size: 12px;
    line-height: 1.6;
  }
  .form-status:empty {
    display: none;
  }
  @media (max-width: 1050px) {
    .contact-inner {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 700px) {
    .visit-info .contact-grid,
    .form-row {
      grid-template-columns: 1fr;
    }
    .inline-contact {
      padding: 24px 20px;
    }
    .inline-contact input,
    .inline-contact select,
    .inline-contact textarea {
      font-size: 16px;
    }
  }
  .contact,
  .contact * {
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
  .info h3 {
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
    color: var(--text);
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
    background: #fff;
    border-color: #fff;
    color: #17231e;
  }
  .inline-contact .button.primary :global(svg) { color: #e30613; }
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
      background: #e9ede8;
      border-color: #e9ede8;
      color: #17231e;
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
</style>
