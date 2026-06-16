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

page.on('console', m => { if (m.type() === 'error') console.error('PAGE ERROR:', m.text()); });

console.log('Loading page...');
await page.goto(BASE_URL);

// Check if cached - look for "Try the sample" button
const trySampleBtn = page.getByRole('button', { name: 'Try the sample' });
await trySampleBtn.click();
console.log('Waiting for inference...');
await page.getByText('Done — here\'s your cutout').waitFor({ timeout: PROCESS_TIMEOUT });
console.log('Done! Processing complete.');

// Select eBay preset
await page.getByRole('radio', { name: 'eBay 1600×1600' }).click();

// Switch to Gradient mode
const bgGroup = page.getByRole('radiogroup', { name: 'Export background' });
await bgGroup.getByRole('radio', { name: 'Gradient' }).click();

// Set #FF0000 -> #0000FF, vertical
const fromField = page.getByRole('textbox', { name: 'Gradient from color hex' });
const toField = page.getByRole('textbox', { name: 'Gradient to color hex' });
await fromField.fill('#FF0000');
await fromField.blur();
await toField.fill('#0000FF');
await toField.blur();

// Select vertical
const angleGroup = page.getByRole('radiogroup', { name: 'Gradient angle' });
await angleGroup.getByRole('radio', { name: 'Vertical' }).click();

// Download
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
  // Sample a 10x10 region from each corner
  const sample = (startX, startY) => {
    const data = ctx.getImageData(startX, startY, 10, 10).data;
    let r=0,g=0,b=0;
    for (let i=0; i<100; i++) { r+=data[i*4]; g+=data[i*4+1]; b+=data[i*4+2]; }
    return [Math.round(r/100), Math.round(g/100), Math.round(b/100)];
  };
  URL.revokeObjectURL(url);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    corners_1px: [px(0,0), px(c.width-1,0), px(0,c.height-1), px(c.width-1,c.height-1)],
    corners_10px: [
      sample(0, 0),
      sample(c.width-10, 0),
      sample(0, c.height-10),
      sample(c.width-10, c.height-10)
    ]
  };
}, { b64 });

console.log('Result:', JSON.stringify(result, null, 2));
console.log('1px corners [TL, TR, BL, BR]:', result.corners_1px);
console.log('10px avg corners [TL, TR, BL, BR]:', result.corners_10px);

await browser.close();
