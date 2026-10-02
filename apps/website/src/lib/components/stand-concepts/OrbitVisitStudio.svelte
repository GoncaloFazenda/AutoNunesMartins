<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowUpRight, ArrowRight, Phone, Mail, MapPin, Clock3, Check } from 'lucide-svelte';
  import { standContact, type StandContact } from './standContact';
  import { photo } from './data';
  import { responsivePhoto } from './images';
  import OrbitVisitOriginalForm from './OrbitVisitOriginalForm.svelte';
  import FormSelectField from './FormSelectField.svelte';
  import OrbitVisitLabel from './OrbitVisitLabel.svelte';

  let {
    id = 'contactos-proposta',
    contact = standContact,
    comparison = false,
    backgroundTone = 'studio',
    comparisonLabel = 'Nova proposta',
    backgroundReferenceId,
    compareBackgroundTones = false,
    formTreatment = 'minimal',
    formDivider = false,
    showDemoNote = true,
    showCallIcon = false,
    borderlessPanels = false,
    formTitle = 'O que tem em mente?',
    formIntro = 'Uma pergunta é um bom começo.',
    mapArtwork = 'studio',
    harmonizedTypography = false,
  }: {
    id?: string;
    contact?: StandContact;
    comparison?: boolean;
    backgroundTone?: 'studio' | 'original';
    comparisonLabel?: string;
    backgroundReferenceId?: string;
    compareBackgroundTones?: boolean;
    formTreatment?: 'minimal' | 'refined' | 'original';
    formDivider?: boolean;
    showDemoNote?: boolean;
    showCallIcon?: boolean;
    borderlessPanels?: boolean;
    formTitle?: string;
    formIntro?: string;
    mapArtwork?: 'studio' | 'original';
    harmonizedTypography?: boolean;
  } = $props();
  let section: HTMLElement;
  let useReferenceTone = $state(true);
  let tested = $state(false);
  let fields = $state({ name: '', email: '', subject: 'Informações gerais', message: '' });
  const subjects = [
    'Informações gerais',
    'Conhecer uma viatura',
    'Marcar uma visita',
    'Falar sobre uma retoma',
  ];
  const demoId = $derived(contact.isDemo ? `${id}-demo` : undefined);

  // In the comparison, retain the original image/gradient canvas size instead of
  // compressing it into this shorter layout. Only absolute paint layers resize;
  // neither form nor section geometry depends on the reference.
  onMount(() => {
    if (backgroundTone !== 'original' || !backgroundReferenceId) return;
    const reference = document.getElementById(backgroundReferenceId);
    if (!reference) return;
    const syncBackground = () => {
      section.style.setProperty(
        '--reference-background-height',
        `${reference.getBoundingClientRect().height}px`,
      );
    };
    syncBackground();
    const observer = new ResizeObserver(syncBackground);
    observer.observe(reference);
    return () => observer.disconnect();
  });
</script>

<section
  class="visit-studio"
  bind:this={section}
  class:original-tone={backgroundTone === 'original'}
  class:reference-tone={backgroundReferenceId && (!compareBackgroundTones || useReferenceTone)}
  class:tone-comparison={compareBackgroundTones}
  class:refined-form={formTreatment === 'refined'}
  class:has-form-divider={formDivider}
  class:borderless-panels={borderlessPanels}
  class:harmonized-type={harmonizedTypography}
  {id}
  aria-labelledby={`${id}-heading`}
