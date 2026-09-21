<script lang="ts">
  import { standTrust } from './standTrust';
</script>

<section class="orbit-trust" aria-labelledby="trust-heading">
  <h2 id="trust-heading">Cuidamos de tudo.</h2>
  <div class="trust-services">
    {#each standTrust.services as service}
      <article>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </article>
    {/each}
  </div>
</section>

<style>
  .orbit-trust {
    width: var(--orbit-frame, 90%);
    max-width: var(--orbit-frame-max, 1720px);
    margin: 0 auto;
    padding-block: var(--orbit-space-section, 86px);
  }
  h2 {
    margin: 0 0 var(--orbit-space-heading, 36px);
    font-size: var(--orbit-title-section, 48px);
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.05em;
  }
  .trust-services {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  article {
    position: relative;
    padding: clamp(28px, 3vw, 48px);
    border: 1px solid var(--line);
    border-radius: 2px;
    background: var(--orbit-panel-bg, color-mix(in srgb, var(--text) 2%, transparent));
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
  @media (hover: hover) {
    article:hover {
      border-color: color-mix(in srgb, var(--text) 28%, transparent);
      background: color-mix(in srgb, var(--text) 3.5%, transparent);
    }
    article:hover::before {
      width: calc(100% - 56px);
      opacity: 0.9;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    article {
      transition:
        border-color 260ms ease,
        background 260ms ease;
    }
    article::before {
      transition:
        width 360ms cubic-bezier(0.2, 0.65, 0.3, 1),
        opacity 240ms ease;
    }
  }
  h3 {
    margin: 0;
    font-size: clamp(24px, 2.2vw, 34px);
    font-weight: 500;
    letter-spacing: -0.04em;
  }
  p {
    margin: 18px 0 0;
    max-width: 28ch;
    font-size: var(--orbit-type-body, 15px);
    line-height: 1.75;
    color: var(--muted);
  }
  @media (max-width: 700px) {
    .trust-services {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    article {
      padding: 28px;
    }
    p {
      margin-top: 12px;
    }
  }
</style>
