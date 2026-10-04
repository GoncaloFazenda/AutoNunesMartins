<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { standContact } from './standContact';
  let { onContact }: { onContact: () => void } = $props();
</script>

<footer class="catalog-footer">
  <div class="closing">
    <button class="invitation" onclick={onContact}>
      <span>Vamos<br /><span>conversar.</span></span>
      <ArrowUpRight aria-hidden="true" />
    </button>
    <div class="contact-line">
      <div>
        {#if standContact.phone}<a href={`tel:${standContact.phone.international}`}>{standContact.phone.display}</a>{/if}
        {#if standContact.email}<a href={`mailto:${standContact.email}`}>{standContact.email}</a>{/if}
      </div>
    </div>
  </div>
  <div class="practical">
    <a class="brand" href="/"><img src="/logo-transparent-white-v3.png" alt="Auto Nunes Martins — início" width="180" height="80" /></a>
    <div class="visit"><p class="eyebrow">MORADA</p><address>{standContact.address ?? 'Morada por confirmar.'}</address></div>
    <div class="hours"><p class="eyebrow">HORÁRIO</p><dl>{#each standContact.hours as item}<div><dt>{item.days}</dt><dd>{item.time}</dd></div>{/each}</dl></div>
  </div>
  <div class="baseline">
    <p>© {new Date().getFullYear()} {standContact.name}{#if standContact.isDemo}<span>Demonstração · Dados fictícios</span>{/if}</p>
    <nav aria-label="Navegação do rodapé"><a href="/">Início</a><a href="/#sobre">Sobre nós</a><a href="/informacao-legal">Informação legal</a><a href="/politica-de-privacidade">Privacidade</a></nav>
  </div>
</footer>

<style>
  .catalog-footer { background: #101012; color: #f5f5f1; padding: clamp(48px, 6vw, 96px) max(24px, 2%, calc((100% - 1720px) / 2)) 28px; }
  p { margin: 0; }
  .eyebrow { color: #a5a5aa; font-size: 10px; letter-spacing: .12em; line-height: 1.7; }
  .invitation { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 30px; padding: 42px 0; border: 0; background: none; color: inherit; cursor: pointer; text-align: left; font: inherit; }
  .invitation > span { font-size: clamp(48px, 7vw, 106px); line-height: 1.02; letter-spacing: -.065em; font-weight: 500; }
  .invitation > span > span { color: #97979d; }
  .invitation :global(svg) { width: clamp(46px, 8vw, 112px); height: auto; flex-shrink: 0; color: var(--red); stroke-width: 1; }
  .contact-line { display: flex; padding-block: 12px 64px; color: #b6b6bc; font-size: 12px; line-height: 1.8; }
  .contact-line > div { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; }
  a { color: inherit; text-decoration: none; }
  a:hover { color: #fff; text-decoration: underline; text-underline-offset: 5px; }
  .practical { border-top: 1px solid #ffffff24; display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 40px; padding-block: 36px 44px; }
  .brand img { width: 150px; height: auto; }
  address { max-width: 25ch; font-style: normal; font-size: 12px; line-height: 1.8; margin-top: 14px; color: #b6b6bc; }
  dl { margin: 14px 0 0; font-size: 12px; line-height: 1.8; color: #b6b6bc; }
  dl > div { display: flex; justify-content: space-between; gap: 20px; }
  dd { margin: 0; }
  .baseline { display: flex; justify-content: space-between; gap: 24px; font-size: 10px; color: #a5a5aa; line-height: 1.8; }
  .baseline p span { display: block; }
  nav { display: flex; flex-wrap: wrap; gap: 24px; }
  :is(a, button):focus-visible { outline: 2px solid #f5f5f1; outline-offset: 6px; }
  @media (prefers-reduced-motion: no-preference) { .invitation :global(svg) { transition: transform 300ms ease; } .invitation:hover :global(svg) { transform: translate(5px, -5px); } }
  @media (max-width: 700px) {
    .catalog-footer { padding-inline: 5%; }
    .invitation { padding-block: 36px; gap: 12px; }
    .invitation > span { font-size: clamp(42px, 10vw, 64px); }
    .invitation :global(svg) { width: 40px; }
    .contact-line { flex-direction: column; padding-bottom: 44px; gap: 18px; }
    .contact-line > div { flex-direction: column; align-items: flex-start; gap: 4px; }
    .contact-line a { padding-block: 5px; }
    .practical { grid-template-columns: 1fr; gap: 28px; }
    .hours { max-width: 350px; }
    .baseline { flex-direction: column; }
    nav a { padding-block: 10px; }
  }
</style>
