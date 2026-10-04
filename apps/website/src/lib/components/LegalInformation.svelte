<script lang="ts">
  import { page } from '$app/stores';
  import readiness from '$lib/publicationReadiness.json';
  import LegalFields from './LegalFields.svelte';
</script>

<svelte:head>
  <title>Informação legal — Auto Nunes Martins</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="description" content="Identificação do operador e informação legal em preparação. Dados por confirmar antes da publicação." />
  <link rel="canonical" href={new URL('/informacao-legal', $page.url.origin).href} />
</svelte:head>

<main class="legal">
  <p class="eyebrow">INFORMAÇÃO LEGAL</p>
  <h1>Informação clara.<br />Dados por confirmar.</h1>
  <aside aria-label="Estado de preparação"><strong>Preparação para publicação — incompleta</strong><p>Esta página contém campos pendentes. Não confirma dados do operador, adesões, registos ou prontidão para publicação. Os contactos e formulários do site continuam em demonstração.</p></aside>
  <nav aria-label="Nesta página"><a href="#operador">Operador</a><a href="#ral">Resolução de litígios</a><a href="#reclamacoes">Livro de Reclamações</a></nav>
  <section id="operador"><h2>Identificação do operador</h2><LegalFields fields={readiness.operator} /></section>
  <section id="ral"><h2>Resolução alternativa de litígios</h2><p>A entidade competente, os respetivos contactos e a existência de eventual adesão estão por confirmar. Não é declarada adesão a qualquer entidade.</p><LegalFields fields={readiness.disputes} /></section>
  <section id="reclamacoes"><h2>Livro de Reclamações</h2><p>O registo e a ligação aplicável ao operador estão pendentes. A ligação seguinte abre o portal geral oficial e não confirma que este stand esteja registado.</p><LegalFields fields={readiness.complaints} /><a href="https://www.livroreclamacoes.pt/">Consultar o portal geral do Livro de Reclamações</a></section>
  <section><h2>Privacidade e contacto</h2><p>A identificação do responsável, os contactos e os serviços efetivos também estão em preparação. Consulte a <a href="/politica-de-privacidade">política de privacidade</a>, incluindo a informação sobre armazenamento de favoritos e comparação.</p></section>
</main>

<style>
  .legal { width: var(--orbit-frame, 90%); max-width: 1100px; margin: auto; padding: 56px 0 80px; color: var(--text); line-height: 1.7; }
  .eyebrow { font-size: 11px; letter-spacing: .12em; color: var(--muted); }
  h1 { font-size: clamp(34px, 5vw, 62px); line-height: 1.12; letter-spacing: -.04em; font-weight: 500; }
  h2 { font-size: clamp(24px, 3vw, 34px); line-height: 1.25; font-weight: 500; }
  aside { border-left: 3px solid var(--red); padding: 20px 24px; background: var(--surface); }
  aside p { margin-bottom: 0; }
  nav { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-block: 30px; }
  a { color: inherit; text-decoration: underline; text-underline-offset: 4px; overflow-wrap: anywhere; }
  a:focus-visible { outline: 2px solid var(--red); outline-offset: 5px; }
  section { padding: 26px 0; border-top: 1px solid var(--line); scroll-margin-top: 100px; }
  @media (max-width: 700px) { .legal { padding-top: 32px; } aside { padding: 16px; } }
</style>
