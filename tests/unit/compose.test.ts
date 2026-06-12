import { describe, it, expect } from "vitest";
import {
  clampMargin,
  marginBox,
  alphaCoverage,
  isNearEmpty,
  MARGIN_DEFAULT,
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
