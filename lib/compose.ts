/** Pure helpers for compositing + cutout sanity checks (unit-tested). */

/* ---------------------------------------------------------------------------
 * Background-mode helpers (round 5: White | Color | Transparent export).
 * No React / DOM dependencies — pure functions, fully unit-testable.
 * ------------------------------------------------------------------------- */

export type BgMode = "white" | "color" | "transparent";

/* ---------------------------------------------------------------------------
 * Shadow helpers (additive — round 10).
 * ShadowIntensity maps to sane blur/offset/opacity presets.
 * ------------------------------------------------------------------------- */

export type ShadowIntensity = "soft" | "medium" | "strong";

export interface ShadowPreset {
  blur: number;   // Gaussian blur radius (canvas units at export resolution)
  offsetX: number;
  offsetY: number;
  opacity: number; // 0–1
}

export const SHADOW_PRESETS: Record<ShadowIntensity, ShadowPreset> = {
  soft:   { blur: 18, offsetX: 4,  offsetY: 8,  opacity: 0.28 },
  medium: { blur: 28, offsetX: 7,  offsetY: 14, opacity: 0.42 },
  strong: { blur: 40, offsetX: 10, offsetY: 20, opacity: 0.58 },
};

export const BG_COLOR_PRESETS = [
  { label: "White", hex: "#ffffff" },
  { label: "Black", hex: "#000000" },
  { label: "Light gray", hex: "#d1d5db" },
  { label: "Beige", hex: "#F5F0E6" },
  { label: "Brand blue", hex: "#1d4ed8" },
  { label: "Brand red", hex: "#dc2626" },
] as const;

/** Parse and validate a 6-digit hex color string. Returns normalized lowercase or null. */
export function parseHex(raw: string): string | null {
  const m = raw.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  return `#${m[1].toLowerCase()}`;
}

/** Resolve the composite fill arg from bgMode + bgColor.
 *  Returns a CSS color string for White/Color, or null for Transparent. */
export function resolveFill(bgMode: BgMode, bgColor: string): string | null {
  if (bgMode === "transparent") return null;
  if (bgMode === "white") return "#ffffff";
  return bgColor;
}

/** Build the primary download button label. */
export function primaryButtonLabel(
  bgMode: BgMode,
  bgColor: string,
  dims: { w: number; h: number },
  preset: { label: string },
  exporting: boolean,
  shadowOn?: boolean
): string {
  if (exporting) {
    return bgMode === "transparent" ? "Preparing PNG…" : "Preparing JPEG…";
  }
  const sizeStr = `${dims.w}×${dims.h}`;
  const marketStr = preset.label;
  const shadowSuffix = shadowOn ? " (with drop shadow)" : "";
  if (bgMode === "white") {
    return `Download white JPEG${shadowSuffix} — ${sizeStr} (${marketStr})`;
  }
  if (bgMode === "transparent") {
    return `Download transparent PNG — ${sizeStr}`;
  }
  // color mode
  const matchedSwatch = BG_COLOR_PRESETS.find(
    (s) => s.hex.toLowerCase() === bgColor.toLowerCase()
  );
  const colorName = matchedSwatch ? matchedSwatch.label.toLowerCase() : bgColor;
  return `Download JPEG on this background${shadowSuffix} — ${sizeStr} (${marketStr}) · ${colorName}`;
}

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

/* ---------------------------------------------------------------------------
 * Mask auto-clean helpers (unit-tested with synthetic RGBA arrays).
 * No DOM / canvas dependencies — operate on flat RGBA Uint8ClampedArrays.
 * ------------------------------------------------------------------------- */

/**
 * Connected-component labelling on alpha channel (4-connectivity).
 * Returns an Int32Array of component label per pixel (0 = background/transparent).
 * Only pixels with alpha > threshold are labelled.
 */
