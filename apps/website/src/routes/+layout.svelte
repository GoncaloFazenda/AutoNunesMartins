<script lang="ts">
  import '../app.css';
  import WhatsAppContact from '$lib/components/WhatsAppContact.svelte';
  import { onMount, setContext, tick } from 'svelte';
  import { afterNavigate, beforeNavigate, goto, pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import { installAnchorNavigation } from '$lib/anchorNavigation';
  let anchors: ReturnType<typeof installAnchorNavigation> | undefined;
  beforeNavigate(() => anchors?.stop());
  afterNavigate(({ type, to }) => { if (to) anchors?.afterNavigate(type, to.url); });
  import { comparisonContext, createComparison, COMPARISON_KEY } from '$lib/comparison';
  import { createFavorites, favoritesContext, FAVORITES_KEY } from '$lib/favorites';
  import { createNotifications, notificationContext } from '$lib/notifications';
  import NotificationHost from '$lib/components/NotificationHost.svelte';
  const notifications = createNotifications();
  setContext(notificationContext, notifications);
  const comparison = createComparison(notifications.push);
  setContext(comparisonContext, comparison);
  const favorites = createFavorites(notifications.push);
  setContext(favoritesContext, favorites);
  const { ids: comparisonIds } = comparison;
  $effect(() => {
    if ($comparisonIds.length < 2) notifications.invalidateActions('comparison', { label: 'Ver seleção', href: '/comparar' });
  });
  onMount(() => {
    // Keep focus until the anchor arrives; Kit's hash focus fallback otherwise emits a synthetic popstate.
    anchors = installAnchorNavigation({ tick, push: url => pushState(url, $page.state), navigate: url => goto(url, { noScroll: true, keepFocus: true }) });
    comparison.initialize(() => localStorage, () => sessionStorage);
    favorites.initialize(() => localStorage);
    const sync = (event: StorageEvent) => {
      try { if (event.storageArea !== localStorage) return; } catch { return; }
      if (event.key === COMPARISON_KEY || event.key === null) comparison.sync(event.newValue);
      if (event.key === FAVORITES_KEY || event.key === null) favorites.sync(event.newValue);
    };
    window.addEventListener('storage', sync);
    return () => { anchors?.destroy(); window.removeEventListener('storage', sync); notifications.destroy(); };
  });
  let { children }: { children: import('svelte').Snippet } = $props();
</script>

{@render children()}
<WhatsAppContact />
<NotificationHost />
