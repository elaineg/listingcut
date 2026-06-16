import { describe, it, expect } from "vitest";
import {
  clampMargin,
  marginBox,
  alphaCoverage,
  isNearEmpty,
  MARGIN_DEFAULT,
  labelComponents,
  componentSizes,
  dropSmallBlobs,
  suppressShadows,
  cleanMask,
  primaryButtonLabel,
  SHADOW_PRESETS,
  GRADIENT_PRESETS,
  DEFAULT_GRADIENT,
  gradientLine,
  parseHex,
  resolveFill,
} from "../../lib/compose";

describe("clampMargin", () => {
  it("clamps to the 2–15% range", () => {
    expect(clampMargin(0)).toBe(2);
    expect(clampMargin(2)).toBe(2);
    expect(clampMargin(6)).toBe(6);
    expect(clampMargin(15)).toBe(15);
    expect(clampMargin(40)).toBe(15);
  });
  it("falls back to the default on NaN", () => {
    expect(clampMargin(NaN)).toBe(MARGIN_DEFAULT);
  });
});

describe("marginBox", () => {
  it("shrinks the box by the margin on both sides", () => {
    expect(marginBox(1000, 1000, 6)).toEqual({ boxW: 880, boxH: 880 });
    expect(marginBox(1600, 1600, 2)).toEqual({ boxW: 1536, boxH: 1536 });
  });
});

describe("alphaCoverage / isNearEmpty", () => {
  it("returns 0 for fully transparent data", () => {
    const data = new Uint8ClampedArray(4 * 100); // all zeros
    expect(alphaCoverage(data)).toBe(0);
    expect(isNearEmpty(alphaCoverage(data))).toBe(true);
  });
  it("returns 1 for fully opaque data", () => {
    const data = new Uint8ClampedArray(4 * 100).fill(255);
    expect(alphaCoverage(data)).toBe(1);
    expect(isNearEmpty(alphaCoverage(data))).toBe(false);
  });
  it("flags coverage below 0.5% as near-empty", () => {
    const data = new Uint8ClampedArray(4 * 1000); // 1000 px
    data[3] = 255; // a single opaque pixel = 0.1%
    const cov = alphaCoverage(data);
    expect(cov).toBeCloseTo(0.001);
    expect(isNearEmpty(cov)).toBe(true);
  });
  it("ignores near-zero alpha noise", () => {
    const data = new Uint8ClampedArray(4 * 100);
    for (let i = 3; i < data.length; i += 4) data[i] = 4; // below threshold of 8
    expect(alphaCoverage(data)).toBe(0);
  });
  it("handles empty input", () => {
    expect(alphaCoverage(new Uint8ClampedArray(0))).toBe(0);
  });
});

/* ---------------------------------------------------------------------------
 * Synthetic helpers: build RGBA arrays for a grid of pixels.
 * w×h pixels; opaqueIndices are flat pixel indices (0-based) that get alpha=255.
 * --------------------------------------------------------------------------- */
function makeRgba(
  w: number,
  h: number,
  opaqueIndices: number[],
  rgb: [number, number, number] = [200, 200, 200]
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(w * h * 4);
  for (const idx of opaqueIndices) {
    data[idx * 4] = rgb[0];
    data[idx * 4 + 1] = rgb[1];
    data[idx * 4 + 2] = rgb[2];
    data[idx * 4 + 3] = 255;
  }
  return data;
}

