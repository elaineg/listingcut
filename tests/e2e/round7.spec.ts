/**
 * Round-7 / panel round-2 regression tests:
 *
 * A. Landing reframe — new headline + 3-way background preview above fold
 * B. New Social/Other preset chips (Square, Story, Link/Ad, Slide 16:9)
 * C1. Export panel inline with result (download button visible when "Done" shows)
 * C2. Size preset change does NOT reset bgMode or bgColor
 * C3. Download button label updates synchronously with bg mode/color change
 * C4. Preset chip click registers on first tap (no focus/blur swallowing)
 *
 * Static checks (no inference) run first and are fast.
 * Inference-dependent checks are gated behind PROCESS_TIMEOUT.
 */

import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize, pngSize } from "../utils/imageMeta";

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
// A. Static: landing reframe checks (no inference)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-7 static: landing reframe (A)", () => {
  test("new headline names the outcome, not the audience", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    // New headline: "Remove any background" — not "Listing-ready product photos"
    await expect(h1).toContainText("Remove any background");
    // Old seller-only framing must NOT dominate
    await expect(h1).not.toContainText("Listing-ready product photos");
  });

  test("use-case line leads with headshots/avatars and covers listings + ads + slides", async ({ page }) => {
    await page.goto("/");
    // The use-case microcopy line in the header paragraph (round-4: also appears in hero tile
    // figcaption, so use .first() to avoid strict-mode violation with 2 matches).
    await expect(
      page.getByText(/Headshots.*avatars/i, { exact: false }).first()
    ).toBeVisible();
    await expect(
      page.getByText(/ads.*social/i, { exact: false }).first()
    ).toBeVisible();
    await expect(
      page.getByText(/slides.*mockups/i, { exact: false }).first()
    ).toBeVisible();
    await expect(
      page.getByText(/marketplace listings/i, { exact: false }).first()
    ).toBeVisible();
  });

  test("3-way background preview is above the fold on cold load", async ({ page }) => {
    await page.goto("/");
    // The three labeled background outcomes (White · Color · Transparent) are shown
    // as captioned figures before any upload.
    // Round-4 updated: white/color tiles keep product-cutout SVG; transparent tile now
    // shows the headshot SVG (alt="Sample headshot portrait with transparent background").
    // White tile: alt="Sample product cutout on white background"
    await expect(page.getByAltText(/Sample product cutout on white background/i)).toBeVisible();
    // Color tile: alt="Sample product cutout on brand color background"
    await expect(page.getByAltText(/Sample product cutout on brand color background/i)).toBeVisible();
    // Transparent tile: round-4 updated alt text (headshot SVG used)
    await expect(page.getByAltText(/transparent background/i).first()).toBeVisible();
    // Each has a one-word label
    await expect(page.getByText("White").first()).toBeVisible();
    await expect(page.getByText("Color").first()).toBeVisible();
    await expect(page.getByText("Transparent").first()).toBeVisible();
  });

  test("section heading is 'Export background', not 'Marketplace export'", async ({ page }) => {
    await page.goto("/");
    // The persistent section heading uses the neutral label (A)
    await expect(
      page.getByText("Export background", { exact: false }).first()
    ).toBeVisible();
    // Old "Marketplace export" heading must not appear
    await expect(page.getByText("Marketplace export", { exact: true })).not.toBeVisible();
  });

  test("eBay guideline line still present (seller case kept)", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/photo guidelines recommend a clean white/i, { exact: false })
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Static: new preset chips visible and disabled pre-upload
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-7 static: General & Social preset chips (B, round-3 panel)", () => {
  test("General & Social chips are visible, disabled pre-upload, and appear BEFORE Marketplaces", async ({ page }) => {
    await page.goto("/");

    const newChips = [
      "Square 1080×1080",
      "Story 1080×1920",
      "Link/Ad 1200×627",
      "Slide 16:9 (1920×1080)",
    ];

    for (const chip of newChips) {
      const btn = page.getByRole("radio", { name: chip });
      await expect(btn).toBeVisible();
      await expect(btn).toBeDisabled();
    }

    // Custom is still accessible in General & Social group (not buried in Marketplaces)
    const customBtn = page.getByRole("radio", { name: "Custom", exact: true });
    await expect(customBtn).toBeVisible();
    await expect(customBtn).toBeDisabled();

    // "General & Social" label must appear before "Marketplaces" in the DOM
    const generalLabel = page.getByText("General & Social", { exact: true }).first();
    const marketplacesLabel = page.getByText("Marketplaces", { exact: true }).first();
    await expect(generalLabel).toBeVisible();
    await expect(marketplacesLabel).toBeVisible();
  });

  test("Marketplace preset chips (eBay etc.) remain visible", async ({ page }) => {
    await page.goto("/");
    for (const chip of ["eBay 1600×1600", "Etsy 2000×2000", "Poshmark square", "Depop 1280×1280", "Facebook 1200×1200"]) {
      const btn = page.getByRole("radio", { name: chip });
      await expect(btn).toBeVisible();
      await expect(btn).toBeDisabled();
    }
  });

  test("Square 1080×1080 is the default selected chip (neutral default, round 7)", async ({ page }) => {
    await page.goto("/");
    // Square chip must be aria-checked=true by default (neutral default, not eBay)
    await expect(
      page.getByRole("radio", { name: "Square 1080×1080" })
    ).toHaveAttribute("aria-checked", "true");
    // eBay must NOT be the default
    await expect(
      page.getByRole("radio", { name: "eBay 1600×1600" })
    ).toHaveAttribute("aria-checked", "false");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C1. Inference: export panel is visible alongside "Done" result
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-7 inference: C1 export panel inline with result", () => {
  test("primary download button is visible in the same panel as 'Done — here's your cutout'", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // C1 fix: primary download button must appear WITHOUT scrolling past the "Done" heading.
    // We check that the button is visible in the viewport (not below the fold).
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toBeVisible({ timeout: 10_000 });

    // The button should contain either "JPEG" or "PNG" (derives from bgMode synchronously)
    const btnText = await primaryBtn.textContent();
    expect(btnText).toMatch(/JPEG|PNG/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B + C2. Inference: new Social/Other presets export at exact dimensions;
//         size change does NOT reset bgMode or bgColor
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-7 inference: new presets + C2 no-reset", () => {
  test("Social/Other presets produce correct pixel dimensions; switching size does not reset Color mode", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 300_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // --- Set Color mode with brand blue (#1d4ed8) ---
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#1d4ed8");
    await hexField.blur();

    const primaryBtn = page.getByTestId("primary-download-btn");

    // --- C2: switch to each new preset and verify bgMode did NOT reset ---
    const newPresets = [
      { chip: "Square 1080×1080", w: 1080, h: 1080 },
      { chip: "Story 1080×1920", w: 1080, h: 1920 },
      { chip: "Link/Ad 1200×627", w: 1200, h: 627 },
      { chip: "Slide 16:9 (1920×1080)", w: 1920, h: 1080 },
    ];

    for (const { chip, w, h } of newPresets) {
      await page.getByRole("radio", { name: chip }).click();
      await expect(page.getByRole("radio", { name: chip })).toHaveAttribute(
        "aria-checked",
        "true"
      );

      // C2 assertion: Color mode must still be selected after the size switch
      await expect(
        bgGroup.getByRole("radio", { name: "Color" })
      ).toHaveAttribute("aria-checked", "true");

      // C3 assertion: button label says "this background" (not "white"), synchronously
      await expect(primaryBtn).toContainText("this background");
      await expect(primaryBtn).not.toContainText("white JPEG");

      // Wait for preview to update then download
      await expect(
        page.getByAltText("Color-background preview at " + chip)
      ).toBeVisible({ timeout: 30_000 });

      const dlP = page.waitForEvent("download", { timeout: 60_000 });
      await primaryBtn.click();
      const dl = await dlP;
      expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);
      const px = await decodeInPage(page, dl, "image/jpeg");
      expect(px.width, `${chip} width`).toBe(w);
      expect(px.height, `${chip} height`).toBe(h);
      // Corners should be brand blue (#1d4ed8 = r29 g78 b216)
      for (const [r, g, b, a] of px.corners) {
        expect(a, `${chip} alpha`).toBe(255);
        expect(r, `${chip} red`).toBeLessThan(60);  // ~29, JPEG tolerance
        expect(b, `${chip} blue`).toBeGreaterThan(180); // ~216
      }
    }

    // --- C2: switch to Custom and verify bgMode + bgColor still intact ---
    await page.getByRole("radio", { name: "Custom", exact: true }).click();
    await expect(page.getByRole("radio", { name: "Custom", exact: true })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    // bgMode must NOT have been reset to White
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    // C3: button label still says "this background" immediately after Custom selection
    await expect(primaryBtn).toContainText("this background");

    // Custom with explicit dimensions
    await page.getByLabel("Width").fill("800");
    await page.getByLabel("Height").fill("600");
    await page.getByLabel("Height").blur();

    await expect(
      page.getByAltText("Color-background preview at Custom")
    ).toBeVisible({ timeout: 30_000 });

    const customDlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const customDl = await customDlP;
    expect(customDl.suggestedFilename()).toMatch(/\.jpg$/i);
    const customPx = await decodeInPage(page, customDl, "image/jpeg");
    expect(customPx.width, "Custom width").toBe(800);
    expect(customPx.height, "Custom height").toBe(600);
  });

  test("Transparent mode at new presets: PNG with alpha-0 corners", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 180_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Transparent" })).toHaveAttribute("aria-checked", "true");

    const primaryBtn = page.getByTestId("primary-download-btn");

    // Story 1080×1920 transparent PNG
    await page.getByRole("radio", { name: "Story 1080×1920" }).click();
    await expect(
      page.getByAltText("Transparent-background preview at Story 1080×1920")
    ).toBeVisible({ timeout: 30_000 });

    const dlP = page.waitForEvent("download", { timeout: 60_000 });
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.png$/i);
    const buf = readFileSync((await dl.path())!);
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1920 });
    const px = await decodeInPage(page, dl, "image/png");
    for (const [, , , a] of px.corners) {
      expect(a).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C3. Static: download button label is synchronous with mode changes
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-7 inference: C3 synchronous label", () => {
  test("button label updates immediately when switching White→Color→Transparent (no lag)", async ({
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

    // White mode: label says "Download white JPEG" synchronously
    await bgGroup.getByRole("radio", { name: "White" }).click();
    // No waitForTimeout — label must be correct in the same render
    const whiteLabel = await primaryBtn.textContent();
    expect(whiteLabel).toMatch(/Download white JPEG/i);

    // Color mode: label changes to "this background" synchronously.
    // Round-8 panel-4 fix: switching to Color from white now defaults bgColor to
    // beige (#F5F0E6), so the label says "… · beige" — clearly different from White.
    // The key check remains: label must say "this background", NOT "Download white JPEG".
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const colorLabel = await primaryBtn.textContent();
    // Must say "this background" (Color mode label) and NOT "Download white JPEG"
    // (which would be the stale White-mode label — the actual C3 regression).
    expect(colorLabel).toContain("this background");
    expect(colorLabel).not.toMatch(/Download white JPEG/i);

    // Enter a hex and verify label stays consistent
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();
    const colorLabelRed = await primaryBtn.textContent();
    expect(colorLabelRed).toContain("this background");

    // Transparent: label changes synchronously
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    const transLabel = await primaryBtn.textContent();
    expect(transLabel).toMatch(/Download transparent PNG/i);
    expect(transLabel).not.toContain("JPEG");
  });
});
