<script lang="ts">
  import { page } from '$app/stores';
  import { AlertOctagon, Home } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Wordmark from '$lib/components/brand/Wordmark.svelte';

  const status = $derived($page.status);
  const message = $derived($page.error?.message ?? 'Ocorreu um erro inesperado.');

  function title(): { eyebrow: string; head: string; accent?: string } {
    if (status === 404) return { eyebrow: '404 · Não encontrado', head: 'Página', accent: ' perdida' };
    if (status === 403) return { eyebrow: '403 · Sem acesso', head: 'Acesso', accent: ' negado' };
    if (status === 401) return { eyebrow: '401 · Sessão', head: 'Sessão', accent: ' expirada' };
    return { eyebrow: `${status} · Erro do servidor`, head: 'Algo', accent: ' correu mal' };
  }
  const t = $derived(title());
</script>

<svelte:head>
  <title>{status} · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-12 pb-12 max-w-2xl">
  <div class="mb-8"><Wordmark size="md" /></div>
  <div class="mb-8">
    <div class="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-red)]">
      ● {t.eyebrow}
    </div>
    <ItalicHero text={t.head} accent={t.accent ?? ''} size="lg" />
  </div>

  <Panel>
    <div class="p-6 flex items-start gap-4">
      <AlertOctagon class="h-6 w-6 text-[var(--color-red)] flex-shrink-0 mt-0.5" />
      <div class="h-6 w-[1.5px] bg-[var(--color-red)] flex-shrink-0 mt-0.5"></div>
      <div class="flex-1">
        <p class="text-[14px] leading-relaxed text-[var(--color-text)] mb-2">
          {message}
        </p>
        <p class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
          URL: <code class="text-[var(--color-text-muted)] normal-case">{$page.url.pathname}</code>
        </p>
      </div>
    </div>
    <div
      class="border-t border-[var(--color-border)] px-6 py-4 flex items-center justify-end gap-2"
    >
      <Button variant="outline" href="/dashboard">
        <Home class="h-4 w-4" />
        Voltar ao Dashboard
      </Button>
    </div>
  </Panel>
</section>
