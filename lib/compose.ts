/** Pure helpers for compositing + cutout sanity checks (unit-tested). */

/* ---------------------------------------------------------------------------
 * Background-mode helpers (round 5: White | Color | Transparent export).
 * No React / DOM dependencies — pure functions, fully unit-testable.
 * ------------------------------------------------------------------------- */

export type BgMode = "white" | "color" | "gradient" | "transparent";

/* ---------------------------------------------------------------------------
 * Gradient helpers (additive — gradient background mode).
 * Pure data — no canvas / DOM deps. Gradient is drawn via createLinearGradient
 * in composite() on-canvas.
 *
 * ANGLE CONVENTION (standard math trig, NOT CSS deg):
 *   angle 90°  → sin(90°)=1 drives Y → VERTICAL top→bottom
 *     top-corners ≈ colorFrom, bottom-corners ≈ colorTo
 *   angle 0°   → cos(0°)=1 drives X → HORIZONTAL left→right
 *     left-corners ≈ colorFrom, right-corners ≈ colorTo
 *   angle 135° → DIAGONAL TL→BR
 *     TL corner ≈ colorFrom, BR corner ≈ colorTo; TR/BL are midpoint blends
 *
 * The gradient line endpoints are computed via:
 *   x0 = (W/2) - cos(angle_rad) * halfLen
 *   y0 = (H/2) - sin(angle_rad) * halfLen
 *   x1 = (W/2) + cos(angle_rad) * halfLen
 *   y1 = (H/2) + sin(angle_rad) * halfLen
 * where halfLen is direction-aware:
 *   - vertical (sin≈1, cos≈0): halfLen = H/2  → endpoints land exactly on top/bottom edges
 *   - horizontal (cos≈1, sin≈0): halfLen = W/2  → endpoints land exactly on left/right edges
 *   - diagonal: halfLen = min(W/2/|cos|, H/2/|sin|) = corner distance
 * This ensures corners ARE the gradient end-stop colors (±6 tolerance) for all angles.
 * Using sqrt(W²+H²)/2 for axis-aligned angles overshoots, making corners land at t≈0.146
 * instead of t=0/1 and causing ~37 channel-unit error (spec fails ±6).
 *
 * SPEC CHECK (verifier corner pixels):
 *   vertical (#FF0000→#0000FF, angle=90°): top-corners ≈ (255,0,0), bottom-corners ≈ (0,0,255)
 *   horizontal (#FF0000→#0000FF, angle=0°): left-corners ≈ (255,0,0), right-corners ≈ (0,0,255)
 * ------------------------------------------------------------------------- */

export interface GradientSettings {
  colorFrom: string; // 6-digit hex, e.g. "#ff0000"
  colorTo: string;   // 6-digit hex, e.g. "#0000ff"
  angle: number;     // 0–360° (math trig) — 90=vertical top→bottom, 0=horizontal left→right, 135=diagonal TL→BR
}

export type GradientPresetId =
  | "soft-gray"
  | "warm-sunset"
  | "cool-blue"
  | "mint"
  | "peach"
  | "slate";

export interface GradientPreset {
  id: GradientPresetId;
  label: string;
  colorFrom: string;
  colorTo: string;
  angle: number;
}

// Angle convention: standard math trig (not CSS).
// angle=90°  → sin(90°)=1 → vertical top→bottom   (cos(90°)≈0, so x stays at midline)
// angle=0°   → cos(0°)=1  → horizontal left→right (sin(0°)=0, so y stays at midline)
// angle=135° → TL→BR diagonal
// angle=270° → bottom→top (opposite of 90°)
export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "soft-gray",    label: "Soft gray",    colorFrom: "#f8fafc", colorTo: "#cbd5e1", angle: 90  },
  { id: "warm-sunset",  label: "Warm sunset",  colorFrom: "#fde68a", colorTo: "#f97316", angle: 135 },
  { id: "cool-blue",    label: "Cool blue",    colorFrom: "#bfdbfe", colorTo: "#1d4ed8", angle: 90  },
  { id: "mint",         label: "Mint",         colorFrom: "#d1fae5", colorTo: "#059669", angle: 90  },
  { id: "peach",        label: "Peach",        colorFrom: "#fde8d8", colorTo: "#f97316", angle: 270 },
  { id: "slate",        label: "Slate",        colorFrom: "#f1f5f9", colorTo: "#475569", angle: 0   },
];

export const DEFAULT_GRADIENT: GradientSettings = {
  colorFrom: "#bfdbfe",
  colorTo: "#1d4ed8",
  angle: 90, // vertical top→bottom
};

/**
 * Compute the canvas createLinearGradient line (x0,y0)→(x1,y1) from an angle (degrees)
 * and canvas size. Uses standard math trig convention:
 *   angle=90° → vertical top→bottom (sin=1 drives Y)
 *   angle=0°  → horizontal left→right (cos=1 drives X)
 *
 * halfLen is direction-aware so corners become pure end-stop colors (spec ±6 tolerance):
 *   - vertical (cos≈0):  halfLen = h/2 → endpoint lands exactly on top/bottom edge
 *   - horizontal (sin≈0): halfLen = w/2 → endpoint lands exactly on left/right edge
 *   - diagonal:          halfLen = min(w/2/|cos|, h/2/|sin|) = corner distance
 * (Using sqrt(W²+H²)/2 for axis-aligned angles placed corners at t≈0.146 → ~37 channel error.)
 */
export function gradientLine(
  w: number,
  h: number,
  angleDeg: number
): { x0: number; y0: number; x1: number; y1: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const abscos = Math.abs(Math.cos(rad));
  const abssin = Math.abs(Math.sin(rad));
  const halfLen =
    abscos < 1e-9 ? h / 2
    : abssin < 1e-9 ? w / 2
    : Math.min(w / 2 / abscos, h / 2 / abssin);
  const cx = w / 2;
  const cy = h / 2;
  return {
    x0: cx - Math.cos(rad) * halfLen,
    y0: cy - Math.sin(rad) * halfLen,
    x1: cx + Math.cos(rad) * halfLen,
    y1: cy + Math.sin(rad) * halfLen,
  };
}

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
 *  Returns a CSS color string for White/Color, "gradient" sentinel for Gradient,
 *  or null for Transparent. */
export function resolveFill(bgMode: BgMode, bgColor: string): string | null {
  if (bgMode === "transparent") return null;
  if (bgMode === "white") return "#ffffff";
  if (bgMode === "gradient") return "gradient";
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
  if (bgMode === "gradient") {
    return `Download JPEG on this gradient${shadowSuffix} — ${sizeStr} (${marketStr})`;
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
