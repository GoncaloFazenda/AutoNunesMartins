<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Check, ChevronDown } from 'lucide-svelte';

  let {
    id,
    label,
    name,
    value,
    options,
    onChange,
    describedBy,
    hideLabel = false,
    subtle = false,
  }: {
    id: string;
    label: string;
    name?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    describedBy?: string;
    hideLabel?: boolean;
    subtle?: boolean;
  } = $props();
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let list = $state<HTMLDivElement>();
  let open = $state(false);
  let active = $state(0);
  let above = $state(false);
  let maxHeight = $state(280);
  let typed = '';
  let lastTyped = 0;
  const selected = $derived(options.findIndex((option) => option.value === value));
  const text = $derived(options[selected]?.label ?? options[0]?.label ?? 'Selecionar');

  // External resets and dependent option changes must not leave a stale popup open.
  $effect(() => {
    value;
    options;
    open = false;
  });

  function position() {
    const bounds = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const bottom = top + (viewport?.height ?? window.innerHeight);
    const below = bottom - bounds.bottom - 16;
    const over = bounds.top - top - 16;
    above = below < Math.min(280, options.length * 44 + 12) && over > below;
    maxHeight = Math.max(44, Math.min(280, above ? over : below));
  }
  async function reveal(index = Math.max(0, selected)) {
    if (!options.length) return;
    position();
    active = index;
    open = true;
    await tick();
    scrollActive();
  }
  function scrollActive() {
    const option = list?.children[active] as HTMLElement | undefined;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }
  async function move(index: number) {
    active = Math.min(options.length - 1, Math.max(0, index));
    await tick();
    scrollActive();
  }
  function commit(index = active, focus = true) {
    const option = options[index];
    open = false;
    if (focus) trigger.focus({ preventScroll: true });
    if (option && option.value !== value) onChange(option.value);
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      open = false;
      return;
    }
    if (event.key === 'Tab') {
      if (open) commit(active, false);
      return; // Preserve native Tab / Shift+Tab navigation, never trap focus.
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) commit();
      else void reveal();
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const index =
        event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, selected);
      if (!open) void reveal(index);
      else
        void move(
          event.key === 'Home' || event.key === 'End'
            ? index
            : active + (event.key === 'ArrowDown' ? 1 : -1),
        );
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      typed = now - lastTyped > 700 ? event.key : typed + event.key;
      lastTyped = now;
      const normalize = (text: string) =>
        text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
      const query = normalize(typed);
      const repeated = [...query].every((letter) => letter === query[0]);
      const start = open ? active : selected;
      const candidates = options.map(
        (_, index) => (Math.max(0, start) + 1 + index) % options.length,
      );
      const index = candidates.find((index) =>
        normalize(options[index]!.label).startsWith(repeated ? query[0]! : query),
      );
      if (index !== undefined) {
        if (!open) void reveal(index);
        else void move(index);
      }
    }
  }
  onMount(() => {
    const outside = (event: Event) => {
      if (open && event.target instanceof Node && !root.contains(event.target)) open = false;
    };
    const reposition = () => {
      if (open) position();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    window.visualViewport?.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      window.visualViewport?.removeEventListener('resize', reposition);
    };
  });
</script>

<div class="orbit-select" class:open class:subtle bind:this={root}>
  <label for={id} class:sr-only={hideLabel}>{label}</label>
  {#if name}<input type="hidden" {name} {value} />{/if}
  <button
    {id}
    type="button"
    role="combobox"
    bind:this={trigger}
    class="select-trigger"
    aria-label={label}
    aria-expanded={open}
    aria-controls={`${id}-list`}
    aria-haspopup="listbox"
    aria-activedescendant={open ? `${id}-option-${active}` : undefined}
    aria-describedby={describedBy}
    disabled={!options.length}
    onclick={() => {
      if (open) open = false;
      else void reveal();
    }}
    onkeydown={keydown}
  >
    <span>{text}</span><ChevronDown size={15} aria-hidden="true" />
  </button>
  {#if open}<div
      id={`${id}-list`}
      role="listbox"
      aria-label={label}
      class="select-list"
      class:above
      bind:this={list}
      style={`max-height:${maxHeight}px`}
    >
      {#each options as option, index (option.value)}
        <button
          type="button"
          role="option"
          id={`${id}-option-${index}`}
          tabindex="-1"
          aria-selected={option.value === value}
          class:highlighted={active === index}
          onpointerdown={(event) => {
            if (event.pointerType === 'mouse') event.preventDefault();
          }}
          onclick={() => commit(index)}
          onkeydown={keydown}
        >
          <span>{option.label}</span>{#if option.value === value}<Check
              size={14}
              aria-hidden="true"
            />{/if}
        </button>
      {/each}
    </div>{/if}
</div>

<style>
  .orbit-select {
    position: relative;
    min-width: 0;
    width: 100%;
    display: grid;
    gap: 8px;
  }
  .orbit-select.open {
    z-index: 30;
  }
  * {
    box-sizing: border-box;
  }
  label {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text);
  }
  button {
    font: inherit;
    color: var(--text);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    padding: 10px 11px;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--surface);
    text-align: left;
    font-size: 13px;
    line-height: 1.5;
    transition: border-color 140ms;
  }
  .select-trigger > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .select-trigger :global(svg) {
    flex-shrink: 0;
    color: var(--muted);
    transition: transform 140ms;
  }
  .open .select-trigger {
    border-color: var(--muted);
  }
  .open .select-trigger :global(svg) {
    transform: rotate(180deg);
  }
  .select-trigger:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 3px;
  }
  .select-trigger:disabled {
    cursor: default;
    opacity: 0.5;
  }
  .select-list {
    position: absolute;
    z-index: 1;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 5px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--surface);
    box-shadow: 0 12px 28px #0003;
  }
  .select-list.above {
    top: auto;
    bottom: calc(44px + 6px);
  }
  .select-list button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 2px;
    padding: 10px 11px;
    background: transparent;
    text-align: left;
    font-size: 13px;
    line-height: 1.5;
  }
  .select-list button > span {
    overflow-wrap: anywhere;
    min-width: 0;
  }
  .select-list button :global(svg) {
    flex-shrink: 0;
    color: var(--red);
  }
  .select-list button[aria-selected='true'] {
    font-weight: 600;
  }
  .select-list button.highlighted {
    background: var(--line);
    box-shadow: inset 2px 0 var(--red);
  }
  @media (hover: hover) {
    .select-trigger:hover {
      border-color: var(--muted);
    }
    .select-list button:hover {
      background: var(--line);
    }
  }
  .subtle label {
    font-size: 11px;
    color: var(--muted);
  }
  .subtle .select-trigger {
    background: transparent;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .select-trigger,
    .select-trigger :global(svg) {
      transition: none;
    }
  }
</style>
