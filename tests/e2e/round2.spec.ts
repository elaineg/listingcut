import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize, pngSize } from "../utils/imageMeta";

/**
 * Round-2 feature regression: batch queue + ZIP download-all, touch-up brush,
 * new presets (Depop 1280×1280, Facebook 1200×1200, Custom W×H).
 *
 * One long test so the ~50MB model is downloaded once per run.
 * Selectors use roles/aria-labels, not transient UI copy, where possible.
 */

const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");
const FIX_PNG = join(__dirname, "..", "fixtures", "product.png");
const PROCESS_TIMEOUT = 300_000;

async function samplePixels(
  page: Page,
  download: Download,
  mime: string
): Promise<{
  width: number;
  height: number;
  corners: number[][];
  center: number[];
}> {
  const b64 = readFileSync((await download.path())!).toString("base64");
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
        center: px(Math.floor(c.width / 2), Math.floor(c.height / 2)),
      };
    },
    { b64, mime }
  );
}

function expectWhiteOpaqueCorners(corners: number[][]) {
  for (const [r, g, b, a] of corners) {
    expect(a).toBe(255);
    expect(r).toBeGreaterThanOrEqual(250);
    expect(g).toBeGreaterThanOrEqual(250);
    expect(b).toBeGreaterThanOrEqual(250);
  }
}

test.describe("round-2 features", () => {
  test("2-file batch → per-row downloads + ZIP; Depop/Facebook/Custom presets; touch-up erase changes export", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 240_000);

    await page.goto("/");

    // --- Batch: drop two files at once -----------------------------------
    await page.setInputFiles('input[type="file"]', [FIX_JPG, FIX_PNG]);

    // Both rows finish (sequential queue; first run includes model download).
    await expect(page.getByText("(2/2 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Each finished row has its own download (stable aria-labels).
    await expect(
      page.getByRole("button", { name: "Download product.jpg as white JPEG" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download product.png as white JPEG" })
    ).toBeVisible();

    // ZIP button appears once 2+ are done; default preset is eBay 1600×1600.
    const zipBtn = page.getByRole("button", { name: /Download all \(ZIP\)/ });
    await expect(zipBtn).toBeVisible();
    await expect(zipBtn).toContainText("2 photos");

    const zipDlPromise = page.waitForEvent("download", { timeout: 120_000 });
    await zipBtn.click();
    const zipDl = await zipDlPromise;
    expect(zipDl.suggestedFilename()).toMatch(/\.zip$/);

    // Parse the ZIP in node: one white JPEG per photo at the preset size.
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(readFileSync((await zipDl.path())!));
    const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
    expect(names).toHaveLength(2);
    for (const name of names) {
      expect(name).toMatch(/\.jpg$/);
      const buf = await zip.files[name].async("nodebuffer");
      expect(jpegSize(buf)).toEqual({ width: 1600, height: 1600 });
    }

    // --- New presets ------------------------------------------------------
    const primaryDl = page.getByRole("button", { name: /Download white JPEG/ });

    for (const { chip, w, h } of [
      { chip: "Depop 1280×1280", w: 1280, h: 1280 },
      { chip: "Facebook 1200×1200", w: 1200, h: 1200 },
    ]) {
      await page.getByRole("radio", { name: chip }).click();
      await expect(page.getByRole("radio", { name: chip })).toHaveAttribute(
        "aria-checked",
        "true"
      );
      await expect(
        page.getByAltText(`White-background preview at ${chip}`)
      ).toBeVisible({ timeout: 30_000 });

      const dlP = page.waitForEvent("download", { timeout: 60_000 });
      await primaryDl.click();
      const dl = await dlP;
      expect(dl.suggestedFilename()).toMatch(/\.jpg$/);
      const px = await samplePixels(page, dl, "image/jpeg");
      expect({ width: px.width, height: px.height }).toEqual({
        width: w,
        height: h,
      });
      expectWhiteOpaqueCorners(px.corners);
    }

    // Custom preset: enter 900×700, export matches exactly.
    await page.getByRole("radio", { name: "Custom", exact: true }).click();
    await page.getByLabel("Width").fill("900");
    await page.getByLabel("Height").fill("700");
    await page.getByLabel("Height").blur();
    await expect(
      page.getByAltText("White-background preview at Custom")
    ).toBeVisible({ timeout: 30_000 });
    await expect(primaryDl).toContainText("900×700");
    const customDlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryDl.click();
    const customDl = await customDlP;
    const customPx = await samplePixels(page, customDl, "image/jpeg");
    expect({ width: customPx.width, height: customPx.height }).toEqual({
      width: 900,
      height: 700,
    });
    expectWhiteOpaqueCorners(customPx.corners);

    // --- Touch-up brush ----------------------------------------------------
    // Baseline transparent PNG: subject occupies the fixture's center, so the
    // center pixel should be opaque before any erasing.
    const preDlP = page.waitForEvent("download", { timeout: 60_000 });
    await page
      .getByRole("button", { name: "Download transparent PNG" })
      .click();
    const prePng = await preDlP;
    expect(pngSize(readFileSync((await prePng.path())!))).not.toBeNull();
    const pre = await samplePixels(page, prePng, "image/png");
    expect(pre.center[3]).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Touch up" }).click();
    const eraseTool = page
      .getByRole("radiogroup", { name: "Touch-up tool" })
      .getByRole("radio", { name: "erase" });
    await eraseTool.click();
    await expect(eraseTool).toHaveAttribute("aria-checked", "true");

    // Scrub the brush across the canvas center. The editor canvas can be
    // taller than the viewport; page.mouse only reaches on-screen points, so
    // center the canvas in the viewport first.
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await canvas.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" })
    );
    const box = (await canvas.boundingBox())!;
    const cy = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.35, cy);
    await page.mouse.down();
    for (let i = 0; i <= 10; i++) {
      await page.mouse.move(box.x + box.width * (0.35 + 0.03 * i), cy, {
        steps: 4,
      });
    }
    await page.mouse.up();

    // The stroke registered iff an undo snapshot was pushed.
    await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();

    await page.getByRole("button", { name: "Done", exact: true }).click();

    // Export reflects the fix: erased center is now transparent.
    await expect(
      page.getByRole("button", { name: "Download transparent PNG" })
    ).toBeVisible({ timeout: 30_000 });
    const postDlP = page.waitForEvent("download", { timeout: 60_000 });
    await page
      .getByRole("button", { name: "Download transparent PNG" })
      .click();
    const postPng = await postDlP;
    const post = await samplePixels(page, postPng, "image/png");
    expect(post.center[3]).toBe(0);
    for (const [, , , a] of post.corners) expect(a).toBe(0);
  });
});
