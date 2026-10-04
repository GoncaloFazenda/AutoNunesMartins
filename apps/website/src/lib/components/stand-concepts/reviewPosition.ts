/** Smallest horizontal movement that puts a complete card inside the faded edges. */
export function reviewRevealOffset(left: number, right: number, viewportLeft: number, viewportRight: number, inset: number) {
  if (left < viewportLeft + inset) return viewportLeft + inset - left;
  if (right > viewportRight - inset) return viewportRight - inset - right;
  return 0;
}