>
  <img
    class="studio-photo"
    src={photo('photo-1576212767334-9e289e294c77', backgroundTone === 'original' ? 2200 : 1280)}
    srcset={responsivePhoto('photo-1576212767334-9e289e294c77')}
    sizes="100vw"
    alt=""
    loading="lazy"
    decoding="async"
  />
  <div class="studio-inner">
    <div class="visit-copy">
      <div class="heading-line">
        <OrbitVisitLabel />
        {#if compareBackgroundTones}
          <button
            class="background-toggle"
            type="button"
            role="switch"
            aria-label="Usar tom original do fundo"
            aria-checked={useReferenceTone}
            onclick={() => (useReferenceTone = !useReferenceTone)}
          >
            <span class="toggle-track" aria-hidden="true"><span></span></span>
            {useReferenceTone ? 'Tom original' : 'Tom atual'}
          </button>
        {:else if comparison}<span class="comparison-label">{comparisonLabel}</span>{/if}
      </div>
      <h2 id={`${id}-heading`}>
        Venha <span class="heading-tail">conhecer-nos<span class="period">.</span></span>
      </h2>
      <p class="introduction">Os carros, ao vivo. As suas dúvidas, com tempo.</p>

      <div class="location" class:original-map={mapArtwork === 'original'}>
        {#if mapArtwork === 'original'}
          <img class="location-map" src="/images/orbit-location-map.svg" alt="" width="1728" height="684" loading="lazy" decoding="async" />
        {:else}
        <svg
          class="location-map"
          viewBox="0 0 540 220"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <path
            class="map-block"
            d="M15 12H104V61H15ZM135 9H210V59H135ZM244 8H324V58H244ZM365 12H469V59H365ZM12 99H96V145H12ZM139 99H213V143H139ZM247 99H321V142H247ZM365 99H444V145H365ZM15 178H99V215H15ZM140 178H212V216H140ZM250 178H322V216H250ZM365 178H470V218H365Z"
          />
          <g class="map-street" fill="none" stroke-width="10">
            <path d="M-20 80H560M-20 160H560M118-20V240M229-20V240M346-20V240M489-20V240" />
            <path d="M370-30L242 95 103 245" stroke-width="17" />
          </g>
          <path
            d="M370-30L242 95 103 245"
            fill="none"
            stroke="currentColor"
            stroke-opacity=".12"
            stroke-width="1.5"
          />
          <circle cx="328" cy="107" r="36" fill="#e30613" opacity=".07" />
          <circle cx="328" cy="107" r="22" fill="#e30613" opacity=".09" />
          <path
            d="M328 76c-10 0-18 8-18 18 0 14 18 32 18 32s18-18 18-32c0-10-8-18-18-18Z"
            fill="#e30613"
          />
          <circle cx="328" cy="94" r="5.5" fill="white" />
        </svg>
        {/if}
        <div class="location-copy">
          <h3><MapPin size={15} aria-hidden="true" /> Encontre-nos</h3>
          <address>{contact.address ?? 'Morada por confirmar.'}</address>
          {#if contact.directionsUrl}
            <a
              class="map-link"
              href={contact.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={demoId}
            >
              Abrir no mapa <ArrowUpRight size={16} aria-hidden="true" /><span class="sr-only">
                (abre num novo separador)</span
              >
            </a>
          {/if}
        </div>
      </div>

      <div class="contact-details">
        <div class="channels">
          <div>
            <h3><Phone size={14} aria-hidden="true" /> Telefone</h3>
            {#if contact.phone}<a
                class="contact-value"
                href={`tel:${contact.phone.international}`}
                aria-describedby={demoId}>{contact.phone.display}</a
              >{:else}<p>Por confirmar.</p>{/if}
          </div>
          <div>
            <h3><Mail size={14} aria-hidden="true" /> Email</h3>
            {#if contact.email}<a
                class="contact-value email"
                href={`mailto:${contact.email}`}
                aria-describedby={demoId}>{contact.email}</a
              >{:else}<p>Por confirmar.</p>{/if}
          </div>
        </div>
        <div class="opening-hours">
          <h3><Clock3 size={14} aria-hidden="true" /> Quando nos visitar</h3>
          {#if contact.hours.length}
            <dl>
              {#each contact.hours as hours}<div>
                  <dt>{hours.days}</dt>
                  <dd>{hours.time}</dd>
                </div>{/each}
            </dl>
          {:else}<p>Horário por confirmar.</p>{/if}
        </div>
      </div>

      <div class="direct-actions">
        {#if contact.phone}<a
            class="call-action"
            href={`tel:${contact.phone.international}`}
            aria-describedby={demoId}
            ><span class="call-label">{#if showCallIcon}<Phone class="call-phone-icon" size={15} strokeWidth={1.7} aria-hidden="true" />{/if}Ligar agora</span><ArrowUpRight size={18} aria-hidden="true" /></a
          >{/if}
        {#if contact.email}<a
            class="email-action"
            href={`mailto:${contact.email}`}
            aria-describedby={demoId}>Enviar email <ArrowUpRight size={16} aria-hidden="true" /></a
          >{/if}
      </div>
      {#if contact.isDemo}<p class="demo-note" class:sr-only={!showDemoNote} id={demoId}>
          Demonstração: morada, mapa, contactos e horário ilustrativos.
        </p>{/if}
    </div>

    {#if formTreatment === 'original'}
      {#if formDivider}
        <div class="original-form-divider">
          <OrbitVisitOriginalForm id={`${id}-form`} {showDemoNote} />
        </div>
      {:else}
        <OrbitVisitOriginalForm id={`${id}-form`} {showDemoNote} />
      {/if}
    {:else}
    <form
      class="message-card"
      aria-labelledby={`${id}-form-heading`}
      aria-describedby={`${id}-form-note`}
      oninput={() => (tested = false)}
      onsubmit={(event) => {
        event.preventDefault();
        tested = true;
      }}
    >
      <div class="form-heading">
        <span class="message-icon" aria-hidden="true"><Mail size={20} strokeWidth={1.5} /></span>
        <div>
          <h3 id={`${id}-form-heading`}>{formTitle}</h3>
          <p>{formIntro}</p>
        </div>
      </div>
      <div class="form-fields">
        <div class="field-row">
          <label for={`${id}-name`}
            >Nome<input
              id={`${id}-name`}
              name="name"
              autocomplete="name"
              placeholder="O seu nome"
              bind:value={fields.name}
              required
            /></label
          >
          <label for={`${id}-email`}
            >Email<input
              id={`${id}-email`}
              name="email"
              type="email"
              autocomplete="email"
              placeholder="nome@exemplo.pt"
              bind:value={fields.email}
              required
            /></label
          >
        </div>
        <label for={`${id}-subject`}
          >Gostava de falar sobre<FormSelectField><select
            id={`${id}-subject`}
            name="subject"
            bind:value={fields.subject}
            >{#each subjects as subject}<option>{subject}</option>{/each}</select
          ></FormSelectField></label
        >
        <label for={`${id}-message`}
          >Mensagem<textarea
            id={`${id}-message`}
            name="message"
            rows="4"
            placeholder="Conte-nos o que procura ou como podemos ajudar."
            bind:value={fields.message}
            required
          ></textarea></label
        >
      </div>
      <button class="send-button" type="submit"
        >Experimentar pedido <ArrowRight size={19} aria-hidden="true" /></button
      >
      <p class="form-note" id={`${id}-form-note`}>
        Formulário de demonstração. Não envia mensagens nem guarda dados.
      </p>
      <div class="form-status" role="status" aria-atomic="true">
        {#if tested}<Check size={15} aria-hidden="true" /><span
            >Pedido experimentado. Nenhuma mensagem foi enviada.</span
          >{/if}
      </div>
    </form>
    {/if}
  </div>
</section>

<style>
  .visit-studio,
  .visit-studio * {
    box-sizing: border-box;
  }
  .visit-studio {
    --bg: #17231e;
    --text: #f5f5f1;
    --muted: #c2cbc5;
    --line: #ffffff30;
    --studio-panel: #17231e50;
    --studio-soft: #22342b;
    position: relative;
    isolation: isolate;
    background: var(--bg);
    color: var(--text);
    border-block: 1px solid var(--line);
    margin: 0;
    scroll-margin-top: calc(var(--company-nav-height, 80px) + 20px);
  }
  .studio-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 54%;
    z-index: -2;
  }
  .borderless-panels .location,
  .borderless-panels :global(.inline-contact) {
    border-color: transparent;
  }
  .visit-studio::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(100deg, #0c1c16ed 0%, #12251ddb 48%, #0e211bea 100%);
  }
  /* Background treatment from OrbitContactFooter, without changing the studio layout. */
  .original-tone {
    background: #111214;
    overflow: hidden;
  }
  .original-tone .studio-photo {
    object-position: center 58%;
    filter: saturate(0.45);
  }
  .original-tone::before {
    background:
      linear-gradient(90deg, #101114a6 0%, #10111480 48%, #10111433 100%),
      linear-gradient(0deg, #0c0c0e99, #0c0c0e0d 75%);
  }
  .original-tone.reference-tone .studio-photo,
  .original-tone.reference-tone::before {
    bottom: auto;
    height: max(100%, var(--reference-background-height, 100%));
  }
  .studio-inner {
    --column-gap: clamp(40px, 6vw, 96px);
    width: var(--orbit-frame, 90%);
    max-width: var(--orbit-frame-max, 1720px);
    margin-inline: auto;
    padding-block: clamp(32px, 3.5vw, 54px);
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
    gap: var(--column-gap);
    align-items: start;
  }
  .original-form-divider {
    position: relative;
    min-width: 0;
  }
  .has-form-divider .studio-inner {
    --column-gap: clamp(64px, 9vw, 144px);
    gap: var(--column-gap);
  }
  .original-form-divider::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--column-gap) / -2);
    width: 1px;
    background: var(--line);
    pointer-events: none;
  }
  h2,
  h3,
  p,
  dl,
  dd {
    margin: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button,
  input,
  select,
  textarea {
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  .heading-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .comparison-label {
    font-size: 11px;
    color: var(--muted);
  }
  .background-toggle {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 132px;
    min-height: 36px;
    flex-shrink: 0;
    padding: 7px 9px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: #10111455;
    color: var(--text);
    font-size: 11px;
    line-height: 1.5;
  }
  .tone-comparison .heading-line {
    position: relative;
    padding-right: 150px;
  }
  .background-toggle:focus-visible {
    outline-color: var(--text);
  }
  .toggle-track {
    display: block;
    width: 24px;
    height: 14px;
    padding: 2px;
    border-radius: 9px;
    background: #ffffff30;
  }
  .toggle-track > span {
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--text);
  }
  .background-toggle[aria-checked='true'] .toggle-track > span {
    transform: translateX(10px);
  }
  h2 {
    margin-top: 18px;
    max-width: 16ch;
    font-size: clamp(34px, 3.3vw, 49px);
    letter-spacing: -0.055em;
    font-weight: 500;
    line-height: 1.05;
  }
  .period {
    color: var(--red);
  }
  .heading-tail {
    white-space: nowrap;
  }
  .introduction {
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    margin-top: 15px;
  }
  .location {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    margin-top: 22px;
    min-height: 130px;
    padding: 15px 18px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--studio-soft);
  }
  .location-map {
    position: absolute;
    inset: 0 0 0 auto;
    width: 70%;
    height: 100%;
    z-index: -2;
    opacity: 0.8;
    color: var(--text);
  }
  .map-block {
    fill: color-mix(in srgb, var(--text) 8%, var(--bg));
  }
  .map-street {
    stroke: var(--bg);
  }
  .location::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, var(--studio-soft) 34%, transparent 84%);
  }
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
    font-weight: 400;
  }
  .location h3 {
    color: var(--text);
  }
  address {
    font-size: 15px;
    font-style: normal;
    line-height: 1.6;
    white-space: pre-line;
    margin-top: 10px;
    max-width: 250px;
  }
  .map-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    min-height: 30px;
    margin-top: 8px;
  }
  .contact-details {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 22px;
    margin-top: 22px;
  }
  .channels {
    display: grid;
    gap: 14px;
    min-width: 0;
  }
  .contact-value {
    display: inline-block;
    font-size: 16px;
    line-height: 1.6;
    margin-top: 5px;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
  .contact-value.email {
    font-size: 14px;
  }
  .opening-hours {
    border-left: 1px solid var(--line);
    padding-left: 25px;
    min-width: 0;
  }
  dl {
    margin-top: 10px;
    display: grid;
    gap: 9px;
    font-size: 12px;
    line-height: 1.6;
  }
  dl > div {
    display: flex;
    gap: 14px;
    justify-content: space-between;
  }
  dt {
    color: var(--text);
  }
  dd {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .direct-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 26px;
    align-items: center;
    margin-top: 20px;
  }
  .call-action,
  .email-action {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 26px;
    min-height: 45px;
    font-size: 13px;
  }
  .call-action {
    padding: 10px 17px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--studio-panel);
  }
  .call-label {
    display: inline-flex;
    align-items: center;
    gap: 11px;
  }
  .call-label :global(svg) { flex-shrink: 0; }
  .email-action {
    gap: 12px;
  }
  .original-tone .call-action {
    background: #fff;
    border-color: #fff;
    color: #17231e;
  }
  .original-tone .call-action :global(svg) { color: #e30613; }
  .original-tone .call-action :global(svg.call-phone-icon) { color: #111; }
  .demo-note {
    font-size: 11px;
    line-height: 1.65;
    color: var(--muted);
    margin-top: 12px;
  }
  .demo-note.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .message-card {
    position: relative;
    padding: 4px 0 0 clamp(28px, 3.5vw, 54px);
    border-left: 1px solid var(--line);
    min-width: 0;
  }
  .form-heading {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding-bottom: 0;
  }
  .message-icon {
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    border: 1px solid var(--line);
    border-radius: 50%;
    color: var(--muted);
  }
  .form-heading h3 {
    color: var(--text);
    font-size: clamp(23px, 2vw, 28px);
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: -0.035em;
  }
  .form-heading p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
    margin-top: 8px;
  }
  .form-fields {
    display: grid;
    gap: 15px;
    margin-block: 22px 18px;
  }
  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 9px;
    color: var(--text);
    font-size: 12px;
    min-width: 0;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    font-size: var(--orbit-type-control, 16px);
    line-height: 1.5;
    background: #10201988;
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 4px;
  }
  input,
  select {
    min-height: 44px;
  }
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  option {
    background: var(--bg);
    color: var(--text);
  }
  /* Original fields use a translucent light surface, not a second dark veil.
     Keep the former dark field treatment in the comparison's current-tone mode. */
  .original-tone.reference-tone :is(input, select, textarea) {
    background: #ffffff09;
  }
  :is(input, select, textarea):focus {
    border-color: var(--text);
    box-shadow: inset 0 0 0 0.35px var(--text);
    outline: none;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 4px;
  }
  .send-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 49px;
    gap: 20px;
    padding: 12px 17px;
    background: #f5f5f1;
    color: #17231e;
    border: 1px solid #f5f5f1;
    border-radius: 4px;
    font-size: 14px;
  }
  .original-tone .send-button {
    background: transparent;
    color: var(--text);
    border-color: var(--line);
  }
  .form-note {
    margin-top: 13px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.6;
  }
  .form-status {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-height: 48px;
    padding-top: 12px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text);
  }
  .form-status :global(svg) {
    flex-shrink: 0;
    margin-top: 2px;
  }
  @media (hover: hover) {
    .visit-copy a:hover {
      color: white;
    }
    .call-action:hover {
      border-color: #ffffff90;
    }
    .original-tone .call-action:hover {
      background: #e9ede8;
      border-color: #e9ede8;
      color: #17231e;
    }
    :is(input, select, textarea):hover {
      background: color-mix(in srgb, var(--text) 2%, var(--bg));
      border-color: color-mix(in srgb, var(--text) 40%, transparent);
    }
    .original-tone.reference-tone :is(input, select, textarea):hover {
      background: #ffffff13;
    }
    .send-button:hover {
      background: #e0e8df;
      border-color: #e0e8df;
    }
    .original-tone .send-button:hover {
      background: #ffffff09;
      border-color: #ffffff70;
    }
    .map-link:hover :global(svg),
    .send-button:hover :global(svg) {
      transform: translateX(3px);
    }
  }
  .original-tone.reference-tone :is(input, select, textarea):focus {
    background: #ffffff16;
  }
  /* Refined comparison: local reading surfaces, not a large opaque form panel. */
  .refined-form .form-heading {
    padding: 18px;
    border: 1px solid #ffffff30;
    border-radius: 4px;
    background: #102019c9;
    align-items: center;
  }
  .refined-form .form-heading h3 {
    color: #fff;
    font-weight: 600;
    font-size: clamp(23px, 2vw, 28px);
    letter-spacing: -0.035em;
  }
  .refined-form .form-heading p {
    color: #dde4df;
    margin-top: 7px;
  }
  .refined-form .message-icon {
    color: #f5f5f1;
    border-color: #ffffff50;
  }
  .refined-form label {
    font-weight: 500;
    color: #fff;
    text-shadow: 0 1px 4px #0008;
  }
  .refined-form :is(input, select, textarea) {
    background: #0d1714d9;
    border-color: #ffffff60;
    color: #fff;
    text-shadow: none;
    font-weight: 400;
  }
  .refined-form :is(input, textarea)::placeholder {
    color: #d2dbd5;
  }
  .refined-form .send-button {
    color: #fff;
    border-color: #ffffff70;
    text-shadow: 0 1px 4px #0008;
  }
  .refined-form .form-note,
  .refined-form .form-status {
    color: #e4e9e5;
    text-shadow: 0 1px 4px #000a;
  }
  @media (hover: hover) {
    .refined-form :is(input, select, textarea):hover {
      background: #14261eeb;
      border-color: #ffffff90;
    }
    .refined-form .send-button:hover {
      background: #ffffff09;
      border-color: #ffffffb0;
    }
  }
  .refined-form :is(input, select, textarea):focus {
    background: #14261efa;
    border-color: #f5f5f1;
    box-shadow: inset 0 0 0 0.35px #f5f5f1;
  }
  @media (prefers-reduced-motion: no-preference) {
    a,
    button,
    input,
    select,
    textarea {
      transition:
        color 180ms ease,
        border-color 180ms ease,
        background-color 180ms ease,
        box-shadow 180ms ease;
    }
    .map-link :global(svg),
    .send-button :global(svg) {
      transition: transform 220ms ease;
    }
  }
  @media (max-width: 1100px) {
    .studio-inner {
      gap: 36px;
    }
    .contact-details {
      grid-template-columns: 1fr;
      gap: 22px;
    }
    .channels {
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .opening-hours {
      border-left: 0;
      padding-left: 0;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }
    .opening-hours dl {
      max-width: 370px;
    }
  }
  @media (max-width: 900px) {
    .map-link { min-height: 44px; }
    .has-form-divider .studio-inner { --column-gap: 102px; }
    .borderless-panels :global(.inline-contact :is(input, select, textarea)) {
      border-color: transparent;
      box-shadow: none;
    }
    .borderless-panels :global(.inline-contact :is(input, select, textarea):focus) {
      /* Keep selection visible without restoring an outer frame. */
      box-shadow: inset 0 -2px 0 #f5f5f1;
    }
    .original-form-divider::before {
      top: calc(var(--column-gap) / -2);
      bottom: auto;
      left: 0;
      width: 100%;
      height: 1px;
    }
    .studio-inner {
      grid-template-columns: 1fr;
      gap: 34px;
    }
    .visit-copy h2 {
      max-width: none;
    }
    .contact-details {
      grid-template-columns: 1fr 1fr;
    }
    .channels {
      grid-template-columns: 1fr;
    }
    .opening-hours {
      border-top: 0;
      padding-top: 0;
      border-left: 1px solid var(--line);
      padding-left: 24px;
    }
    .message-card {
      padding: 28px 0 0;
      border-left: 0;
      border-top: 1px solid var(--line);
    }
  }
  @media (max-width: 700px) {
    .has-form-divider .studio-inner { --column-gap: 90px; }
    .refined-form .form-heading {
      padding: 16px;
    }
    .refined-form .form-heading h3 {
      font-size: 24px;
    }
    .original-tone .studio-photo {
      object-position: 62% center;
    }
    .original-tone::before {
      background:
        linear-gradient(90deg, #101114a6, #10111473), linear-gradient(0deg, #0c0c0e99, transparent);
    }
    .studio-inner {
      padding-block: 36px;
      gap: 30px;
    }
    .visit-copy h2 {
      font-size: clamp(35px, 9vw, 46px);
      max-width: 12ch;
      margin-top: 20px;
    }
    .introduction {
      font-size: 15px;
      margin-top: 17px;
    }
    .location {
      padding: 20px;
      margin-top: 23px;
    }
    .location-map {
      width: 90%;
      opacity: 0.65;
    }
    .location::before {
      background: linear-gradient(90deg, var(--studio-soft) 24%, transparent 100%);
    }
    address {
      font-size: 14px;
    }
    .contact-details {
      grid-template-columns: 1fr;
      margin-top: 23px;
      gap: 22px;
    }
    .channels {
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .opening-hours {
      border: 0;
      border-top: 1px solid var(--line);
      padding: 19px 0 0;
    }
    dl {
      font-size: 13px;
    }
    .message-card {
      padding: 24px 0 0;
    }
    .form-heading {
      gap: 12px;
      padding-bottom: 0;
    }
    .message-icon {
      width: 36px;
      height: 36px;
    }
    .form-heading h3 {
      font-size: 24px;
    }
    .form-fields {
      margin-top: 23px;
    }
    .field-row {
      grid-template-columns: 1fr;
      gap: 19px;
    }
    input,
    select,
    textarea {
      font-size: 16px;
    }
    .form-status {
      min-height: 48px;
    }
  }
  @media (max-width: 380px) {
    .channels {
      grid-template-columns: 1fr;
    }
    .direct-actions {
      gap: 8px 18px;
    }
    .call-action,
    .email-action {
      font-size: 12px;
    }
    .form-heading {
      gap: 10px;
    }
    .message-icon {
      display: none;
    }
  }
  /* Approved homepage typography; other instances retain their existing treatment. */
  .harmonized-type h2 {
    margin-top: 15px;
    font-size: clamp(30px, 3.1vw, 46px);
    font-weight: 500;
    letter-spacing: -.045em;
    line-height: 1.15;
  }
  .harmonized-type .introduction {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.6;
  }
  .harmonized-type :global(.inline-contact h3) {
    font-size: clamp(24px, 2vw, 30px);
    letter-spacing: -.035em;
    line-height: 1.2;
  }
  @media (max-width: 700px) {
    .harmonized-type h2 { font-size: 32px; }
  }
  /* Original map artwork and tint, without changing the approved card geometry. */
  .location.original-map .location-map { width: 100%; opacity: 1; object-fit: cover; object-position: center; }
  .location.original-map::before { background: linear-gradient(90deg, #101913f2 0%, #101913df 48%, #10191373 100%); }
</style>
