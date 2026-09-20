<script lang="ts">
  import { SignIn, ClerkLoading } from 'svelte-clerk';
  import { dark } from '@clerk/themes';
  import { theme } from '$lib/stores/theme';
  import Wordmark from '$lib/components/brand/Wordmark.svelte';
  import CrmBrandHead from '$lib/components/brand/CrmBrandHead.svelte';
  import ThemeToggle from '$lib/components/brand/ThemeToggle.svelte';
  import { cars, photo } from '$lib/components/stand-concepts/data';

  // Keep Clerk's authentication, validation, loading and recovery flows unchanged.
  const clerkAppearance = $derived({
    baseTheme: $theme === 'dark' ? dark : undefined,
    variables: {
      colorPrimary: '#E30613',
      colorBackground: 'transparent',
      colorText: $theme === 'dark' ? '#F4F4F2' : '#16161A',
      colorInputBackground: $theme === 'dark' ? '#171719' : '#FFFFFF',
      colorInputText: $theme === 'dark' ? '#F4F4F2' : '#16161A',
      colorTextSecondary: $theme === 'dark' ? '#A8A8A4' : '#5A5C61',
      colorTextOnPrimaryBackground: '#FFFFFF',
      colorNeutral: $theme === 'dark' ? '#FFFFFF' : '#16161A',
      colorDanger: '#E30613',
      borderRadius: '6px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyButtons: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
    },
    elements: {
      rootBox: 'login-auth-root',
      card: 'login-auth-card',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      socialButtonsBlockButton: 'login-social-button',
      socialButtonsBlockButtonText: 'login-social-text',
      dividerLine: 'login-divider',
      dividerText: 'login-secondary',
      formFieldLabel: 'login-field-label',
      formFieldInput: 'login-field-input',
      formButtonPrimary: 'login-primary-button',
      footerActionLink: 'login-auth-link',
      identityPreviewText: 'login-identity',
      formFieldAction: 'login-auth-link',
    },
  });
</script>

<CrmBrandHead />
<svelte:head
  ><title>Acesso ao CRM — Auto Nunes Martins</title><meta
    name="robots"
    content="noindex, nofollow"
  /><meta name="description" content="Acesso ao painel interno Auto Nunes Martins." /></svelte:head
>

<main class="login-page">
  <header class="login-header">
    <Wordmark size="md" />
    <div class="header-tools"><span>PAINEL INTERNO</span><ThemeToggle size={42} /></div>
  </header>
  <div class="login-grid">
    <aside class="login-art" aria-label="Auto Nunes Martins">
      <img
        src={photo(cars[0]!.image, 1600)}
        alt="Porsche — fotografia ilustrativa usada no Stand Orbit"
        width="1600"
        height="1100"
        fetchpriority="high"
      />
      <div class="art-shade" aria-hidden="true"></div>
      <div class="art-copy">
        <p>AUTO NUNES MARTINS</p>
        <h2>Cada viatura tem<br />a sua história<span>.</span></h2>
        <span class="art-note">Comércio de automóveis</span>
      </div>
    </aside>
    <section class="login-form-side" aria-labelledby="login-heading">
      <div class="form-content">
        <p class="eyebrow"><span></span> DE VOLTA AO STAND</p>
        <h1 id="login-heading">O seu dia<br />começa aqui<span>.</span></h1>
        <p class="intro">
          Inicie sessão para gerir as viaturas,<br class="desktop-break" /> os clientes e as tarefas do
          dia.
        </p>
        <div class="auth-container">
          <ClerkLoading><p class="intro" role="status">A carregar o acesso seguro…</p></ClerkLoading
          ><SignIn
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>
        <footer>
          <span>© {new Date().getFullYear()} Auto Nunes Martins</span><span>Acesso interno</span>
        </footer>
      </div>
    </section>
  </div>
</main>

