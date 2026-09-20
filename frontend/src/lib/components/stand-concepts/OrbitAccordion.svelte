<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  let { items, idPrefix }: { items: { question: string; answer: string }[]; idPrefix: string } =
    $props();
  let expanded = $state<number[]>([]);
  let reducedMotion = $state(true);
  const toggle = (index: number) => {
    expanded = expanded.includes(index)
      ? expanded.filter((item) => item !== index)
      : [...expanded, index];
  };
  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotion = preference.matches;
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });
</script>

<div class="faq-list">
  {#each items as item, index}
    {@const isExpanded = expanded.includes(index)}
    <div class="faq-item" class:expanded={isExpanded}>
      <h3>
        <button
          type="button"
          id={idPrefix + '-question-' + index}
          aria-expanded={isExpanded}
          aria-controls={idPrefix + '-answer-' + index}
          onclick={() => toggle(index)}
        >
          <span>{item.question}</span>
          <svg
            class="chevron"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="m5 9 7 7 7-7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        id={idPrefix + '-answer-' + index}
        role="region"
        aria-labelledby={idPrefix + '-question-' + index}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
      >
        {#if isExpanded}
          <div
            class="answer"
            transition:slide={{ duration: reducedMotion ? 0 : 320, easing: cubicOut }}
          >
            <p>{item.answer}</p>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  h3,
  p {
    margin: 0;
  }
  .faq-list {
    min-width: 0;
  }
  .faq-list {
    border-top: 1px solid var(--line);
  }
  .faq-item {
    border-bottom: 1px solid var(--line);
  }
  h3 {
    font: inherit;
  }
  button {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: clamp(25px, 2.5vw, 38px) 2px;
    border: 0;
    background: none;
    color: var(--text);
    font: inherit;
    font-size: clamp(20px, 1.85vw, 28px);
    font-weight: 450;
    letter-spacing: -0.03em;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
  }
  button > span {
    max-width: 38ch;
  }
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 7px;
  }
  .chevron {
    flex-shrink: 0;
    margin-right: 8px;
    color: var(--muted);
    transform-origin: center;
  }
  button:hover .chevron {
    color: var(--text);
  }
  .expanded .chevron {
    transform: rotate(180deg);
    color: var(--text);
  }
  .answer {
    padding: 0 56px 34px 2px;
  }
  .answer > p {
    max-width: 64ch;
    font-size: clamp(15px, 1.2vw, 18px);
    line-height: 1.85;
    color: var(--muted);
  }
  @media (prefers-reduced-motion: no-preference) {
    .chevron {
      transition:
        transform 320ms cubic-bezier(0.2, 0.65, 0.3, 1),
        color 180ms ease;
    }
  }
  @media (max-width: 700px) {
    button {
      font-size: 19px;
      padding-block: 25px;
      gap: 24px;
    }
    .chevron {
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
    .answer {
      padding: 0 30px 28px 2px;
    }
    .answer > p {
      font-size: 14px;
      line-height: 1.8;
    }
  }
</style>
