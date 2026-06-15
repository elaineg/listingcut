/**
 * Round-9 / panel round-4 tests.
 *
 * Verifies the two changes from panel round-4 fix:
 *   CHANGE 1 — Headshot sample: a second one-click sample "Try a headshot" runs
 *     the full cutout + export flow on a bundled portrait SVG.
 *   CHANGE 2 — Color-mode label fix: selecting Color immediately changes the
 *     button label away from "white JPEG" even before a color is picked
 *     (bgColor now defaults to beige #F5F0E6 when switching to Color from white).
 *
 * NO-REGRESSION checks:
 *   - "Try the sample" (product/mug) still works.
 *   - White and Transparent mode labels unchanged.
 *   - Headshot sample hero tile visible above the fold.
 */

import { test, expect } from "@playwright/test";

const PROCESS_TIMEOUT = 300_000;

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 1 — Static: headshot sample buttons and hero tile visible
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel4-C1 static: headshot sample UI visible", () => {
  test("'Try a headshot' button is visible in the drop zone", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Try a headshot" })
    ).toBeVisible();
  });

  test("'Try the sample' (product) button still visible alongside the headshot button", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Try the sample" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try a headshot" })
    ).toBeVisible();
  });

  test("headshot sample-headshot.svg image is visible above the fold", async ({ page }) => {
    await page.goto("/");
    // The headshot SVG is used in both the hero tiles and the sample example
    const headshotImgs = page.locator('img[src="/sample-headshot.svg"]');
    await expect(headshotImgs.first()).toBeVisible();
  });

  test("hero tile section shows the headshot with 'headshots & avatars' caption", async ({
    page,
  }) => {
    await page.goto("/");
    // The figcaption for the headshot tile should mention headshots
    const caption = page.getByText(/headshots.*avatars/i, { exact: false }).first();
    await expect(caption).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 1 — Inference: headshot sample runs the full cutout flow
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel4-C1 inference: headshot sample cutout flow", () => {
  test("clicking 'Try a headshot' runs the full cutout flow and produces a result", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    const headshotBtn = page.getByRole("button", { name: "Try a headshot" });
    await expect(headshotBtn).toBeVisible();

    await headshotBtn.click();

    // Queue should appear (items.length > 0) showing the headshot is processing.
    // Use the heading ("Your photos (0/1 done)") not the privacy badge which also
    // contains "Your photos" — avoids strict-mode violation when 2 elements match.
    await expect(page.getByRole("heading", { name: /Your photos/i })).toBeVisible({ timeout: 10_000 });

    // Wait for processing to complete
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // The result panel appears — confirms full flow ran
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toBeVisible({ timeout: 10_000 });

    // Queue row should show "sample-headshot.png"
    await expect(page.getByText("sample-headshot.png")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 2 — Static / unit-level: Color mode immediately changes label
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel4-C2 static: Color mode label fix (no-white-on-switch)", () => {
  test("selecting Color mode immediately changes download button away from 'white JPEG'", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    // Use the headshot sample to trigger a result
    await page.getByRole("button", { name: "Try a headshot" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Ensure White mode is active first
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "White" }).click();
    const primaryBtn = page.getByTestId("primary-download-btn");
    const whiteLabel = await primaryBtn.textContent();
    expect(whiteLabel).toMatch(/Download white JPEG/i);

    // Switch to Color — WITHOUT picking any specific color
    await bgGroup.getByRole("radio", { name: "Color" }).click();
    const colorLabel = await primaryBtn.textContent();

    // The label must immediately change — no "nothing happened" moment
    expect(colorLabel).toContain("this background");
    expect(colorLabel).not.toMatch(/Download white JPEG/i);
  });

  test("Color mode default color is non-white (beige) so preview is visibly different", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    // Ensure White mode first (reset state)
    await bgGroup.getByRole("radio", { name: "White" }).click();

    // Switch to Color
    await bgGroup.getByRole("radio", { name: "Color" }).click();

    // Hex field should show a non-white value (beige = #f5f0e6)
    const hexField = page.getByLabel("Hex color value");
    const hexVal = await hexField.inputValue();
    expect(hexVal.toLowerCase()).not.toBe("#ffffff");
    // Specifically we expect beige
    expect(hexVal.toLowerCase()).toBe("#f5f0e6");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO-REGRESSION: White and Transparent labels unchanged
// ─────────────────────────────────────────────────────────────────────────────

test.describe("panel4 no-regression: White and Transparent labels unchanged", () => {
  test("White mode still reads 'Download white JPEG' (no regression)", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "White" }).click();

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("Download white JPEG");
  });

  test("Transparent mode still reads 'Download transparent PNG' (no regression)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();

    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("transparent PNG");
  });
});
