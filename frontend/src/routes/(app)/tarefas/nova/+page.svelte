<script lang="ts">
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import TaskForm from '$lib/components/task/TaskForm.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Nova Tarefa · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Nova" accent=" Tarefa" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      Criar nova entrada no quadro
    </p>
  </div>

  <Panel>
    <div class="p-6">
      <TaskForm
        users={data.users}
        currentUserId={data.currentUser?.id ?? null}
        submitLabel="Criar Tarefa"
      />
    </div>
  </Panel>
</section>
