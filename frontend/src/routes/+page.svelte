<script lang="ts">
  import { SignIn } from 'svelte-clerk';
  import { dark } from '@clerk/themes';
  import { theme } from '$lib/stores/theme';
  import Wordmark from '$lib/components/brand/Wordmark.svelte';
  import ThemeToggle from '$lib/components/brand/ThemeToggle.svelte';
  import CarSilhouette from '$lib/components/brand/CarSilhouette.svelte';

  // baseTheme: dark uses Clerk's official dark palette for all internal
  // surfaces (input bgs, hover states, dividers, secondary text, etc.) so
  // the widget reads cleanly on our dark canvas. We then layer brand
  // overrides on top via `variables` + `elements`.
  const clerkAppearance = $derived({
    baseTheme: $theme === 'dark' ? dark : undefined,
    variables: {
      colorPrimary: '#E30613',
      colorBackground: 'transparent',
      colorText: $theme === 'dark' ? '#F4F4F2' : '#16161A',
      colorInputBackground: $theme === 'dark' ? '#1B1C20' : '#FFFFFF',
      colorInputText: $theme === 'dark' ? '#F4F4F2' : '#16161A',
      colorTextSecondary: $theme === 'dark' ? '#A8A8A4' : '#5A5C61',
      colorTextOnPrimaryBackground: '#FFFFFF',
      colorNeutral: $theme === 'dark' ? '#FFFFFF' : '#16161A',
      colorDanger: '#E30613',
      colorSuccess: '#34C480',
      colorWarning: '#E0A040',
      borderRadius: '4.4px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyButtons: 'Barlow, system-ui, sans-serif',
      fontSize: '14px',
    },
    elements: {
      rootBox: 'w-full',
      card: 'bg-transparent shadow-none border-0 p-0',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      socialButtonsBlockButton:
        'border border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors',
      socialButtonsBlockButtonText: 'font-mono uppercase tracking-[0.15em] text-[11px]',
      dividerLine: 'bg-[var(--color-border)]',
      dividerText:
        'font-mono uppercase tracking-[0.2em] text-[10px] text-[var(--color-text-faint)]',
      formFieldLabel:
        'font-mono uppercase tracking-[0.2em] text-[10px] text-[var(--color-text-muted)] mb-1.5',
      formFieldInput:
        'border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors',
      formButtonPrimary:
        '!bg-[var(--color-red)] hover:!bg-[var(--color-red-soft)] !font-display !font-black !italic !uppercase !tracking-tight !text-white !text-[14px] !py-3 !w-full transition-colors',
      footerActionLink: 'text-[var(--color-red)] hover:text-[var(--color-red-soft)]',
      identityPreviewText: 'text-[var(--color-text)]',
      formFieldAction:
        'text-[var(--color-red)] hover:text-[var(--color-red-soft)] font-mono text-[10px] uppercase tracking-[0.2em]',
    },
  });
</script>

<svelte:head>
  <title>Acesso · Painel · Auto Nunes Martins</title>
</svelte:head>

