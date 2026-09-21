<script lang="ts">
  import { PUBLIC_WEBSITE_URL } from '$env/static/public';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import type { VehicleDetailResponse } from '$lib/server/vehicles';
  let {
    vehicle,
    photos = [],
  }: { vehicle: VehicleDetailResponse; photos?: { path: string; url: string }[] } = $props();
  let price = $state('');
  let description = $state('');
  let transmission = $state('');
  let selected = $state<string[]>([]);
  let pending = $state(false);
  let message = $state('');
  let confirmationDialog: HTMLDialogElement;
  let cancelButton: HTMLButtonElement;
  let confirmButton: HTMLButtonElement;
  let publicationForm: HTMLFormElement;
  let confirmationOrigin: HTMLElement | null = null;
  let confirmedWithoutPhoto = false;
  function confirmationKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === cancelButton) {
      event.preventDefault();
      confirmButton.focus();
    } else if (!event.shiftKey && document.activeElement === confirmButton) {
      event.preventDefault();
      cancelButton.focus();
    }
  }
  function cancelConfirmation() {
    confirmedWithoutPhoto = false;
    confirmationDialog.close();
    confirmationOrigin?.focus({ preventScroll: true });
  }
  function confirmPublication() {
    confirmedWithoutPhoto = true;
    confirmationDialog.close();
    publicationForm.requestSubmit();
  }
  const allowedPhotos = $derived(
    vehicle.photos.filter((path) =>
      new RegExp(`^${vehicle.id}/[a-f0-9-]{36}\\.(jpg|jpeg|png|webp)$`).test(path),
    ),
  );
  const eligible = $derived(
    ['AVAILABLE', 'RESERVED'].includes(vehicle.status) && !vehicle.sale && !vehicle.soldDate,
  );
  const ready = $derived(
    eligible && (!price || Number(price) > 0) && description.trim().length > 0,
  );
  $effect(() => {
    price = vehicle.publicSlug ? (vehicle.publicPrice ?? '') : (vehicle.salePrice ?? '');
    description =
      vehicle.publicDescription ?? `${vehicle.brand} ${vehicle.model}, de ${vehicle.year}.`;
    transmission = vehicle.publicTransmission ?? '';
    selected = (
      vehicle.webPublished
        ? vehicle.publicPhotoPaths
        : vehicle.publicPhotoPaths.length
          ? vehicle.publicPhotoPaths
          : allowedPhotos
    ).filter((path) => vehicle.photos.includes(path));
  });
  const submit: import('@sveltejs/kit').SubmitFunction = ({ formData, cancel, submitter }) => {
    if (formData.get('operation') === 'publish' && !formData.getAll('publicPhotoPaths').length) {
      if (!confirmedWithoutPhoto) {
        cancel();
        confirmationOrigin =
          submitter instanceof HTMLElement ? submitter : (document.activeElement as HTMLElement);
        confirmationDialog.showModal();
        cancelButton.focus();
        return;
      }
      formData.set('confirmWithoutPhoto', 'true');
    }
    confirmedWithoutPhoto = false;
    pending = true;
    message = '';
    return async ({ result, update }) => {
      try {
        if (result.type === 'success') {
          await update({ reset: false });
          message = 'Visibilidade no site atualizada.';
          toast.success(message);
        } else {
          message =
            result.type === 'failure'
              ? ((result.data as { error?: string })?.error ?? 'Falha ao atualizar.')
              : 'Não foi possível atualizar.';
          toast.error(message);
        }
      } finally {
        pending = false;
      }
    };
  };
</script>

