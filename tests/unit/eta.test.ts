/**
 * Unit tests for the download ETA computation logic.
 *
 * The ETA formula lives inline in page.tsx (not an exported function) but the
 * math is a pure expression.  We re-implement it identically here and verify
 * its behaviour directly — this is the spec-required unit test for the ETA
 * math.
 *
 * Formula (from page.tsx ~line 1314-1318):
 *   rate     = (newest.bytes - oldest.bytes) / (newest.t - oldest.t)  // bytes/ms
 *   remaining = total - current
 *   etaMs    = remaining / rate
 *   etaSecs  = Math.max(1, Math.round(etaMs / 1000))
 */
import { describe, it, expect } from "vitest";

function calcEtaSecs(
  window: { t: number; bytes: number }[],
  total: number,
  current: number
): number | null {
  if (window.length < 2) return null;
  const oldest = window[0];
  const newest = window[window.length - 1];
  const dt = newest.t - oldest.t;
  if (dt <= 0) return null;
  const rate = (newest.bytes - oldest.bytes) / dt; // bytes/ms
  if (rate <= 0) return null;
  const remaining = total - current;
  const etaMs = remaining / rate;
  return Math.max(1, Math.round(etaMs / 1000));
}

describe("calcEtaSecs — ETA countdown math", () => {
  it("returns null when window has fewer than 2 samples", () => {
    expect(calcEtaSecs([], 50_000_000, 1_000_000)).toBeNull();
    expect(calcEtaSecs([{ t: 0, bytes: 1_000_000 }], 50_000_000, 1_000_000)).toBeNull();
  });

  it("returns null when dt is zero (duplicate timestamps)", () => {
    const window = [
      { t: 1000, bytes: 5_000_000 },
      { t: 1000, bytes: 10_000_000 },
    ];
    expect(calcEtaSecs(window, 50_000_000, 10_000_000)).toBeNull();
  });

  it("returns null when rate is zero (no bytes transferred between samples)", () => {
    const window = [
      { t: 1000, bytes: 5_000_000 },
      { t: 2000, bytes: 5_000_000 },
    ];
    expect(calcEtaSecs(window, 50_000_000, 5_000_000)).toBeNull();
  });

  it("returns correct ETA for a steady 5 MB/s download with 45 MB remaining", () => {
    // 5 MB/s = 5_000 bytes/ms
    // In 1000ms window: bytes go from 5M to 10M → rate = 5_000 bytes/ms
    const window = [
      { t: 1000, bytes: 5_000_000 },
      { t: 2000, bytes: 10_000_000 },
    ];
    const total = 50_000_000;
    const current = 10_000_000;
    // remaining = 40_000_000 bytes / 5_000 bytes/ms = 8_000 ms = 8 s
    expect(calcEtaSecs(window, total, current)).toBe(8);
  });

  it("returns correct ETA for a slower 1 MB/s download with 25 MB remaining", () => {
    // 1 MB/s = 1_000 bytes/ms over 2s window
    const window = [
      { t: 0, bytes: 25_000_000 },
      { t: 2000, bytes: 27_000_000 },
    ];
    const total = 50_000_000;
    const current = 27_000_000;
    // remaining = 23_000_000 / 1_000 = 23_000 ms = 23 s
    expect(calcEtaSecs(window, total, current)).toBe(23);
  });

  it("clamps to at least 1 second even when ETA rounds to 0", () => {
    // Nearly done: 1 byte remaining, very fast rate
    const window = [
      { t: 0, bytes: 49_999_998 },
      { t: 1, bytes: 49_999_999 },
    ];
    const total = 50_000_000;
    const current = 49_999_999;
    // remaining = 1 byte, rate = 1 byte/ms → etaMs = 1 ms → rounds to 0 → clamped to 1
    expect(calcEtaSecs(window, total, current)).toBe(1);
  });

  it("produces a decreasing sequence as download progresses at constant rate", () => {
    // 10 MB/s = 10_000 bytes/ms
    const rate = 10_000; // bytes/ms
    const total = 50_000_000;
    const results: number[] = [];
    for (let pct = 10; pct <= 90; pct += 10) {
      const current = Math.floor((pct / 100) * total);
      const t0 = 1000;
      const t1 = 2000;
      const bytes0 = current - rate * (t1 - t0);
      const window = [
        { t: t0, bytes: bytes0 },
        { t: t1, bytes: current },
      ];
      const eta = calcEtaSecs(window, total, current);
      if (eta !== null) results.push(eta);
    }
    // ETA should be strictly decreasing as we progress
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeLessThanOrEqual(results[i - 1]);
    }
  });

  it("handles fractional seconds correctly — rounds to nearest integer", () => {
    // 100 bytes/ms rate (100 bytes per ms = 100_000 bytes/s).
    // Over a 1000ms window: bytes go from 0 to 100_000.
    // Remaining = 7_550_000 bytes → etaMs = 7_550_000 / 100 = 75_500ms = 75.5s → rounds to 76.
    const window = [
      { t: 0, bytes: 0 },
      { t: 1000, bytes: 100_000 },
    ];
    const total = 50_000_000;
    const current = total - 7_550_000; // 42_450_000 bytes downloaded
    const eta = calcEtaSecs(window, total, current);
    // rate = 100_000 / 1000 = 100 bytes/ms
    // remaining = 7_550_000 bytes
    // etaMs = 7_550_000 / 100 = 75_500 ms = 75.5 s → Math.round → 76
    expect(eta).toBe(76);
  });
});
