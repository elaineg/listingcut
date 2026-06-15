/**
 * Round-8 / panel round-3 regression tests.
 *
 * Verifies the four changes from panel round-3 fix:
 *   A. DEFAULT preset is Square 1080×1080 (NOT eBay);
 *      "General & Social" group renders FIRST, "Marketplaces" SECOND;
 *      all marketplace presets still present and functional;
 *      eBay-guidelines line is NOT the dominant hero subline.
 *   B. Use-case line leads with "Headshots & avatars".
 *   C. Touch-up discoverability copy ("Hair or edges not perfect?") at result.
 *   D. First-run progress copy mentions the one-time ~50 MB model download.
 *
 * NO-REGRESSION checks:
 *   - eBay still exports 1600×1600
 *   - Etsy still exports 2000×2000
 *   - White corners ≈ (255,255,255)
 *   - Color #FF0000 corners ≈ (254,0,0) ±3
 *   - Transparent → PNG alpha 0 at preset size
 *   - Color choice survives switching presets (incl. Custom)
 *   - Reload-restore of saved prefs still works
 *   - Download label updates synchronously
 */

import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { pngSize } from "../utils/imageMeta";

const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");
const PROCESS_TIMEOUT = 300_000;

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
// A. Static: default preset + group order + eBay line placement
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3-A static: default Square + group order", () => {
  test("Square 1080×1080 is the default selected preset chip (NOT eBay)", async ({ page }) => {
    await page.goto("/");
    // Square must be aria-checked=true
    await expect(
      page.getByRole("radio", { name: "Square 1080×1080" })
    ).toHaveAttribute("aria-checked", "true");
    // eBay must NOT be the default
    await expect(
      page.getByRole("radio", { name: "eBay 1600×1600" })
    ).toHaveAttribute("aria-checked", "false");
  });

  test("General & Social group label appears BEFORE Marketplaces label in DOM", async ({ page }) => {
    await page.goto("/");
    const generalLabel = page.getByText("General & Social", { exact: true }).first();
    const marketplacesLabel = page.getByText("Marketplaces", { exact: true }).first();
    await expect(generalLabel).toBeVisible();
    await expect(marketplacesLabel).toBeVisible();

    // Verify DOM order: General & Social comes before Marketplaces
    const order = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("p, span, div, h1, h2, h3, h4, label"));
      const general = all.find(el => el.textContent?.trim() === "General & Social");
      const market = all.find(el => el.textContent?.trim() === "Marketplaces");
      if (!general || !market) return null;
      const pos = Node.DOCUMENT_POSITION_FOLLOWING;
      // general.compareDocumentPosition(market) should include FOLLOWING if market comes after
      return (general.compareDocumentPosition(market) & pos) !== 0;
    });
    expect(order).toBe(true);
  });

  test("all marketplace presets still visible (no regression)", async ({ page }) => {
    await page.goto("/");
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

  test("eBay-guidelines text is NOT in the hero subline or headline (demoted to footer note)", async ({ page }) => {
    await page.goto("/");
    // The headline must not mention eBay guidelines
    const h1Text = await page.locator("h1").first().textContent();
    expect(h1Text).not.toMatch(/eBay/i);

    // The paragraph immediately under the h1 (the subline/use-case line) must not be
    // the eBay-guidelines line. The subline should lead with "Headshots & avatars".
    const sublines = await page.locator("p").allTextContents();
    const heroSubline = sublines.find(t =>
      t.includes("avatars") || t.includes("Headshots")
    );
    expect(heroSubline).toBeTruthy();
    // The eBay guideline line is present but not the hero subline
    const ebayGuidelineIdx = sublines.findIndex(t =>
      t.match(/photo guidelines recommend/i)
    );
    const headshotsIdx = sublines.findIndex(t =>
      t.match(/Headshots.*avatars/i) || t.match(/avatars.*Headshots/i)
    );
    expect(ebayGuidelineIdx).toBeGreaterThan(-1); // still present
    // headshots line appears before the eBay guideline line
    expect(headshotsIdx).toBeLessThan(ebayGuidelineIdx);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Static: use-case line leads with "Headshots & avatars"
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3-B static: use-case line", () => {
  test("use-case line leads with 'Headshots & avatars'", async ({ page }) => {
    await page.goto("/");
    // The use-case microcopy line should contain "Headshots" first.
    // Use .first() to handle the case where the headshot hero tile caption
    // also matches this pattern (both are visible and correct).
    const useCaseLine = page.getByText(/Headshots.*avatars/i, { exact: false });
    await expect(useCaseLine.first()).toBeVisible();
    const text = await useCaseLine.first().textContent();
    // Text must start with "Headshots" or very close (not "marketplace" or "seller" first)
    const lower = (text ?? "").toLowerCase();
    const headshotsPos = lower.indexOf("headshots");
    const marketplacePos = lower.indexOf("marketplace");
    expect(headshotsPos).toBeGreaterThanOrEqual(0);
    // headshots should appear before marketplace
    expect(headshotsPos).toBeLessThan(marketplacePos > -1 ? marketplacePos : Infinity);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. Inference: touch-up discoverability copy at result
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3-C inference: touch-up copy visible at result", () => {
  test("'Hair or edges not perfect?' appears alongside Touch up button after processing", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // The discoverability copy should now be visible in the result panel
    await expect(
      page.getByText(/Hair or edges not perfect/i, { exact: false }).first()
    ).toBeVisible({ timeout: 10_000 });

    // Touch up button is also visible
    await expect(
      page.getByRole("button", { name: "Touch up" })
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D. Static: first-run progress copy mentions ~50 MB model download
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3-D static: 50MB model disclosure in drop zone", () => {
  test("drop zone discloses one-time ~50 MB model download BEFORE upload", async ({ page }) => {
    await page.goto("/");
    // Must be visible in the drop zone area before any file is dropped
    await expect(
      page.getByText(/50 MB/i, { exact: false }).first()
    ).toBeVisible();
    const fullText = await page.getByText(/50 MB/i, { exact: false }).first().textContent();
    expect(fullText).toMatch(/one-time/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Inference: A — Square 1080×1080 default exports correctly
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3-A inference: Square 1080×1080 default export", () => {
  test("default preset (Square 1080×1080) exports exactly 1080×1080 JPEG with white corners", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Default: Square 1080×1080, White mode — no interaction needed
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toBeVisible({ timeout: 10_000 });

    // Button label should reflect Square 1080×1080
    const label = await primaryBtn.textContent();
    expect(label).toContain("1080×1080");
    expect(label).toMatch(/JPEG/i);

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);

    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1080);
    expect(px.height).toBe(1080);
    // White corners ≈ (255,255,255) with ±3 JPEG tolerance
    for (const [r, g, b] of px.corners) {
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeGreaterThanOrEqual(252);
      expect(b).toBeGreaterThanOrEqual(252);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: eBay still 1600×1600 white, Etsy still 2000×2000
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: eBay + Etsy dimensions", () => {
  test("eBay exports exactly 1600×1600 JPEG with white corners", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    await expect(
      page.getByRole("radio", { name: "eBay 1600×1600" })
    ).toHaveAttribute("aria-checked", "true");

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("1600×1600");

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);

    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    // White corners
    for (const [r, g, b] of px.corners) {
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeGreaterThanOrEqual(252);
      expect(b).toBeGreaterThanOrEqual(252);
    }
  });

  test("Etsy exports exactly 2000×2000 JPEG", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "Etsy 2000×2000" }).click();
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("2000×2000");

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(2000);
    expect(px.height).toBe(2000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: Color #FF0000 corners ≈ (254,0,0) ±3
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: Color #FF0000 at eBay 1600×1600", () => {
  test("Color #FF0000 + eBay = 1600×1600 JPEG with red corners (±3 JPEG tolerance)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");

    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("this background");

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);

    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    // Red corners ≈ (254,0,0) ±3
    for (const [r, g, b] of px.corners) {
      expect(r).toBeGreaterThanOrEqual(251);
      expect(g).toBeLessThanOrEqual(5);
      expect(b).toBeLessThanOrEqual(5);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: Transparent → PNG alpha 0 at preset size (eBay 1600×1600)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: Transparent PNG at eBay 1600×1600", () => {
  test("Transparent mode + eBay = 1600×1600 PNG with alpha-0 corners", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Transparent" })).toHaveAttribute("aria-checked", "true");

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("transparent PNG");

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.png$/i);

    const buf = readFileSync((await dl.path())!);
    const size = pngSize(buf);
    expect(size?.width).toBe(1600);
    expect(size?.height).toBe(1600);

    const px = await decodeInPage(page, dl, "image/png");
    for (const [, , , a] of px.corners) {
      expect(a).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: Color choice survives switching presets (incl. Custom)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: color survives preset switch", () => {
  test("Color #FF0000 survives switching from eBay → Square → Custom and back", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Set Color #FF0000 on eBay
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();

    // Switch to Square
    await page.getByRole("radio", { name: "Square 1080×1080" }).click();
    // Color mode must persist
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
    const hexVal1 = await hexField.inputValue();
    expect(hexVal1.toLowerCase()).toBe("#ff0000");

    // Switch to Custom
    await page.getByRole("radio", { name: "Custom", exact: true }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
    const hexVal2 = await hexField.inputValue();
    expect(hexVal2.toLowerCase()).toBe("#ff0000");

    // Download button label should say "this background"
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("this background");
    await expect(primaryBtn).not.toContainText("white JPEG");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: Reload-restore of saved prefs
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: reload-restore", () => {
  test("saved prefs (eBay + Color + #FF0000 + margin 10) are restored after reload", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Set prefs
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();
    // Set margin to 10%
    await page.getByLabel("Margin — space around the subject").fill("10");
    await page.getByLabel("Margin — space around the subject").blur();

    // Allow prefs to persist (debounce in the app)
    await page.waitForTimeout(800);

    // Reload — prefs should be restored from localStorage
    await page.reload();
    await page.waitForLoadState("networkidle");

    // eBay should be selected (visible in static chips)
    await expect(
      page.getByRole("radio", { name: "eBay 1600×1600" })
    ).toHaveAttribute("aria-checked", "true");
    // Color mode restored (visible in bg radiogroup even disabled)
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
    // Margin restored (slider is rendered even disabled)
    const marginVal = await page.getByLabel("Margin — space around the subject").inputValue();
    expect(Number(marginVal)).toBe(10);

    // Process again to confirm hex value survived reload (hex field only renders when Color + enabled)
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });
    // After processing, controls are enabled — hex field should now be accessible
    const restoredHex = await hexField.inputValue();
    expect(restoredHex.toLowerCase()).toBe("#ff0000");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: Download label updates synchronously
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel3 no-regression: synchronous download label", () => {
  test("label updates immediately when switching White→Color→Transparent (no lag)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    const primaryBtn = page.getByTestId("primary-download-btn");

    await bgGroup.getByRole("radio", { name: "White" }).click();
    const whiteLabel = await primaryBtn.textContent();
    expect(whiteLabel).toMatch(/Download white JPEG/i);

    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const colorLabel = await primaryBtn.textContent();
    expect(colorLabel).toContain("this background");
    expect(colorLabel).not.toMatch(/Download white JPEG/i);

    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    const transLabel = await primaryBtn.textContent();
    expect(transLabel).toMatch(/Download transparent PNG/i);
    expect(transLabel).not.toContain("JPEG");
  });
});
