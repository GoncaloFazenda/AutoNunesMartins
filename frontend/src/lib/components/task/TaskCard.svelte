<script lang="ts">
  import { Calendar, CalendarClock, RotateCw, X } from 'lucide-svelte';
  import { formatDate } from '$lib/utils/format';
  import type { TaskDto } from '$lib/server/tasks';
  import type { Priority, Recurrence } from '@anm/types';

  interface Props {
    task: TaskDto;
    /**
     * Recurring task scheduled ahead of its dueDate. Renders dimmed with a
     * "Agendada · <date>" badge and (if `ondelete` provided) an X button to
     * cancel the upcoming occurrence without going through the edit page.
     */
    standby?: boolean;
    onclick?: () => void;
    ondelete?: () => void;
  }

  let { task, standby = false, onclick, ondelete }: Props = $props();

  const PRIORITY_LABELS: Record<Priority, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  const PRIORITY_COLOR: Record<Priority, string> = {
    LOW: 'var(--color-text-faint)',
    MEDIUM: 'var(--color-info)',
    HIGH: 'var(--color-warning)',
    URGENT: 'var(--color-red)',
  };

  const RECURRENCE_LABEL: Record<Recurrence, string> = {
    NONE: '',
    WEEKLY: 'SEMANAL',
    MONTHLY: 'MENSAL',
    ANNUAL: 'ANUAL',
  };

  const initials = $derived.by(() => {
    const name = task.assignee?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  const isOverdue = $derived.by(() => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date(new Date().toISOString().slice(0, 10));
  });
</script>

<article
  onclick={onclick}
  role="button"
  tabindex="0"
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' ? onclick?.() : null)}
  class="task-card group relative flex flex-col gap-2.5 p-3.5 border bg-[var(--color-bg-1)] hover:border-[color-mix(in_oklab,var(--color-red)_45%,transparent)] transition-colors {standby
    ? 'is-standby border-dashed border-[var(--color-border-strong)]'
    : 'border-[var(--color-border)]'}"
  style="border-radius: var(--radius-card);"
>
  {#if standby && ondelete}
    <button
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        ondelete?.();
      }}
      title="Cancelar próxima ocorrência"
      aria-label="Cancelar próxima ocorrência"
      class="cancel-btn absolute -top-2 -right-2 h-6 w-6 inline-flex items-center justify-center border border-[color-mix(in_oklab,var(--color-red)_50%,transparent)] bg-[var(--color-bg-1)] text-[var(--color-red)] hover:bg-[var(--color-red)] hover:text-white transition-colors"
      style="border-radius: 999px;"
    >
      <X class="h-3 w-3" />
    </button>
  {/if}
  <!-- Priority left rail -->
  <div
    class="absolute left-0 top-0 bottom-0 w-[3px]"
    style="background: {PRIORITY_COLOR[task.priority]};"
  ></div>

  <div class="flex items-start justify-between gap-2">
    <h4 class="font-display font-semibold italic text-[14.5px] leading-tight tracking-[-0.005em] text-[var(--color-text)] flex-1">
      {task.title}
    </h4>
    {#if task.recurrence !== 'NONE'}
      <span
        class="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[color-mix(in_oklab,var(--color-red)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-red)_8%,transparent)] text-[var(--color-red)] font-mono text-[9px] uppercase tracking-[0.12em]"
        style="border-radius: 3px;"
        title={`Recorrência: ${RECURRENCE_LABEL[task.recurrence].toLowerCase()}`}
      >
        <RotateCw class="h-2.5 w-2.5" />
        {RECURRENCE_LABEL[task.recurrence]}
      </span>
    {/if}
  </div>

  {#if task.description}
    <p class="text-[12.5px] leading-snug text-[var(--color-text-muted)] line-clamp-2">
      {task.description}
    </p>
  {/if}

  <div class="flex items-center justify-between gap-2 pt-1">
    <div class="flex items-center gap-1.5">
      <span
        class="h-2 w-2 rounded-full flex-shrink-0"
        style="background: {PRIORITY_COLOR[task.priority]};"
      ></span>
      <span
        class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        {PRIORITY_LABELS[task.priority]}
      </span>
    </div>

    <div class="flex items-center gap-2">
      {#if standby && task.dueDate}
        <span
          class="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[color-mix(in_oklab,var(--color-info)_30%,transparent)] bg-[color-mix(in_oklab,var(--color-info)_8%,transparent)] text-[var(--color-info)] font-mono text-[9.5px] uppercase tracking-[0.12em] tabular-nums"
          style="border-radius: 3px;"
          title="Tarefa recorrente — aparecerá novamente neste dia"
        >
          <CalendarClock class="h-2.5 w-2.5" />
          Agendada · {formatDate(task.dueDate)}
        </span>
      {:else if task.dueDate}
        <span
          class="inline-flex items-center gap-1 font-mono text-[10px] tabular-nums {isOverdue
            ? 'text-[var(--color-red)] font-semibold'
            : 'text-[var(--color-text-faint)]'}"
        >
          <Calendar class="h-2.5 w-2.5" />
          {formatDate(task.dueDate)}
        </span>
      {/if}

      {#if task.assignee}
        {#if task.assignee.imageUrl}
          <img
            src={task.assignee.imageUrl}
            alt={task.assignee.name}
            title={task.assignee.name}
            referrerpolicy="no-referrer"
            class="h-8 w-8 object-cover border border-[var(--color-border)]"
            style="border-radius: var(--radius-btn);"
          />
        {:else}
          <div
            class="h-8 w-8 flex items-center justify-center font-display font-black italic text-[12px] text-white"
            style="background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-deep) 100%); border-radius: var(--radius-btn);"
            title={task.assignee.name}
          >
            {initials || 'A'}
          </div>
        {/if}
      {:else}
        <span
          class="inline-flex items-center px-1.5 py-0.5 border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
          style="border-radius: 3px;"
          title="Tarefa geral — visível para toda a equipa"
        >
          Geral
        </span>
      {/if}
    </div>
  </div>
</article>

<style>
  .task-card {
    cursor: grab;
  }
  .task-card:active {
    cursor: grabbing;
  }
  /*
    Standby cards live outside the dndzone so dragging is impossible at the
    DOM level. The opacity + non-grab cursor reinforce that visually, and
    the cancel-btn keeps its own pointer events so the X stays clickable.
  */
  .task-card.is-standby {
    cursor: pointer;
    opacity: 0.55;
  }
  .task-card.is-standby:hover {
    opacity: 0.85;
  }
  .cancel-btn {
    opacity: 0;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }
  .task-card:hover .cancel-btn,
  .cancel-btn:focus-visible {
    opacity: 1;
  }
  :global(.line-clamp-2) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
