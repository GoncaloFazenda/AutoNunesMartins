<script lang="ts">
  import { stableTrustRow } from './trustRow';
  import { standTrust } from './standTrust';
  import { HandCoins, BadgeCheck, CarFront } from 'lucide-svelte';
  const symbols = [HandCoins, BadgeCheck, CarFront];
  let openService: number | null = null;

  // The existing button remains the single accessible control. Pointer clicks
  // elsewhere on the card delegate to it, without swallowing text selection or links.
  function clickableService(node: HTMLElement) {
    const activate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (window.getSelection()?.toString().trim()) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a, button, input, select, textarea, label, [contenteditable], [role="button"], [role="link"], [tabindex]')) return;
      node.querySelector<HTMLButtonElement>('.service-toggle')?.click();
    };
    node.addEventListener('click', activate);
    return { destroy: () => node.removeEventListener('click', activate) };
  }

</script>

<section class="orbit-trust" aria-labelledby="trust-heading">
  <h2 id="trust-heading">Cuidamos de tudo.</h2>
    <div class="trust-services" class:has-open={openService !== null} use:stableTrustRow>
      {#each standTrust.services as service, index}
        {@const Symbol = symbols[index]!}
        {@const isExpanded = openService === index}
        <article class="refined" use:clickableService>
          <span class="service-symbol" aria-hidden="true"><Symbol size={28} strokeWidth={1.6} /></span>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <div class="service-details" class:expanded={isExpanded}>
            <button
              class="service-toggle"
              type="button"
              id={`trust-service-trigger-${index}`}
              aria-expanded={isExpanded}
              aria-controls={`trust-service-panel-${index}`}
              on:click={() => openService = isExpanded ? null : index}
            >
              <span class="when-closed">Ver mais</span>
              <span class="when-open">Ver menos</span>
              <span class="sr-only"> sobre {service.title}</span>
              <span class="toggle-mark" aria-hidden="true"></span>
            </button>
            <div
              class="service-panel"
              id={`trust-service-panel-${index}`}
              role="region"
              aria-labelledby={`trust-service-trigger-${index}`}
              aria-hidden={!isExpanded}
              inert={!isExpanded}
            >
                <div class="service-reveal">
                  <p class="service-expanded">{service.details}</p>
                </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
</section>

<style>
  .orbit-trust {
    width: var(--orbit-frame, 90%);
    max-width: var(--orbit-frame-max, 1720px);
    margin: 0 auto;
    padding-block: var(--orbit-space-section, 86px) 0;
  }
  h2 {
    margin: 0 0 var(--orbit-space-heading, 36px);
    font-size: max(32px, calc(var(--orbit-title-section, 48px) * .9));
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.05em;
    text-wrap: balance;
  }
  .trust-services {
    display: grid;
    align-items: start;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  article {
    position: relative;
    padding: clamp(28px, 3vw, 48px);
    border: 1px solid var(--line);
    border-radius: 2px;
    background: var(--orbit-panel-bg, color-mix(in srgb, var(--text) 2%, transparent));
    cursor: pointer;
  }
  article::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 28px;
    width: 32px;
    height: 1px;
    background: var(--red);
    opacity: 0.65;
  }
  .service-symbol {
    position: absolute;
    top: -15px;
    right: 22px;
    display: flex;
    padding-inline: 7px;
    color: color-mix(in srgb, var(--text) 78%, var(--muted));
    background: var(--orbit-panel-bg);
    pointer-events: none;
  }
  @media (hover: hover) {
    article:hover {
      border-color: color-mix(in srgb, var(--text) 28%, transparent);
      background: color-mix(in srgb, var(--text) 3.5%, transparent);
    }
    article:hover::before {
      width: calc(100% - 56px);
      opacity: 0.9;
    }
    .refined:hover .service-symbol { color: var(--text); }
    .refined:hover::before { width: calc(100% - 98px); }
  }
  @media (prefers-reduced-motion: no-preference) {
    article { transition: border-color 260ms ease, background 260ms ease; }
    article::before { transition: width 360ms cubic-bezier(0.2, 0.65, 0.3, 1), opacity 240ms ease; }
    .service-symbol { transition: color 260ms ease; }
  }
  h3 {
    margin: 0;
    font-size: clamp(24px, 2.2vw, 34px);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1.25;
  }
  p {
    margin: 18px 0 0;
    max-width: 28ch;
    font-size: var(--orbit-type-body, 15px);
    line-height: 1.75;
    color: var(--muted);
  }
  .service-details { margin-top: 18px; }
  .service-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 8px 0;
    border: 0;
    background: none;
    color: var(--text);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
    cursor: pointer;
    border-radius: 2px;
    text-align: left;
  }
  article:has(.service-toggle:focus-visible) { outline: 2px solid var(--text); outline-offset: 4px; }
  .service-toggle:focus-visible { outline: none; }
  .when-open, .expanded .when-closed { display: none; }
  .expanded .when-open { display: inline; }
  .toggle-mark { position: relative; width: 12px; height: 12px; flex-shrink: 0; color: var(--red); }
  .toggle-mark::before, .toggle-mark::after { content: ''; position: absolute; inset: 5px 0; height: 1px; background: currentColor; }
  .toggle-mark::after { transform: rotate(90deg); }
  .expanded .toggle-mark::after { transform: rotate(90deg) scaleX(0); }
  .service-reveal { padding-top: 12px; }
  .service-panel { height: 0; overflow: hidden; }
  .expanded .service-panel { height: var(--service-reveal-height, auto); }
  @media (min-width: 701px) {
    .trust-services:global([data-measured]) { min-height: var(--trust-row-closed); }
    .trust-services.has-open:global([data-measured]) { min-height: var(--trust-row-expanded); }
  }
  article .service-expanded {
    max-width: none;
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    line-height: 1.75;
  }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  @media (hover: hover) { .service-toggle:hover { color: var(--red); } }
  @media (prefers-reduced-motion: no-preference) {
    .trust-services { transition: min-height 320ms cubic-bezier(.215, .61, .355, 1); }
    .service-panel { transition: height 320ms cubic-bezier(.215, .61, .355, 1); }
    .service-toggle { transition: color 180ms ease; }
    .toggle-mark::after { transition: transform 180ms ease; }
  }
  @media (min-width: 701px) and (max-width: 850px) {
    article { padding-inline: 20px; }
  }
  @media (max-width: 700px) {
    .trust-services { grid-template-columns: 1fr; gap: 14px; }
    article { padding: 28px; }
    article p { margin-top: 12px; }
    .trust-services:has(.refined) { gap: 24px; }
  }
</style>
