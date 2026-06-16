import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as os from 'node:os';

const BASE_URL = 'http://localhost:3210';
const PROCESS_TIMEOUT = 300_000;

const browser = await chromium.launchPersistentContext(
  join(os.homedir(), 'app-factory/apps/listingcut/.playwright-profile'),
  { headless: true, acceptDownloads: true }
);
const page = await browser.newPage();

await page.goto(BASE_URL);
const trySampleBtn = page.getByRole('button', { name: 'Try the sample' });
await trySampleBtn.click();
await page.getByText("Done — here's your cutout").waitFor({ timeout: PROCESS_TIMEOUT });

await page.getByRole('radio', { name: 'eBay 1600×1600' }).click();
const bgGroup = page.getByRole('radiogroup', { name: 'Export background' });
await bgGroup.getByRole('radio', { name: 'Gradient' }).click();

const fromField = page.getByRole('textbox', { name: 'Gradient from color hex' });
const toField = page.getByRole('textbox', { name: 'Gradient to color hex' });
await fromField.fill('#FF0000');
await fromField.blur();
await toField.fill('#0000FF');
await toField.blur();

const angleGroup = page.getByRole('radiogroup', { name: 'Gradient angle' });
await angleGroup.getByRole('radio', { name: 'Vertical' }).click();

// Enable Shadow
const shadowToggle = page.getByTestId('shadow-toggle');
await shadowToggle.check();
await page.waitForTimeout(200);

const dlP = page.waitForEvent('download');
await page.getByTestId('primary-download-btn').click();
const dl = await dlP;

const filePath = await dl.path();
const b64 = readFileSync(filePath).toString('base64');

const result = await page.evaluate(async ({ b64 }) => {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('decode failed'));
    i.src = url;
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const px = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
  URL.revokeObjectURL(url);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    corners: [px(0,0), px(c.width-1,0), px(0,c.height-1), px(c.width-1,c.height-1)],
  };
}, { b64 });

console.log('Shadow+Gradient corners (TL,TR,BL,BR):', result.corners);
// Expected without shadow: TL≈(216,0,37), BL≈(37,0,216)
// Expected WITH shadow: corners should be ~same (shadow is near subject center)

await browser.close();