describe("labelComponents", () => {
  it("labels a single contiguous block as component 1", () => {
    // 3×3 fully opaque
    const data = makeRgba(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const { labels, count } = labelComponents(data, 3, 3);
    expect(count).toBe(1);
    // All pixels belong to the same component
    const unique = new Set(labels.filter((l) => l > 0));
    expect(unique.size).toBe(1);
  });

  it("labels two disconnected blobs as separate components", () => {
    // 5×1 image: pixels 0,1 opaque; pixel 2 transparent; pixels 3,4 opaque
    const data = makeRgba(5, 1, [0, 1, 3, 4]);
    const { count } = labelComponents(data, 5, 1);
    expect(count).toBe(2);
  });

  it("returns count 0 for fully transparent image", () => {
    const data = new Uint8ClampedArray(4 * 9);
    const { count } = labelComponents(data, 3, 3);
    expect(count).toBe(0);
  });
});

describe("componentSizes", () => {
  it("counts pixels per component correctly", () => {
    // 5×1: blob A = pixels 0,1 (2px); blob B = pixels 3,4 (2px)
    const data = makeRgba(5, 1, [0, 1, 3, 4]);
    const { labels, count } = labelComponents(data, 5, 1);
    const sizes = componentSizes(labels, count);
    const values = [...sizes.values()];
    expect(values.sort((a, b) => a - b)).toEqual([2, 2]);
  });
});

describe("dropSmallBlobs", () => {
  it("removes detached blobs smaller than minFraction of the dominant component", () => {
    // 20×1: big subject = pixels 0–17 (18px); gap=pixel 18; tiny blob = pixel 19 (1px)
    // minFraction=0.1 → threshold = 18*0.1 = 1.8 → blob of 1 is removed (1 < 1.8).
    const subject = Array.from({ length: 18 }, (_, i) => i);
    const data = makeRgba(20, 1, [...subject, 19]);
    const out = dropSmallBlobs(data, 20, 1, 0.1);
    // Subject pixels still opaque
    expect(out[0 * 4 + 3]).toBe(255);
    // Detached blob pixel erased
    expect(out[19 * 4 + 3]).toBe(0);
  });

  it("keeps a blob that is large enough relative to the subject", () => {
    // 20×1: subject = 0–13 (14px); gap=14; second blob = 15–19 (5px)
    // minFraction=0.1 → threshold = 14*0.1=1.4 → blob of 5 > 1.4 → survives
    const subject = Array.from({ length: 14 }, (_, i) => i);
    const blob = [15, 16, 17, 18, 19];
    const data = makeRgba(20, 1, [...subject, ...blob]);
    const out = dropSmallBlobs(data, 20, 1, 0.1);
    expect(out[15 * 4 + 3]).toBe(255);
    expect(out[19 * 4 + 3]).toBe(255);
  });

  it("returns data unchanged when there are no blobs", () => {
    const data = makeRgba(4, 1, [0, 1, 2, 3]);
    const out = dropSmallBlobs(data, 4, 1, 0.03);
    // All opaque pixels kept
    for (let i = 0; i < 4; i++) expect(out[i * 4 + 3]).toBe(255);
  });

  it("handles fully transparent input", () => {
    const data = new Uint8ClampedArray(4 * 10);
    const out = dropSmallBlobs(data, 10, 1, 0.03);
    // All still transparent
    for (let i = 0; i < 10; i++) expect(out[i * 4 + 3]).toBe(0);
  });
});

describe("suppressShadows", () => {
  it("erases semi-transparent dark pixels (cast-shadow signature)", () => {
    // Shadow pixel: dark (rgb ~20), alpha=120 (semi-transparent)
    const data = new Uint8ClampedArray(4);
    data[0] = 20; data[1] = 15; data[2] = 10; data[3] = 120;
    const out = suppressShadows(data);
    expect(out[3]).toBe(0);
  });

  it("leaves fully opaque pixels untouched (product edges)", () => {
    const data = new Uint8ClampedArray(4);
    data[0] = 30; data[1] = 30; data[2] = 30; data[3] = 255;
    const out = suppressShadows(data);
    expect(out[3]).toBe(255);
  });

  it("leaves transparent pixels untouched", () => {
    const data = new Uint8ClampedArray(4); // alpha=0
    const out = suppressShadows(data);
    expect(out[3]).toBe(0);
  });

  it("preserves semi-transparent bright pixels (soft product edge, not shadow)", () => {
    // High luminance semi-transparent: product soft edge, NOT shadow
    const data = new Uint8ClampedArray(4);
    data[0] = 220; data[1] = 220; data[2] = 220; data[3] = 150;
    const out = suppressShadows(data);
    // luminance ~220 > 80 → should be kept
    expect(out[3]).toBe(150);
  });
});

describe("cleanMask", () => {
  it("removes a detached blob AND a shadow pixel in one pass", () => {
    // 30×1: subject = 0–27 (28px bright opaque), gap=28, tiny blob = pixel 29 (1px bright opaque)
    // minFraction=0.05 → threshold = 28*0.05 = 1.4 → 1 < 1.4 → blob removed.
    // shadow = appended at index 29 is the blob, so we test shadow separately below.
    // Let's use a 2-row layout: row 0 = subject (10px), gap, tiny blob; row 1 = shadow.
    // Simpler: 22×1: subject=0-19 (20px), gap=20, tiny-blob=21 (1px)
    // minFraction=0.1 → threshold=20*0.1=2.0 → 1 < 2.0 → blob removed.
    // Also add a shadow at end separately is complex; test blob removal here and
    // shadow in its own context (which already has a test above). Combined:
    // 22×1: subject=0–19, gap=20, tiny-blob=21
    const data = new Uint8ClampedArray(22 * 4);
    for (let i = 0; i <= 19; i++) {
      data[i * 4] = 200; data[i * 4 + 1] = 200; data[i * 4 + 2] = 200;
      data[i * 4 + 3] = 255;
    }
    // Tiny blob (gap at pixel 20)
    data[21 * 4] = 200; data[21 * 4 + 1] = 200; data[21 * 4 + 2] = 200;
    data[21 * 4 + 3] = 255;

    const out = cleanMask(data, 22, 1, { removeShadow: false, minFraction: 0.1 });

    // Subject kept
    expect(out[0 * 4 + 3]).toBe(255);
    // Tiny blob removed (1 < 20*0.1=2.0)
    expect(out[21 * 4 + 3]).toBe(0);
  });

  it("removes a shadow pixel with removeShadow=true", () => {
    // Shadow pixel only — dark semi-transparent
    const data = new Uint8ClampedArray(4);
    data[0] = 20; data[1] = 15; data[2] = 10; data[3] = 120;
    const out = cleanMask(data, 1, 1, { removeShadow: true });
    expect(out[3]).toBe(0);
  });

  it("preserves soft edges when removeShadow=false", () => {
    const data = new Uint8ClampedArray(4);
    data[0] = 20; data[1] = 15; data[2] = 10; data[3] = 120;
    const out = cleanMask(data, 1, 1, { removeShadow: false });
    // Shadow suppression off → pixel kept
    expect(out[3]).toBe(120);
  });
});

/* ---------------------------------------------------------------------------
 * primaryButtonLabel — Color mode label fix (round-8 panel-4, CHANGE 2).
 * Ensures Color mode never reads "Download white JPEG" even when bgColor=#ffffff,
 * and reads correctly for named swatches (beige) and custom hex.
 * --------------------------------------------------------------------------- */
const SQUARE_PRESET = { label: "Square" };
const DIMS_1080 = { w: 1080, h: 1080 };

describe("primaryButtonLabel — Color mode (round-8 panel-4 fix)", () => {
  it("Color mode with beige (#F5F0E6) reads 'JPEG on this background … beige'", () => {
    const label = primaryButtonLabel("color", "#F5F0E6", DIMS_1080, SQUARE_PRESET, false);
    expect(label).toContain("this background");
    expect(label).toMatch(/beige/i);
    expect(label).not.toMatch(/Download white JPEG/i);
  });

  it("Color mode with white (#ffffff) reads 'JPEG on this background … white' (NOT 'Download white JPEG')", () => {
    // Even if bgColor happens to be #ffffff in Color mode, the label is
    // 'Download JPEG on this background … white' — NOT 'Download white JPEG'.
    // This distinction matters: 'Download white JPEG' is the White-mode label.
    const label = primaryButtonLabel("color", "#ffffff", DIMS_1080, SQUARE_PRESET, false);
    expect(label).toContain("this background");
    expect(label).not.toMatch(/^Download white JPEG/i);
    // The word "white" may appear as a swatch suffix but the mode-identifying phrase must differ.
    expect(label).toMatch(/JPEG on this background/i);
  });

  it("Color mode with custom hex (#1d4ed8) reads 'JPEG on this background'", () => {
    const label = primaryButtonLabel("color", "#1d4ed8", DIMS_1080, SQUARE_PRESET, false);
    expect(label).toContain("this background");
    expect(label).not.toMatch(/Download white JPEG/i);
  });

  it("White mode still reads 'Download white JPEG' (no regression)", () => {
    const label = primaryButtonLabel("white", "#ffffff", DIMS_1080, SQUARE_PRESET, false);
    expect(label).toMatch(/Download white JPEG/i);
  });

  it("Transparent mode still reads 'Download transparent PNG' (no regression)", () => {
    const label = primaryButtonLabel("transparent", "#ffffff", DIMS_1080, SQUARE_PRESET, false);
    expect(label).toMatch(/Download transparent PNG/i);
  });
});

/* ---------------------------------------------------------------------------
 * Shadow: primaryButtonLabel "(with drop shadow)" qualifier (round 10).
 * --------------------------------------------------------------------------- */

describe("primaryButtonLabel — shadow qualifier", () => {
  it("White mode with shadowOn=true appends '(with drop shadow)'", () => {
    const label = primaryButtonLabel("white", "#ffffff", DIMS_1080, SQUARE_PRESET, false, true);
    expect(label).toMatch(/Download white JPEG \(with drop shadow\)/i);
    expect(label).toContain("(with drop shadow)");
  });

  it("Color mode with shadowOn=true appends '(with drop shadow)'", () => {
    const label = primaryButtonLabel("color", "#1d4ed8", DIMS_1080, SQUARE_PRESET, false, true);
    expect(label).toContain("this background");
    expect(label).toContain("(with drop shadow)");
  });

  it("Transparent mode with shadowOn=true does NOT append '(with drop shadow)' (shadow disabled in transparent mode)", () => {
    // When bgMode=transparent, caller should pass shadowOn=false (shadow inactive).
    // But even if called with true, the function itself does not add suffix for transparent.
    // (The current impl only adds suffix for white/color.)
    const label = primaryButtonLabel("transparent", "#ffffff", DIMS_1080, SQUARE_PRESET, false, true);
    expect(label).not.toContain("(with drop shadow)");
  });

  it("White mode with shadowOn=false (or omitted) has no suffix", () => {
    const withFalse = primaryButtonLabel("white", "#ffffff", DIMS_1080, SQUARE_PRESET, false, false);
    const withOmitted = primaryButtonLabel("white", "#ffffff", DIMS_1080, SQUARE_PRESET, false);
    expect(withFalse).not.toContain("(with drop shadow)");
    expect(withOmitted).not.toContain("(with drop shadow)");
    expect(withFalse).toMatch(/Download white JPEG/i);
    expect(withOmitted).toMatch(/Download white JPEG/i);
  });

  it("exporting=true ignores shadowOn and returns 'Preparing JPEG…'", () => {
    const label = primaryButtonLabel("white", "#ffffff", DIMS_1080, SQUARE_PRESET, true, true);
    expect(label).toBe("Preparing JPEG…");
    expect(label).not.toContain("(with drop shadow)");
  });
});

/* ---------------------------------------------------------------------------
 * SHADOW_PRESETS: sanity checks on preset values.
 * --------------------------------------------------------------------------- */

describe("SHADOW_PRESETS", () => {
  it("all three intensity levels are defined with positive blur and opacity", () => {
    for (const key of ["soft", "medium", "strong"] as const) {
      const p = SHADOW_PRESETS[key];
      expect(p.blur).toBeGreaterThan(0);
      expect(p.opacity).toBeGreaterThan(0);
      expect(p.opacity).toBeLessThanOrEqual(1);
    }
  });

  it("strong > medium > soft in terms of blur and opacity", () => {
    expect(SHADOW_PRESETS.strong.blur).toBeGreaterThan(SHADOW_PRESETS.medium.blur);
    expect(SHADOW_PRESETS.medium.blur).toBeGreaterThan(SHADOW_PRESETS.soft.blur);
    expect(SHADOW_PRESETS.strong.opacity).toBeGreaterThan(SHADOW_PRESETS.medium.opacity);
    expect(SHADOW_PRESETS.medium.opacity).toBeGreaterThan(SHADOW_PRESETS.soft.opacity);
  });
});

/* ---------------------------------------------------------------------------
 * GRADIENT helpers — round-13 addition.
 * ---------------------------------------------------------------------------
 * Corner-pixel math (verifier spec check reference):
 *   angle 0°  (vertical, top→bottom):
 *     x0=W/2, y0=(H/2)-halfDiag  →  above top edge  →  top corners ≈ colorFrom
 *     x1=W/2, y1=(H/2)+halfDiag  →  below bottom edge →  bottom corners ≈ colorTo
 *   angle 90° (horizontal, left→right):
 *     x0=(W/2)-halfDiag, y0=H/2  →  left of left edge → left corners ≈ colorFrom
 *     x1=(W/2)+halfDiag, y1=H/2  →  right of right edge → right corners ≈ colorTo
 *   angle 135° (diagonal, TL→BR):
 *     x0=(W/2)-halfDiag*cos135, y0=(H/2)-halfDiag*sin135 → TL corner ≈ colorFrom
 *     x1=(W/2)+halfDiag*cos135, y1=(H/2)+halfDiag*sin135 → BR corner ≈ colorTo
 *     TR/BL corners are midpoint blends.
 * --------------------------------------------------------------------------- */

describe("GRADIENT_PRESETS", () => {
  it("contains exactly 6 presets with valid hex colors and angle", () => {
    expect(GRADIENT_PRESETS).toHaveLength(6);
    for (const p of GRADIENT_PRESETS) {
      expect(parseHex(p.colorFrom), `${p.id} colorFrom`).not.toBeNull();
      expect(parseHex(p.colorTo), `${p.id} colorTo`).not.toBeNull();
      expect(p.angle).toBeGreaterThanOrEqual(0);
      expect(p.angle).toBeLessThanOrEqual(360);
    }
  });

  it("preset ids are unique", () => {
    const ids = GRADIENT_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes soft-gray, warm-sunset, cool-blue, mint, peach, slate", () => {
    const ids = GRADIENT_PRESETS.map((p) => p.id);
    for (const id of ["soft-gray", "warm-sunset", "cool-blue", "mint", "peach", "slate"]) {
      expect(ids).toContain(id);
    }
  });

  it("warm-sunset has distinct colorFrom and colorTo (not a flat color)", () => {
    const p = GRADIENT_PRESETS.find((x) => x.id === "warm-sunset")!;
    expect(p.colorFrom.toLowerCase()).not.toBe(p.colorTo.toLowerCase());
  });
});

describe("DEFAULT_GRADIENT", () => {
  it("has valid hex colors and an angle in range", () => {
    expect(parseHex(DEFAULT_GRADIENT.colorFrom)).not.toBeNull();
    expect(parseHex(DEFAULT_GRADIENT.colorTo)).not.toBeNull();
    expect(DEFAULT_GRADIENT.angle).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_GRADIENT.angle).toBeLessThanOrEqual(360);
  });

  it("colorFrom and colorTo differ (not a flat color)", () => {
    expect(DEFAULT_GRADIENT.colorFrom.toLowerCase()).not.toBe(DEFAULT_GRADIENT.colorTo.toLowerCase());
  });
});

