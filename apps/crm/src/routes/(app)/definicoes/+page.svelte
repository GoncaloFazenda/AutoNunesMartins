<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { Moon, Palette, Settings as SettingsIcon, Sun, User as UserIcon } from 'lucide-svelte';
  import { UserProfile } from 'svelte-clerk';
  import { dark } from '@clerk/themes';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { theme } from '$lib/stores/theme';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let savingKey = $state<string | null>(null);

  // baseTheme: dark switches Clerk's internal palette to dark when our app
  // is dark, so all surfaces in <UserProfile> (left nav, page cards, form
  // backgrounds, hover states, dividers) read clearly instead of clashing
  // with our dark canvas. Reactive on $theme so toggling the theme picks
  // up the new variant.
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
    },
    elements: {
      rootBox: 'w-full',
      card: 'bg-transparent shadow-none border-0',
      navbar: 'bg-transparent border-r border-[var(--color-border)]',
      pageScrollBox: 'bg-transparent',
    },
  });
</script>

<svelte:head>
  <title>Definições · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Definições" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      Preferências do painel + perfil do utilizador
    </p>
  </div>

  <!-- Aparência -->
  <Panel>
    <PanelHeader icon={Palette} title="Aparência" />
    <div class="p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div class="text-[14px] text-[var(--color-text)] mb-1">Tema</div>
        <div class="text-[12px] text-[var(--color-text-muted)]">
          Predefinido para escuro. A escolha fica guardada no navegador.
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onclick={() => theme.set('light')}
          class="inline-flex items-center gap-2 px-3 h-10 border font-mono text-[11px] uppercase tracking-[0.12em] transition-colors {$theme ===
          'light'
            ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
          style="border-radius: var(--radius-btn);"
        >
          <Sun class="h-3.5 w-3.5" />
          Claro
        </button>
        <button
          type="button"
          onclick={() => theme.set('dark')}
          class="inline-flex items-center gap-2 px-3 h-10 border font-mono text-[11px] uppercase tracking-[0.12em] transition-colors {$theme ===
          'dark'
            ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
          style="border-radius: var(--radius-btn);"
        >
          <Moon class="h-3.5 w-3.5" />
          Escuro
        </button>
      </div>
    </div>
  </Panel>

  <!-- Painel · Definições -->
  <Panel>
    <PanelHeader icon={SettingsIcon} title="Painel" />
    {#if data.error}
      <div class="p-4 text-[13px] text-[var(--color-red)]">{data.error}</div>
    {:else if data.settings.length === 0}
      <div
        class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
      >
        Sem definições editáveis
      </div>
    {:else}
      <ul class="divide-y divide-[var(--color-border)]">
        {#each data.settings as setting (setting.key)}
          {@const isSaving = savingKey === setting.key}
          <li class="p-5">
            <form
              method="POST"
              action="?/updateSetting"
              use:enhance={() => {
                savingKey = setting.key;
                return async ({ result }) => {
                  savingKey = null;
                  if (result.type === 'success') {
                    toast.success('Definição actualizada.');
                    await invalidateAll();
                  } else if (result.type === 'failure') {
                    toast.error(
                      (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                    );
                  }
                };
              }}
              class="flex items-end justify-between gap-4 flex-wrap"
            >
              <input type="hidden" name="key" value={setting.key} />
              <div class="min-w-0 flex-1">
                <label
                  class="block text-[14px] text-[var(--color-text)] mb-1"
                  for={`set-${setting.key}`}
                >
                  {setting.label}
                </label>
                <p class="text-[12px] text-[var(--color-text-muted)] max-w-prose">
                  {setting.description}
                </p>
                <div
                  class="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
                >
                  key: <code class="text-[var(--color-text-muted)]">{setting.key}</code>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  id={`set-${setting.key}`}
                  name="value"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  required
                  value={setting.value}
                  class="h-10 w-28 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] tabular-nums outline-none focus:border-[var(--color-red)]"
                  style="border-radius: var(--radius-btn);"
                />
                <Button variant="primary" size="sm" type="submit" loading={isSaving}>
                  Guardar
                </Button>
              </div>
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  </Panel>

  <!-- Perfil -->
  <Panel>
    <PanelHeader icon={UserIcon} title="Perfil" />
    <div class="p-5">
      <UserProfile appearance={clerkAppearance} />
    </div>
  </Panel>
</section>