<section class="web-publication" aria-labelledby="web-publication-title">
  <div class="heading">
    <div>
      <h2 id="web-publication-title">Publicação no website</h2>
      <p>
        {vehicle.webPublished
          ? eligible
            ? vehicle.status === 'RESERVED'
              ? 'Publicada · Reservada'
              : 'Publicada no site'
            : 'Publicação aprovada, mas oculta devido ao estado interno ou venda.'
          : 'Não publicada · visível apenas no CRM'}
      </p>
    </div>
    {#if vehicle.webPublished}<form method="POST" action="?/webPublication" use:enhance={submit}>
        <input type="hidden" name="operation" value="remove" /><button disabled={pending}
          >Remover do site</button
        >
      </form>{/if}
  </div>
  <p class="note">
    Este controlo é independente da disponibilidade interna. Retirar do site não altera o estado nem
    a venda. As viaturas reservadas aparecem com a indicação «Reservada». Guarde primeiro quaisquer
    alterações à ficha interna.
  </p>
  {#if vehicle.webPublished && vehicle.publicSlug && eligible}<a
      href={`${PUBLIC_WEBSITE_URL.replace(/\/$/, '')}/stand-orbit/viaturas/${vehicle.publicSlug}`}
      target="_blank"
      rel="noreferrer">Ver ficha pública ↗</a
    >{/if}
  <form method="POST" action="?/webPublication" use:enhance={submit} bind:this={publicationForm}>
    <input type="hidden" name="operation" value="publish" />
    <div class="fields">
      <label
        >Preço público (€)<input
          name="publicPrice"
          type="number"
          min="0.01"
          max="9999999999.99"
          step="0.01"
          bind:value={price}
        /></label
      >
      <label
        >Transmissão<select name="publicTransmission" bind:value={transmission}
          ><option value="">Não indicada</option><option value="MANUAL">Manual</option><option
            value="AUTOMATIC">Automática</option
          ></select
        ></label
      >
    </div>
    <label
      >Descrição pública<textarea
        name="publicDescription"
        rows="3"
        maxlength="6000"
        required
        bind:value={description}
      ></textarea></label
    >
    <p class="note">
      Apenas este texto será publicado. Não inclua notas internas, matrícula, VIN ou dados pessoais.
      O preço público é aprovado separadamente do preço interno.
    </p>
    <fieldset>
      <legend>Fotografias autorizadas para o site</legend>
      {#each allowedPhotos as path, index}<label class="photo-choice"
          ><input
            type="checkbox"
            name="publicPhotoPaths"
            value={path}
            bind:group={selected}
          />{#if photos.find((photo) => photo.path === path)}<img
              src={photos.find((photo) => photo.path === path)!.url}
              alt=""
            />{/if}<span>Fotografia {index + 1}</span></label
        >{:else}<p>Sem fotografias associadas. O site mostrará «Imagem indisponível».</p>{/each}
    </fieldset>
    <div class="requirements" aria-live="polite">
      {#if !eligible}<p>
          Requer estado Disponível ou Reservado, sem venda registada.
        </p>{/if}{#if !price}<p>
          Sem preço indicado, o site mostrará «Preço sob consulta».
        </p>{:else if !(Number(price) > 0)}<p>
          Indique um preço positivo ou deixe o campo vazio.
        </p>{/if}{#if !description.trim()}<p>
          Falta uma descrição pública.
        </p>{/if}{#if !selected.length}<p>
          Sem fotografia selecionada, será pedida confirmação para publicar com «Imagem
          indisponível».
        </p>{/if}
    </div>
    <button class="primary" disabled={pending || !ready}
      >{pending
        ? 'A guardar…'
        : vehicle.webPublished
          ? 'Guardar publicação'
          : 'Publicar no site'}</button
    >
  </form>
  <p role="status" aria-live="polite">{message}</p>
</section>

<dialog
  class="publication-dialog"
  bind:this={confirmationDialog}
  aria-labelledby="publication-confirm-title"
  aria-describedby="publication-confirm-description"
  onkeydown={confirmationKeydown}
  oncancel={(event) => {
    event.preventDefault();
    cancelConfirmation();
  }}
  onclose={() => confirmationOrigin?.focus({ preventScroll: true })}
>
  <h2 id="publication-confirm-title">Publicar sem fotografia?</h2>
  <p id="publication-confirm-description">
    Esta viatura ficará visível no site com uma imagem indisponível até adicionar fotografias.
  </p>
  <div class="confirmation-actions">
    <button type="button" bind:this={cancelButton} onclick={cancelConfirmation}>Cancelar</button
    ><button type="button" class="primary" bind:this={confirmButton} onclick={confirmPublication}
      >Publicar mesmo assim</button
    >
  </div>
</dialog>

<style>
  .publication-dialog {
    width: min(460px, calc(100vw - 32px));
    max-height: calc(100svh - 40px);
    overflow: auto;
    margin: auto;
    padding: 26px;
    color: var(--color-text);
    background: var(--color-bg-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    box-shadow: 0 20px 60px #0006;
  }
  .publication-dialog::backdrop {
    background: #0008;
    backdrop-filter: blur(2px);
  }
  .publication-dialog p {
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-text-muted);
    margin: 16px 0 24px;
  }
  .confirmation-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }
  .web-publication {
    padding: 24px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    background: var(--color-bg-1);
  }
  .heading {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 20px;
  }
  h2 {
    font-size: 19px;
    font-weight: 600;
    margin: 0 0 6px;
  }
  .note {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 15px 0;
  }
  a {
    text-decoration: underline;
    font-size: 13px;
  }
  form {
    margin-top: 20px;
  }
  .heading form {
    margin: 0;
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  label {
    display: grid;
    gap: 7px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  input:not([type='checkbox']),
  select,
  textarea {
    width: 100%;
    background: var(--color-bg-0);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 10px;
    border-radius: var(--radius-btn);
  }
  fieldset {
    border: 1px solid var(--color-border);
    padding: 14px;
    margin: 20px 0;
  }
  legend {
    font-size: 13px;
    padding: 0 5px;
  }
  .photo-choice {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin: 6px 18px 6px 0;
    cursor: pointer;
    min-height: 44px;
  }
  .photo-choice img {
    width: 76px;
    height: 52px;
    object-fit: cover;
  }
  .requirements {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-bottom: 14px;
  }
  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    padding: 10px 16px;
    border-radius: var(--radius-btn);
    cursor: pointer;
    font-size: 13px;
  }
  .primary {
    background: var(--color-red);
    color: white;
  }
  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  :is(button, input, select, textarea, a):focus-visible {
    outline: 2px solid var(--color-text);
    outline-offset: 3px;
  }
  @media (max-width: 600px) {
    .fields {
      grid-template-columns: 1fr;
    }
    .heading {
      flex-direction: column;
    }
    .web-publication {
      padding: 18px;
    }
  }
</style>
