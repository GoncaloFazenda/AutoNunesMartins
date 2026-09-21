<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { Calendar, ChevronRight, ListChecks, Play, Plus, X } from 'lucide-svelte';
  import { mobileDrawer } from '$lib/stores/sidebar';
  import { quickTask } from '$lib/stores/quickTask';
  import { formatDate } from '$lib/utils/format';
  import type { TaskAssignee, TaskDto } from '$lib/server/tasks';
  import type { Priority } from '@anm/types';

  const PRIORITIES: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Baixa', color: 'var(--color-text-faint)' },
    { value: 'MEDIUM', label: 'Média', color: 'var(--color-info)' },
    { value: 'HIGH', label: 'Alta', color: 'var(--color-warning)' },
    { value: 'URGENT', label: 'Urgente', color: 'var(--color-red)' },
  ];

  type DueChoice = 'none' | 'today' | 'tomorrow' | 'week' | 'custom';
  const DUE_PRESETS: { value: Exclude<DueChoice, 'custom'>; label: string }[] = [
    { value: 'none', label: 'Sem data' },
    { value: 'today', label: 'Hoje' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'week', label: 'Esta semana' },
  ];

  type Scope = 'all' | 'mine' | 'general';
  const SCOPES: { value: Scope; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'mine', label: 'Minhas' },
    { value: 'general', label: 'Gerais' },
  ];

  /**
   * Panel transition. Mobile reveals via a clip-path inset that shrinks from
   * the top — the panel is anchored against the top of the bottom-nav and
   * the visible region grows steadily upward, so it reads as the bottom-nav
   * being dragged up. We use a near-linear ease (with a tiny soft-finish at
   * the end) and keep opacity at 1 from the first frame: that prevents the
   * "appears already half-way" jump caused by aggressive ease-outs and
   * opacity ramps. Desktop keeps the slight slide-up + fade.
   */
  function panelTransition(
    _node: Element,
    { mobile = false }: { mobile?: boolean } = {},
  ) {
    if (mobile) {
      return {
        duration: 380,
        css: (t: number) => {
          // 90% linear + 10% ease-out so it doesn't feel mechanical at the
          // very end but still moves at a perceivable constant rate from t=0.
          const eased = 0.9 * t + 0.1 * (1 - Math.pow(1 - t, 2));
          return `
            clip-path: inset(${(1 - eased) * 100}% 0 0 0);
            opacity: 1;
          `;
        },
      };
    }
    return {
      duration: 220,
      css: (t: number) => {
        const eased = cubicOut(t);
        return `
          transform: translateY(${(1 - eased) * 8}px) scale(${0.985 + eased * 0.015});
          opacity: ${eased};
        `;
      },
    };
  }

  function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function resolveDue(choice: DueChoice, custom: string): string | undefined {
    if (choice === 'none') return undefined;
    if (choice === 'custom') return custom || undefined;
    const d = new Date();
    if (choice === 'tomorrow') d.setDate(d.getDate() + 1);
    if (choice === 'week') d.setDate(d.getDate() + 7);
    return toISODate(d);
  }
  function isToday(iso: string | null): boolean {
    if (!iso) return false;
    const d = new Date(iso);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }
  function isOverdue(task: TaskDto): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date(new Date().toISOString().slice(0, 10));
  }
  function shortName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0] ?? '';
    return `${parts[0]} ${parts.at(-1)?.[0] ?? ''}.`;
  }
  function initialsOf(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  // ─── Component state ───────────────────────────────────────────────────────
  // isOpen is driven by the shared store so the mobile bottom-nav "+"
  // affordance can also open the panel without coupling components.
  const isOpen = $derived($quickTask);
  let creating = $state(false);
  let loading = $state(false);
  let items = $state<TaskDto[]>([]);
  let loadError = $state<string | null>(null);
  let users = $state<TaskAssignee[]>([]);
  let usersLoaded = $state(false);
  let isMobile = $state(false);

  // Quick-add form
  let title = $state('');
  let priority = $state<Priority>('MEDIUM');
  let dueChoice = $state<DueChoice>('none');
  let customDate = $state('');
  let assigneeChoice = $state<string>('');

  // List filter (desktop only)
  let scope = $state<Scope>('all');

  // Per-row pending state advances
  let advancing = $state<Set<string>>(new Set());

  // Element refs
  let panelEl = $state<HTMLDivElement | null>(null);
  let bubbleEl = $state<HTMLButtonElement | null>(null);
  let titleInput = $state<HTMLInputElement | null>(null);

  // ─── Drag-to-open / drag-to-close (mobile) ─────────────────────────────
  // Native bottom-sheet feel: drag up from the bubble to reveal, drag down
  // on the header to dismiss. Snaps to the nearest state on release based on
  // distance dragged. Movements under TAP_THRESHOLD fall through to the
  // regular click handler so quick taps still toggle.
  const PANEL_PX = 380;        // approximate sheet height — used to map drag → clip %
  const TAP_THRESHOLD = 6;     // px movement under which it's considered a tap
  const OPEN_SNAP_PX = 56;     // drag-up distance that snaps to fully open
  const CLOSE_SNAP_PX = 70;    // drag-down distance that snaps to closed
  let dragDelta = $state(0);
  let isDragging = $state(false);
  let dragOrigin = $state<'bubble' | 'header' | null>(null);
  let dragStartY = 0;
  let suppressClick = false;

  // ─── Derived state ─────────────────────────────────────────────────────────
  const currentUserId = $derived(
    ($page.data as { currentUser?: { id?: string } | null })?.currentUser?.id ?? '',
  );

  // Live clip % for the mobile sheet. Base value comes from isOpen; while the
  // user drags we add the delta so the sheet tracks the finger 1:1. Clamped
  // to [0, 100].
  const mobileClipPct = $derived.by(() => {
    const base = isOpen ? 0 : 100;
    const pct = base + (dragDelta / PANEL_PX) * 100;
    return Math.min(100, Math.max(0, pct));
  });

  $effect(() => {
    if (assigneeChoice === '' && currentUserId) {
      assigneeChoice = currentUserId;
    }
  });

  // Refetch list when scope changes while panel is open (desktop only)
  $effect(() => {
    if (isOpen && !isMobile) {
      void load(scope);
    }
  });

  // ─── Visibility rules ──────────────────────────────────────────────────────
  const hiddenOnRoute = $derived.by(() => {
    const path = $page.url.pathname;
    return path === '/tarefas/nova' || /^\/tarefas\/[^/]+\/editar$/.test(path);
  });
  const hiddenForDrawer = $derived($mobileDrawer);
  const shouldRender = $derived(!hiddenOnRoute && !hiddenForDrawer);

  // ─── Network ───────────────────────────────────────────────────────────────
  async function load(currentScope: Scope = scope) {
    loading = true;
    loadError = null;
    try {
      const qs = new URLSearchParams({ status: 'TODO', scope: currentScope });
      const res = await fetch(`/api/tasks?${qs.toString()}`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: TaskDto[] };
      const list = data.items ?? [];
      const PR: Record<Priority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      list.sort((a, b) => {
        const ao = isOverdue(a) ? 0 : 1;
        const bo = isOverdue(b) ? 0 : 1;
        if (ao !== bo) return ao - bo;
        const pa = PR[a.priority] ?? 99;
        const pb = PR[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return da - db;
      });
      items = list;
    } catch (err) {
      loadError = (err as Error).message;
    } finally {
      loading = false;
    }
  }

  async function loadUsers() {
    if (usersLoaded) return;
    try {
      const res = await fetch('/api/users', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: TaskAssignee[] };
      users = data.items ?? [];
      usersLoaded = true;
    } catch {
      /* Non-fatal */
    }
  }

  function toggle() {
    quickTask.toggle();
  }

  // Side effects when the panel opens/closes — runs regardless of trigger
  // (bubble click, bottom-nav "+", drag-snap, Escape, etc.).
  $effect(() => {
    if (isOpen) {
      void loadUsers();
      if (!isMobile) {
        void tick().then(() => titleInput?.focus());
      }
    } else {
      bubbleEl?.blur();
    }
  });

  // ─── Drag handlers ─────────────────────────────────────────────────────
  function startDrag(origin: 'bubble' | 'header', e: PointerEvent) {
    if (!isMobile) return;
    // Let form fields and inner buttons handle their own taps.
    const tgt = e.target as HTMLElement;
    if (tgt.closest('input, select, textarea, .qt-close, .qt-submit, .qt-chip, .qt-advance, .qt-footer-link'))
      return;
    dragStartY = e.clientY;
    dragOrigin = origin;
    isDragging = false;
    dragDelta = 0;
  }

  function onDragMove(e: PointerEvent) {
    if (dragOrigin === null) return;
    const dy = e.clientY - dragStartY;
    if (!isDragging) {
      if (Math.abs(dy) < TAP_THRESHOLD) return;
      isDragging = true;
      try {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      } catch {
        /* unsupported */
      }
    }
    // Constrain by origin: bubble drags up only, header drags down only.
    dragDelta = dragOrigin === 'bubble' ? Math.min(0, dy) : Math.max(0, dy);
  }

  function endDrag() {
    if (dragOrigin === null) return;
    const origin = dragOrigin;
    dragOrigin = null;
    if (!isDragging) return; // tap — let click handler run
    isDragging = false;
    const moved = Math.abs(dragDelta);
    if (origin === 'bubble' && moved >= OPEN_SNAP_PX) {
      quickTask.open();
    } else if (origin === 'header' && moved >= CLOSE_SNAP_PX) {
      quickTask.close();
    }
    // Else: snap back to previous state (clip transitions to base via CSS).
    dragDelta = 0;
    // Block the click that browsers synthesize after a touch sequence.
    suppressClick = true;
    setTimeout(() => {
      suppressClick = false;
    }, 120);
  }

  function onBubbleClick() {
    if (suppressClick) return;
    void toggle();
  }

  function close() {
    quickTask.close();
  }

  async function handleSubmit(e?: Event) {
    e?.preventDefault();
    const t = title.trim();
    if (!t || creating) return;
    if (t.length > 160) {
      toast.error('Título demasiado longo (máx. 160).');
      return;
    }
    if (dueChoice === 'custom' && !customDate) {
      toast.error('Escolhe uma data ou desliga a data personalizada.');
      return;
    }
    creating = true;
    try {
      const body: Record<string, unknown> = {
        title: t,
        priority,
        status: 'TODO',
      };
      const dueISO = resolveDue(dueChoice, customDate);
      if (dueISO) body.dueDate = dueISO;
      if (assigneeChoice) body.assigneeId = assigneeChoice;
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      toast.success('Tarefa criada.');
      title = '';
      customDate = '';
      if (dueChoice === 'custom') dueChoice = 'none';
      if (!isMobile) titleInput?.focus();
      // Only refetch the desktop list — mobile has no list to refresh.
      if (!isMobile) await load();
      void invalidateAll();
    } catch (err) {
      toast.error(`Falha ao criar: ${(err as Error).message}`);
    } finally {
      creating = false;
    }
  }

  async function advance(task: TaskDto) {
    if (advancing.has(task.id)) return;
    advancing = new Set(advancing).add(task.id);
    const previous = items;
    items = items.filter((t) => t.id !== task.id);
    try {
      const res = await fetch(`/tarefas/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.message('Em curso.');
      void invalidateAll();
    } catch (err) {
      toast.error(`Falha: ${(err as Error).message}`);
      items = previous;
    } finally {
      const next = new Set(advancing);
      next.delete(task.id);
      advancing = next;
    }
  }

  function onDocClick(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    if (panelEl?.contains(target) || bubbleEl?.contains(target)) return;
    close();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) close();
  }

  onMount(() => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    const mq = window.matchMedia('(max-width: 767px)');
    isMobile = mq.matches;
    const onMQ = (ev: MediaQueryListEvent) => (isMobile = ev.matches);
    mq.addEventListener('change', onMQ);
    return () => mq.removeEventListener('change', onMQ);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
  });

  function dueRel(task: TaskDto): { label: string; tone: 'red' | 'warning' | 'muted' } {
    if (!task.dueDate) return { label: '—', tone: 'muted' };
    if (isOverdue(task)) return { label: 'atrasada', tone: 'red' };
    if (isToday(task.dueDate)) return { label: 'hoje', tone: 'warning' };
    return { label: formatDate(task.dueDate), tone: 'muted' };
  }
</script>

{#if shouldRender}
  <!-- Backdrop only on mobile — gives the bottom sheet its native feel. -->
  {#if isMobile && (isOpen || isDragging) && mobileClipPct < 100}
    <button
      type="button"
      class="qt-backdrop"
      aria-label="Fechar"
      onclick={close}
      style="opacity: {((100 - mobileClipPct) / 100) * 0.55}; transition: {isDragging ? 'none' : 'opacity 360ms cubic-bezier(0.32, 0.72, 0, 1)'};"
    ></button>
  {/if}

  {#if !isMobile}
    <!--
      Floating bubble: desktop entry-point only. On mobile the user opens
      the panel from the "+" affordance on the Tarefas item in the bottom
      navigation, so a separate floating bubble would be a redundant tap
      target competing with the nav bar.
    -->
    <button
      bind:this={bubbleEl}
      type="button"
      onclick={onBubbleClick}
      onpointerdown={(e) => startDrag('bubble', e)}
      onpointermove={onDragMove}
      onpointerup={endDrag}
      onpointercancel={endDrag}
      class="qt-bubble {isOpen ? 'is-open' : ''}"
      aria-label="Tarefas rápidas"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <ListChecks class="h-[22px] w-[22px]" />
    </button>
  {/if}

  {#snippet panelBody()}
      <header
        class="qt-header"
        role={isMobile ? 'region' : undefined}
        aria-label={isMobile ? 'Cabeçalho — arraste para baixo para fechar' : undefined}
        onpointerdown={(e) => startDrag('header', e)}
        onpointermove={onDragMove}
        onpointerup={endDrag}
        onpointercancel={endDrag}
      >
        {#if isMobile}
          <!-- Drag handle hint: a thin grabber centred above the title row. -->
          <div class="qt-grabber" aria-hidden="true"></div>
        {/if}
        <div class="qt-header-title">
          <ListChecks class="h-[20px] w-[20px] text-[var(--color-text)]" />
          <div class="qt-header-divider"></div>
          <h3>{isMobile ? 'Nova tarefa' : 'Tarefas'}</h3>
        </div>
        <button type="button" class="qt-close" onclick={close} aria-label="Fechar">
          <X class="h-4 w-4" />
        </button>
      </header>

      <!-- ─── Quick-add (always shown) ───────────────────────────────────── -->
      <form class="qt-add" onsubmit={handleSubmit}>
        <div class="qt-input-wrap">
          <input
            bind:this={titleInput}
            bind:value={title}
            type="text"
            maxlength="160"
            placeholder="O que precisa de ser feito?"
            class="qt-input"
            disabled={creating}
          />
          <button
            type="submit"
            class="qt-submit"
            disabled={creating || !title.trim()}
            aria-label="Criar tarefa"
          >
            <Plus class="h-4 w-4" />
          </button>
        </div>

        <div class="qt-form-row">
          <span class="qt-form-label">Prioridade</span>
          <div class="qt-chips">
            {#each PRIORITIES as p (p.value)}
              {@const active = priority === p.value}
              <button
                type="button"
                onclick={() => (priority = p.value)}
                class="qt-chip {active ? 'is-active' : ''}"
              >
                <span class="qt-chip-dot" style="background: {p.color};"></span>
                {p.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="qt-form-row">
          <span class="qt-form-label">Prazo</span>
          <div class="qt-chips">
            {#each DUE_PRESETS as d (d.value)}
              {@const active = dueChoice === d.value}
              <button
                type="button"
                onclick={() => {
                  dueChoice = d.value;
                  customDate = '';
                }}
                class="qt-chip {active ? 'is-active' : ''}"
              >
                {d.label}
              </button>
            {/each}
            <label
              class="qt-chip qt-chip-date {dueChoice === 'custom' ? 'is-active' : ''}"
              title="Data personalizada"
            >
              <Calendar class="h-3 w-3" />
              <input
                type="date"
                bind:value={customDate}
                oninput={() => {
                  dueChoice = customDate ? 'custom' : 'none';
                }}
                class="qt-date-input"
                aria-label="Data personalizada"
              />
            </label>
          </div>
        </div>

        <div class="qt-form-row">
          <span class="qt-form-label">Para</span>
          <div class="qt-assignee-wrap">
            <select bind:value={assigneeChoice} class="qt-assignee" aria-label="Atribuir a">
              {#if currentUserId}
                <option value={currentUserId}>Para mim</option>
              {/if}
              <option value="">— Geral (todos) —</option>
              {#each users.filter((u) => u.id !== currentUserId) as u (u.id)}
                <option value={u.id}>{u.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </form>

      <!-- ─── List (DESKTOP ONLY) ──────────────────────────────────────────
           The header (label + scope filter) lives OUTSIDE the scroll area
           so it never overlays rows when the user scrolls — it's a fixed
           strip above the list, with the rows scrolling under nothing. -->
      {#if !isMobile}
        <section class="qt-list-section">
          <div class="qt-list-header">
            <span class="qt-section-label">A Fazer</span>
            <div class="qt-scope">
              {#each SCOPES as s (s.value)}
                {@const active = scope === s.value}
                <button
                  type="button"
                  onclick={() => (scope = s.value)}
                  class="qt-scope-btn {active ? 'is-active' : ''}"
                >
                  {s.label}
                </button>
              {/each}
            </div>
          </div>

          <div class="qt-list-scroll">
          {#if loading && items.length === 0}
            <div class="qt-empty" in:fade={{ duration: 160 }}>A carregar…</div>
          {:else if loadError}
            <div class="qt-empty qt-empty-err" in:fade={{ duration: 160 }}>
              Erro: {loadError}
            </div>
          {:else if items.length === 0}
            <div class="qt-empty" in:fade={{ duration: 200 }}>Tudo em dia ✓</div>
          {:else}
            <ul class="qt-rows">
              {#each items as t, i (t.id)}
                {@const pColor = PRIORITIES.find((p) => p.value === t.priority)?.color ?? 'var(--color-text-faint)'}
                {@const rd = dueRel(t)}
                {@const isBusy = advancing.has(t.id)}
                <li
                  class="qt-row {isBusy ? 'is-busy' : ''}"
                  in:fly={{ y: 6, duration: 220, delay: Math.min(i * 25, 200), easing: cubicOut }}
                  out:slide={{ duration: 200, easing: cubicOut }}
                >
                  <span class="qt-row-rail" style="background: {pColor};"></span>
                  <div class="qt-row-body">
                    <div class="qt-row-title">{t.title}</div>
                    <div class="qt-row-meta">
                      <span class="qt-row-due qt-row-due-{rd.tone}">{rd.label}</span>
                      {#if t.assignee}
                        <span class="qt-row-assignee" title={t.assignee.name}>
                          {#if t.assignee.imageUrl}
                            <img
                              src={t.assignee.imageUrl}
                              alt=""
                              referrerpolicy="no-referrer"
                              class="qt-avatar-img"
                            />
                          {:else}
                            <span class="qt-avatar-fallback">
                              {initialsOf(t.assignee.name) || 'A'}
                            </span>
                          {/if}
                          <span class="qt-row-assignee-name">{shortName(t.assignee.name)}</span>
                        </span>
                      {:else}
                        <span class="qt-row-tag" title="Visível a todos">GERAL</span>
                      {/if}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="qt-advance"
                    onclick={() => advance(t)}
                    disabled={isBusy}
                    title="Marcar em curso"
                    aria-label="Marcar em curso"
                  >
                    <Play class="h-3.5 w-3.5" />
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
          </div>
        </section>
      {/if}

      <footer class="qt-footer">
        {#if !isMobile}
          <a href="/tarefas" onclick={close} class="qt-footer-link">
            Ver todas
            <ChevronRight class="h-3 w-3" />
          </a>
        {/if}
        <a href="/tarefas/nova" onclick={close} class="qt-footer-link qt-footer-secondary">
          <Plus class="h-3 w-3" />
          Tarefa completa
        </a>
      </footer>
  {/snippet}

  {#if isMobile}
    <!--
      Mobile: panel is always in the DOM so the drag gesture can manipulate
      its clip-path in real time. When isOpen is false and the user isn't
      dragging, mobileClipPct sits at 100 (fully hidden) and pointer-events
      are off so the panel doesn't intercept taps on the page behind.
    -->
    <div
      bind:this={panelEl}
      class="qt-panel panel-surface is-mobile {mobileClipPct >= 99 && !isDragging ? 'is-fully-closed' : ''}"
      role="dialog"
      aria-label="Tarefas rápidas"
      aria-hidden={!isOpen && !isDragging}
      style="clip-path: inset({mobileClipPct}% 0 0 0); transition: {isDragging ? 'none' : 'clip-path 360ms cubic-bezier(0.32, 0.72, 0, 1)'};"
    >
      {@render panelBody()}
    </div>
  {:else if isOpen}
    <div
      bind:this={panelEl}
      class="qt-panel panel-surface"
      role="dialog"
      aria-label="Tarefas rápidas"
      transition:panelTransition={{ mobile: false }}
    >
      {@render panelBody()}
    </div>
  {/if}
{/if}

<style>
  /* ───────── Bubble ───────── */
  .qt-bubble {
    position: fixed;
    bottom: 24px;
    right: 28px;
    z-index: 30;
    width: 56px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-2);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    box-shadow:
      0 10px 28px rgba(0, 0, 0, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.25);
    opacity: 0.96;
    transition:
      transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1),
      opacity 0.22s var(--ease-brand),
      border-color 0.22s var(--ease-brand),
      color 0.22s var(--ease-brand),
      box-shadow 0.28s var(--ease-brand);
    cursor: pointer;
  }
  /*
    Restrict hover/focus styles to devices that can actually hover (desktop
    mice & trackpads). Without this guard, iOS Safari and some Android
    browsers latch the :hover state on the bubble after a tap and don't
    clear it until the user taps somewhere else — that's why the bubble
    stayed red after the panel closed.
  */
  @media (hover: hover) and (pointer: fine) {
    .qt-bubble:hover,
    .qt-bubble:focus-visible {
      opacity: 1;
      color: var(--color-text);
      border-color: var(--color-red);
      transform: scale(1.08) translateZ(0);
      box-shadow:
        0 14px 36px rgba(0, 0, 0, 0.5),
        0 0 0 4px color-mix(in oklab, var(--color-red) 10%, transparent);
      outline: none;
    }
  }
  .qt-bubble:active {
    transform: scale(0.96);
    transition-duration: 0.08s;
  }
  .qt-bubble.is-open {
    color: var(--color-text);
    border-color: var(--color-red);
    opacity: 1;
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.5),
      0 0 0 4px color-mix(in oklab, var(--color-red) 16%, transparent);
  }
  :global([data-theme='light']) .qt-bubble {
    background: var(--color-bg-1);
    box-shadow:
      0 10px 28px rgba(0, 0, 0, 0.14),
      0 2px 6px rgba(0, 0, 0, 0.08);
  }

  /* ───────── Backdrop (mobile only) ─────────
     Stops at the top edge of the bottom-nav so the nav stays bright and
     fully tappable — the dim only covers the page area above the panel,
     never the navigation. */
  .qt-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: calc(56px + env(safe-area-inset-bottom, 0));
    z-index: 45;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    border: 0;
    padding: 0;
    cursor: pointer;
  }
  :global([data-theme='light']) .qt-backdrop {
    background: rgba(20, 20, 24, 0.4);
  }

  /* ───────── Panel (desktop default) ───────── */
  .qt-panel {
    position: fixed;
    z-index: 50;
    right: 28px;
    bottom: calc(24px + 56px + 14px);
    width: 480px;
    /* Fixed height — prevents the panel from shifting when the task list
       finishes loading. The list section is the flex:1 child that absorbs
       the remaining space and scrolls internally. */
    height: min(640px, calc(100vh - 120px));
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    will-change: transform, opacity;
  }
  :global([data-theme='dark']) .qt-panel,
  :global(html:not([data-theme='light'])) .qt-panel {
    background: linear-gradient(180deg, #16161a 0%, #101012 100%);
  }
  :global([data-theme='light']) .qt-panel {
    background: var(--color-bg-1);
  }

  /* ───────── Panel (mobile bottom-sheet) ───────── */
  @media (max-width: 767px) {
    .qt-bubble {
      bottom: calc(56px + env(safe-area-inset-bottom, 0) + 14px);
      right: 18px;
      width: 52px;
      height: 52px;
    }
  }
  .qt-panel.is-mobile {
    left: 0;
    right: 0;
    top: auto;
    width: auto;
    bottom: calc(56px + env(safe-area-inset-bottom, 0));
    /* Mobile: content-fit height, since the list isn't rendered there. */
    height: auto;
    max-height: 78vh;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    /* Minimalist: thin neutral hairline instead of the red rail. The
       clip-path reveal already gives enough visual continuity with the
       bottom-nav without needing a coloured separator. */
    border-top: 1px solid var(--color-border-strong);
    box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.5);
  }
  :global([data-theme='light']) .qt-panel.is-mobile {
    box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.16);
  }
  /* Drop the red header gradient + divider glow on mobile — too loud
     against the bottom-nav transition. Keeps the brand divider thin. */
  .qt-panel.is-mobile .qt-header {
    background: transparent;
    /* Make room for the grabber handle above the title row. */
    padding-top: 18px;
    position: relative;
    /* Touch hint: drag does pan vertically (handled by JS), so let the OS
       know we're claiming vertical pan to avoid native scroll fighting. */
    touch-action: none;
    cursor: grab;
  }
  .qt-panel.is-mobile .qt-header:active {
    cursor: grabbing;
  }
  .qt-panel.is-mobile .qt-header-divider {
    box-shadow: none;
  }
  /* The visual drag handle — a small horizontal pill centred at the top of
     the mobile header, like an iOS sheet grabber. */
  .qt-grabber {
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--color-border-strong);
    opacity: 0.85;
  }
  /* When the mobile panel is fully hidden (clip 100% and not being
     dragged), drop pointer-events so the page beneath stays interactive. */
  .qt-panel.is-mobile.is-fully-closed {
    pointer-events: none;
  }
  /* On mobile, the bubble should also indicate vertical pan-claim so the
     OS doesn't try to scroll the page when the user starts dragging up. */
  @media (max-width: 767px) {
    .qt-bubble {
      touch-action: none;
    }
  }

  /* ───────── Header ───────── */
  .qt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 14px;
    border-bottom: 1px solid var(--color-border);
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-red) 4%, transparent) 0%,
      transparent 100%
    );
  }
  .qt-header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .qt-header-divider {
    width: 1.5px;
    height: 20px;
    background: var(--color-red);
    box-shadow: 0 0 8px color-mix(in oklab, var(--color-red) 60%, transparent);
  }
  .qt-header h3 {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 700;
    font-style: italic;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    line-height: 1;
    color: var(--color-text);
    margin: 0;
  }
  .qt-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    transition:
      color 0.18s var(--ease-brand),
      border-color 0.18s var(--ease-brand),
      background-color 0.18s var(--ease-brand),
      transform 0.18s var(--ease-brand);
    cursor: pointer;
  }
  .qt-close:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    background: color-mix(in oklab, var(--color-red) 8%, transparent);
  }
  .qt-close:active {
    transform: scale(0.92);
  }

  /* ───────── Quick-add form ───────── */
  .qt-add {
    padding: 16px 14px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .qt-panel.is-mobile .qt-add {
    border-bottom: 0;
    padding-bottom: 18px;
  }
  .qt-input-wrap {
    display: flex;
    align-items: stretch;
    gap: 8px;
  }
  .qt-input {
    flex: 1;
    height: 44px;
    padding: 0 14px;
    background: var(--color-bg-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    font-size: 14px;
    color: var(--color-text);
    outline: none;
    transition:
      border-color 0.18s var(--ease-brand),
      box-shadow 0.22s var(--ease-brand),
      background-color 0.18s var(--ease-brand);
  }
  .qt-input:focus {
    border-color: var(--color-red);
    background: var(--color-bg-2);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-red) 16%, transparent);
  }
  .qt-input::placeholder {
    color: var(--color-text-faint);
  }
  .qt-submit {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-deep) 100%);
    color: #fff;
    border: 0;
    border-radius: var(--radius-btn);
    box-shadow: 0 4px 12px color-mix(in oklab, var(--color-red) 35%, transparent);
    transition:
      transform 0.18s var(--ease-brand),
      box-shadow 0.22s var(--ease-brand),
      opacity 0.18s var(--ease-brand);
    cursor: pointer;
  }
  .qt-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px color-mix(in oklab, var(--color-red) 50%, transparent);
  }
  .qt-submit:active:not(:disabled) {
    transform: scale(0.94);
    transition-duration: 0.08s;
  }
  .qt-submit:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }

  .qt-form-row {
    display: grid;
    grid-template-columns: 70px 1fr;
    align-items: center;
    gap: 10px;
  }
  .qt-form-label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-faint);
  }
  .qt-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .qt-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    /* Smooth colour-only transition — no scale, no glow. The size of the
       chip stays exactly the same across hover / active / selected so the
       label never appears to jump or flicker. */
    transition:
      color 0.2s var(--ease-brand),
      border-color 0.2s var(--ease-brand),
      background-color 0.2s var(--ease-brand);
    cursor: pointer;
  }
  .qt-chip:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
  }
  .qt-chip.is-active {
    color: var(--color-text);
    border-color: var(--color-red);
    background: color-mix(in oklab, var(--color-red) 14%, transparent);
  }
  .qt-chip-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .qt-chip-date {
    padding: 3px 8px;
    position: relative;
  }
  .qt-date-input {
    background: transparent;
    border: 0;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: 9.5px;
    padding: 0;
    outline: none;
    cursor: pointer;
    color-scheme: dark;
    width: 102px;
  }
  :global([data-theme='light']) .qt-date-input {
    color-scheme: light;
  }
  .qt-date-input::-webkit-calendar-picker-indicator {
    opacity: 0.5;
  }

  .qt-assignee-wrap {
    position: relative;
  }
  .qt-assignee {
    width: 100%;
    height: 36px;
    padding: 0 28px 0 12px;
    background: var(--color-bg-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    font-size: 13px;
    color: var(--color-text);
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, var(--color-text-muted) 50%),
      linear-gradient(135deg, var(--color-text-muted) 50%, transparent 50%);
    background-position: calc(100% - 14px) 15px, calc(100% - 9px) 15px;
    background-size: 5px 5px;
    background-repeat: no-repeat;
    transition: border-color 0.18s var(--ease-brand), background-color 0.18s var(--ease-brand);
    cursor: pointer;
  }
  .qt-assignee:hover {
    border-color: var(--color-border-strong);
  }
  .qt-assignee:focus {
    border-color: var(--color-red);
    background-color: var(--color-bg-2);
  }

  /* ───────── List ───────── */
  /* Wraps the list header + scroll area in a flex column so the header
     stays put while only the rows scroll. Critical: min-height:0 lets the
     scroll child shrink below its content size, which is what enables
     overflow: auto inside a flex parent. */
  .qt-list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .qt-list-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--color-border);
  }
  .qt-list-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .qt-section-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-text);
    font-weight: 600;
  }
  .qt-scope {
    display: inline-flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    overflow: hidden;
  }
  .qt-scope-btn {
    padding: 5px 11px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    background: transparent;
    border: 0;
    border-right: 1px solid var(--color-border);
    transition:
      color 0.18s var(--ease-brand),
      background-color 0.22s var(--ease-brand);
    cursor: pointer;
  }
  .qt-scope-btn:last-child {
    border-right: 0;
  }
  .qt-scope-btn:hover {
    color: var(--color-text);
    background: color-mix(in oklab, var(--color-red) 5%, transparent);
  }
  .qt-scope-btn.is-active {
    color: var(--color-text);
    background: color-mix(in oklab, var(--color-red) 14%, transparent);
  }

  .qt-empty {
    padding: 22px 14px 26px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-faint);
  }
  .qt-empty-err {
    color: var(--color-red);
  }
  .qt-rows {
    list-style: none;
    margin: 0;
    padding: 4px 8px 10px;
  }
  .qt-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 10px 10px 16px;
    border-radius: var(--radius-btn);
    transition:
      background-color 0.18s var(--ease-brand),
      opacity 0.18s var(--ease-brand),
      transform 0.18s var(--ease-brand);
  }
  .qt-row:hover {
    background: color-mix(in oklab, var(--color-red) 6%, transparent);
    transform: translateX(2px);
  }
  .qt-row.is-busy {
    opacity: 0.45;
  }
  .qt-row-rail {
    position: absolute;
    left: 6px;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 2px;
  }
  .qt-row-body {
    flex: 1;
    min-width: 0;
  }
  .qt-row-title {
    font-size: 13.5px;
    color: var(--color-text);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .qt-row-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 3px;
  }
  .qt-row-due {
    font-family: var(--font-mono);
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-variant-numeric: tabular-nums;
  }
  .qt-row-due-red {
    color: var(--color-red);
    font-weight: 600;
  }
  .qt-row-due-warning {
    color: var(--color-warning);
    font-weight: 600;
  }
  .qt-row-due-muted {
    color: var(--color-text-faint);
  }
  .qt-row-assignee {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--color-text-muted);
  }
  .qt-avatar-img,
  .qt-avatar-fallback {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .qt-avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-style: italic;
    font-size: 9.5px;
    color: #fff;
    background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-deep) 100%);
  }
  .qt-row-assignee-name {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }
  .qt-row-tag {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    padding: 1px 5px;
    border: 1px solid var(--color-border-strong);
    color: var(--color-text-muted);
    border-radius: 3px;
  }
  .qt-advance {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    transition:
      color 0.18s var(--ease-brand),
      border-color 0.18s var(--ease-brand),
      background-color 0.18s var(--ease-brand),
      transform 0.18s cubic-bezier(0.34, 1.5, 0.64, 1);
    flex-shrink: 0;
    cursor: pointer;
  }
  .qt-advance:hover:not(:disabled) {
    color: var(--color-warning);
    border-color: color-mix(in oklab, var(--color-warning) 50%, transparent);
    background: color-mix(in oklab, var(--color-warning) 12%, transparent);
    transform: scale(1.08);
  }
  .qt-advance:active:not(:disabled) {
    transform: scale(0.92);
    transition-duration: 0.08s;
  }
  .qt-advance:disabled {
    cursor: not-allowed;
  }

  /* ───────── Footer ───────── */
  .qt-footer {
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 12px 14px 14px;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-1);
  }
  :global([data-theme='dark']) .qt-footer,
  :global(html:not([data-theme='light'])) .qt-footer {
    background: rgba(255, 255, 255, 0.02);
  }
  .qt-panel.is-mobile .qt-footer {
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0));
  }
  .qt-footer-link {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-muted);
    text-decoration: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    transition:
      color 0.18s var(--ease-brand),
      border-color 0.18s var(--ease-brand),
      background-color 0.18s var(--ease-brand),
      transform 0.18s var(--ease-brand);
  }
  .qt-footer-link:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    background: color-mix(in oklab, var(--color-text) 4%, transparent);
  }
  .qt-footer-link:active {
    transform: scale(0.98);
  }
  .qt-footer-secondary {
    color: var(--color-red);
    border-color: color-mix(in oklab, var(--color-red) 35%, transparent);
    background: color-mix(in oklab, var(--color-red) 6%, transparent);
  }
  .qt-footer-secondary:hover {
    color: #fff;
    background: var(--color-red);
    border-color: var(--color-red);
  }

  @media (prefers-reduced-motion: reduce) {
    .qt-bubble,
    .qt-chip,
    .qt-row,
    .qt-advance,
    .qt-submit,
    .qt-footer-link {
      transition-duration: 0.1s !important;
    }
  }
</style>