<main class="login-grid relative min-h-screen">
  <!-- LEFT: Brand art panel -->
  <aside class="login-art relative overflow-hidden">
    <!-- grid pattern overlay -->
    <div class="login-grid-overlay absolute inset-0" aria-hidden="true"></div>

    <!-- red diagonal wedge as panel divider -->
    <div class="login-wedge absolute inset-0" aria-hidden="true"></div>

    <!-- red radial glow -->
    <div class="login-glow absolute inset-0" aria-hidden="true"></div>

    <div class="relative z-10 flex h-full flex-col justify-between p-10 lg:p-14">
      <!-- top row: wordmark + PT plate -->
      <div class="flex items-start justify-between gap-6">
        <Wordmark size="md" />

        <div
          class="inline-flex items-center overflow-hidden border border-white/15"
          style="border-radius: var(--radius-btn);"
        >
          <span
            class="bg-[#003399] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            >PT</span
          >
          <span
            class="bg-white/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-white/90"
            >00-AN-00</span
          >
        </div>
      </div>

      <!-- eyebrow -->
      <div class="mt-6 flex items-center gap-2">
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
          Painel Interno
        </span>
      </div>

      <!-- car silhouette absolute behind quote -->
      <div class="login-car absolute pointer-events-none">
        <CarSilhouette />
      </div>

      <!-- bottom: quote + stats -->
      <div class="mt-auto flex flex-col gap-8 relative z-10">
        <div class="max-w-[460px]">
          <div
            class="mb-2 font-mono text-[9.5px] uppercase tracking-[0.3em] text-[var(--color-red)]"
          >
            ─── O Stand
          </div>
          <p
            class="font-display text-[36px] font-black italic uppercase leading-[0.95] tracking-[-0.025em] text-white"
          >
            Cada viatura tem<br />
            <span class="text-[var(--color-red)]">a sua história.</span>
          </p>
        </div>

        <div class="grid grid-cols-3 gap-0 max-w-[420px]">
          <div class="pr-4">
            <div class="font-display text-[26px] font-black italic text-white">+200</div>
            <div
              class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/60"
            >
              Viaturas
            </div>
          </div>
          <div class="border-x border-white/15 px-4">
            <div class="font-display text-[26px] font-black italic text-white">15</div>
            <div
              class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/60"
            >
              Anos
            </div>
          </div>
          <div class="pl-4">
            <div class="font-display text-[26px] font-black italic text-white">A++</div>
            <div
              class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/60"
            >
              Confiança
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- RIGHT: Form panel -->
  <section class="login-form-side relative">
    <!-- red glow top-right -->
    <div class="login-form-glow absolute inset-0" aria-hidden="true"></div>

    <!-- theme toggle top-right -->
    <div class="absolute top-6 right-6 z-20">
      <ThemeToggle size={38} />
    </div>

    <div class="relative z-10 flex min-h-screen items-center justify-center p-8">
      <div class="w-full max-w-[400px]">
        <!-- eyebrow -->
        <div class="mb-4 flex items-center gap-2">
          <span class="h-[1.5px] w-6 bg-[var(--color-red)]"></span>
          <span
            class="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)]"
          >
            Acesso · Painel Interno
          </span>
        </div>

        <!-- headline -->
        <h1
          class="mb-3 font-display text-[44px] font-black italic uppercase leading-[0.92] tracking-[-0.025em]"
        >
          Bom dia,<br />
          <span class="text-[var(--color-red)]">de volta ao stand.</span>
        </h1>

        <!-- subtitle -->
        <p class="mb-8 text-[15px] text-[var(--color-text-muted)]">
          Inicia sessão para gerir o inventário, clientes e tarefas do dia.
        </p>

        <!-- Clerk SignIn (styled via appearance API) -->
        <SignIn
          forceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          appearance={clerkAppearance}
        />

        <!-- footer -->
        <div
          class="mt-10 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]"
        >
          <span>© 2026 Auto Nunes Martins</span>
          <span class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"></span>
            2FA · Ativo
          </span>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .login-grid {
    display: grid;
    grid-template-columns: 1.08fr 1fr;
  }

  @media (max-width: 920px) {
    .login-grid {
      grid-template-columns: 1fr;
    }
    .login-art {
      display: none;
    }
  }

  .login-art {
    background: linear-gradient(135deg, #1a1a1d 0%, #0a0a0b 100%);
  }

  .login-grid-overlay {
    background-image:
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 60px),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 60px);
  }

  .login-wedge {
    background: linear-gradient(135deg, transparent 50%, #e30613 50%);
    clip-path: polygon(40% 0%, 100% 0%, 100% 100%, 55% 100%);
    opacity: 0.92;
  }

  .login-glow {
    background:
      radial-gradient(
        700px 500px at 30% 70%,
        color-mix(in oklab, #e30613 22%, transparent),
        transparent 65%
      );
    mix-blend-mode: screen;
  }

  .login-car {
    left: -4%;
    top: 34%;
    width: 88%;
    z-index: 1;
  }

  .login-form-side {
    background: var(--color-bg-0);
  }

  .login-form-glow {
    background:
      radial-gradient(
        500px 400px at 100% 0%,
        color-mix(in oklab, #e30613 10%, transparent),
        transparent 70%
      );
    pointer-events: none;
  }
</style>
