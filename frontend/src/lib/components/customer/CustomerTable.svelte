<script lang="ts">
  import { Phone, Mail, MoreHorizontal, User as UserIcon } from 'lucide-svelte';
  import { formatDate } from '$lib/utils/format';
  import type { CustomerListItem } from '$lib/server/customers';

  interface Props {
    items: CustomerListItem[];
  }

  let { items }: Props = $props();
</script>

<div class="overflow-x-auto">
  <table class="w-full text-[13px]">
    <thead>
      <tr class="border-b border-[var(--color-border)]">
        <th
          class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Cliente
        </th>
        <th
          class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          NIF
        </th>
        <th
          class="text-left px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Contacto
        </th>
        <th
          class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Compras
        </th>
        <th
          class="text-right px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Último contacto
        </th>
        <th class="w-10"></th>
      </tr>
    </thead>
    <tbody>
      {#each items as c (c.id)}
        <tr
          class="border-b border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
        >
          <td class="px-4 py-3">
            <a href={`/clientes/${c.id}`} class="flex items-center gap-3">
              <div
                class="h-11 w-11 flex items-center justify-center bg-[var(--color-bg-2)] border border-[var(--color-border)] flex-shrink-0"
                style="border-radius: var(--radius-btn);"
              >
                <UserIcon class="h-5 w-5 text-[var(--color-red)]" />
              </div>
              <div class="min-w-0">
                <div
                  class="font-display font-bold italic text-[15px] truncate group-hover:text-[var(--color-red)] transition-colors"
                >
                  {c.name}
                </div>
                {#if c.address}
                  <div
                    class="text-[11px] text-[var(--color-text-faint)] truncate max-w-[280px]"
                  >
                    {c.address}
                  </div>
                {/if}
              </div>
            </a>
          </td>
          <td class="px-4 py-3 num-value text-[12.5px]">{c.nif}</td>
          <td class="px-4 py-3">
            <div class="flex flex-col gap-0.5">
              <span class="flex items-center gap-1.5 text-[12px]">
                <Phone class="h-3 w-3 text-[var(--color-text-faint)]" />
                <span class="font-mono">{c.phone}</span>
              </span>
              {#if c.email}
                <span
                  class="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]"
                >
                  <Mail class="h-3 w-3 text-[var(--color-text-faint)]" />
                  {c.email}
                </span>
              {/if}
            </div>
          </td>
          <td class="px-4 py-3 text-right">
            <span class="num-value text-[18px]">
              {c._count.sales}
            </span>
          </td>
          <td class="px-4 py-3 font-mono text-[11px] text-right text-[var(--color-text-muted)]">
            {c.lastContactDate ? formatDate(c.lastContactDate) : '—'}
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="text-[var(--color-text-faint)] hover:text-[var(--color-text)] p-1"
              aria-label="Mais opções"
            >
              <MoreHorizontal class="h-4 w-4" />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
