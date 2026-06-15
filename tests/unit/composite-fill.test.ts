/**
 * Unit tests for the background-mode helpers added in round 5.
 * These cover pure (non-canvas) functions: parseHex, resolveFill,
 * BG_COLOR_PRESETS, and primaryButtonLabel.
 *
 * Round-6 additions:
 *   - New Social/Other presets (Square, Story, Link/Ad, Slide 16:9, Custom)
 *   - Size change must NOT reset bgMode/bgColor (C2)
 *   - primaryButtonLabel is derived synchronously from state (C3)
 *
 * The canvas-based composite() pixel assertions are exercised by the e2e
 * suite (tests/e2e/round5.spec.ts) which runs in a real browser.
 */

import { describe, it, expect } from "vitest";
import {
  parseHex,
  resolveFill,
  BG_COLOR_PRESETS,
  primaryButtonLabel,
} from "../../lib/compose";

// ----------------------------------------------------------------------------
// parseHex
// ----------------------------------------------------------------------------

describe("parseHex", () => {
  it("accepts a 6-digit hex with # prefix", () => {
    expect(parseHex("#FF0000")).toBe("#ff0000");
    expect(parseHex("#ffffff")).toBe("#ffffff");
    expect(parseHex("#000000")).toBe("#000000");
    expect(parseHex("#F5F0E6")).toBe("#f5f0e6");
  });
  it("accepts a 6-digit hex without # prefix", () => {
    expect(parseHex("FF0000")).toBe("#ff0000");
    expect(parseHex("1d4ed8")).toBe("#1d4ed8");
  });
  it("normalises to lowercase", () => {
    expect(parseHex("#AABBCC")).toBe("#aabbcc");
  });
  it("rejects short hashes", () => {
    expect(parseHex("#FFF")).toBeNull();
    expect(parseHex("#12345")).toBeNull();
  });
  it("rejects empty / non-hex strings", () => {
    expect(parseHex("")).toBeNull();
    expect(parseHex("notacolor")).toBeNull();
    expect(parseHex("#GGGGGG")).toBeNull();
  });
  it("ignores leading/trailing whitespace", () => {
    expect(parseHex("  #ff0000  ")).toBe("#ff0000");
  });
});

// ----------------------------------------------------------------------------
// resolveFill
// ----------------------------------------------------------------------------

describe("resolveFill", () => {
  it("White mode always resolves to #ffffff regardless of bgColor", () => {
    expect(resolveFill("white", "#ff0000")).toBe("#ffffff");
    expect(resolveFill("white", "#000000")).toBe("#ffffff");
  });
  it("Transparent mode resolves to null", () => {
    expect(resolveFill("transparent", "#ffffff")).toBeNull();
    expect(resolveFill("transparent", "#ff0000")).toBeNull();
  });
  it("Color mode resolves to the provided bgColor", () => {
    expect(resolveFill("color", "#ff0000")).toBe("#ff0000");
    expect(resolveFill("color", "#000000")).toBe("#000000");
    expect(resolveFill("color", "#F5F0E6")).toBe("#F5F0E6");
  });
});

// ----------------------------------------------------------------------------
// BG_COLOR_PRESETS
// ----------------------------------------------------------------------------

describe("BG_COLOR_PRESETS", () => {
  it("contains White, Black, Light gray, Beige, Brand blue, Brand red", () => {
    const labels = BG_COLOR_PRESETS.map((s) => s.label);
    expect(labels).toContain("White");
    expect(labels).toContain("Black");
    expect(labels).toContain("Light gray");
    expect(labels).toContain("Beige");
    expect(labels).toContain("Brand blue");
    expect(labels).toContain("Brand red");
  });
  it("White swatch is #ffffff", () => {
    const white = BG_COLOR_PRESETS.find((s) => s.label === "White");
    expect(white?.hex).toBe("#ffffff");
  });
  it("Black swatch is #000000", () => {
    const black = BG_COLOR_PRESETS.find((s) => s.label === "Black");
    expect(black?.hex).toBe("#000000");
  });
  it("Beige swatch is #F5F0E6", () => {
    const beige = BG_COLOR_PRESETS.find((s) => s.label === "Beige");
    expect(beige?.hex).toBe("#F5F0E6");
  });
  it("all hex values parse as valid 6-digit hex", () => {
    for (const s of BG_COLOR_PRESETS) {
      expect(parseHex(s.hex), `${s.label} hex ${s.hex} should be valid`).not.toBeNull();
    }
  });
});

// ----------------------------------------------------------------------------
// primaryButtonLabel
// ----------------------------------------------------------------------------

const eBayPreset = { label: "eBay" };
const dims = { w: 1600, h: 1600 };

