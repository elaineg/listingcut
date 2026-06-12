import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pngSize, jpegSize } from "../utils/imageMeta";

const fixtures = join(__dirname, "..", "fixtures");

describe("pngSize", () => {
  it("reads dimensions from a real PNG", () => {
    const buf = readFileSync(join(fixtures, "product.png"));
    expect(pngSize(buf)).toEqual({ width: 600, height: 600 });
  });
  it("rejects non-PNG data", () => {
    expect(pngSize(Buffer.from("not a png at all, sorry"))).toBeNull();
    expect(pngSize(readFileSync(join(fixtures, "product.jpg")))).toBeNull();
  });
});

describe("jpegSize", () => {
  it("reads dimensions from a real JPEG", () => {
    const buf = readFileSync(join(fixtures, "product.jpg"));
    expect(jpegSize(buf)).toEqual({ width: 600, height: 600 });
  });
  it("rejects non-JPEG data", () => {
    expect(jpegSize(Buffer.from([0, 1, 2, 3, 4, 5]))).toBeNull();
    expect(jpegSize(readFileSync(join(fixtures, "product.png")))).toBeNull();
  });
});
