/**
 * Round-6 verification: prefsLoaded guard fix + invalid hex feedback.
 *
 * PRIMARY CHECK (the fix that was previously FAILING):
 *   Seed localStorage with non-default prefs {presetId:"etsy", bgMode:"color",
 *   bgColor:"#ff0000"} via addInitScript BEFORE mount, navigate, reload, then
 *   assert the restored values render AND localStorage was NOT overwritten with
 *   defaults AND the next export uses those prefs.
 *
 * ALSO CHECKS:
 *   - Invalid hex shows inline cue (aria-invalid + error text) and reverts on blur.
 *
 * Run against preview URL:
 *   BASE_URL=https://listingcut-l467l7vi4-elainegao.vercel.app npx playwright test tests/e2e/round6-reload-restore.spec.ts
 */

import { test, expect, type Page, type Download } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pngSize } from "../utils/imageMeta";

const PROCESS_TIMEOUT = 300_000; // 5 min — model download + inference
const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");

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
// THE PRIMARY FIX: returning-user reload-restore
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-6: reload-restore fix (localStorage prefsLoaded guard)", () => {
  /**
   * CLEAN CONTEXT: no pre-seeded state. Verifies basic pref persistence works
   * (set prefs in session, reload, check they are restored).
   */
  test("clean context: prefs set in-session survive a page reload", async ({ page }) => {
    await page.goto("/");
    // Wait for restore effect to fire
    await page.waitForTimeout(500);

    // Manually set prefs in localStorage (simulate user already having picked something)
    await page.evaluate(() => {
      window.localStorage.setItem(
        "listingcut-export-prefs",
        JSON.stringify({
          presetId: "etsy",
          bgMode: "color",
          bgColor: "#ff0000",
          marginPct: 10,
        })
      );
    });

    // Reload page
    await page.reload();
    await page.waitForTimeout(600); // wait for restore setTimeout(0) to fire

    // Verify localStorage was NOT overwritten with defaults
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("listingcut-export-prefs")
    );
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.bgMode, "bgMode must survive reload").toBe("color");
    expect(parsed.presetId, "presetId must survive reload").toBe("etsy");
    expect(parsed.bgColor, "bgColor must survive reload").toBe("#ff0000");

    // Verify UI reflects restored prefs
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    await expect(
      page.getByRole("radio", { name: "Etsy 2000×2000" })
    ).toHaveAttribute("aria-checked", "true");
  });

  /**
   * PRE-SEEDED CONTEXT (the specific fix being verified):
   * addInitScript seeds localStorage BEFORE any React code runs.
   * This is the exact pattern that previously FAILED (persist effect fired with
   * defaults before restore effect could run, overwriting saved prefs).
   * The prefsLoaded ref guard must prevent that overwrite.
   */
  test("pre-seeded context: addInitScript-seeded prefs survive mount and are reflected in UI", async ({
    page,
  }) => {
    // Seed BEFORE mount — this is the failing scenario
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "listingcut-export-prefs",
        JSON.stringify({
          presetId: "etsy",
          bgMode: "color",
          bgColor: "#ff0000",
          marginPct: 10,
        })
      );
    });

    await page.goto("/");
    await page.waitForTimeout(600); // restore setTimeout(0)

    // 1. localStorage must NOT be overwritten with defaults
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("listingcut-export-prefs")
    );
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.bgMode, "bgMode must not be overwritten with defaults").toBe("color");
    expect(parsed.presetId, "presetId must not be overwritten with defaults").toBe("etsy");
    expect(parsed.bgColor, "bgColor must not be overwritten with defaults").toBe("#ff0000");

    // 2. UI must show Color radio checked
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    // 3. Etsy chip must be active
    await expect(
      page.getByRole("radio", { name: "Etsy 2000×2000" })
    ).toHaveAttribute("aria-checked", "true");
  });

  /**
   * RELOAD AFTER PRE-SEEDED:
   * Seed via addInitScript, load, reload, verify still intact.
   */
  test("pre-seeded then reload: prefs survive mount + explicit reload", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "listingcut-export-prefs",
        JSON.stringify({
          presetId: "etsy",
          bgMode: "color",
          bgColor: "#ff0000",
          marginPct: 10,
        })
      );
    });

    await page.goto("/");
    await page.waitForTimeout(600);

    // Now reload (simulate returning user opening a new tab after prefs were persisted)
    await page.reload();
    await page.waitForTimeout(600);

    // localStorage still intact
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("listingcut-export-prefs")
    );
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed.bgMode, "bgMode preserved after reload").toBe("color");
    expect(parsed.presetId, "presetId preserved after reload").toBe("etsy");
    expect(parsed.bgColor, "bgColor preserved after reload").toBe("#ff0000");

    // UI still reflects restored prefs
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(
      bgGroup.getByRole("radio", { name: "Color" })
    ).toHaveAttribute("aria-checked", "true");

    await expect(
      page.getByRole("radio", { name: "Etsy 2000×2000" })
    ).toHaveAttribute("aria-checked", "true");
  });

  /**
   * FULL INFERENCE FLOW with seeded prefs:
   * Pre-seed {presetId:"etsy", bgMode:"color", bgColor:"#ff0000"}, load,
   * process a sample photo, then verify the export is Etsy 2000×2000 JPEG
   * with red corners (±3 JPEG tolerance).
   */
  test("pre-seeded prefs: sample export uses Etsy 2000×2000 with red corners ±3", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.addInitScript(() => {
      window.localStorage.setItem(
        "listingcut-export-prefs",
        JSON.stringify({
          presetId: "etsy",
          bgMode: "color",
          bgColor: "#ff0000",
          marginPct: 6,
        })
      );
    });

    await page.goto("/");
    await page.waitForTimeout(600); // restore setTimeout(0)

    // Confirm UI reflects prefs before inference
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("radio", { name: "Etsy 2000×2000" })).toHaveAttribute("aria-checked", "true");

    // Process the sample
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Primary button should say "this background" and "2000×2000"
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("this background");
    await expect(primaryBtn).toContainText("2000×2000");

    // Download and verify pixel dimensions and red corners
    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);

    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width, "Etsy preset must be 2000px wide").toBe(2000);
    expect(px.height, "Etsy preset must be 2000px tall").toBe(2000);

    for (const [r, g, b, a] of px.corners) {
      expect(a, "alpha must be 255 (JPEG)").toBe(255);
      // Red (#ff0000) ± 3 for JPEG compression
      expect(r, "red channel ≥ 252").toBeGreaterThanOrEqual(252);
      expect(g, "green channel ≤ 3").toBeLessThanOrEqual(3);
      expect(b, "blue channel ≤ 3").toBeLessThanOrEqual(3);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVALID HEX FEEDBACK (P3 fix)
// Note: the hex field is only rendered when bgMode="color" AND a cutout exists
// (disabled=false). Tests must first process the sample to get a live cutout.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-6: invalid hex inline feedback", () => {
  /**
   * Typing an invalid hex shows aria-invalid + "Invalid hex" error text while typing.
   * On blur, field reverts to last valid color (no silent no-op).
   *
   * Requires a cutout (Color mode hex field only shown when !disabled).
   * Uses "Try the sample" inference path.
   */
  test("invalid hex typing shows aria-invalid and error text; blur reverts to valid color", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    // Process sample to unlock controls
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Switch to Color mode (enables hex field)
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");

    // Set a known valid baseline first
    const hexField = page.getByLabel("Hex color value");
    await expect(hexField).toBeVisible();
    await hexField.fill("#ff0000");
    await hexField.blur();

    // Type an invalid value
    await hexField.fill("#GGG");
    // Trigger the React onChange handler
    await hexField.dispatchEvent("input");

    // aria-invalid must be set to true
    await expect(hexField).toHaveAttribute("aria-invalid", "true");

    // Error text "Invalid hex" must be visible
    await expect(page.getByText("Invalid hex")).toBeVisible();

    // The error span has role="alert"
    await expect(page.locator('[role="alert"]').filter({ hasText: "Invalid hex" })).toBeVisible();

    // On blur: field reverts to the last valid color (#ff0000), error clears
    await hexField.blur();

    // aria-invalid should now be false/not present
    const ariaInvalidAfterBlur = await hexField.getAttribute("aria-invalid");
    expect(
      ariaInvalidAfterBlur === null || ariaInvalidAfterBlur === "false",
      "aria-invalid must be cleared on blur"
    ).toBe(true);

    // Error text is gone
    await expect(page.getByText("Invalid hex")).not.toBeVisible();

    // Field reverted to valid color
    const fieldValue = await hexField.inputValue();
    // Should be the valid #ff0000 (or a normalized form)
    expect(fieldValue.toLowerCase()).toMatch(/^#?ff0000$/);
  });

  test("typing a partial valid hex shows invalid during typing but resolves when complete", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    // Process sample to unlock controls
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Switch to Color mode
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");

    const hexField = page.getByLabel("Hex color value");
    await expect(hexField).toBeVisible();

    // Type a partial hex (#FF) — invalid while partial
    await hexField.fill("#FF");
    await hexField.dispatchEvent("input");

    // Should show invalid state
    await expect(hexField).toHaveAttribute("aria-invalid", "true");

    // Complete the hex (#FF0000) — should become valid
    await hexField.fill("#FF0000");
    await hexField.dispatchEvent("input");

    // Now valid — aria-invalid should clear
    const ariaInvalid = await hexField.getAttribute("aria-invalid");
    expect(
      ariaInvalid === null || ariaInvalid === "false",
      "aria-invalid must clear when hex becomes valid"
    ).toBe(true);
    // No error text
    await expect(page.getByText("Invalid hex")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: White, Transparent, Start-over keep working
// ─────────────────────────────────────────────────────────────────────────────

test.describe("round-6: regression checks (sample inference)", () => {
  test("White mode: 1600×1600 JPEG white corners ±3", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "White" }).click();

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download white JPEG");
    await expect(primaryBtn).toContainText("1600×1600");

    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.jpg$/i);
    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    for (const [r, g, b, a] of px.corners) {
      expect(a).toBe(255);
      expect(r).toBeGreaterThanOrEqual(252);
      expect(g).toBeGreaterThanOrEqual(252);
      expect(b).toBeGreaterThanOrEqual(252);
    }
  });

  test("Color #000000 corners ≈ (0,0,0) ±3", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#000000");
    await hexField.blur();

    const primaryBtn = page.getByTestId("primary-download-btn");
    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    const px = await decodeInPage(page, dl, "image/jpeg");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    for (const [r, g, b, a] of px.corners) {
      expect(a).toBe(255);
      expect(r).toBeLessThanOrEqual(3);
      expect(g).toBeLessThanOrEqual(3);
      expect(b).toBeLessThanOrEqual(3);
    }
  });

  test("Transparent → PNG with alpha=0 corners at preset size", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download transparent PNG");
    await expect(primaryBtn).not.toContainText("JPEG");

    const dlP = page.waitForEvent("download");
    await primaryBtn.click();
    const dl = await dlP;
    expect(dl.suggestedFilename()).toMatch(/\.png$/i);

    const buf = readFileSync((await dl.path())!);
    const dims = pngSize(buf);
    expect(dims).toEqual({ width: 1600, height: 1600 });

    const px = await decodeInPage(page, dl, "image/png");
    expect(px.width).toBe(1600);
    expect(px.height).toBe(1600);
    for (const [, , , a] of px.corners) {
      expect(a).toBe(0);
    }
  });

  test("Start over keeps bg mode and color", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const hexField = page.getByLabel("Hex color value");
    await hexField.fill("#FF0000");
    await hexField.blur();

    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.getByText(/Drag & drop photos/i)).toBeVisible();

    // Color mode must survive Start over
    await expect(bgGroup.getByRole("radio", { name: "Color" })).toHaveAttribute("aria-checked", "true");
  });
});