<style>
  .login-page :global(.cl-footer) {
    background: transparent !important;
    border-top: 1px solid var(--color-border);
  }
  .login-page :global(.cl-footerActionText),
  .login-page :global(.cl-footerItem),
  .login-page :global(.cl-footerItem p) {
    color: var(--color-text-muted) !important;
  }
  .login-page {
    min-height: 100svh;
    background: var(--color-bg-0);
    color: var(--color-text);
    font-family: Inter, system-ui, sans-serif;
    padding: 0 clamp(20px, 3vw, 48px) 24px;
  }
  .login-header {
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    max-width: 1600px;
    margin: auto;
  }
  .header-tools {
    display: flex;
    align-items: center;
    gap: 28px;
  }
  .header-tools > span {
    font-size: 9px;
    letter-spacing: 0.17em;
    color: var(--color-text-muted);
  }
  .login-grid {
    display: grid;
    grid-template-columns: 1.06fr 1fr;
    max-width: 1600px;
    margin: auto;
    min-height: calc(100svh - 136px);
  }
  .login-art {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    background: #171719;
    min-height: 600px;
  }
  .login-art > img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 52% center;
  }
  .art-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 38%, #09090b33 57%, #09090bea 100%);
  }
  .art-copy {
    position: absolute;
    bottom: clamp(30px, 4vw, 60px);
    left: clamp(28px, 4vw, 60px);
    right: 24px;
    color: #f5f5f1;
  }
  .art-copy > p {
    font-size: 9px;
    letter-spacing: 0.16em;
    margin: 0 0 20px;
    color: #ffffffc4;
  }
  .art-copy h2 {
    font-size: clamp(31px, 3.2vw, 51px);
    letter-spacing: -0.05em;
    line-height: 1.1;
    font-weight: 450;
    margin: 0 0 20px;
  }
  .art-copy h2 > span {
    color: #e30613;
  }
  .art-note {
    font-size: 12px;
    color: #ffffffb8;
  }
  .login-form-side {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px clamp(28px, 5vw, 80px);
  }
  .form-content {
    width: 100%;
    max-width: 390px;
  }
  .eyebrow {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: var(--color-text-muted);
    margin: 0 0 24px;
  }
  .eyebrow > span {
    width: 22px;
    height: 1px;
    background: #e30613;
  }
  h1 {
    font-size: clamp(38px, 3.4vw, 52px);
    font-weight: 450;
    letter-spacing: -0.055em;
    line-height: 1.07;
    margin: 0 0 18px;
  }
  h1 > span {
    color: #e30613;
  }
  .intro {
    font-size: 13px;
    line-height: 1.85;
    color: var(--color-text-muted);
    margin: 0 0 32px;
  }
  .auth-container {
    min-height: 315px;
    width: 100%;
  }
  footer {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid var(--color-border);
    padding-top: 20px;
    margin-top: 32px;
    font-size: 9px;
    color: var(--color-text-muted);
  }
  .login-page :global(.login-auth-root) {
    width: 100%;
  }
  .login-page :global(.login-auth-card) {
    width: 100%;
    max-width: 100%;
    background: transparent;
    box-shadow: none;
    border: 0;
    padding: 0;
  }
  .login-page :global(.cl-cardBox) {
    width: 100%;
    max-width: 100%;
    box-shadow: none;
    border: 0;
    background: transparent;
  }
  .login-page :global(.login-social-button) {
    min-height: 46px;
    border: 1px solid var(--color-border);
    box-shadow: none;
    transition: background-color 0.15s;
  }
  .login-page :global(.login-social-text) {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
  }
  .login-page :global(.login-divider) {
    background: var(--color-border);
  }
  .login-page :global(.login-secondary) {
    color: var(--color-text-muted);
    font-size: 11px;
  }
  .login-page :global(.login-field-label) {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    margin-bottom: 7px;
    color: var(--color-text);
  }
  .login-page :global(.login-field-input) {
    min-height: 46px;
    border: 1px solid var(--color-border);
    box-shadow: none;
    transition: border-color 0.15s;
  }
  .login-page :global(.login-field-input:focus) {
    border-color: var(--color-text-muted);
    outline: 2px solid var(--color-red);
    outline-offset: 2px;
  }
  .login-page :global(.login-primary-button) {
    min-height: 46px;
    background: #e30613;
    color: white;
    box-shadow: none;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    transition: opacity 0.15s;
  }
  .login-page :global(.login-primary-button:hover) {
    opacity: 0.88;
  }
  .login-page :global(.login-auth-link) {
    color: var(--color-red);
    font-size: 12px;
  }
  .login-page :global(.login-identity) {
    color: var(--color-text);
  }
  .login-page :global(button:focus-visible),
  .login-page :global(a:focus-visible) {
    outline: 2px solid var(--color-red);
    outline-offset: 3px;
  }
  .login-page :global(.cl-formFieldErrorText) {
    font-size: 12px;
    line-height: 1.5;
  }
  .login-page :global(.cl-alert) {
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }
  @media (max-width: 1000px) {
    .login-form-side {
      padding-inline: 32px;
    }
    .login-art {
      min-height: 580px;
    }
    .art-copy h2 {
      font-size: 34px;
    }
  }
  @media (max-width: 760px) {
    .login-page {
      padding: 0 22px 24px;
    }
    .login-header {
      height: 98px;
    }
    .login-header :global(.wordmark) {
      width: 160px;
    }
    .header-tools {
      gap: 0;
    }
    .header-tools > span {
      display: none;
    }
    .login-grid {
      grid-template-columns: 1fr;
      min-height: 0;
      gap: 32px;
      max-width: 460px;
    }
    .login-art {
      height: 170px;
      min-height: 0;
    }
    .login-art > img {
      object-position: 50% 56%;
    }
    .art-copy {
      display: none;
    }
    .art-shade {
      background: linear-gradient(180deg, transparent, #09090b33);
    }
    .login-form-side {
      padding: 0 5px 12px;
    }
    .form-content {
      max-width: none;
    }
    .eyebrow {
      margin-bottom: 17px;
    }
    h1 {
      font-size: 38px;
    }
    .intro {
      margin-bottom: 25px;
    }
    .desktop-break {
      display: none;
    }
    .auth-container {
      min-height: 300px;
    }
    footer {
      margin-top: 24px;
      line-height: 1.6;
    }
  }
  @media (max-width: 360px) {
    .login-page {
      padding-inline: 18px;
    }
    .login-art {
      height: 140px;
    }
    .login-form-side {
      padding-inline: 0;
    }
    h1 {
      font-size: 35px;
    }
    .login-header :global(.wordmark) {
      width: 145px;
    }
    footer {
      font-size: 8px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .login-page :global(*) {
      transition: none !important;
    }
  }
</style>
