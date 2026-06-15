/**
 * Round-10 shadow tests.
 *
 * Verifies the Shadow feature:
 *   - Shadow toggle is present in the Export background section.
 *   - Default is OFF.
 *   - Disabled/greyed when Background = Transparent; re-enabled when switching back.
 *   - When ON, reveals Soft · Medium · Strong segmented control.
 *   - When ON, download button label includes "(with shadow)".
 *   - Shadow state is sticky across "Start over".
 *   - No regression: White and Color mode labels still work without shadow.
 */

import { test, expect } from "@playwright/test";

const PROCESS_TIMEOUT = 300_000;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC: Shadow control visibility and default state (no inference needed)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("shadow static: control visibility and defaults", () => {
  test("Shadow checkbox is visible in the export controls section", async ({ page }) => {
    await page.goto("/");
    // The shadow checkbox is in the persistent export-controls section
    const shadowToggle = page.getByTestId("shadow-toggle");
    await expect(shadowToggle).toBeVisible();
  });

  test("Shadow is OFF by default", async ({ page }) => {
    await page.goto("/");
    const shadowToggle = page.getByTestId("shadow-toggle");
    await expect(shadowToggle).not.toBeChecked();
  });

  test("Shadow toggle is disabled when Background = Transparent", async ({ page }) => {
    await page.goto("/");
    // Switch to Transparent background
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    const shadowToggle = page.getByTestId("shadow-toggle");
    await expect(shadowToggle).toBeDisabled();
  });

  test("Transparent mode shows tooltip/reason for disabled shadow", async ({ page }) => {
    await page.goto("/");
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    // Should show a reason message
    await expect(page.getByText(/Shadow needs a solid background/i)).toBeVisible();
  });

  test("Shadow toggle re-enables when switching from Transparent to White", async ({ page }) => {
    await page.goto("/");
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();
    // Verify disabled
    const shadowToggle = page.getByTestId("shadow-toggle");
    await expect(shadowToggle).toBeDisabled();
    // Switch back to White
    await bgGroup.getByRole("radio", { name: "White" }).click();
    await expect(shadowToggle).not.toBeDisabled();
  });

  test("Turning shadow ON reveals intensity segmented control", async ({ page }) => {
    await page.goto("/");
    // Intensity control hidden initially
    await expect(page.getByRole("radiogroup", { name: "Shadow intensity" })).not.toBeVisible();
    // Turn shadow on
    const shadowToggle = page.getByTestId("shadow-toggle");
    await shadowToggle.click();
    // Intensity control appears
    await expect(page.getByRole("radiogroup", { name: "Shadow intensity" })).toBeVisible();
  });

  test("Intensity control hidden when shadow is OFF", async ({ page }) => {
    await page.goto("/");
    const shadowToggle = page.getByTestId("shadow-toggle");
    // Make sure it's off (default)
    await expect(shadowToggle).not.toBeChecked();
    await expect(page.getByRole("radiogroup", { name: "Shadow intensity" })).not.toBeVisible();
  });

  test("Intensity control has Soft, Medium, Strong options; Soft is default", async ({ page }) => {
    await page.goto("/");
    const shadowToggle = page.getByTestId("shadow-toggle");
    await shadowToggle.click();
    const intensityGroup = page.getByRole("radiogroup", { name: "Shadow intensity" });
    await expect(intensityGroup.getByRole("radio", { name: "Soft" })).toBeVisible();
    await expect(intensityGroup.getByRole("radio", { name: "Medium" })).toBeVisible();
    await expect(intensityGroup.getByRole("radio", { name: "Strong" })).toBeVisible();
    // Soft is checked by default
    await expect(intensityGroup.getByRole("radio", { name: "Soft" })).toHaveAttribute("aria-checked", "true");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INFERENCE: Shadow label and sticky behavior after processing
// ─────────────────────────────────────────────────────────────────────────────

test.describe("shadow inference: label and sticky state", () => {
  test("with Shadow ON, download button label includes '(with shadow)'", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Default: White mode, Shadow OFF — label should NOT contain "(with shadow)"
    const primaryBtn = page.getByTestId("primary-download-btn");
    const offLabel = await primaryBtn.textContent();
    expect(offLabel).not.toContain("(with shadow)");
    expect(offLabel).toMatch(/Download white JPEG/i);

    // Turn shadow on
    const shadowToggle = page.getByTestId("shadow-toggle");
    await shadowToggle.click();

    // Label should now include "(with shadow)"
    const onLabel = await primaryBtn.textContent();
    expect(onLabel).toContain("(with shadow)");
    expect(onLabel).toMatch(/Download white JPEG/i);
  });

  test("with Background = Transparent, shadow ON is not possible (toggle disabled)", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 60_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Switch to Transparent
    const bgGroup = page.getByRole("radiogroup", { name: "Export background" });
    await bgGroup.getByRole("radio", { name: "Transparent" }).click();

    const shadowToggle = page.getByTestId("shadow-toggle");
    await expect(shadowToggle).toBeDisabled();

    // Label should NOT contain "(with shadow)"
    const primaryBtn = page.getByTestId("primary-download-btn");
    const label = await primaryBtn.textContent();
    expect(label).not.toContain("(with shadow)");
  });

  test("Shadow state is sticky across 'Start over'", async ({ page }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Turn shadow ON and set to Medium
    const shadowToggle = page.getByTestId("shadow-toggle");
    await shadowToggle.click();
    const intensityGroup = page.getByRole("radiogroup", { name: "Shadow intensity" });
    await intensityGroup.getByRole("radio", { name: "Medium" }).click();

    // Verify label contains shadow qualifier
    const primaryBtn = page.getByTestId("primary-download-btn");
    await expect(primaryBtn).toContainText("(with shadow)");

    // Start over
    await page.getByRole("button", { name: "Start over" }).click();

    // Process a new photo
    await page.getByRole("button", { name: "Try the sample" }).click();
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Shadow ON should still be sticky
    await expect(shadowToggle).toBeChecked();
    await expect(primaryBtn).toContainText("(with shadow)");
    // Medium should still be selected
    await expect(intensityGroup.getByRole("radio", { name: "Medium" })).toHaveAttribute("aria-checked", "true");
  });
});
