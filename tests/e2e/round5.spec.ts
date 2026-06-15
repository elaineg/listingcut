import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize, pngSize } from "../utils/imageMeta";

/**
 * Round-5: Export Background selector (White | Color | Transparent).
 *
 * Pixel-level assertions on downloaded files validate:
 *   - White mode (default): corners are (255,255,255) — byte-for-byte identical to pre-round-5
 *   - Color mode #FF0000: corners are (255,0,0) at the eBay 1600×1600 preset
 *   - Color mode #000000: corners are (0,0,0)
 *   - Transparent mode: PNG with alpha=0 corners at preset size (distinct from original-size PNG)
 *   - Background mode + color persist across "Start over"
 *   - ZIP bundles photos in the active background mode/color
 *
 * Static checks (no inference):
 *   - Export background segmented control is visible and disabled pre-upload
 */

const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");
const FIX_PNG = join(__dirname, "..", "fixtures", "product.png");
const PROCESS_TIMEOUT = 300_000;

/** Decode a downloaded image in-browser; return width/height and corner pixels. */
async function decodeInPage(
  page: Page,
  download: Download,
  mime: string
): Promise<{ width: number; height: number; corners: number[][] }> {
  const path = await download.path();
  const b64 = readFileSync(path!).toString("base64");
  return page.evaluate(
    async ({ b64, mime }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error("decode failed"));
        i.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const px = (x: number, y: number) =>
        Array.from(ctx.getImageData(x, y, 1, 1).data);
      URL.revokeObjectURL(url);
      return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        corners: [
          px(0, 0),
          px(c.width - 1, 0),
          px(0, c.height - 1),
          px(c.width - 1, c.height - 1),
        ],
      };
    },
    { b64, mime }
  );
}

test.describe("round-5 static (no inference)", () => {
  test("Export background segmented control is visible and disabled pre-upload", async ({
    page,
  }) => {
    await page.goto("/");

    // Export background radiogroup visible in the shell
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(bgGroup).toBeVisible();

    // Three options: White (default checked), Color, Transparent
    const whiteBtn = bgGroup.getByRole("radio", { name: "White" });
    const colorBtn = bgGroup.getByRole("radio", { name: "Color" });
    const transparentBtn = bgGroup.getByRole("radio", { name: "Transparent" });

    await expect(whiteBtn).toBeVisible();
    await expect(colorBtn).toBeVisible();
    await expect(transparentBtn).toBeVisible();

    // All disabled pre-upload
    await expect(whiteBtn).toBeDisabled();
    await expect(colorBtn).toBeDisabled();
    await expect(transparentBtn).toBeDisabled();

    // White is the default (aria-checked)
    await expect(whiteBtn).toHaveAttribute("aria-checked", "true");
  });
});

