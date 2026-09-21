<script lang="ts">
  import { Camera, Plus, Star, Trash2, Upload } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';

  interface SignedPhoto {
    path: string;
    url: string;
  }

  interface Props {
    vehicleId: string;
    photos: SignedPhoto[];
  }

  let { vehicleId, photos }: Props = $props();
  // All photo ops go through SvelteKit proxy endpoints so the user's Clerk
  // session is forwarded server-side as a Bearer token to the Express backend.
  const apiBase = $derived(`/viaturas/${vehicleId}/photos`);

  let uploading = $state(false);
  let activeIndex = $state(0);

  async function uploadFiles(files: FileList) {
    if (files.length === 0) return;
    uploading = true;
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: ficheiro maior que 5 MB.`);
          continue;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name}: formato não suportado.`);
          continue;
        }

        // Step 1: ask backend for a signed upload URL
        const urlRes = await fetch(`${apiBase}/upload-url`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!urlRes.ok) {
          toast.error(`Falha ao obter URL de upload (${urlRes.status}).`);
          continue;
        }
        const { path, uploadUrl } = (await urlRes.json()) as {
          path: string;
          uploadUrl: string;
          token: string;
        };

        // Step 2: PUT the file to Supabase Storage via the signed URL
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': file.type },
          body: file,
        });
        if (!putRes.ok) {
          toast.error(`Falha no upload (${putRes.status}).`);
          continue;
        }

        // Step 3: persist the path on the Vehicle
        const persistRes = await fetch(apiBase, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ path }),
        });
        if (!persistRes.ok) {
          toast.error(`Falha ao guardar foto (${persistRes.status}).`);
        }
      }
      toast.success('Fotos carregadas.');
      await invalidateAll();
    } finally {
      uploading = false;
    }
  }

  async function setPrimary(path: string) {
    const next = [path, ...photos.filter((p) => p.path !== path).map((p) => p.path)];
    const res = await fetch(`${apiBase}/reorder`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photos: next }),
    });
    if (res.ok) {
      activeIndex = 0;
      await invalidateAll();
      toast.success('Foto definida como principal.');
    } else {
      toast.error('Falha ao reordenar.');
    }
  }

  async function deletePhoto(path: string) {
    if (!window.confirm('Eliminar esta foto?')) return;
    const res = await fetch(`${apiBase}/${encodeURIComponent(path)}`, { method: 'DELETE' });
    if (res.ok) {
      await invalidateAll();
      toast.success('Foto eliminada.');
    } else {
      toast.error('Falha ao eliminar.');
    }
  }

  function pickFile(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      void uploadFiles(target.files);
      target.value = '';
    }
  }

  const primary = $derived(photos[activeIndex] ?? photos[0] ?? null);
</script>

<section
  class="overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-1)]"
  style="border-radius: var(--radius-card);"
>
  <PanelHeader icon={Camera} title="Fotografias" meta={`${photos.length} / 20`}>
    {#snippet actions()}
      <label
        class="inline-flex items-center gap-1.5 px-3 h-8 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] font-mono text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-colors {uploading
          ? 'opacity-50 pointer-events-none'
          : ''}"
        style="border-radius: var(--radius-btn);"
      >
        {#if uploading}
          <span
            class="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
          ></span>
        {:else}
          <Upload class="h-3.5 w-3.5" />
        {/if}
        Carregar
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onchange={pickFile}
          class="hidden"
        />
      </label>
    {/snippet}
  </PanelHeader>

  {#if photos.length === 0}
    <div class="aspect-[16/10] flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-2)]">
      <Camera class="h-8 w-8 text-[var(--color-text-faint)]" />
      <span
        class="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]"
      >
        Sem fotografias · carregar acima
      </span>
    </div>
  {:else}
    <!-- Primary photo -->
    <div class="aspect-[16/10] bg-[var(--color-bg-2)] overflow-hidden">
      {#if primary}
        <img
          src={primary.url}
          alt="Foto principal"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      {/if}
    </div>

    <!-- Thumbnail strip -->
    <div class="flex gap-2 p-3 overflow-x-auto border-t border-[var(--color-border)]">
      {#each photos as p, i (p.path)}
        {@const isActive = i === activeIndex}
        {@const isPrimary = i === 0}
        <div class="relative flex-shrink-0">
          <button
            type="button"
            onclick={() => (activeIndex = i)}
            class="block h-16 w-24 overflow-hidden border-2 transition-colors {isActive
              ? 'border-[var(--color-red)]'
              : 'border-transparent hover:border-[var(--color-border-strong)]'}"
            style="border-radius: 4px;"
          >
            <img src={p.url} alt="Miniatura" class="h-full w-full object-cover" loading="lazy" />
          </button>
          {#if isPrimary}
            <span
              class="absolute top-0.5 left-0.5 px-1 py-0.5 bg-[var(--color-red)] text-white font-mono text-[8px] uppercase tracking-[0.15em]"
              style="border-radius: 2px;"
            >
              Principal
            </span>
          {/if}
          <div class="absolute bottom-0.5 right-0.5 flex gap-0.5">
            {#if !isPrimary}
              <button
                type="button"
                onclick={() => setPrimary(p.path)}
                title="Definir como principal"
                class="bg-black/60 hover:bg-[var(--color-red)] text-white p-1"
                style="border-radius: 2px;"
              >
                <Star class="h-3 w-3" />
              </button>
            {/if}
            <button
              type="button"
              onclick={() => deletePhoto(p.path)}
              title="Eliminar"
              class="bg-black/60 hover:bg-[var(--color-red)] text-white p-1"
              style="border-radius: 2px;"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      {/each}
      <label
        class="flex-shrink-0 flex items-center justify-center h-16 w-24 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] cursor-pointer transition-colors {uploading
          ? 'opacity-50 pointer-events-none'
          : ''}"
        style="border-radius: 4px;"
      >
        <Plus class="h-5 w-5 text-[var(--color-text-faint)]" />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onchange={pickFile}
          class="hidden"
        />
      </label>
    </div>
  {/if}
</section>
