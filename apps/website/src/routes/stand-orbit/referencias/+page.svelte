<script lang="ts">
  import { ArrowLeft, ArrowUpRight, X } from 'lucide-svelte';
  import ArchivedOrbitCinema from '$lib/components/stand-concepts/ArchivedOrbitCinema.svelte';
  import OrbitDetails from '$lib/components/stand-concepts/OrbitDetails.svelte';
  import OrbitPageEnding from '$lib/components/stand-concepts/OrbitPageEnding.svelte';
  import OrbitSpread from '$lib/components/stand-concepts/OrbitSpread.svelte';
  import { designMotion } from '$lib/components/stand-concepts/designMotion';

  let contactDialog: HTMLDialogElement;
  let sent = $state(false);
  let reason = $state('Gostava de combinar uma visita para conhecer uma viatura.');

  function contact(message: string) {
    reason = message;
    sent = false;
    contactDialog.showModal();
  }
</script>

<svelte:head>
  <title>Referências visuais — Auto Nunes Martins</title>
  <meta
    name="description"
    content="Arquivo reservado de referências visuais da Auto Nunes Martins."
  />
</svelte:head>

<div class="references">
  <header>
    <a class="logo" href="/stand-orbit">
      <img src="/logo.png" alt="Auto Nunes Martins — início" width="180" height="80" />
    </a>
    <a class="back" href="/stand-orbit"><ArrowLeft size={15} /> Voltar ao Stand Orbit</a>
  </header>

  <main>
    <div class="collection-intro">
      <p>ARQUIVO / REFERÊNCIAS VISUAIS</p>
      <div>
        <h1>Ideias a que<br />queremos voltar.</h1>
        <p>
          Uma coleção reservada de momentos, composições e movimentos guardados para futuras
          explorações.
        </p>
      </div>
    </div>

    <div class="archive-lead-space" aria-hidden="true">
      <span>DESÇA PARA REVISITAR</span>
    </div>

    <article class="reference-item">
      <div class="reference-heading">
        <span>02</span>
        <div>
          <p>TRANSIÇÃO CINEMATOGRÁFICA</p>
          <h2>Do ecrã para a estrada.</h2>
        </div>
        <small>ARQUIVADA NA ÍNTEGRA</small>
      </div>
      <ArchivedOrbitCinema onContact={contact} />
    </article>

    <article class="reference-item">
      <div class="reference-heading">
        <span>01</span>
        <div>
          <p>COMPOSIÇÃO EDITORIAL</p>
          <h2>O primeiro olhar atrai. Os detalhes decidem.</h2>
        </div>
        <small>ARQUIVADA NA ÍNTEGRA</small>
      </div>
      <div class="reference-motion" use:designMotion>
        <OrbitDetails onContact={contact} />
      </div>
    </article>
    <article class="reference-item">
      <div class="reference-heading">
        <span>03</span>
        <div>
          <p>TRÊS PERSPETIVAS</p>
          <h2>Três perspetivas para o seu próximo carro.</h2>
        </div>
        <small>ARQUIVADA NA ÍNTEGRA</small>
      </div>
      <div class="reference-motion" use:designMotion>
        <OrbitSpread />
      </div>
    </article>
  </main>

  <div class="reference-ending">
    <OrbitPageEnding onContact={() => contact('Gostava de saber mais.')} />
  </div>

  <dialog bind:this={contactDialog}>
    <button class="dialog-close" onclick={() => contactDialog.close()} aria-label="Fechar">
      <X size={22} />
    </button>
    {#if sent}
      <p class="dialog-kicker">PEDIDO EXPERIMENTADO</p>
      <h2>Primeiro passo,<br />experimentado.</h2>
      <p>Esta é uma demonstração. O pedido não foi enviado e os dados não foram guardados.</p>
      <button class="dialog-action" onclick={() => contactDialog.close()}>
        Continuar a explorar <ArrowUpRight size={18} />
      </button>
    {:else}
      <p class="dialog-kicker">VAMOS CONVERSAR</p>
      <h2>O que tem<br />em mente?</h2>
      <p>Formulário de demonstração. Não envia mensagens.</p>
      <form
        onsubmit={(event) => {
          event.preventDefault();
          sent = true;
        }}
      >
        <label>Nome<input required autocomplete="name" placeholder="O seu nome" /></label>
        <label
          >Email<input
            required
            type="email"
            autocomplete="email"
            placeholder="nome@exemplo.pt"
          /></label
        >
        <label>Mensagem<textarea rows="3" bind:value={reason}></textarea></label>
        <button class="dialog-action" type="submit">
          Experimentar pedido <ArrowUpRight size={18} />
        </button>
      </form>
    {/if}
  </dialog>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  .references {
    --bg: #0c0c0e;
    --surface: #17171a;
    --text: #f5f5f1;
    --muted: #96969d;
    --line: #ffffff24;
    --red: #e30613;
    min-height: 100vh;
    overflow: clip;
    background: var(--bg);
    color: var(--text);
    font:
      400 14px/1.65 'Inter',
      sans-serif;
    color-scheme: dark;
  }
  .reference-ending {
    --orbit-frame: min(96%, calc(100% - 48px));
    --orbit-frame-max: 1720px;
    font-family: 'Orbit Inter', 'Inter', Arial, sans-serif;
  }
  .references * {
    box-sizing: border-box;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  header,
  .collection-intro,
  .reference-heading {
    width: 95%;
    max-width: 1640px;
    margin-inline: auto;
  }
  header {
    height: 94px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    border-bottom: 1px solid var(--line);
  }
  .logo {
    width: 150px;
    padding: 4px 7px;
    border-radius: 3px;
    background: white;
  }
  .logo img {
    width: 100%;
    height: auto;
    display: block;
  }
  .back {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: var(--muted);
    font-size: 12px;
  }
  .collection-intro {
    padding: clamp(64px, 9vw, 130px) 0 clamp(50px, 7vw, 96px);
    border-bottom: 1px solid var(--line);
  }
  .collection-intro > p,
  .reference-heading p,
  .reference-heading small {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .collection-intro > div {
    margin-top: 30px;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.7fr);
    align-items: end;
    gap: 8vw;
  }
  h1,
  h2,
  p {
    margin-top: 0;
  }
  h1 {
    margin-bottom: 0;
    font-size: clamp(54px, 7vw, 112px);
    font-weight: 500;
    letter-spacing: -0.065em;
    line-height: 1;
  }
  .collection-intro > div > p {
    max-width: 42ch;
    margin-bottom: 8px;
    color: var(--muted);
  }
  .reference-item {
    padding: clamp(70px, 9vw, 130px) 0;
  }
  .archive-lead-space {
    width: 95%;
    max-width: 1640px;
    min-height: max(72svh, 620px);
    margin-inline: auto;
    display: flex;
    align-items: end;
    justify-content: center;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
  }
  .archive-lead-space span {
    padding-bottom: 28px;
    font-size: 9px;
    letter-spacing: 0.14em;
  }
  .reference-motion {
    --bg: #0c0c0e;
    --surface: #17171a;
    --text: #f5f5f1;
    --muted: #96969d;
    --line: #ffffff24;
    --red: #e30613;
  }
  .reference-heading {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: end;
    gap: 24px;
    padding-bottom: 28px;
  }
  .reference-heading > span {
    color: var(--red);
    font-size: 42px;
    line-height: 1;
    letter-spacing: -0.06em;
  }
  .reference-heading h2 {
    margin: 4px 0 0;
    font-size: clamp(29px, 3vw, 48px);
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 1.1;
  }
  dialog {
    width: min(520px, calc(100% - 32px));
    padding: 52px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
  }
  dialog::backdrop {
    background: #000c;
    backdrop-filter: blur(8px);
  }
  .dialog-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: transparent;
    color: var(--text);
    cursor: pointer;
  }
  .dialog-kicker {
    color: var(--red);
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  dialog h2 {
    margin: 18px 0;
    font-size: 43px;
    font-weight: 500;
    letter-spacing: -0.055em;
    line-height: 1.05;
  }
  dialog > p:not(.dialog-kicker) {
    color: var(--muted);
  }
  form,
  label {
    display: flex;
    flex-direction: column;
  }
  form {
    gap: 16px;
    margin-top: 24px;
  }
  label {
    gap: 7px;
    color: var(--muted);
    font-size: 12px;
  }
  input,
  textarea {
    min-height: 46px;
    padding: 11px 12px;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: transparent;
    color: var(--text);
    font: inherit;
  }
  textarea {
    resize: vertical;
  }
  .dialog-action {
    min-height: 46px;
    margin-top: 20px;
    padding: 12px 20px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border: 0;
    border-radius: 50px;
    background: var(--red);
    color: white;
    font: inherit;
    cursor: pointer;
  }
  form .dialog-action {
    width: 100%;
    margin-top: 4px;
  }
  @media (max-width: 700px) {
    .reference-ending { --orbit-frame: 90%; }
    header,
    .collection-intro,
    .reference-heading,
    .archive-lead-space {
      width: 90%;
    }
    header {
      height: 82px;
    }
    .logo {
      width: 135px;
    }
    .back {
      font-size: 0;
    }
    .back :global(svg) {
      width: 20px;
      height: 20px;
    }
    .collection-intro {
      padding-block: 60px;
    }
    .collection-intro > div {
      display: block;
    }
    h1 {
      font-size: clamp(48px, 13vw, 68px);
    }
    .collection-intro > div > p {
      margin-top: 28px;
    }
    .reference-heading {
      grid-template-columns: auto 1fr;
      align-items: start;
    }
    .reference-heading > span {
      font-size: 34px;
    }
    .reference-heading small {
      grid-column: 2;
    }
    .archive-lead-space {
      min-height: max(78svh, 620px);
    }
    dialog {
      padding: 48px 24px 28px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .references * {
      animation: none !important;
      scroll-behavior: auto !important;
      transition: none !important;
    }
  }
</style>
