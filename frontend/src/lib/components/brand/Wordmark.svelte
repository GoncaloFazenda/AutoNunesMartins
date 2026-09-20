<script lang="ts">
  let {
    size = 'md',
    showCaption = false,
    surface = 'auto',
  }: {
    size?: 'sm' | 'md' | 'lg';
    showCaption?: boolean;
    surface?: 'auto' | 'dark' | 'light';
  } = $props();
</script>

<div class="wordmark" data-size={size} data-surface={surface}>
  <img
    class="light-logo"
    src="/logo-transparent.png"
    alt="Auto Nunes Martins"
    width="1881"
    height="836"
  />
  <img
    class="dark-logo"
    src="/logo-transparent-white-v3.png"
    alt="Auto Nunes Martins"
    width="1881"
    height="836"
  />
  {#if showCaption}<span>Comércio de Automóveis</span>{/if}
</div>

<style>
  .wordmark {
    width: 190px;
    max-width: 100%;
  }
  .wordmark[data-size='sm'] {
    width: 146px;
  }
  .wordmark[data-size='lg'] {
    width: 240px;
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .dark-logo {
    display: none;
  }
  .wordmark[data-surface='dark'] .light-logo,
  :global(html[data-theme='dark']) .wordmark[data-surface='auto'] .light-logo {
    display: none;
  }
  .wordmark[data-surface='dark'] .dark-logo,
  :global(html[data-theme='dark']) .wordmark[data-surface='auto'] .dark-logo {
    display: block;
  }
  span {
    display: block;
    font-size: 9px;
    letter-spacing: 0.15em;
    margin-top: 6px;
    color: var(--color-text-muted);
  }
</style>