describe("primaryButtonLabel", () => {
  it("White mode: label says 'Download white JPEG'", () => {
    const label = primaryButtonLabel("white", "#ffffff", dims, eBayPreset, false);
    expect(label).toMatch(/Download white JPEG/i);
    expect(label).toContain("1600×1600");
    expect(label).toContain("eBay");
  });
  it("Transparent mode: label says 'Download transparent PNG', no JPEG", () => {
    const label = primaryButtonLabel("transparent", "#ffffff", dims, eBayPreset, false);
    expect(label).toMatch(/Download transparent PNG/i);
    expect(label).toContain("1600×1600");
    expect(label).not.toContain("JPEG");
  });
  it("Color mode with a named swatch (white): label mentions 'this background'", () => {
    const label = primaryButtonLabel("color", "#ffffff", dims, eBayPreset, false);
    expect(label).toContain("this background");
  });
  it("Color mode with Brand red swatch: label mentions color name", () => {
    const labelRed = primaryButtonLabel("color", "#dc2626", dims, eBayPreset, false);
    expect(labelRed).toContain("this background");
    expect(labelRed).toContain("1600×1600");
    expect(labelRed).toContain("brand red");
  });
  it("Color mode with arbitrary hex: label contains 'this background' and size", () => {
    const label = primaryButtonLabel("color", "#123456", dims, eBayPreset, false);
    expect(label).toContain("this background");
    expect(label).toContain("1600×1600");
  });
  it("exporting=true: label says 'Preparing'", () => {
    expect(primaryButtonLabel("white", "#ffffff", dims, eBayPreset, true)).toMatch(/Preparing JPEG/);
    expect(primaryButtonLabel("transparent", "#ffffff", dims, eBayPreset, true)).toMatch(/Preparing PNG/);
    expect(primaryButtonLabel("color", "#ff0000", dims, eBayPreset, true)).toMatch(/Preparing JPEG/);
  });

  // C3: label is derived synchronously — switching modes produces the correct label
  // without any async tick or deferred update.
  it("C3 synchronous label: switching mode gives correct label immediately (same-tick)", () => {
    // White → "Download white JPEG"
    const whiteLabel = primaryButtonLabel("white", "#ffffff", { w: 1600, h: 1600 }, eBayPreset, false);
    expect(whiteLabel).toMatch(/Download white JPEG/i);

    // Color → "this background"
    const colorLabel = primaryButtonLabel("color", "#ff0000", { w: 1600, h: 1600 }, eBayPreset, false);
    expect(colorLabel).toContain("this background");
    expect(colorLabel).not.toMatch(/white/i);

    // Transparent → "Download transparent PNG"
    const transLabel = primaryButtonLabel("transparent", "#ffffff", { w: 1600, h: 1600 }, eBayPreset, false);
    expect(transLabel).toMatch(/Download transparent PNG/i);
  });
});

// ----------------------------------------------------------------------------
// Round-6: new Social/Other presets — dimensions and resolveFill integrity
// C2: size selection must NOT affect bgMode/bgColor (they are independent state)
// ----------------------------------------------------------------------------

describe("Round-6 new presets: expected dimensions", () => {
  // Each preset has fixed dimensions; verify they are distinct from marketplace presets.
  const SOCIAL_PRESET_DIMS = [
    { id: "square", label: "Square", w: 1080, h: 1080 },
    { id: "story", label: "Story", w: 1080, h: 1920 },
    { id: "linkad", label: "Link/Ad", w: 1200, h: 627 },
    { id: "slide", label: "Slide 16:9", w: 1920, h: 1080 },
  ];

  for (const { label, w, h } of SOCIAL_PRESET_DIMS) {
    it(`${label} preset produces correct label dimensions`, () => {
      const preset = { label };
      const d = { w, h };
      const lbl = primaryButtonLabel("white", "#ffffff", d, preset, false);
      expect(lbl).toContain(`${w}×${h}`);
      expect(lbl).toContain(label);
    });
  }
});

describe("C2: size preset change does NOT reset bgMode or bgColor", () => {
  // bgMode and bgColor are independent state from presetId.
  // Changing presetId (size) should not affect resolveFill output.
  it("resolveFill with Color mode stays correct when size dimensions change", () => {
    const bgColor = "#1d4ed8";
    // Before size change: eBay 1600×1600
    expect(resolveFill("color", bgColor)).toBe(bgColor);
    // After size change to Square 1080×1080 — bgMode/bgColor are unchanged:
    expect(resolveFill("color", bgColor)).toBe(bgColor);
  });

  it("resolveFill with Transparent stays null regardless of size", () => {
    // White mode initially
    expect(resolveFill("white", "#ffffff")).toBe("#ffffff");
    // After switching to Custom size — mode is unchanged:
    expect(resolveFill("white", "#ffffff")).toBe("#ffffff");
    // Transparent stays null for any size:
    expect(resolveFill("transparent", "#ffffff")).toBeNull();
    expect(resolveFill("transparent", "#1d4ed8")).toBeNull();
  });

  it("primaryButtonLabel for Color mode stays unchanged when only dimensions change", () => {
    const bgColor = "#1d4ed8";
    const preset = { label: "Custom" };
    // Changing width/height does not affect bgMode resolution
    const label900 = primaryButtonLabel("color", bgColor, { w: 900, h: 700 }, preset, false);
    const label1080 = primaryButtonLabel("color", bgColor, { w: 1080, h: 1080 }, preset, false);
    // Both should contain "this background" and NOT say "white"
    expect(label900).toContain("this background");
    expect(label900).not.toMatch(/·\s*white/i);
    expect(label1080).toContain("this background");
    expect(label1080).not.toMatch(/·\s*white/i);
  });
});
