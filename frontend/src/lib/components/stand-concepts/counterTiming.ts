export const COUNTER_DURATION = 1800;

/** Fast initial count with the same deceleration profile as the local stand reference. */
export function counterValue(target: number, progress: number) {
  const time = Math.min(1, Math.max(0, progress));
  return Math.floor(target * (1 - (1 - time) ** 3));
}
