const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Progress uses the same sticky top and element height as the actual layout. */
export function sceneProgress(
  top: number,
  sectionHeight: number,
  viewport: number,
  pinHeight: number | null,
  pinTop = 0,
) {
  const through = clamp((viewport - top) / Math.max(1, viewport + sectionHeight));
  const enter = clamp((viewport * 0.82 - top) / Math.max(1, viewport * 0.52));
  if (pinHeight === null) return { through, enter, pinned: 0 };
  const range = sectionHeight - pinHeight;
  const pinned = range > 1 ? clamp((pinTop - top) / range) : 0;
  return { through, enter, pinned };
}

export function chapterProgress(progress: number, start: number, end: number) {
  return clamp((progress - start) / Math.max(0.001, end - start));
}

/** Unpinned scenes finish opening when their centre reaches the viewport centre. */
export function approachProgress(top: number, sectionHeight: number, viewport: number) {
  return clamp((viewport * 0.94 - top) / Math.max(1, viewport * 0.44 + sectionHeight / 2));
}
