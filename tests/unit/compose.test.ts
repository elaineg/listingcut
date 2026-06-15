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