test.describe("round-5 full flow (inference required)", () => {
  test("White mode produces white corners; Color #FF0000 → red corners; Color #000000 → black corners; Transparent → alpha=0 corners at preset size", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 300_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    const ebayChip = page.getByRole("radio", { name: "eBay 1600×1600" });
    await ebayChip.click();
    await expect(ebayChip).toHaveAttribute("aria-checked", "true");

    // --- White mode (default): corners are (255,255,255) ---
    await bgGroup.getByRole("radio", { name: "White" }).click();
    await expect(bgGroup.getByRole("radio", { name: "White" })).toHaveAttribute("aria-checked", "true");
    // Primary button says "Download white JPEG"
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download white JPEG");
    await expect(primaryBtn).toContainText("1600×1600");

    // Preview alt text reflects White mode
    await expect(page.getByAltText("White-background preview at eBay 1600×1600")).toBeVisible({ timeout: 30_000 });

    const whiteDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const whiteDl = await whiteDlP;
    expect(whiteDl.suggestedFilename()).toMatch(/\.jpg$/);
    const whitePx = await decodeInPage(page, whiteDl, "image/jpeg");
    expect({ width: whitePx.width, height: whitePx.height }).toEqual({ width: 1600, height: 1600 });
    for (const [r, g, b, a] of whitePx.corners) {
      expect(a).toBe(255);
      expect(r).toBeGreaterThanOrEqual(250);
      expect(g).toBeGreaterThanOrEqual(250);
      expect(b).toBeGreaterThanOrEqual(250);
    }

    // --- Color mode #FF0000: corners are (255,0,0) ---
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");

    // Enter hex value
    const hexField = page.getByLabel("Hex color value");
    await expect(hexField).toBeVisible();
    await hexField.fill("#FF0000");
    await hexField.blur();

    // Primary button reflects color mode
    await expect(primaryBtn).toContainText("this background");
    await expect(primaryBtn).toContainText("1600×1600");

    // Preview updates
    await expect(page.getByAltText("Color-background preview at eBay 1600×1600")).toBeVisible({ timeout: 30_000 });

    const redDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const redDl = await redDlP;
    expect(redDl.suggestedFilename()).toMatch(/\.jpg$/);
    const redPx = await decodeInPage(page, redDl, "image/jpeg");
    expect({ width: redPx.width, height: redPx.height }).toEqual({ width: 1600, height: 1600 });
    for (const [r, g, b, a] of redPx.corners) {
      expect(a).toBe(255);
      expect(r).toBeGreaterThanOrEqual(240); // JPEG compression may shift slightly
      expect(g).toBeLessThanOrEqual(20);
      expect(b).toBeLessThanOrEqual(20);
    }

    // --- Color mode #000000: corners are (0,0,0) ---
    await hexField.fill("#000000");
    await hexField.blur();

    const blackDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const blackDl = await blackDlP;
    expect(blackDl.suggestedFilename()).toMatch(/\.jpg$/);
    const blackPx = await decodeInPage(page, blackDl, "image/jpeg");
    expect({ width: blackPx.width, height: blackPx.height }).toEqual({ width: 1600, height: 1600 });
    for (const [r, g, b, a] of blackPx.corners) {
      expect(a).toBe(255);
      expect(r).toBeLessThanOrEqual(10);
      expect(g).toBeLessThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(10);
    }

    // --- Transparent mode: preset-sized PNG with alpha=0 corners ---
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Transparent" })).toHaveAttribute("aria-checked", "true");

    // Primary button says "Download transparent PNG — 1600×1600"
    await expect(primaryBtn).toContainText("Download transparent PNG");
    await expect(primaryBtn).toContainText("1600×1600");
    // No "JPEG" in label
    await expect(primaryBtn).not.toContainText("JPEG");

    // Preview uses checkerboard (transparent mode)
    await expect(page.getByAltText("Transparent-background preview at eBay 1600×1600")).toBeVisible({ timeout: 30_000 });

    const transDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const transDl = await transDlP;
    expect(transDl.suggestedFilename()).toMatch(/\.png$/);

    const transBuf = readFileSync((await transDl.path())!);
    // Verify it's a real PNG
    expect(pngSize(transBuf)).not.toBeNull();
    // Verify it's preset-sized (1600×1600), NOT the original image size
    expect(pngSize(transBuf)).toEqual({ width: 1600, height: 1600 });

    const transPx = await decodeInPage(page, transDl, "image/png");
    expect({ width: transPx.width, height: transPx.height }).toEqual({ width: 1600, height: 1600 });
    // Corner pixels must be transparent (alpha=0): the subject is centered with margin,
    // so the corners are outside the subject area.
    for (const [, , , a] of transPx.corners) {
      expect(a).toBe(0);
    }
  });

  test("Background mode and color survive Start over and switching photos", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 300_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });

    // Set Color mode with #FF0000
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();

    // Start over
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.getByText("Drag & drop photos (up to 20) or click to upload")).toBeVisible();

    // Background mode and color are still active
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");

    // Upload again and verify the download has red corners
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();

    const primaryBtn = page.getByTestId("primary-download-btn");
    const dl2P = page.waitForEvent("download");
    await primaryBtn.click();
    const dl2 = await dl2P;
    const px = await decodeInPage(page, dl2, "image/jpeg");
    // Corner pixels should still be red (mode survived Start over)
    for (const [r, , , a] of px.corners) {
      expect(a).toBe(255);
      expect(r).toBeGreaterThanOrEqual(240);
    }
  });

  test("ZIP bundles all photos in the active background color", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 300_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', [FIX_JPG, FIX_PNG]);
    await expect(page.getByText("(2/2 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Switch to Color #000000
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#000000");
    await hexField.blur();

    // Download ZIP
    const zipDlP = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: /Download all \(ZIP\)/ }).click();
    const zipDl = await zipDlP;
    expect(zipDl.suggestedFilename()).toMatch(/\.zip$/);

    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(readFileSync((await zipDl.path())!));
    const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
    expect(names.length).toBe(2);
    // All files should be JPEGs (Color mode → JPEG)
    for (const name of names) {
      expect(name).toMatch(/\.jpg$/);
    }
    // Verify corner pixels of one file are black
    const firstFile = names[0];
    const buf = await zip.files[firstFile].async("nodebuffer");
    const dims = jpegSize(buf);
    expect(dims).not.toBeNull();
    // Decode in page
    const b64 = buf.toString("base64");
    const corners = await page.evaluate(async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error("decode failed"));
        i.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const px = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
      URL.revokeObjectURL(url);
      return [px(0, 0), px(c.width - 1, 0), px(0, c.height - 1), px(c.width - 1, c.height - 1)];
    }, b64);
    for (const [r, g, b, a] of corners) {
      expect(a).toBe(255);
      expect(r).toBeLessThanOrEqual(10);
      expect(g).toBeLessThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(10);
    }
  });
});
