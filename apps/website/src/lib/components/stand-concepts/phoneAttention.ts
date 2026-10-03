const INTERVAL = 180_000;

export function startPhoneAttention(options: {
  eligible: () => boolean;
  ring: () => boolean;
}) {
  const timer = setInterval(() => {
    if (options.eligible()) options.ring();
  }, INTERVAL);
  return { destroy() { clearInterval(timer); } };
}
export function ringPhone(icon: SVGElement | null): boolean {
  if (!icon || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      icon.getAnimations().some((animation) => animation.playState === 'running')) return false;
  icon.animate(
    [0, -16, 12, -8, 4, 0].map((angle) => ({ transform: `rotate(${angle}deg)` })),
    { duration: 520, easing: 'ease-in-out' },
  );
  return true;
}

export function phoneAttention(node: HTMLAnchorElement) {
  const attention = startPhoneAttention({
    ring: () => ringPhone(node.querySelector('svg')),
    eligible: () => {
      if (document.visibilityState !== 'visible' || !document.hasFocus() ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          document.activeElement?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]') ||
          node.closest('[inert]')) return false;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight ||
          rect.right <= 0 || rect.left >= innerWidth) return false;
      for (let element: Element | null = node; element; element = element.parentElement) {
        const style = getComputedStyle(element);
        if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) < .1) return false;
      }
      return true;
    },
  });
  return { destroy() { attention.destroy(); } };
}
