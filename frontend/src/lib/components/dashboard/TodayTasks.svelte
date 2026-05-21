<script lang="ts">
  import { Calendar, CheckSquare, ChevronDown, Users, Check } from 'lucide-svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import { formatDate } from '$lib/utils/format';
  import type { TodayTaskRow } from '$lib/server/dashboard';
  import type { TaskAssignee } from '$lib/server/tasks';

  interface Props {
    items: TodayTaskRow[];
    users?: TaskAssignee[];
    currentUserId?: string | null;
  }

  let { items, users = [], currentUserId = null }: Props = $props();

  type Scope =
    | { kind: 'mine' }
    | { kind: 'general' }
    | { kind: 'all' }
    | { kind: 'byUser'; assigneeId: string; name: string };

  let scope = $state<Scope>({ kind: 'mine' });
  let rows = $state<TodayTaskRow[]>(items);
  let loading = $state(false);
  let menuOpen = $state(false);
  let menuEl = $state<HTMLDivElement | null>(null);

  // Keep `rows` aligned with new props if the parent re-streams.
  let initialItemsRef = items;
  $effect(() => {
    if (items !== initialItemsRef && scope.kind === 'mine') {
      rows = items;
      initialItemsRef = items;
    }
  });

  // Maps to the prototype's `.tag.red / .gold / .blue / .green` classes.
  const PRIORITY_TAG_COLOR: Record<string, { text: string; border: string }> = {
    URGENT: {
      text: 'text-[var(--color-red)]',
      border: 'border-[var(--color-red)]',
    },
    HIGH: {
      text: 'text-[var(--color-warning)]',
      border: 'border-[color-mix(in_oklab,var(--color-warning)_45%,transparent)]',
    },
    MEDIUM: {
      text: 'text-[var(--color-info)]',
      border: 'border-[color-mix(in_oklab,var(--color-info)_45%,transparent)]',
    },
    LOW: {
      text: 'text-[var(--color-success)]',
      border: 'border-[color-mix(in_oklab,var(--color-success)_45%,transparent)]',
    },
  };

  // Short Portuguese priority codes (URG / ALT / MED / BX) shown big & red on
  // the left of each row — matches the prototype's `.sch-row .h` value.
  const PRIORITY_CODE: Record<string, string> = {
    URGENT: 'URG',
    HIGH: 'ALT',
    MEDIUM: 'MED',
    LOW: 'BX',
  };
  const PRIORITY_FULL_LABEL: Record<string, string> = {
    URGENT: 'Urgente',
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
  };

  function scopeLabel(s: Scope): string {
    if (s.kind === 'mine') return 'Minhas';
    if (s.kind === 'general') return 'Geral';
    if (s.kind === 'all') return 'Todas';
    return s.name;
  }

  async function refetch(next: Scope) {
    scope = next;
    menuOpen = false;
    loading = true;
    try {
      const qs = new URLSearchParams();
      if (next.kind === 'byUser') {
        qs.set('scope', 'byUser');
        qs.set('assigneeId', next.assigneeId);
      } else {
        qs.set('scope', next.kind);
      }
      const res = await fetch(`/api/today-tasks?${qs.toString()}`, {
        headers: { accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as { items?: TodayTaskRow[] };
        rows = data.items ?? [];
      }
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuEl && !menuEl.contains(e.target as Node)) menuOpen = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') menuOpen = false;
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  });

  // Hide the current user from the per-user list (they have "Minhas")
  // and unassigned rows (the system has no name).
  const userOptions = $derived(
    users.filter((u) => u.id !== currentUserId && Boolean(u.name)),
  );

  // Build today's date label in the prototype's "QUI · 30 ABR · N ATIVAS" format.
  const PT_WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const PT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const todayLabel = $derived.by(() => {
    const d = new Date();
    return `${PT_WEEKDAYS[d.getDay()]} · ${d.getDate()} ${PT_MONTHS[d.getMonth()]} · ${rows.length} ATIVAS`;
  });
</script>

<Panel>
  <PanelHeader icon={CheckSquare} title="Tarefas · Hoje" meta={todayLabel}>
    {#snippet actions()}
      <div bind:this={menuEl} class="relative">
        <button
          type="button"
          onclick={() => (menuOpen = !menuOpen)}
          class="inline-flex items-center gap-1.5 px-2.5 h-8 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          style="border-radius: var(--radius-btn);"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Users class="h-3 w-3" />
          <span>{scopeLabel(scope)}</span>
          <ChevronDown class="h-3 w-3 opacity-70" />
        </button>

        {#if menuOpen}
          <div
            role="menu"
            class="absolute right-0 top-full mt-1 z-20 w-56 max-h-[320px] overflow-y-auto bg-[var(--color-bg-1)] border border-[var(--color-border)] shadow-lg"
            style="border-radius: var(--radius-card);"
          >
            <button
              type="button"
              role="menuitemradio"
              aria-checked={scope.kind === 'mine'}
              onclick={() => refetch({ kind: 'mine' })}
              class="w-full text-left flex items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] cursor-pointer"
            >
              <span>Minhas</span>
              {#if scope.kind === 'mine'}<Check class="h-3 w-3 text-[var(--color-red)]" />{/if}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={scope.kind === 'general'}
              onclick={() => refetch({ kind: 'general' })}
              class="w-full text-left flex items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] cursor-pointer"
            >
              <span>Geral · Sem assignee</span>
              {#if scope.kind === 'general'}<Check class="h-3 w-3 text-[var(--color-red)]" />{/if}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={scope.kind === 'all'}
              onclick={() => refetch({ kind: 'all' })}
              class="w-full text-left flex items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] cursor-pointer"
            >
              <span>Todas</span>
              {#if scope.kind === 'all'}<Check class="h-3 w-3 text-[var(--color-red)]" />{/if}
            </button>

            {#if userOptions.length > 0}
              <div
                class="px-3 pt-3 pb-1 border-t border-[var(--color-border)] font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-text-faint)]"
              >
                Por utilizador
              </div>
              {#each userOptions as u (u.id)}
                {@const active = scope.kind === 'byUser' && scope.assigneeId === u.id}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onclick={() => refetch({ kind: 'byUser', assigneeId: u.id, name: u.name })}
                  class="w-full text-left flex items-center justify-between gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] cursor-pointer"
                >
                  <span class="truncate">{u.name}</span>
                  {#if active}<Check class="h-3 w-3 text-[var(--color-red)]" />{/if}
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/snippet}
  </PanelHeader>

  {#if loading}
    <div
      class="p-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
    >
      A carregar…
    </div>
  {:else if rows.length === 0}
    <div
      class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
    >
      Sem tarefas para hoje
    </div>
  {:else}
    <!-- .sch-row layout: [code+HOJE] · [red sep] · [body] · [colored tag] -->
    {#each rows as t (t.id)}
      {@const code = PRIORITY_CODE[t.priority] ?? '—'}
      {@const tagStyle = PRIORITY_TAG_COLOR[t.priority] ?? {
        text: 'text-[var(--color-success)]',
        border: 'border-[color-mix(in_oklab,var(--color-success)_45%,transparent)]',
      }}
      <a
        href={`/tarefas/${t.id}/editar`}
        class="grid items-center gap-4 px-5 py-3.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[color-mix(in_oklab,var(--color-red)_4%,transparent)] transition-colors group"
        style="grid-template-columns: 64px 1.5px 1fr auto;"
      >
        <!-- Big italic red priority code with small HOJE / ATRASO subtitle -->
        <div class="text-right leading-none">
          <div
            class="font-display font-extrabold italic text-[22px] tracking-[-0.01em] text-[var(--color-red)] leading-none"
          >
            {code}
          </div>
          <div
            class="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-faint)] mt-1"
          >
            {t.isOverdue ? 'Atraso' : 'Hoje'}
          </div>
        </div>

        <!-- Red vertical separator (1.5px) — brand-DNA pattern -->
        <span class="block h-[32px] w-[1.5px] bg-[var(--color-red)]"></span>

        <div class="min-w-0">
          <div
            class="font-semibold text-[14px] truncate group-hover:text-[var(--color-red)] transition-colors"
          >
            {t.title}
          </div>
          <div class="text-[12px] text-[var(--color-text-muted)] truncate mt-0.5">
            {#if t.dueDate}
              <Calendar class="inline h-2.5 w-2.5 mr-1 -mt-px text-[var(--color-text-faint)]" />
              <span class="num-value text-[11px] text-[var(--color-text-muted)]">
                {formatDate(t.dueDate)}
              </span>
              <span class="mx-1.5 text-[var(--color-text-faint)]">·</span>
            {/if}
            {#if t.assignee}
              {#if currentUserId && t.assignee.id === currentUserId}
                <span class="text-[var(--color-red)] font-semibold">{t.assignee.name}</span>
              {:else}
                <span>{t.assignee.name}</span>
              {/if}
            {:else}
              <span class="text-[var(--color-text-faint)]">Geral</span>
            {/if}
          </div>
        </div>

        <!-- Colored tag pill, matches prototype `.sch-row .tag` -->
        <span
          class="inline-flex items-center font-mono text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-1 border {tagStyle.text} {tagStyle.border}"
          style="border-radius: 3px;"
        >
          {PRIORITY_FULL_LABEL[t.priority] ?? t.priority}
        </span>
      </a>
    {/each}
  {/if}
</Panel>
