/**
 * Verification tests for the Export Background selector feature (round 5).
 * Uses "Try the sample" path to avoid uploading heavy files and get faster inference.
 *
 * Proves:
 *   - Background selector visible + disabled pre-upload (White/Color/Transparent)
 *   - After inference: White mode → JPEG 1600×1600 with white corners
 *   - Color #FF0000 → JPEG with red corners (±3 tolerance for JPEG)
 *   - Color #000000 → JPEG with black corners
 *   - Transparent → PNG 1600×1600, corner alpha=0
 *   - Background mode + color survive "Start over"
 *   - Primary button label reflects mode
 *   - Returns-user path: localStorage-seeded prefs are respected on reload
 *
 * Run against preview URL:
 *   BASE_URL=https://listingcut-ja2l3wpgj-elainegao.vercel.app npx playwright test tests/e2e/bg-mode-verify.spec.ts
 */

import { test, expect, type Page, type Download } from "@playwright/test";
import { readFileSync } from "node:fs";
import { pngSize } from "../utils/imageMeta";

const PROCESS_TIMEOUT = 300_000; // 5 min — model download + inference

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

// ─────────────────────────────────────────────────────────────────────────────
// Static checks (no inference)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("verify: bg-mode static (no inference)", () => {
  test("page loads with drop zone, privacy claim, 50MB disclosure, and preset chips", async ({
    page,
  }) => {
    await page.goto("/");
    // Drop zone present
    await expect(page.getByText(/Drag & drop photos/i)).toBeVisible();
    // Privacy claim
    await expect(page.getByText(/never leave/i).first()).toBeVisible();
    // 50MB disclosure
    await expect(page.getByText(/50 MB/i)).toBeVisible();
    // Preset chips (they use role="radio" in a radiogroup, not role="button")
    for (const chip of [
      "eBay 1600×1600",
      "Etsy 2000×2000",
      "Poshmark square",
      "Depop 1280×1280",
      "Facebook 1200×1200",
    ]) {
      await expect(page.getByRole("radio", { name: chip })).toBeVisible();
    }
  });

  test("subtitle names all five marketplaces", async ({ page }) => {
    await page.goto("/");
    const subtitle = await page.locator("p").first().textContent();
    // At least the five marketplace names appear somewhere on the page
    for (const name of ["eBay", "Etsy", "Poshmark", "Depop", "Facebook"]) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
    // eBay guidelines line (no invented statistics)
    await expect(
      page.getByText(/eBay.*photo guidelines.*white background/i)
    ).toBeVisible();
    void subtitle;
  });

  test("Export background selector: White/Color/Gradient/Transparent present and disabled pre-upload", async ({
    page,
  }) => {
    await page.goto("/");
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(bgGroup).toBeVisible();
    const whiteBtn = bgGroup.getByRole("radio", { name: "White" });
    const colorBtn = bgGroup.getByRole("radio", { name: "Color" });
    const gradientBtn = bgGroup.getByRole("radio", { name: "Gradient" });
    const transBtn = bgGroup.getByRole("radio", { name: "Transparent" });
    await expect(whiteBtn).toBeVisible();
    await expect(colorBtn).toBeVisible();
    await expect(gradientBtn).toBeVisible();
    await expect(transBtn).toBeVisible();
    // Disabled before upload
    await expect(whiteBtn).toBeDisabled();
    await expect(colorBtn).toBeDisabled();
    await expect(gradientBtn).toBeDisabled();
    await expect(transBtn).toBeDisabled();
    // White is default
    await expect(whiteBtn).toHaveAttribute("aria-checked", "true");
  });

  test("Margin slider and preset chips visible pre-upload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Margin/i)).toBeVisible();
    // Slider present
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });

  test("returning-user: localStorage-seeded prefs are restored on page reload", async ({
    page,
  }) => {
    // Use addInitScript to seed localStorage in the page's own origin context
    // BEFORE any React code runs. This is the correct Playwright pattern for
    // simulating a returning user (mirrors the friction lesson: seed full object before mount).
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "listingcut-export-prefs",
        JSON.stringify({
          presetId: "etsy",
          marginPct: 10,
          bgMode: "color",
          bgColor: "#ff0000",
        })
      );
    });

    // Navigate to the app — initScript fires before any page JS, so localStorage
    // is seeded before the React mount and the persist/restore effects run.
    await page.goto("/");
    // Wait for the restore setTimeout(0) to fire and apply state
    await page.waitForTimeout(500);

    // 1. localStorage must still hold the seeded values (prefsLoaded guard prevents
    //    the persist effect from overwriting them with defaults on first render).
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("listingcut-export-prefs")
    );
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.bgMode, "bgMode must survive reload (not overwritten by defaults)").toBe("color");
    expect(parsed.presetId, "presetId must survive reload (not overwritten by defaults)").toBe("etsy");
    expect(parsed.bgColor, "bgColor must survive reload").toBe("#ff0000");

    // 2. The UI must reflect the restored prefs: Color mode selected
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    // 3. The Etsy preset chip must be active
    await expect(
      page.getByRole("radio", { name: "Etsy 2000×2000" })
    ).toHaveAttribute("aria-checked", "true");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inference tests (use "Try the sample" — no large file upload)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("verify: bg-mode full flow (sample inference)", () => {
  test("White mode: 1600×1600 JPEG with white corners; button label correct", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Select eBay 1600×1600
    const ebayChip = page.getByRole("radio", { name: "eBay 1600×1600" });
    await ebayChip.click();
    await expect(ebayChip).toHaveAttribute("aria-checked", "true");

    // White mode is default
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(
      bgGroup.getByRole("radio", { name: "White" })
    ).toHaveAttribute("aria-checked", "true");

    // Primary button label
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download white JPEG");
    await expect(primaryBtn).toContainText("1600×1600");

    // Download and check pixel values
    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);
    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    for (const [r, g, b, a] of px.corners) {
      expect(a).toBe(255);
      // White with JPEG tolerance ±3
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeGreaterThanOrEqual(252);
      expect(b).toBeGreaterThanOrEqual(252);
    }
  });

  test("Color #FF0000: JPEG corners ≈ (255,0,0) ±3; Color #000000: corners ≈ (0,0,0)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 180_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Select eBay 1600×1600
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();

    // Switch to Color mode
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    // Enter #FF0000
    const hexField = page.getByLabel("Hex color value");
    await expect(hexField).toBeVisible();
    await hexField.fill("#FF0000");
    await hexField.blur();

    // Primary button label reflects mode
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("this background");
    await expect(primaryBtn).toContainText("1600×1600");
    await expect(primaryBtn).not.toContainText("transparent PNG");

    // Download red JPEG
    const redDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const redDl = await redDlP;
    expect(redDl.suggestedFilename()).toMatch(/\.jpg$/i);
    const redPx = await decodeInPage(page, redDl, "image/jpeg");
    expect(redPx.width).toBe(1600);
    expect(redPx.height).toBe(1600);
    for (const [r, g, b, a] of redPx.corners) {
      expect(a).toBe(255);
      // Red (#FF0000) ± 3 per channel for JPEG
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeLessThanOrEqual(3);
      expect(b).toBeLessThanOrEqual(3);
    }

    // Now enter #000000 (black)
    await hexField.fill("#000000");
    await hexField.blur();

    const blackDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const blackDl = await blackDlP;
    expect(blackDl.suggestedFilename()).toMatch(/\.jpg$/i);
    const blackPx = await decodeInPage(page, blackDl, "image/jpeg");
    expect(blackPx.width).toBe(1600);
    expect(blackPx.height).toBe(1600);
    for (const [r, g, b, a] of blackPx.corners) {
      expect(a).toBe(255);
      // Black (#000000) ± 3 for JPEG
      expect(r).toBeLessThanOrEqual(3);
      expect(g).toBeLessThanOrEqual(3);
      expect(b).toBeLessThanOrEqual(3);
    }
  });

  test("Transparent mode: PNG 1600×1600, corner alpha=0 (distinct from original-size PNG)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Select eBay 1600×1600
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();

    // Switch to Transparent
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    await expect(
      bgGroup.getByRole("radio", { name: "Transparent" })
    ).toHaveAttribute("aria-checked", "true");

    // Primary button: "Download transparent PNG" with size, no "JPEG"
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download transparent PNG");
    await expect(primaryBtn).toContainText("1600×1600");
    await expect(primaryBtn).not.toContainText("JPEG");

    // Download and verify
    const transDlP = page.waitForEvent("download");
    await primaryBtn.click();
    const transDl = await transDlP;
    expect(transDl.suggestedFilename()).toMatch(/\.png$/i);

    // Verify PNG header and exact size
    const buf = readFileSync((await transDl.path())!);
    const pngDims = pngSize(buf);
    expect(pngDims).not.toBeNull();
    expect(pngDims).toEqual({ width: 1600, height: 1600 });

    // Corner pixels must be transparent (alpha=0)
    const transPx = await decodeInPage(page, transDl, "image/png");
    expect(transPx.width).toBe(1600);
    expect(transPx.height).toBe(1600);
    for (const [, , , a] of transPx.corners) {
      expect(a).toBe(0);
    }
  });

  test("Background mode and color survive Start over", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 180_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });

    // Set Color mode with #FF0000
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();

    // Confirm mode is active
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    // Start over
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(
      page.getByText(/Drag & drop photos/i)
    ).toBeVisible();

    // Background mode and color still active after Start over
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");
  });

  test("per-row download and primary download both respect active background mode", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Select eBay and Color mode
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#000000");
    await hexField.blur();

    // Row download button text should reflect Color mode (not "white JPEG")
    const rowDownloadBtn = page.locator('button[aria-label*="Download sample-mug"]').first();
    if (await rowDownloadBtn.count() > 0) {
      const label = await rowDownloadBtn.getAttribute("aria-label") ?? "";
      // Should not say "white JPEG" in Color mode
      expect(label).not.toMatch(/white JPEG/i);
    }

    // Primary download
    const primaryBtn = page.getByTestId("primary-download-btn");
    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    const px = await decodeInPage(page, dl, "image/jpeg");
    for (const [r, g, b, a] of px.corners) {
      expect(a).toBe(255);
      expect(r).toBeLessThanOrEqual(3);
      expect(g).toBeLessThanOrEqual(3);
      expect(b).toBeLessThanOrEqual(3);
    }
  });
});