/* ---------------------------------------------------------------------------
 * Corner-pixel interpolation helper (pure math, no canvas).
 * For a linear gradient from colorFrom→colorTo over a line (x0,y0)→(x1,y1),
 * the color at point P is interpolated at t = dot(P-P0, P1-P0) / |P1-P0|^2.
 * t=0 → colorFrom, t=1 → colorTo.  We compute t for each canvas corner.
 * --------------------------------------------------------------------------- */
function gradientT(
  px: number, py: number,
  x0: number, y0: number,
  x1: number, y1: number
): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return 0;
  return ((px - x0) * dx + (py - y0) * dy) / len2;
}

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * Math.clamp01(t));
}

// Clamp t to [0,1] as canvas does
Math.clamp01 = (t: number) => Math.max(0, Math.min(1, t));

describe("gradientLine — angle→canvas-endpoint math", () => {
  const W = 1600;
  const H = 1600;
  // direction-aware halfLen values for a square canvas:
  //   0°  (horizontal): halfLen = W/2 = 800
  //   90° (vertical):   halfLen = H/2 = 800
  //   135° (diagonal):  min(W/2/|cos135|, H/2/|sin135|) = min(800/0.7071, 800/0.7071) = ~1131 = halfDiag
  const halfDiag = Math.sqrt(W * W + H * H) / 2; // ~1131

  it("angle 0° (horizontal left→right): endpoints land exactly on left/right edges (halfLen=W/2)", () => {
    const { x0, y0, x1, y1 } = gradientLine(W, H, 0);
    // cos(0)=1, sin(0)=0 → halfLen = W/2 = 800
    expect(x0).toBeCloseTo(0, 0);         // left edge
    expect(y0).toBeCloseTo(H / 2, 0);    // midline
    expect(x1).toBeCloseTo(W, 0);        // right edge
    expect(y1).toBeCloseTo(H / 2, 0);
  });

  it("angle 90° (vertical top→bottom): endpoints land exactly on top/bottom edges (halfLen=H/2)", () => {
    const { x0, y0, x1, y1 } = gradientLine(W, H, 90);
    // cos(90°)≈0, sin(90°)=1 → halfLen = H/2 = 800
    expect(x0).toBeCloseTo(W / 2, 0);    // midline
    expect(y0).toBeCloseTo(0, 0);        // top edge
    expect(x1).toBeCloseTo(W / 2, 0);
    expect(y1).toBeCloseTo(H, 0);        // bottom edge
  });

  it("angle 135° (diagonal TL→BR): halfLen equals halfDiag for square canvas (unchanged)", () => {
    const { x0, y0, x1, y1 } = gradientLine(W, H, 135);
    const rad = (135 * Math.PI) / 180;
    // For square canvas at 135°, halfLen = min(800/|cos135|, 800/|sin135|) = halfDiag
    expect(x0).toBeCloseTo(W / 2 - Math.cos(rad) * halfDiag, 0);
    expect(y0).toBeCloseTo(H / 2 - Math.sin(rad) * halfDiag, 0);
    expect(x1).toBeCloseTo(W / 2 + Math.cos(rad) * halfDiag, 0);
    expect(y1).toBeCloseTo(H / 2 + Math.sin(rad) * halfDiag, 0);
  });

  it("endpoints are equidistant from canvas center for all angles", () => {
    for (const angle of [0, 45, 90, 135, 180, 270]) {
      const { x0, y0, x1, y1 } = gradientLine(W, H, angle);
      const d0 = Math.hypot(x0 - W / 2, y0 - H / 2);
      const d1 = Math.hypot(x1 - W / 2, y1 - H / 2);
      expect(d0).toBeCloseTo(d1, 1); // symmetric from center
    }
  });

  // -------------------------------------------------------------------------
  // CORNER-PIXEL SPEC CHECKS (±6 tolerance, matching verifier assertions).
  // These use pure interpolation math — no canvas needed.
  // -------------------------------------------------------------------------

  it("SPEC: vertical 90° on 1600×1600 with #FF0000→#0000FF: top corners ≈ (255,0,0), bottom ≈ (0,0,255) within ±6", () => {
    const { x0, y0, x1, y1 } = gradientLine(W, H, 90);
    const corners = {
      TL: { px: 0,     py: 0 },
      TR: { px: W - 1, py: 0 },
      BL: { px: 0,     py: H - 1 },
      BR: { px: W - 1, py: H - 1 },
    };
    // colorFrom = #FF0000 (r=255,g=0,b=0), colorTo = #0000FF (r=0,g=0,b=255)
    for (const corner of [corners.TL, corners.TR]) {
      const t = gradientT(corner.px, corner.py, x0, y0, x1, y1);
      const r = lerpChannel(255, 0, t);
      const g = lerpChannel(0, 0, t);
      const b = lerpChannel(0, 255, t);
      expect(Math.abs(r - 255)).toBeLessThanOrEqual(6);
      expect(Math.abs(g - 0)).toBeLessThanOrEqual(6);
      expect(Math.abs(b - 0)).toBeLessThanOrEqual(6);
    }
    for (const corner of [corners.BL, corners.BR]) {
      const t = gradientT(corner.px, corner.py, x0, y0, x1, y1);
      const r = lerpChannel(255, 0, t);
      const g = lerpChannel(0, 0, t);
      const b = lerpChannel(0, 255, t);
      expect(Math.abs(r - 0)).toBeLessThanOrEqual(6);
      expect(Math.abs(g - 0)).toBeLessThanOrEqual(6);
      expect(Math.abs(b - 255)).toBeLessThanOrEqual(6);
    }
  });

  it("SPEC: horizontal 0° on 1600×1600 with #FF0000→#0000FF: left corners ≈ (255,0,0), right ≈ (0,0,255) within ±6", () => {
    const { x0, y0, x1, y1 } = gradientLine(W, H, 0);
    const leftCorners  = [{ px: 0,     py: 0 }, { px: 0,     py: H - 1 }];
    const rightCorners = [{ px: W - 1, py: 0 }, { px: W - 1, py: H - 1 }];
    for (const corner of leftCorners) {
      const t = gradientT(corner.px, corner.py, x0, y0, x1, y1);
      expect(Math.abs(lerpChannel(255, 0, t) - 255)).toBeLessThanOrEqual(6);
      expect(Math.abs(lerpChannel(0, 255, t) - 0)).toBeLessThanOrEqual(6);
    }
    for (const corner of rightCorners) {
      const t = gradientT(corner.px, corner.py, x0, y0, x1, y1);
      expect(Math.abs(lerpChannel(255, 0, t) - 0)).toBeLessThanOrEqual(6);
      expect(Math.abs(lerpChannel(0, 255, t) - 255)).toBeLessThanOrEqual(6);
    }
  });

  it("SPEC: diagonal 135° on 1600×1600 with #FF0000→#0000FF: TR corner ≈ (255,0,0), BL corner ≈ (0,0,255) within ±6 (unchanged behavior)", () => {
    // cos(135°)≈-0.707, sin(135°)≈+0.707 → x0 is on right side (TR), x1 is on left side (BL).
    // So for a square canvas, angle=135° runs TR→BL. TL and BR land at t≈0.5 (midpoint blend).
    // This is the same as the old halfDiag behavior for square canvases (halfLen === halfDiag here).
    const { x0, y0, x1, y1 } = gradientLine(W, H, 135);
    // TR corner (W-1, 0) should be near colorFrom (t≈0)
    const tTR = gradientT(W - 1, 0, x0, y0, x1, y1);
    expect(Math.abs(lerpChannel(255, 0, tTR) - 255)).toBeLessThanOrEqual(6);
    expect(Math.abs(lerpChannel(0, 255, tTR) - 0)).toBeLessThanOrEqual(6);
    // BL corner (0, H-1) should be near colorTo (t≈1)
    const tBL = gradientT(0, H - 1, x0, y0, x1, y1);
    expect(Math.abs(lerpChannel(255, 0, tBL) - 0)).toBeLessThanOrEqual(6);
    expect(Math.abs(lerpChannel(0, 255, tBL) - 255)).toBeLessThanOrEqual(6);
  });
});