export function labelComponents(
  data: Uint8ClampedArray | number[],
  width: number,
  height: number,
  alphaThreshold = 8
): { labels: Int32Array; count: number } {
  const pixels = width * height;
  const labels = new Int32Array(pixels); // 0 = unlabelled / background
  let nextLabel = 1;
  // Union-Find helpers
  const parent = new Int32Array(pixels + 1);
  for (let i = 0; i < parent.length; i++) parent[i] = i;
  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a: number, b: number) {
    a = find(a);
    b = find(b);
    if (a !== b) parent[b] = a;
  }

  // First pass: assign provisional labels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] <= alphaThreshold) continue; // transparent
      const above = y > 0 ? labels[(y - 1) * width + x] : 0;
      const left = x > 0 ? labels[y * width + (x - 1)] : 0;
      if (above === 0 && left === 0) {
        labels[idx] = nextLabel++;
        parent[labels[idx]] = labels[idx];
      } else if (above !== 0 && left === 0) {
        labels[idx] = above;
      } else if (above === 0 && left !== 0) {
        labels[idx] = left;
      } else {
        labels[idx] = above;
        union(above, left);
      }
    }
  }

  // Second pass: flatten labels
  const canonMap = new Map<number, number>();
  let canonical = 1;
  for (let i = 0; i < pixels; i++) {
    if (labels[i] === 0) continue;
    const root = find(labels[i]);
    if (!canonMap.has(root)) canonMap.set(root, canonical++);
    labels[i] = canonMap.get(root)!;
  }

  return { labels, count: canonical - 1 };
}

/**
 * Compute pixel count for each component label.
 * Returns a Map<label, pixelCount>.
 */
export function componentSizes(
  labels: Int32Array,
  count: number
): Map<number, number> {
  const sizes = new Map<number, number>();
  for (let i = 1; i <= count; i++) sizes.set(i, 0);
  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];
    if (l > 0) sizes.set(l, (sizes.get(l) ?? 0) + 1);
  }
  return sizes;
}

/**
 * Drop disconnected blobs below `minFraction` of the dominant (largest)
 * component's area. Returns a new Uint8ClampedArray with blob pixels zeroed.
 *
 * `minFraction` = 0.03 means blobs < 3% of the subject are removed.
 */
export function dropSmallBlobs(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  minFraction = 0.03
): Uint8ClampedArray {
  const { labels, count } = labelComponents(data, width, height);
  if (count === 0) return data;
  const sizes = componentSizes(labels, count);
  const maxSize = Math.max(...sizes.values());
  const threshold = maxSize * minFraction;

  const out = new Uint8ClampedArray(data);
  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];
    if (l > 0 && (sizes.get(l) ?? 0) < threshold) {
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
    }
  }
  return out;
}

/**
 * Shadow signature: pixel has semi-transparent alpha AND low luminance.
 * Suppresses cast-shadow pixels without touching soft product edges.
 *
 * A pixel qualifies as a cast-shadow signature when:
 *   alpha is in (shadowAlphaMax, fullAlphaMin) — semi-transparent
 *   luminance is below shadowLumMax — dark
 *
 * Those pixels are fully erased. Pixels with alpha >= fullAlphaMin are
 * assumed to be soft product edges and are left untouched.
 */
export function suppressShadows(
  data: Uint8ClampedArray,
  shadowAlphaMax = 200, // pixels above this alpha are kept (product edges)
  shadowLumMax = 80    // luminance threshold: 0–255
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data);
  const pixels = Math.floor(data.length / 4);
  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    if (a === 0 || a > shadowAlphaMax) continue; // transparent or fully opaque → skip
    // Luminance (BT.709)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum < shadowLumMax) {
      out[i * 4 + 3] = 0; // erase shadow pixel
    }
  }
  return out;
}

/**
 * Apply the full auto-clean pipeline:
 *   1. Drop disconnected blobs smaller than minFraction of the dominant component.
 *   2. (Optionally) suppress cast-shadow semi-transparent dark regions.
 * Returns new Uint8ClampedArray.
 */
export function cleanMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: { removeShadow?: boolean; minFraction?: number } = {}
): Uint8ClampedArray {
  const { removeShadow = true, minFraction = 0.03 } = options;
  let out = dropSmallBlobs(data, width, height, minFraction);
  if (removeShadow) out = suppressShadows(out);
  return out;
}
