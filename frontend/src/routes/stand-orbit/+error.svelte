<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head
  ><title
    >{$page.status === 404 ? 'Viatura não disponível' : 'Temporariamente indisponível'} — Auto Nunes Martins</title
  ><meta name="robots" content="noindex, follow" /></svelte:head
>
<main>
  <a href="/stand-orbit"
    ><img
      src="/logo-transparent-white-v3.png"
      alt="Auto Nunes Martins — início"
      width="1881"
      height="836"
    /></a
  >
  <p>UM DESVIO DE PERCURSO · {$page.status}</p>
  <h1>
    {$page.status === 404
      ? 'Esta viatura não está publicada.'
      : 'Não foi possível abrir esta página.'}
  </h1>
  <p>
    {$page.status === 404
      ? 'Consulte a seleção atual de viaturas aprovadas para o website.'
      : 'Tente novamente mais tarde.'}
  </p>
  <a class="back" href="/stand-orbit/viaturas">Voltar às viaturas ↗</a>
</main>

<style>
  main {
    min-height: 100svh;
    background: #0c0c0e;
    color: #f5f5f1;
    padding: clamp(30px, 8vw, 110px);
    font-family: Inter, sans-serif;
  }
  img {
    width: 180px;
    height: auto;
    margin-bottom: 70px;
  }
  p {
    color: #aaaab2;
    line-height: 1.8;
    font-size: 13px;
  }
  h1 {
    max-width: 16ch;
    font-size: clamp(35px, 5vw, 65px);
    line-height: 1.1;
    letter-spacing: -0.04em;
    font-weight: 500;
    margin: 22px 0;
  }
  .back {
    display: inline-block;
    margin-top: 32px;
    color: inherit;
    border-bottom: 1px solid #e30613;
    padding-block: 12px;
    text-decoration: none;
  }
  a:focus-visible {
    outline: 2px solid #e30613;
    outline-offset: 5px;
  }
</style>
