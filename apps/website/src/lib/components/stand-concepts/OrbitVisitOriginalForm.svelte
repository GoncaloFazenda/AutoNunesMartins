<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import FormSelectField from './FormSelectField.svelte';

  // Comparison snapshot of OrbitContactFooter's original inline form.
  // Keep this isolated so experiments do not restyle the reference section.
  let { id, showDemoNote = true }: { id: string; showDemoNote?: boolean } = $props();
  let tested = $state(false);
</script>

<form
  class="inline-contact"
  aria-labelledby={`${id}-heading`}
  aria-describedby={`${id}-note`}
  oninput={() => (tested = false)}
  onsubmit={(event) => {
    event.preventDefault();
    tested = true;
  }}
>
  <p class="eyebrow">COMECE A CONVERSA</p>
  <h3 id={`${id}-heading`}>O que tem em mente?</h3>
  <div class="form-row">
    <label for={`${id}-name`}>Nome<input id={`${id}-name`} name="name" autocomplete="name" placeholder="O seu nome" required /></label>
    <label for={`${id}-email`}>Email<input id={`${id}-email`} name="email" type="email" autocomplete="email" placeholder="nome@exemplo.pt" required /></label>
  </div>
  <label for={`${id}-subject`}>Assunto<FormSelectField><select id={`${id}-subject`} name="subject">
    <option>Informações gerais</option>
    <option>Conhecer uma viatura</option>
    <option>Marcar uma visita</option>
    <option>Falar sobre uma retoma</option>
  </select></FormSelectField></label>
  <label for={`${id}-message`}>Mensagem<textarea id={`${id}-message`} name="message" rows="3" placeholder="Como podemos ajudar?" required></textarea></label>
  <div class="form-bottom" class:without-note={!showDemoNote}>
    <p id={`${id}-note`} class:sr-only={!showDemoNote}>Demonstração. Não envia mensagens nem guarda dados.</p>
    <button type="submit" class="button primary"><span class="action-text">Experimentar pedido</span> <span class="action-arrow"><ArrowUpRight size={17} aria-hidden="true" /></span></button>
  </div>
  <p class="form-status" role="status" aria-atomic="true">{tested ? 'Pedido experimentado. Nenhuma mensagem foi enviada.' : ''}</p>
</form>

<style>
  .inline-contact,
  .inline-contact * { box-sizing: border-box; }
  .inline-contact {
    min-width: 0;
    padding: clamp(24px, 2vw, 32px);
    border: 1px solid #ffffff30;
    border-radius: 8px;
    background: #101913c9;
    backdrop-filter: blur(12px);
    color: #f5f5f1;
  }
  h3, p { margin: 0; }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ececef;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.5;
    text-transform: uppercase;
    letter-spacing: .13em;
  }
  h3 {
    margin-top: 12px;
    font-size: clamp(26px, 2.3vw, 36px);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -.04em;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  label { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; min-width: 0; font-size: 12px; color: #ececef; }
  input, select, textarea {
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
  input::placeholder, textarea::placeholder { color: #b7c1b9; opacity: 1; }
  option { background: #17221b; color: #f5f5f1; }
  textarea { resize: vertical; min-height: 96px; }
  button:focus-visible { outline: 2px solid #f5f5f1; outline-offset: 3px; }
  @media (hover: hover) {
    :is(input, select, textarea):hover { background: #ffffff13; border-color: #ffffff70; box-shadow: 0 0 12px #ffffff08; }
    .button.primary:hover { background: #e9ede8; border-color: #e9ede8; }
  }
  :is(input, select, textarea):focus {
    background: #ffffff16;
    border-color: #f5f5f1;
    box-shadow: inset 0 0 0 .35px #f5f5f1;
    outline: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    input, select, textarea { transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease; }
  }
  .form-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-top: 24px; }
  .form-bottom p { flex: 1 1 140px; color: #b7c1b9; font-size: 11px; line-height: 1.6; }
  .form-bottom.without-note { justify-content: flex-end; }
  .form-bottom .sr-only {
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
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    min-height: 48px;
    padding: 12px 22px;
    border: 1px solid #fff;
    border-radius: 3px;
    color: #17231e;
    background: #fff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .form-status { margin-top: 12px; color: #f5f5f1; font-size: 12px; line-height: 1.6; }
  .button.primary { position: relative; isolation: isolate; }
  .button.primary::before { content: ''; position: absolute; inset: -1px; z-index: -1; pointer-events: none; background: inherit; border: inherit; border-radius: inherit; box-shadow: 0 3px 10px #00000000; }
  .action-arrow { display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; flex: 0 0 17px; }
  .button.primary :global(svg) { color: #e30613; }
  .button.primary:focus-visible :global(svg) { rotate: 45deg; }
  .button.primary:focus-visible::before { box-shadow: 0 3px 10px #00000026; }
  @media (hover: hover) {
    .button.primary:hover :global(svg) { rotate: 45deg; }
    .button.primary:hover::before { box-shadow: 0 3px 10px #00000026; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .button.primary { transition: background-color 300ms ease, border-color 300ms ease; }
    .button.primary :global(svg) { transition: rotate 300ms ease; }
    .button.primary::before { transition: box-shadow 300ms ease; }
  }
  .form-status:empty { display: none; }
  @media (max-width: 700px) {
    .form-row { grid-template-columns: 1fr; }
    .inline-contact { padding: 24px 20px; }
    input, select, textarea { font-size: 16px; }
    .button { padding-inline: 12px; font-size: 14px; line-height: 1.4; }
  }
  @media (max-width: 360px) { .button { width: 100%; } }

</style>
