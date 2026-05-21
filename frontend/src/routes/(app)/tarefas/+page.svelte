<script lang="ts">
  import { Download, Plus, Search, X } from 'lucide-svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { toast } from 'svelte-sonner';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import TaskCard from '$lib/components/task/TaskCard.svelte';
  import { formatDateLong } from '$lib/utils/format';
  import type { TaskDto } from '$lib/server/tasks';
  import type { Priority, TaskStatus } from '@anm/types';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const today = new Date();

  const COLUMN_DEFS: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'TODO', label: 'A Fazer', color: 'var(--color-text-faint)' },
    { status: 'IN_PROGRESS', label: 'Em Curso', color: 'var(--color-warning)' },
    { status: 'DONE', label: 'Concluído', color: 'var(--color-success)' },
  ];

  const PRIORITIES: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Baixa', color: 'var(--color-text-faint)' },
    { value: 'MEDIUM', label: 'Média', color: 'var(--color-info)' },
    { value: 'HIGH', label: 'Alta', color: 'var(--color-warning)' },
    { value: 'URGENT', label: 'Urgente', color: 'var(--color-red)' },
  ];

  // Local mutable copy of tasks so DnD can update positions optimistically.
  let board = $state<Record<TaskStatus, TaskDto[]>>({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });

  // Keep the board in sync with server data whenever it reloads.
  $effect(() => {
    const next: Record<TaskStatus, TaskDto[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of data.tasks) next[t.status].push(t);
    board = next;
  });

  const FLIP_MS = 180;

  async function handleDrop(status: TaskStatus, items: TaskDto[]) {
    const previous = board[status];
    board = { ...board, [status]: items };

    // Find the card whose declared status doesn't match the column it's in now.
    const moved = items.find((t) => t.status !== status);
    if (!moved) return;

    // Optimistically mutate the card's status field
    board = {
      ...board,
      [status]: items.map((t) => (t.id === moved.id ? { ...t, status } : t)),
    };

    try {
      const res = await fetch(`/tarefas/${moved.id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = (await res.json()) as { spawnedTaskId: string | null };

      if (result.spawnedTaskId) {
        toast.success('Tarefa concluída — nova ocorrência recorrente criada.');
      } else if (status === 'DONE') {
        toast.success('Tarefa concluída.');
      } else {
        toast.message(`Estado: ${status}`);
      }
      // Reload to pick up any spawned recurring task
      await invalidateAll();
    } catch (err) {
      toast.error(`Falha ao mover tarefa: ${(err as Error).message}`);
      // Revert
      board = { ...board, [status]: previous };
    }
  }

  type Scope = 'all' | 'mine' | 'general';

  function setPriority(value: Priority | undefined) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value) usp.set('priority', value);
    else usp.delete('priority');
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  function setScope(value: Scope) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value === 'all') usp.delete('scope');
    else usp.set('scope', value);
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  function setSearch(value: string) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value) usp.set('q', value);
    else usp.delete('q');
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  const currentScope = $derived<Scope>(data.filters.scope ?? 'all');
  const hasFilters = $derived(
    Boolean(data.filters.priority || currentScope !== 'all' || data.filters.q),
  );

  function clearFilters() {
    goto($page.url.pathname, { keepFocus: false, noScroll: true });
  }

  function openTask(id: string) {
    goto(`/tarefas/${id}/editar`);
  }
</script>

<svelte:head>
  <title>Tarefas · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Page header -->
  <div class="flex items-end justify-between gap-6">
    <div>
      <ItalicHero text="Tarefas" size="lg" />
      <div
        class="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        {formatDateLong(today)}
        <span class="text-[var(--color-text-faint)]">·</span>
        <span class="tabular-nums">{data.tasks.length} no quadro</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" size="md" href="/tarefas/export?format=csv">
        <Download class="h-4 w-4" />
        Exportar
      </Button>
      <Button variant="primary" size="md" href="/tarefas/nova">
        <Plus class="h-4 w-4" />
        Nova Tarefa
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Panel>
    <div class="p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div
          class="flex-1 relative flex items-center h-11 px-3 border border-[var(--color-border)] bg-[var(--color-bg-1)] focus-within:border-[var(--color-red)] transition-colors"
          style="border-radius: var(--radius-btn);"
        >
          <Search class="h-4 w-4 text-[var(--color-text-faint)]" />
          <input
            type="search"
            placeholder="Pesquisar tarefas…"
            value={data.filters.q ?? ''}
            oninput={(e) => setSearch(e.currentTarget.value)}
            class="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
        {#if hasFilters}
          <button
            type="button"
            onclick={clearFilters}
            class="inline-flex items-center gap-1.5 px-3 h-11 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
          >
            <X class="h-3 w-3" /> Limpar
          </button>
        {/if}
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mr-1">
          Prioridade
        </span>
        {#each PRIORITIES as p (p.value)}
          {@const active = data.filters.priority === p.value}
          <button
            type="button"
            onclick={() => setPriority(active ? undefined : p.value)}
            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors flex items-center gap-1.5 {active
              ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
          >
            <span class="h-1.5 w-1.5 rounded-full" style="background: {p.color};"></span>
            {p.label}
          </button>
        {/each}
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mr-1">
          Visibilidade
        </span>
        {#each [{ value: 'all', label: 'Todas' }, { value: 'mine', label: 'Minhas' }, { value: 'general', label: 'Gerais' }] as opt (opt.value)}
          {@const active = currentScope === opt.value}
          <button
            type="button"
            onclick={() => setScope(opt.value as Scope)}
            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors {active
              ? 'border-[var(--color-red)] bg-[color-mix(in_oklab,var(--color-red)_15%,transparent)] text-[var(--color-red)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
          >
            {opt.label}
          </button>
        {/each}
      </div>
    </div>
  </Panel>

  {#if data.error}
    <Panel>
      <div class="p-4 flex items-center gap-3 text-[var(--color-red)] text-[13px]">
        <strong class="font-mono uppercase tracking-[0.12em] text-[10px]">Erro</strong>
        <span>{data.error}</span>
      </div>
    </Panel>
  {/if}

  <!-- Kanban -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each COLUMN_DEFS as col (col.status)}
      <Panel>
        <header
          class="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="h-2 w-2 rounded-full flex-shrink-0"
              style="background: {col.color};"
            ></span>
            <div class="h-[18px] w-[1.5px]" style="background: {col.color};"></div>
            <h3 class="font-display text-[16px] font-bold italic uppercase tracking-[-0.01em]">
              {col.label}
            </h3>
            {#if col.status === 'DONE'}
              <span
                class="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] ml-1"
                title="Tarefas concluídas são eliminadas automaticamente todos os Domingos"
              >
                · limpa Dom
              </span>
            {/if}
          </div>
          <span
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] tabular-nums"
          >
            {board[col.status].length}
          </span>
        </header>

        <div
          use:dndzone={{
            items: board[col.status],
            flipDurationMs: FLIP_MS,
            type: 'task',
            dropTargetStyle: {
              outline: '2px solid var(--color-red)',
              outlineOffset: '-2px',
            },
          }}
          onconsider={(e: CustomEvent<DndEvent<TaskDto>>) => {
            board = { ...board, [col.status]: e.detail.items };
          }}
          onfinalize={(e: CustomEvent<DndEvent<TaskDto>>) =>
            handleDrop(col.status, e.detail.items)}
          class="p-3 space-y-2.5 min-h-[200px]"
        >
          {#each board[col.status] as t (t.id)}
            <div animate:flip={{ duration: FLIP_MS }}>
              <TaskCard task={t} onclick={() => openTask(t.id)} />
            </div>
          {/each}

          {#if board[col.status].length === 0}
            <div
              class="flex items-center justify-center h-32 border-2 border-dashed border-[var(--color-border)] font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
              style="border-radius: var(--radius-btn);"
            >
              Sem tarefas
            </div>
          {/if}
        </div>
      </Panel>
    {/each}
  </div>
</section>
