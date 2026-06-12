/** Pure helpers for compositing + cutout sanity checks (unit-tested). */

export const MARGIN_MIN = 2;
export const MARGIN_MAX = 15;
export const MARGIN_DEFAULT = 6;

/** Clamp a margin percentage to the supported 2–15% range. */
export function clampMargin(pct: number): number {
  if (Number.isNaN(pct)) return MARGIN_DEFAULT;
  return Math.min(MARGIN_MAX, Math.max(MARGIN_MIN, pct));
}

/** Inner box (in px) the subject may occupy for a given margin percentage. */
export function marginBox(
  targetW: number,
  targetH: number,
  marginPct: number
): { boxW: number; boxH: number } {
  const m = clampMargin(marginPct) / 100;
  return { boxW: targetW * (1 - m * 2), boxH: targetH * (1 - m * 2) };
}

/**
 * Fraction of pixels with meaningful alpha (> 8/255) in RGBA image data.
 * Used to detect near-empty cutouts that would export as blank white JPEGs.
 */
export function alphaCoverage(data: Uint8ClampedArray | number[]): number {
  const pixels = Math.floor(data.length / 4);
  if (pixels === 0) return 0;
  let covered = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 8) covered += 1;
  }
  return covered / pixels;
}

/** Below this coverage the cutout is flagged "Check this one" instead of Done. */
export const NEAR_EMPTY_THRESHOLD = 0.005;

export function isNearEmpty(coverage: number): boolean {
  return coverage < NEAR_EMPTY_THRESHOLD;
}
