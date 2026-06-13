import { test, expect } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize } from "../utils/imageMeta";

/**
 * Round-4 regression: alpha mask auto-clean, larger thumbnails, multi-preset
 * ZIP via "Sizes…" popover, friendly fetch-error copy, "Add more photos" append,
 * touch-up discard confirm, new dropzone timing copy.
 *
 * Static checks that don't need inference run first.
 * Inference-dependent checks are gated behind PROCESS_TIMEOUT.
 */

const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");
const FIX_PNG = join(__dirname, "..", "fixtures", "product.png");
const PROCESS_TIMEOUT = 300_000;
const MODEL_HOST = "https://staticimgly.com/**";

test.describe("round-4 static (no inference)", () => {
  test("dropzone shows updated timing copy and Remove-shadow toggle is absent pre-upload", async ({
    page,
  }) => {
    await page.goto("/");
    // New dropzone timing line from spec
    await expect(
      page.getByText("First photo downloads a one-time ~50 MB tool", {
        exact: false,
      })
    ).toBeVisible();
    // No Remove-shadow toggle before any photo is queued
    await expect(page.getByLabel("Remove shadow", { exact: false })).not.toBeVisible();
  });

  test("friendly fetch-error copy appears when model CDN is blocked", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.route(MODEL_HOST, (route) => route.abort());
    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    // Error row shows friendly language mentioning "connection" or "tool", not a raw fetch stack
    const retryBtn = page.getByRole("button", { name: "Retry product.jpg" });
    await expect(retryBtn).toBeVisible({ timeout: 120_000 });
    // Friendly copy should mention connection
    await expect(
      page.getByText(/check your connection/i)
    ).toBeVisible();
    await page.unroute(MODEL_HOST);
  });
});

test.describe("round-4 full flow (inference required)", () => {
  test("Remove shadow toggle visible after upload; multi-preset ZIP via Sizes… popover", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 240_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', [FIX_JPG, FIX_PNG]);

    // Both done
    await expect(page.getByText("(2/2 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Remove shadow toggle is now visible (queue shown)
    const removeShadowToggle = page.getByLabel("Remove shadow", { exact: false });
    await expect(removeShadowToggle).toBeVisible();
    // Default ON per spec
    await expect(removeShadowToggle).toBeChecked();

    // Larger thumbnails: each queue row thumbnail is 64px (h-16/w-16 = 4rem = 64px)
    const thumbs = page.locator("li span.h-16.w-16");
    await expect(thumbs.first()).toBeVisible();

    // "Sizes…" popover appears and allows choosing multiple presets for ZIP
    const sizesBtn = page.getByRole("button", { name: "Sizes…" });
    await expect(sizesBtn).toBeVisible();
    await sizesBtn.click();

    const dialog = page.getByRole("dialog", { name: "Choose export sizes for ZIP" });
    await expect(dialog).toBeVisible();

    // Check both eBay and Etsy so the ZIP will have 2 sizes × 2 photos = 4 files
    const ebayCheck = dialog.getByRole("checkbox", { name: /eBay 1600/i });
    const etsyCheck = dialog.getByRole("checkbox", { name: /Etsy 2000/i });
    await expect(ebayCheck).toBeChecked(); // default
    await etsyCheck.click();
    await expect(etsyCheck).toBeChecked();

    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).not.toBeVisible();

    // ZIP with multiple sizes
    const zipDlP = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: /Download all \(ZIP\)/ }).click();
    const zipDl = await zipDlP;
    expect(zipDl.suggestedFilename()).toMatch(/\.zip$/);

    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(readFileSync((await zipDl.path())!));
    const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
    // 2 presets × 2 photos = 4 entries
    expect(names.length).toBe(4);

    // Validate at least one eBay and one Etsy file
    const hasEbay = names.some((n) => n.includes("ebay"));
    const hasEtsy = names.some((n) => n.includes("etsy"));
    expect(hasEbay).toBe(true);
    expect(hasEtsy).toBe(true);

    // Verify a sampled eBay entry is 1600×1600
    const ebayFile = names.find((n) => n.includes("ebay"))!;
    const buf = await zip.files[ebayFile].async("nodebuffer");
    expect(jpegSize(buf)).toEqual({ width: 1600, height: 1600 });

    // Verify an Etsy entry is 2000×2000
    const etsyFile = names.find((n) => n.includes("etsy"))!;
    const buf2 = await zip.files[etsyFile].async("nodebuffer");
    expect(jpegSize(buf2)).toEqual({ width: 2000, height: 2000 });
  });

  test("Add more photos appends without wiping prior results", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 240_000);

    await page.goto("/");
    // Process first photo
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("(1/1 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // "Add more photos" button is visible (batch complete)
    const addMoreBtn = page.getByRole("button", { name: "Add more photos" });
    await expect(addMoreBtn).toBeVisible();

    // When the queue is shown, the drop-zone input is hidden; only the add-more
    // input is in the DOM — use .last() to be robust if both exist.
    const addMoreInput = page.locator('input[type="file"]').last();
    await addMoreInput.setInputFiles(FIX_PNG);

    // Now two photos in queue, first result still present
    await expect(page.getByText("(2/2 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });
    // The original product.jpg row is still there
    await expect(
      page.getByRole("button", { name: "Download product.jpg as white JPEG" })
    ).toBeVisible();
    // The appended product.png row is also there
    await expect(
      page.getByRole("button", { name: "Download product.png as white JPEG" })
    ).toBeVisible();
  });

  test("touch-up Cancel without edits closes immediately (no confirm dialog)", async ({
    page,
  }) => {
    test.setTimeout(PROCESS_TIMEOUT + 120_000);

    await page.goto("/");
    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here's your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // Open touch-up — no strokes made
    await page.getByRole("button", { name: "Touch up" }).click();
    await expect(page.locator("canvas")).toBeVisible();

    // Cancel without any edits: should close without a confirm dialog.
    // Register a handler to catch any unexpected dialog (would be a bug).
    let unexpectedDialog = false;
    page.on("dialog", (d) => {
      unexpectedDialog = true;
      void d.accept();
    });
    await page.getByRole("button", { name: "Cancel" }).click();
    // Editor should close: "Touch up" button reappears; "Done" (editor) is gone.
    await expect(page.getByRole("button", { name: "Touch up" })).toBeVisible({ timeout: 5_000 });
    expect(unexpectedDialog).toBe(false);
  });
});