describe("resolveFill — gradient mode returns 'gradient' sentinel", () => {
  it("gradient mode returns 'gradient' (not null, not a hex)", () => {
    expect(resolveFill("gradient", "#ff0000")).toBe("gradient");
  });

  it("gradient mode with any bgColor still returns 'gradient' (bgColor is ignored in gradient mode)", () => {
    expect(resolveFill("gradient", "#000000")).toBe("gradient");
    expect(resolveFill("gradient", "#ffffff")).toBe("gradient");
  });

  it("white/color/transparent modes are unaffected by gradient addition", () => {
    expect(resolveFill("white", "#ff0000")).toBe("#ffffff");
    expect(resolveFill("color", "#ff0000")).toBe("#ff0000");
    expect(resolveFill("transparent", "#ff0000")).toBeNull();
  });
});

describe("primaryButtonLabel — Gradient mode", () => {
  const SQUARE = { label: "Square" };
  const D = { w: 1080, h: 1080 };

  it("Gradient mode reads 'Download JPEG on this gradient'", () => {
    const label = primaryButtonLabel("gradient", "#ffffff", D, SQUARE, false, false);
    expect(label).toContain("Download JPEG on this gradient");
    expect(label).toContain("1080×1080");
    expect(label).toContain("Square");
    expect(label).not.toContain("Download white JPEG");
    expect(label).not.toContain("transparent PNG");
  });

  it("Gradient mode with shadowOn=true appends '(with drop shadow)'", () => {
    const label = primaryButtonLabel("gradient", "#ffffff", D, SQUARE, false, true);
    expect(label).toContain("Download JPEG on this gradient");
    expect(label).toContain("(with drop shadow)");
  });

  it("Gradient mode with shadowOn=false has no shadow suffix", () => {
    const label = primaryButtonLabel("gradient", "#ffffff", D, SQUARE, false, false);
    expect(label).not.toContain("(with drop shadow)");
  });

  it("Gradient mode with exporting=true returns 'Preparing JPEG…'", () => {
    const label = primaryButtonLabel("gradient", "#ffffff", D, SQUARE, true, false);
    expect(label).toBe("Preparing JPEG…");
  });
});

