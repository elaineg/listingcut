import { test, expect, type Page, type Download } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { jpegSize } from "../utils/imageMeta";

/**
 * Round-3 feature regression:
 *  - subtitle names all five marketplaces + eBay guidelines line (no inference)
 *  - margin slider (2–15%, default 6%) changes the exported white border,
 *    live-recomposites the preview, and survives "Start over"
 *  - touch-up editor: zoom (wheel) / Pan tool / preview-background toggle
 *  - near-empty cutout flagged "Check this one" and excluded from the ZIP
 *  - per-photo Retry re-processes a failed row (model fetch blocked, then
 *    unblocked) without a reload — separate test so a regression here doesn't
 *    mask evidence for the rest.
 *
 * Selectors use roles/aria-labels (stable), not transient status copy.
 */

const FIX_JPG = join(__dirname, "..", "fixtures", "product.jpg");
const FIX_PNG = join(__dirname, "..", "fixtures", "product.png");
const PROCESS_TIMEOUT = 300_000;
// @imgly/background-removal fetches its WASM/model assets from this host.
const MODEL_HOST = "https://staticimgly.com/**";

/** Distance (px) from the left edge of a JPEG to the first non-white column. */
async function leftWhiteBorder(page: Page, download: Download): Promise<number> {
  const b64 = readFileSync((await download.path())!).toString("base64");
  return page.evaluate(async (b64) => {
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
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    URL.revokeObjectURL(url);
    for (let x = 0; x < c.width; x++) {
      for (let y = 0; y < c.height; y++) {
        const i = (y * c.width + x) * 4;
        if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) return x;
      }
    }
    return c.width;
  }, b64);
}

/** Build an all-white PNG in the live page (forces a near-empty cutout). */
async function whitePngBuffer(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);
    return c.toDataURL("image/png");
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

test.describe("round-3 static checks (no inference)", () => {
  test("all five marketplace presets visible; guidelines line; margin slider shell", async ({
    page,
  }) => {
    await page.goto("/");

    // All five marketplace presets are visible as chips on the page (round-6 reframe:
    // they moved from the subtitle to the preset group, but still present).
    for (const chip of ["eBay 1600×1600", "Etsy 2000×2000", "Poshmark square", "Depop 1280×1280", "Facebook 1200×1200"]) {
      await expect(page.getByRole("radio", { name: chip }).first()).toBeVisible();
    }
    // Supporting line cites eBay's photo guidelines (no invented stats).
    await expect(
      page.getByText(/photo guidelines recommend a clean white\s+background/)
    ).toBeVisible();

    // Margin slider: visible in the shell, 2–15 range, default 6, disabled
    // until a cutout exists.
    const slider = page.getByRole("slider", {
      name: "Margin — space around the subject",
    });
    await expect(slider).toBeVisible();
    await expect(slider).toBeDisabled();
    await expect(slider).toHaveAttribute("min", "2");
    await expect(slider).toHaveAttribute("max", "15");
    await expect(slider).toHaveValue("6");
  });
});

