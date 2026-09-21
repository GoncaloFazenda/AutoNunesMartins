<script lang="ts">
  import { Trash2 } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import TaskForm from '$lib/components/task/TaskForm.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const t = $derived(data.task);

  const initial = $derived({
    title: t.title,
    description: t.description ?? '',
    status: t.status,
    priority: t.priority,
    assigneeId: t.assigneeId,
    startDate: t.startDate,
    dueDate: t.dueDate,
    reminderDate: t.reminderDate,
    recurrence: t.recurrence,
  });

  let deleting = $state(false);
</script>

<svelte:head>
  <title>Editar {t.title} · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Editar " accent={t.title} size="md" />
    {#if t.recurrenceParentId}
      <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-red)]">
        Ocorrência recorrente desta tarefa
      </p>
    {/if}
  </div>

  <Panel>
    <div class="p-6">
      <TaskForm
        {initial}
        users={data.users}
        currentUserId={data.currentUser?.id ?? null}
        submitLabel="Guardar alterações"
      >
        {#snippet extraActions()}
          <form
            method="POST"
            action="?/delete"
            use:enhance={({ cancel }) => {
              if (!window.confirm(`Eliminar a tarefa "${t.title}"?`)) {
                cancel();
                return;
              }
              deleting = true;
              return async ({ result }) => {
                deleting = false;
                if (result.type === 'redirect') {
                  toast.success('Tarefa eliminada.');
                } else if (result.type === 'failure') {
                  toast.error(
                    (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                  );
                }
              };
            }}
          >
            <button
              type="submit"
              disabled={deleting}
              class="inline-flex items-center gap-2 px-3 h-10 border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] text-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_10%,transparent)] font-mono uppercase tracking-[0.12em] text-[11px] transition-colors disabled:opacity-50"
              style="border-radius: var(--radius-btn);"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Eliminar
            </button>
          </form>
        {/snippet}
      </TaskForm>
    </div>
  </Panel>
</section>
