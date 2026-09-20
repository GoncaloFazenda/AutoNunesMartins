<script lang="ts">
  import Button from './Button.svelte';
  import { AlertTriangle } from 'lucide-svelte';

  interface Props {
    /** When true the dialog is shown. Two-way bound by the caller. */
    open: boolean;
    title?: string;
    /** Body text. Use the message snippet for richer content. */
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** "danger" gives the confirm button a red treatment; default is neutral. */
    tone?: 'danger' | 'default';
    /** Disable the confirm button while an async action runs. */
    busy?: boolean;
    onconfirm: () => void;
    oncancel?: () => void;
  }

  let {
    open = $bindable(),
    title = 'Confirmar',
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    tone = 'default',
    busy = false,
    onconfirm,
    oncancel,
  }: Props = $props();

  let dialogEl: HTMLDialogElement | undefined = $state();

  // Sync the native <dialog>'s open state with the bound prop. showModal()
  // gives us the backdrop + focus trap; close() returns control to the page.
  $effect(() => {
    if (!dialogEl) return;
    if (open && !dialogEl.open) dialogEl.showModal();
    else if (!open && dialogEl.open) dialogEl.close();
  });

  function handleCancel() {
    open = false;
    oncancel?.();
  }

  function handleConfirm() {
    if (busy) return;
    onconfirm();
  }
</script>

<!--
  Native <dialog> gives us a real modal with backdrop and ESC-to-close for free.
  The form[method=dialog] inside intercepts ESC so we route it through
  handleCancel — that way bound state stays in sync.
-->
<dialog
  bind:this={dialogEl}
  onclose={handleCancel}
  class="confirm-dialog"
>
  <div class="px-6 pt-6 pb-5 max-w-md">
    <div class="flex items-start gap-3">
      {#if tone === 'danger'}
        <div
          class="flex-shrink-0 h-9 w-9 inline-flex items-center justify-center border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] bg-[color-mix(in_oklab,var(--color-red)_10%,transparent)] text-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        >
          <AlertTriangle class="h-4 w-4" />
        </div>
      {/if}
      <div class="min-w-0">
        <h2
          class="font-display font-bold italic text-[18px] tracking-[-0.01em] text-[var(--color-text)]"
        >
          {title}
        </h2>
        {#if message}
          <p class="mt-1.5 text-[13.5px] leading-snug text-[var(--color-text-muted)]">
            {message}
          </p>
        {/if}
      </div>
    </div>

    <div class="mt-5 flex items-center justify-end gap-2">
      <Button variant="ghost" onclick={handleCancel} disabled={busy}>
        {cancelLabel}
      </Button>
      <Button
        variant={tone === 'danger' ? 'danger' : 'primary'}
        onclick={handleConfirm}
        loading={busy}
        disabled={busy}
      >
        {confirmLabel}
      </Button>
    </div>
  </div>
</dialog>

<style>
  .confirm-dialog {
    padding: 0;
    border: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
    color: var(--color-text);
    border-radius: var(--radius-card);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  }
  .confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
  }
</style>
