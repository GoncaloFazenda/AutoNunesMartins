<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    Activity,
    Car,
    Check,
    Clock,
    FileEdit,
    ListChecks,
    PackageMinus,
    PackagePlus,
    Receipt,
    User as UserIcon,
    Wallet,
  } from 'lucide-svelte';
  import BrandBell from '$lib/components/brand/icons/BrandBell.svelte';
  import type { IconComponent } from '$lib/types/ui';
  import type { NotificationsPayload } from '$lib/server/notifications';

  // Same map as RecentActivityFeed — keep them in sync so the popover and
  // dashboard look consistent.
  const STYLE_FOR_TYPE: Record<string, { icon: IconComponent; color: string }> = {
    VEHICLE_ADDED:          { icon: PackagePlus,  color: 'var(--color-success)' },
    VEHICLE_UPDATED:        { icon: FileEdit,     color: 'var(--color-text-muted)' },
    VEHICLE_STATUS_CHANGED: { icon: Car,          color: 'var(--color-warning)' },
    VEHICLE_DELETED:        { icon: PackageMinus, color: 'var(--color-red)' },
    SALE_CREATED:           { icon: Receipt,      color: '#e6b800' },
    SALE_UPDATED:           { icon: Receipt,      color: 'var(--color-info)' },
    CUSTOMER_ADDED:         { icon: UserIcon,     color: 'var(--color-success)' },
    CUSTOMER_UPDATED:       { icon: UserIcon,     color: 'var(--color-text-muted)' },
    TASK_CREATED:           { icon: FileEdit,     color: 'var(--color-info)' },
    TASK_STATUS_CHANGED:    { icon: FileEdit,     color: 'var(--color-warning)' },
    TASK_COMPLETED:         { icon: Check,        color: 'var(--color-success)' },
    EXPENSE_ADDED:          { icon: Wallet,       color: 'var(--color-warning)' },
    EXPENSE_UPDATED:        { icon: Wallet,       color: 'var(--color-text-muted)' },
  };
  function styleForType(type: string): { icon: IconComponent; color: string } {
    return STYLE_FOR_TYPE[type] ?? { icon: Activity, color: 'var(--color-text-muted)' };
  }

  let isOpen = $state(false);
  let data = $state<NotificationsPayload | null>(null);
  let loading = $state(false);
  let panelEl = $state<HTMLDivElement | null>(null);
  let buttonEl = $state<HTMLButtonElement | null>(null);

  async function load() {
    loading = true;
    try {
      const res = await fetch('/api/notifications', { headers: { accept: 'application/json' } });
      if (res.ok) data = (await res.json()) as NotificationsPayload;
    } finally {
      loading = false;
    }
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen && !data) void load();
  }

  function close() {
    isOpen = false;
  }

  function onDocClick(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    if (panelEl?.contains(target) || buttonEl?.contains(target)) return;
    close();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function relTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'agora';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.floor(hr / 24);
    return `${day}d`;
  }

  function hrefFor(entityType: string, entityId: string): string | null {
    switch (entityType) {
      case 'vehicle':
        return `/viaturas/${entityId}`;
      case 'sale':
        return `/sales/${entityId}`;
      case 'customer':
        return `/clientes/${entityId}`;
      case 'task':
        return `/tarefas/${entityId}/editar`;
      default:
        return null;
    }
  }

  function goAndClose(href: string) {
    close();
    void goto(href);
  }

  onMount(() => {
    // Eagerly load so the badge count is correct on first paint
    void load();
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
  });

  const badge = $derived(data?.total ?? 0);
</script>

