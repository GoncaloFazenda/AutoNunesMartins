<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { standContact } from './standContact';

  let {
    showContacts = true,
    compact = false,
    contactHref = '/#contactos',
    onContact,
  }: { showContacts?: boolean; compact?: boolean; contactHref?: string; onContact?: () => void } = $props();
</script>

<footer class="compact-footer" class:condensed={compact}>
  <div class="inner">
    {#if onContact}
      <div class="invitation-wrap">
        <button class="invitation" onclick={onContact}>
          <span>Vamos<br /><span>conversar.</span></span>
          <ArrowUpRight aria-hidden="true" />
        </button>
      </div>
    {/if}
    <div class="top">
      <a class="brand" href="/" aria-label="Auto Nunes Martins — início">
        <img src="/logo-transparent-white-v3.png" alt={standContact.name} width="180" height="80" />
      </a>
      <nav aria-label="Navegação do rodapé">
        <a href="/viaturas">Viaturas</a>
        <a href="/quem-somos">Quem somos</a>
        <a href={contactHref}>Morada e horário <ArrowUpRight size={14} aria-hidden="true" /></a>
      </nav>
    </div>
    {#if showContacts}
      <div class="contacts">
        {#if standContact.phone}<a href={`tel:${standContact.phone.international}`} aria-describedby={standContact.isDemo ? 'compact-footer-demo' : undefined}>{standContact.phone.display}</a>{/if}
        {#if standContact.email}<a href={`mailto:${standContact.email}`} aria-describedby={standContact.isDemo ? 'compact-footer-demo' : undefined}>{standContact.email}</a>{/if}
      </div>
    {/if}
    <div class="baseline">
      <p>© {new Date().getFullYear()} {standContact.name}
        {#if standContact.isDemo}<span id="compact-footer-demo" class:sr-only={compact}>Demonstração · Dados fictícios</span>{/if}
      </p>
      <a href="/informacao-legal">Informação legal</a>
      <a href="/politica-de-privacidade">Política de privacidade</a>
    </div>
  </div>
</footer>

<style>
  .compact-footer { background: #101012; color: #f5f5f1; }
  .inner { width: var(--orbit-frame, 95%); max-width: var(--orbit-frame-max, 1640px); margin-inline: auto; padding-block: 32px 20px; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 24px 48px; }
  .invitation-wrap { padding-block: clamp(16px, 3vw, 44px) clamp(36px, 5vw, 72px); margin-bottom: 32px; border-bottom: 1px solid #ffffff24; }
  .invitation { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 32px; padding: 0; border: 0; background: none; color: inherit; cursor: pointer; text-align: left; font: inherit; }
  .invitation > span { position: relative; isolation: isolate; font-family: 'Orbit Barlow', 'Orbit Inter', Arial, sans-serif; font-style: normal; font-size: clamp(48px, 7vw, 106px); line-height: 1.02; letter-spacing: -.065em; font-weight: 600; }
  /* Keep the content on the page grid, with both rules just behind its left edge. */
  .invitation > span::before,
  .brand::before {
    content: '';
    position: absolute;
    z-index: -1;
    pointer-events: none;
    left: calc(-1 * clamp(12px, 1.2vw, 24px));
    top: -.06em;
    bottom: -.06em;
    width: 2px;
    background: color-mix(in srgb, var(--red, #e30613) 72%, transparent);
    opacity: .92;
  }
  .invitation > span > span { position: relative; display: inline-block; color: #97979d; }
  .invitation > span > span::after { content: ''; position: absolute; left: 0; right: 0; bottom: -.1em; height: 2px; background: var(--red); transform: scaleX(0); transform-origin: left; }
  .invitation :global(svg) { width: clamp(46px, 7vw, 96px); height: auto; flex-shrink: 0; color: var(--red); stroke-width: 1; }
  .invitation:focus-visible { outline: 2px solid #f5f5f1; outline-offset: 8px; }
  .invitation:focus-visible > span > span { color: #f5f5f1; }
  .invitation:focus-visible > span > span::after { transform: scaleX(1); }
  @media (hover: hover) {
    .invitation:hover > span > span { color: #f5f5f1; }
    .invitation:hover > span > span::after { transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .invitation > span > span { transition: color 240ms ease; }
    .invitation > span > span::after { transition: transform 240ms ease; }
    .invitation :global(svg) { transition: transform 300ms ease; }
    .invitation:hover :global(svg) { transform: translate(5px, -5px); }
  }
  .brand { position: relative; isolation: isolate; flex-shrink: 0; }
  .brand img { display: block; width: 132px; height: auto; }
  a { color: inherit; text-decoration: none; }
  nav { display: flex; flex-wrap: wrap; gap: 8px 28px; }
  nav a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 13px; }
  .contacts { display: flex; flex-wrap: wrap; gap: 4px 28px; margin-top: 16px; color: #c1c1c7; font-size: 13px; }
  .contacts a { display: inline-flex; align-items: center; min-height: 44px; overflow-wrap: anywhere; max-width: 100%; }
  .baseline { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 24px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ffffff24; color: #a6a6ae; font-size: 11px; line-height: 1.7; }
  p { margin: 0; }
  p span { display: inline-block; margin-left: 16px; }
  .baseline a { display: inline-flex; align-items: center; min-height: 44px; }
  a:focus-visible { outline: 2px solid #f5f5f1; outline-offset: 5px; }
  @media (hover: hover) { a:hover { color: #fff; text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 6px; } }
  /* Homepage density is opt-in; other pages keep their existing proportions. */
  .condensed .inner { padding-block: 24px 16px; }
  .condensed .invitation-wrap { padding-block: clamp(12px, 1.5vw, 24px) clamp(24px, 3vw, 40px); margin-bottom: 20px; }
  .condensed .invitation > span { font-size: clamp(42px, 5.2vw, 80px); }
  .condensed .invitation :global(svg) { width: clamp(40px, 5vw, 72px); }
  .condensed .baseline { margin-top: 16px; padding-top: 12px; }
  .condensed .top {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
  }
  .condensed nav { justify-self: end; }
  .baseline .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  @media (max-width: 700px) {
    .invitation-wrap { padding-block: 16px 36px; margin-bottom: 28px; }
    .invitation { gap: 16px; }
    .invitation > span { font-size: clamp(42px, 10vw, 64px); }
    .invitation :global(svg) { width: 40px; }
    .inner { width: 90%; padding-block: 28px 16px; }
    .top { align-items: flex-start; flex-direction: column; gap: 18px; }
    nav { gap: 4px 22px; }
    .contacts { flex-direction: column; gap: 0; margin-top: 12px; }
    .baseline { margin-top: 20px; }
    p span { display: block; margin-left: 0; }
    .condensed .inner { padding-block: 20px 12px; }
    .condensed .invitation-wrap { padding-block: 8px 24px; margin-bottom: 20px; }
    .condensed .invitation > span { font-size: clamp(38px, 9vw, 54px); }
    .condensed .invitation :global(svg) { width: 36px; }
    .condensed .top { gap: 24px; align-items: start; }
    .condensed .brand { padding-top: 8px; }
    .condensed .brand img { width: clamp(108px, 26vw, 120px); }
    .condensed nav {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      min-width: 0;
    }
    .condensed nav a { white-space: nowrap; }
    .condensed .baseline { margin-top: 12px; }
  }
  @media (max-width: 480px) {
    .condensed .baseline {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
  }
</style>
