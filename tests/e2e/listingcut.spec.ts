import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize, pngSize } from "../utils/imageMeta";

const FIXTURE = join(__dirname, "..", "fixtures", "product.jpg");

// First run downloads a ~50MB WASM model and inference takes 5-20s+; be generous.
const PROCESS_TIMEOUT = 300_000;

/**
 * Decode a downloaded image inside the live page (browser canvas is the
 * decoder node lacks) and sample its four corner pixels.
 */
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

test.describe("UI shell (no inference)", () => {
  test("drop zone, privacy claim, and disabled preset chips are visible", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const resp = await page.goto("/");
    expect(resp?.status()).toBe(200);

    // Success check 1: drop zone + privacy claim + pre-upload model disclosure,
    // visible without uploading.
    await expect(
      page.getByText("Drag & drop photos (up to 20) or click to upload")
    ).toBeVisible();
    await expect(
      page.getByText("Your photo never leaves this device", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("First photo downloads a one-time ~50 MB tool", {
        exact: false,
      })
    ).toBeVisible();
    await expect(
      page.getByText("All processing happens in your browser", { exact: false })
    ).toBeVisible();

    // Success check 2: preset chips visible, disabled pre-cutout.
    for (const chip of [
      "eBay 1600×1600",
      "Etsy 2000×2000",
      "Poshmark square",
      "Depop 1280×1280",
      "Facebook 1200×1200",
      "Custom",
    ]) {
      const btn = page.getByRole("radio", { name: chip });
      await expect(btn).toBeVisible();
      await expect(btn).toBeDisabled();
    }
    expect(errors).toEqual([]);
  });
});

test.describe("full flow (model download + inference)", () => {
  test("upload → progress → cutout → transparent PNG → preset JPEG exports", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    // Privacy: record every request from before the upload onward.
    const requests: { method: string; url: string; hasBody: boolean }[] = [];
    page.on("request", (r) =>
      requests.push({
        method: r.method(),
        url: r.url(),
        hasBody: !!r.postData(),
      })
    );

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIXTURE);

    // Success check 3: a status indicator appears immediately (not a frozen page).
    await expect(page.getByText("Working on your photo…")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Downloading model", { exact: false })).toBeVisible();
    await expect(page.getByText("Removing background…")).toBeVisible();

    // ...and resolves to the done state.
    await expect(page.getByText("Done — here’s your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Success check 4: side-by-side original + transparent cutout.
    await expect(page.getByAltText("Original photo")).toBeVisible();
    await expect(
      page.getByAltText("Cutout with transparent background")
    ).toBeVisible();

    // Download PNG (secondary option) and assert corner alpha is 0.
    const pngDl = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download transparent PNG" })
      .click();
    const png = await pngDl;
    expect(png.suggestedFilename()).toMatch(/\.png$/);
    const pngBuf = readFileSync((await png.path())!);
    expect(pngSize(pngBuf)).not.toBeNull(); // really a PNG
    const pngPx = await decodeInPage(page, png, "image/png");
    for (const [, , , a] of pngPx.corners) expect(a).toBe(0);

    // Success check 5: preset JPEG exports with exact sizes + white corners.
    const cases = [
      { chip: "eBay 1600×1600", w: 1600, h: 1600 },
      { chip: "Etsy 2000×2000", w: 2000, h: 2000 },
      { chip: "Poshmark square", w: null, h: null }, // square: width === height
    ] as const;
    for (const { chip, w, h } of cases) {
      await page.getByRole("radio", { name: chip }).click();
      await expect(page.getByRole("radio", { name: chip })).toHaveAttribute(
        "aria-checked",
        "true"
      );
      // Preview thumbnail tracks the selected preset.
      await expect(
        page.getByAltText(`White-background preview at ${chip}`)
      ).toBeVisible({ timeout: 30_000 });

      const dl = page.waitForEvent("download");
      await page.locator("button", { hasText: "JPEG" }).click();
      const jpeg = await dl;
      expect(jpeg.suggestedFilename()).toMatch(/\.jpg$/);
      const dims = jpegSize(readFileSync((await jpeg.path())!));
      expect(dims).not.toBeNull();
      if (w && h) {
        expect(dims).toEqual({ width: w, height: h });
      } else {
        expect(dims!.width).toBe(dims!.height);
      }
      const px = await decodeInPage(page, jpeg, "image/jpeg");
      for (const [r, g, b, a] of px.corners) {
        expect(a).toBe(255);
        expect(r).toBeGreaterThanOrEqual(250);
        expect(g).toBeGreaterThanOrEqual(250);
        expect(b).toBeGreaterThanOrEqual(250);
      }
    }

    // Success check 6: privacy — no request carries an upload payload; the
    // only fetches are GETs for static assets / model files.
    const nonGet = requests.filter((r) => r.method !== "GET" || r.hasBody);
    expect(nonGet).toEqual([]);
  });
});
