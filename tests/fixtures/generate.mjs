// Regenerates the committed binary fixtures using headless Chromium's canvas
// encoders (node has none built in). Run: node tests/fixtures/generate.mjs
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();

const draw = (type) =>
  page.evaluate((t) => {
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 600;
    const ctx = c.getContext("2d");
    // Plain light background with a single dark subject centered — the kind
    // of product photo the spec's success checks assume.
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = "#8b1a1a";
    ctx.beginPath();
    ctx.ellipse(300, 320, 140, 170, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.fillRect(250, 120, 100, 90);
    return c.toDataURL(t, 0.92);
  }, type);

const save = (name, dataUrl) =>
  writeFileSync(join(here, name), Buffer.from(dataUrl.split(",")[1], "base64"));

save("product.jpg", await draw("image/jpeg"));
save("product.png", await draw("image/png"));
await browser.close();
console.log("fixtures written");