test.describe("round-3 full flow", () => {
  test("margin slider exports → live preview → touch-up zoom/pan/bg → sticky margin across Start over → check-flag + ZIP exclusion", async ({
    page,
  }) => {
    test.setTimeout(900_000);

    await page.goto("/");
    const blank = await whitePngBuffer(page);

    await page.setInputFiles('input[type="file"]', FIX_JPG);
    await expect(page.getByText("Done — here’s your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });

    // --- Margin slider: changes export composition + live preview ----------
    const slider = page.getByRole("slider", {
      name: "Margin — space around the subject",
    });
    await expect(slider).toBeEnabled();
    await expect(slider).toHaveValue("6");

    const preview = page.getByAltText(/^White-background preview at /);
    await expect(preview).toBeVisible({ timeout: 30_000 });
    const srcAtDefault = await preview.getAttribute("src");

    // eBay preset for a deterministic 1600×1600 canvas.
    await page.getByRole("radio", { name: "eBay 1600×1600" }).click();
    const primaryDl = page.getByRole("button", { name: /Download white JPEG/ });

    await slider.focus();
    await page.keyboard.press("Home"); // min = 2%
    await expect(slider).toHaveValue("2");
    const dl2P = page.waitForEvent("download", { timeout: 60_000 });
    await primaryDl.click();
    const dl2 = await dl2P;
    expect(jpegSize(readFileSync((await dl2.path())!))).toEqual({
      width: 1600,
      height: 1600,
    });
    const border2 = await leftWhiteBorder(page, dl2);

    await slider.focus();
    await page.keyboard.press("End"); // max = 15%
    await expect(slider).toHaveValue("15");
    // Live preview recomposites: the object URL changes.
    await expect
      .poll(async () => preview.getAttribute("src"), { timeout: 30_000 })
      .not.toBe(srcAtDefault);

    const dl15P = page.waitForEvent("download", { timeout: 60_000 });
    await primaryDl.click();
    const dl15 = await dl15P;
    expect(jpegSize(readFileSync((await dl15.path())!))).toEqual({
      width: 1600,
      height: 1600,
    });
    const border15 = await leftWhiteBorder(page, dl15);

    // 15% margin leaves a visibly larger white border than 2%.
    expect(border2).toBeGreaterThan(0);
    expect(border15).toBeGreaterThan(border2 + 100);

    // --- Touch-up: zoom, Pan tool, preview-background toggle ----------------
    await page.getByRole("button", { name: "Touch up" }).click();
    const bgGroup = page.getByRole("radiogroup", { name: "Preview background" });
    await expect(bgGroup).toBeVisible();
    for (const bg of ["checker", "white", "dark"] as const) {
      await expect(bgGroup.getByRole("radio", { name: bg })).toBeVisible();
    }
    await bgGroup.getByRole("radio", { name: "dark" }).click();
    await expect(bgGroup.getByRole("radio", { name: "dark" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    const panTool = page
      .getByRole("radiogroup", { name: "Touch-up tool" })
      .getByRole("radio", { name: "pan" });
    await panTool.click();
    await expect(panTool).toHaveAttribute("aria-checked", "true");

    // Scroll-wheel zoom: the "Reset zoom" button appears once scale > 1.
    const canvas = page.locator("canvas");
    await canvas.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" })
    );
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -300);
    await expect(
      page.getByRole("button", { name: /Reset zoom/ })
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    // --- Margin survives "Start over" ---------------------------------------
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(
      page.getByText("Drag & drop photos (up to 20) or click to upload")
    ).toBeVisible();
    await expect(slider).toHaveValue("15");

    // --- Near-empty cutout: "Check this one" + ZIP exclusion ----------------
    // (setInputFiles cannot mix paths and buffers — pass all three as buffers)
    await page.setInputFiles('input[type="file"]', [
      { name: "product.jpg", mimeType: "image/jpeg", buffer: readFileSync(FIX_JPG) },
      { name: "product.png", mimeType: "image/png", buffer: readFileSync(FIX_PNG) },
      { name: "blank.png", mimeType: "image/png", buffer: blank },
    ]);

    // 2 real photos finish; the blank one is flagged, not counted done.
    await expect(page.getByText("(2/3 done)")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });
    await expect(
      page
        .locator("li", { hasText: "blank.png" })
        .getByText("Check this one", { exact: false })
    ).toBeVisible();

    // Visible exclusion notice + ZIP counts only the 2 done photos.
    await expect(
      page.getByText("left out of the ZIP", { exact: false })
    ).toBeVisible();
    const zipBtn = page.getByRole("button", { name: /Download all \(ZIP\)/ });
    await expect(zipBtn).toContainText("2 photos");

    const zipDlP = page.waitForEvent("download", { timeout: 120_000 });
    await zipBtn.click();
    const zipDl = await zipDlP;
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(readFileSync((await zipDl.path())!));
    const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
    expect(names).toHaveLength(2);
    expect(names.join(",")).not.toContain("blank");

    // The flagged row still has its own one-off download button.
    await expect(
      page.getByRole("button", { name: "Download blank.png as white JPEG" })
    ).toBeVisible();
  });
});

test.describe("round-3 per-photo retry", () => {
  test("a model-fetch failure shows Retry; Retry re-processes that photo without a reload", async ({
    page,
  }) => {
    test.setTimeout(600_000);

    await page.goto("/");

    // Block the model CDN so the first attempt fails with a fetch error
    // (the app's own JS chunks still load — this simulates a network blip
    // mid model download, the common real-world failure).
    await page.route(MODEL_HOST, (route) => route.abort());
    await page.setInputFiles('input[type="file"]', FIX_JPG);

    const retryBtn = page.getByRole("button", { name: "Retry product.jpg" });
    await expect(retryBtn).toBeVisible({ timeout: 120_000 });

    // Unblock and retry: just this photo re-processes, no page reload.
    await page.unroute(MODEL_HOST);
    let reloaded = false;
    page.once("load", () => (reloaded = true));
    await retryBtn.click();
    await expect(page.getByText("Done — here’s your cutout")).toBeVisible({
      timeout: PROCESS_TIMEOUT,
    });
    expect(reloaded).toBe(false);
    expect(page.url()).toContain("/"); // same page, no navigation
  });
});