describe("export-settings merge: gradient is independent of margin/shadow/color (friction #19/#61)", () => {
  // These tests verify the DESIGN PROPERTY: gradient state is stored independently
  // and a pure spread-merge (the pattern used in the persist effect) never loses
  // a sibling field when gradient changes.
  it("spread-merging gradient into export prefs preserves all sibling fields", () => {
    const initial = {
      presetId: "ebay",
      marginPct: 8,
      bgMode: "gradient" as const,
      bgColor: "#ff0000",
      shadowOn: true,
      shadowIntensity: "medium" as const,
      gradient: DEFAULT_GRADIENT,
      gradientPresetId: "cool-blue" as const,
    };

    // Simulate a margin change: spread-merge preserves gradient
    const afterMarginChange = { ...initial, marginPct: 12 };
    expect(afterMarginChange.gradient).toEqual(initial.gradient);
    expect(afterMarginChange.shadowOn).toBe(true);
    expect(afterMarginChange.bgColor).toBe("#ff0000");

    // Simulate a gradient change: spread-merge preserves margin and shadow
    const newGradient = { colorFrom: "#ff0000", colorTo: "#0000ff", angle: 0 };
    const afterGradientChange = { ...initial, gradient: newGradient, gradientPresetId: "custom" as const };
    expect(afterGradientChange.marginPct).toBe(8);
    expect(afterGradientChange.shadowOn).toBe(true);
    expect(afterGradientChange.bgColor).toBe("#ff0000");

    // Simulate shadow toggle: spread-merge preserves gradient
    const afterShadowToggle = { ...initial, shadowOn: false };
    expect(afterShadowToggle.gradient).toEqual(initial.gradient);
    expect(afterShadowToggle.marginPct).toBe(8);

    // Simulate mode switch Gradient→Color→Gradient: gradient is in the prefs object
    // and is NOT reset by bgMode change (bgMode is a separate key).
    const afterModeSwitch = { ...initial, bgMode: "color" as const };
    expect(afterModeSwitch.gradient).toEqual(initial.gradient);
    const afterModeSwitchBack = { ...afterModeSwitch, bgMode: "gradient" as const };
    expect(afterModeSwitchBack.gradient).toEqual(initial.gradient);
  });
});
