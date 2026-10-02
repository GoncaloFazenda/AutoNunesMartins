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

/** Keep the hero's resting pose, then rotate gently during ordinary document scroll.
 * Unlike pinned scenes, this progress never holds the hero in the viewport.
 * The parser-time equivalent lives in static/orbit-startup.js.
 */
export function heroScrollProgress(
  top: number,
  documentTop: number,
  stageHeight: number,
  viewport: number,
) {
  const resting = clamp((Math.max(0, (viewport - stageHeight) / 2) - documentTop) / Math.max(1, viewport * 0.04));
  const travel = Math.max(1, Math.min(stageHeight * 0.75, viewport * 0.6));
  return resting + (1 - resting) * clamp((documentTop - top) / travel);
}

/** Preserve the approved resting frame in document coordinates.
 * Only the dash travels during scroll; its track must not acquire a second vertical motion.
 * Passing zero scroll retains the original tablet/mobile frame.
 * Keep the parser-time equivalent in static/orbit-startup.js in sync.
 */
export function heroAccentFrame(
  sectionTop: number,
  sectionHeight: number,
  stageTop: number,
  stageHeight: number,
  viewport: number,
  scroll = 0,
) {
  const range = Math.max(0, sectionHeight - stageHeight);
  const pinTop = Math.max(0, (viewport - stageHeight) / 2);
  const documentTop = sectionTop + scroll;
  const travel = Math.min(range, Math.max(0, pinTop - documentTop));
  return {
    shift: sectionTop + travel - stageTop,
    progress: range > 1 ? clamp((pinTop - documentTop) / range) : 0,
  };
}

/** Unpinned scenes finish opening when their centre reaches the viewport centre. */
export function approachProgress(top: number, sectionHeight: number, viewport: number) {
  return clamp((viewport * 0.94 - top) / Math.max(1, viewport * 0.44 + sectionHeight / 2));
}
