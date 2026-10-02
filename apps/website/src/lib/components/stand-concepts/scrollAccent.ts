const smooth = (value: number) => {
  const p = Math.min(1, Math.max(0, value));
  return p * p * (3 - 2 * p);
};

/** The same viewport timing and text-light segment used by OrbitPerspective. */
export function scrollAccent(top: number, viewportHeight: number, width: number) {
  const travel = Math.max(1, viewportHeight * 0.84);
  const journey = (viewportHeight * 0.92 - top) / travel;
  const progress = smooth(journey);
  const lightProgress = smooth(journey - 25 / travel);
  const segmentStart = Math.max(0, lightProgress * 2 - 1) * width;
  const segmentEnd = Math.min(1, lightProgress * 2) * width;
  const segmentWidth = segmentEnd - segmentStart;
  // Subpixel tails can survive clipping and be amplified by the glow filter.
  const visibleLineWidth = Math.max(0, 1 - Math.abs(progress * 2 - 1)) * width;
  return {
    lineSweep: progress * 2,
    segmentStart,
    segmentEnd,
    lightInset: Math.min(24, segmentWidth / 2),
    accentLight: segmentWidth < 1 ? 0 : smooth(segmentWidth / 20),
    lineVisible: visibleLineWidth >= 1,
  };
}
