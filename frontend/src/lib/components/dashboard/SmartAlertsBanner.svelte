<script lang="ts">
  import { AlertTriangle, Car, Clock, ListChecks } from 'lucide-svelte';
  import type { SmartAlerts } from '$lib/server/dashboard';

  interface Props {
    alerts: SmartAlerts;
  }

  let { alerts }: Props = $props();

  const items = $derived(
    [
      alerts.stockAged > 0 && {
        icon: Car,
        label: `${alerts.stockAged} viatura${alerts.stockAged === 1 ? '' : 's'} em stock há mais de 60 dias`,
        href: '/viaturas?status=AVAILABLE',
      },
      alerts.tasksDueOrOverdue > 0 && {
        icon: ListChecks,
        label: `${alerts.tasksDueOrOverdue} tarefa${alerts.tasksDueOrOverdue === 1 ? '' : 's'} para hoje ou em atraso`,
        href: '/tarefas',
      },
      alerts.remindersToday > 0 && {
        icon: Clock,
        label: `${alerts.remindersToday} lembrete${alerts.remindersToday === 1 ? '' : 's'} para hoje`,
        href: '/tarefas',
      },
    ].filter((x): x is { icon: typeof Car; label: string; href: string } => Boolean(x)),
  );

  const hasAny = $derived(items.length > 0);
</script>

{#if hasAny}
  <section class="grid grid-cols-1 md:grid-cols-3 gap-3">
    {#each items as item, i (i)}
      <a
        href={item.href}
        class="group flex items-center gap-3 px-4 py-3 border bg-[color-mix(in_oklab,var(--color-red)_6%,var(--color-bg-1))] border-[color-mix(in_oklab,var(--color-red)_30%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-red)_12%,var(--color-bg-1))] transition-colors"
        style="border-radius: var(--radius-card);"
      >
        <item.icon class="h-5 w-5 text-[var(--color-red)] flex-shrink-0" />
        <div class="h-5 w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
        <span class="text-[13px] text-[var(--color-text)] flex-1">{item.label}</span>
        <AlertTriangle
          class="h-3.5 w-3.5 text-[var(--color-red)] opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
      </a>
    {/each}
  </section>
{/if}