<div class="relative">
  <button
    bind:this={buttonEl}
    type="button"
    onclick={toggle}
    class="relative inline-flex items-center justify-center h-[38px] w-[38px] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
    style="border-radius: var(--radius-btn);"
    aria-label="Notificações"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <BrandBell class="h-4 w-4" />
    {#if badge > 0}
      <span
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--color-red)] text-white font-mono text-[10px] font-semibold tabular-nums"
        style="border-radius: 9px; border: 2px solid var(--color-bg-0);"
      >
        {badge > 99 ? '99+' : badge}
      </span>
    {/if}
  </button>

  {#if isOpen}
    <!--
      Mobile (< md): the dropdown becomes a `position: fixed` sheet anchored
      below the topbar with 8px side margins — the 360px desktop popover
      anchored to the bell's right edge would otherwise extend off-screen
      on a narrow viewport.

      Desktop (md+): original behaviour — `position: absolute` relative to
      the bell wrapper, 360px wide, anchored to the bell's right edge.
    -->
    <div
      bind:this={panelEl}
      class="fixed left-2 right-2 top-[64px] w-auto max-h-[calc(100vh-80px)] overflow-y-auto md:absolute md:left-auto md:right-0 md:top-[calc(100%+8px)] md:w-[360px] md:max-h-none md:overflow-y-visible border border-[var(--color-border)] shadow-xl z-50 panel-surface"
      style="border-radius: var(--radius-card);"
      role="dialog"
      aria-label="Notificações"
    >
      <header
        class="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]"
      >
        <div class="flex items-center gap-2.5">
          <BrandBell class="h-[18px] w-[18px] text-[var(--color-text)]" />
          <div class="h-[18px] w-[1.5px] bg-[var(--color-red)]"></div>
          <h3
            class="font-display text-[18px] font-bold italic uppercase tracking-[-0.01em] leading-none text-[var(--color-text)]"
          >
            Notificações
          </h3>
        </div>
        {#if badge > 0}
          <span
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-red)] font-semibold"
          >
            {badge} ativa{badge === 1 ? '' : 's'}
          </span>
        {/if}
      </header>

      {#if loading && !data}
        <div
          class="p-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          A carregar…
        </div>
      {:else if !data}
        <div
          class="p-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Sem dados
        </div>
      {:else}
        <!-- Alerts section -->
        <section class="p-3 border-b border-[var(--color-border)] space-y-1">
          {#if badge === 0}
            <div
              class="px-2 py-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
            >
              Sem alertas
            </div>
          {/if}
          {#if data.alerts.stockAged > 0}
            <button
              type="button"
              onclick={() => goAndClose('/viaturas?status=AVAILABLE')}
              class="w-full flex items-center gap-2.5 px-2 py-2 text-left hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            >
              <Car class="h-4 w-4 text-[var(--color-red)] flex-shrink-0" />
              <div class="h-4 w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
              <span class="text-[12.5px] text-[var(--color-text)] flex-1">
                {data.alerts.stockAged} viatura{data.alerts.stockAged === 1 ? '' : 's'} em stock +60 dias
              </span>
            </button>
          {/if}
          {#if data.alerts.tasksDueOrOverdue > 0}
            <button
              type="button"
              onclick={() => goAndClose('/tarefas')}
              class="w-full flex items-center gap-2.5 px-2 py-2 text-left hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            >
              <ListChecks class="h-4 w-4 text-[var(--color-red)] flex-shrink-0" />
              <div class="h-4 w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
              <span class="text-[12.5px] text-[var(--color-text)] flex-1">
                {data.alerts.tasksDueOrOverdue} tarefa{data.alerts.tasksDueOrOverdue === 1
                  ? ''
                  : 's'} para hoje / em atraso
              </span>
            </button>
          {/if}
          {#if data.alerts.remindersToday > 0}
            <button
              type="button"
              onclick={() => goAndClose('/tarefas')}
              class="w-full flex items-center gap-2.5 px-2 py-2 text-left hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors"
              style="border-radius: var(--radius-btn);"
            >
              <Clock class="h-4 w-4 text-[var(--color-red)] flex-shrink-0" />
              <div class="h-4 w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
              <span class="text-[12.5px] text-[var(--color-text)] flex-1">
                {data.alerts.remindersToday} lembrete{data.alerts.remindersToday === 1 ? '' : 's'}
                para hoje
              </span>
            </button>
          {/if}
        </section>

        <!-- Recent activity section -->
        <section>
          <div
            class="px-4 pt-3 pb-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Atividade recente
          </div>
          {#if data.recent.length === 0}
            <div
              class="px-4 pb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
            >
              Sem eventos recentes
            </div>
          {:else}
            <ul class="divide-y divide-[var(--color-border)]">
              {#each data.recent as item (item.id)}
                {@const href = hrefFor(item.entityType, item.entityId)}
                {@const s = styleForType(item.type)}
                {@const Icon = s.icon}
                <li>
                  {#if href}
                    <button
                      type="button"
                      onclick={() => goAndClose(href)}
                      class="w-full flex items-start gap-2.5 px-4 py-2 text-left hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors"
                    >
                      <Icon
                        class="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                        style="color: {s.color};"
                      />
                      <span
                        class="font-mono text-[10px] tabular-nums text-[var(--color-text-faint)] w-9 flex-shrink-0 pt-0.5"
                      >
                        {relTime(item.createdAt)}
                      </span>
                      <span
                        class="text-[12.5px] text-[var(--color-text-muted)] flex-1 leading-snug"
                      >
                        {item.message}
                      </span>
                    </button>
                  {:else}
                    <div class="flex items-start gap-2.5 px-4 py-2">
                      <Icon
                        class="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                        style="color: {s.color};"
                      />
                      <span
                        class="font-mono text-[10px] tabular-nums text-[var(--color-text-faint)] w-9 flex-shrink-0 pt-0.5"
                      >
                        {relTime(item.createdAt)}
                      </span>
                      <span class="text-[12.5px] text-[var(--color-text-muted)] flex-1 leading-snug">
                        {item.message}
                      </span>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <footer class="border-t border-[var(--color-border)] p-3">
          <button
            type="button"
            onclick={() => goAndClose('/dashboard')}
            class="w-full inline-flex items-center justify-center gap-2 h-9 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
            style="border-radius: var(--radius-btn);"
          >
            Ver dashboard completo →
          </button>
        </footer>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global([data-theme='dark']) .panel-surface,
  :global(html:not([data-theme='light'])) .panel-surface {
    background: linear-gradient(180deg, #131316 0%, #101012 100%);
  }
  :global([data-theme='light']) .panel-surface {
    background: var(--color-bg-1);
  }
</style>
