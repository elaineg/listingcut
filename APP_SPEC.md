# ListingCut
Purpose: for marketplace sellers (and anyone needing a cutout) — remove a photo's background entirely in the browser, then one-click export a listing-ready white-background JPEG at platform preset sizes.
Problem: An Etsy/eBay/Poshmark seller prepping product listing photos, a job-seeker making a headshot, or anyone making a sticker/meme/slide needs a subject cut out of a photo — common one-off task, ~1–5 images per session, weekly-to-monthly for the typical user (daily only for professional sellers).
Beats alternative: Free client-side removers (NukeBG, bg.addy.ie) stop at a transparent PNG; marketplaces require white-background JPEGs at specific canvas sizes, so sellers round-trip through Canva to composite and resize. ListingCut does cutout → white-bg composite at eBay/Etsy/Poshmark preset sizes → JPEG download in one click, with images never leaving the device.

Core flows:
1. Remove background client-side, one or many photos: user drags-and-drops or picks up to 20 JPEG/PNGs; the page runs the free @imgly/background-removal WASM model in the browser (no server upload, no paid API). Photos process sequentially in a plain vertical queue (thumbnail + filename + status per row); the first finished result auto-opens large with a side-by-side before/after. The drop zone discloses BEFORE upload that the first photo downloads a one-time ~50 MB model; while it downloads and runs, a two-phase progress indicator shows download percent then "removing background…" with elapsed seconds (in every path, including the sample).
2. Touch up + download transparent PNG: on any result, a "Touch up" button opens a canvas brush (Erase / Restore toggles, size slider, Undo, Done) to fix spots the auto-cutout missed; exports include the fix. "Download transparent PNG" is the secondary download, with a plain-language hint and the checkerboard captioned "Checkered area = transparent (no background)".
3. Marketplace-listing export (the differentiator): the user picks a preset — eBay 1600×1600, Etsy 2000×2000, Poshmark square, Depop 1280×1280, Facebook 1200×1200, or Custom width×height — and the primary accent button "Download white JPEG — <size> (<marketplace>)" saves the subject composited centered on white at that exact size. The preset is sticky across photos and start-over; the button label updates the instant a chip is tapped. Each queue row has its own download, and "Download all (ZIP) — N photos, <preset>" appears once 2+ are done. A preview thumbnail of the white-bg composite updates when the preset changes.

Success checks (a stranger can verify in a browser):
- Page loads with a drop zone reading something like "Drag & drop photos (up to 20) or click to upload", a visible privacy claim stating the image never leaves the device / all processing happens in your browser, and a pre-upload disclosure that the first photo downloads a one-time ~50 MB tool — verifiable in <5 seconds without uploading anything.
- Preset buttons labeled "eBay 1600×1600", "Etsy 2000×2000", "Poshmark" (square), "Depop 1280×1280", "Facebook 1200×1200", and "Custom" are visible in the UI shell (disabled until a cutout exists) — verifiable without running inference.
- Dropping 2+ images shows a vertical queue with per-row status; rows finish one by one, each gets its own download, and a "Download all (ZIP)" button appears once 2+ are done and saves a .zip containing one white JPEG per photo at the selected preset size.
- On a finished result, "Touch up" opens an Erase/Restore brush over the cutout; erasing an area and pressing Done changes the subsequent PNG/JPEG exports in that area.
- Dropping an image immediately shows a progress/status indicator (text or bar) that changes state (e.g. model download → processing → done) rather than a frozen page, even though first-run inference takes 5–20s.
- After processing completes, a side-by-side view shows the original image and the cutout (cutout rendered over a checkerboard or otherwise visibly transparent), and "Download PNG" saves a .png file whose corner pixels are transparent (alpha 0) for a photo with a plain background.
- Selecting "eBay 1600×1600" and clicking the primary "Download white JPEG" button downloads a .jpg file that is exactly 1600×1600 pixels with white (255,255,255) corner pixels; Etsy export is exactly 2000×2000; Poshmark export is square (width equals height); Depop 1280×1280; Facebook 1200×1200; Custom matches the entered width×height. The preset choice survives "Start over".
- Privacy is observable: with browser devtools Network tab open, dropping and processing an image produces no network request whose payload contains the image — the only fetches are the page's static assets and the WASM/model files (GET requests, no image upload). Works fully after first load even if you go offline before dropping a second image (no server round-trip required for processing).

Out of scope:
- Custom background colors or background images (white only for MVP).
- Subject margin/placement controls (fixed 6% white border).
- Adding photos to a queue that is already running (start over to begin a new batch).
- Accounts, history, saved images, server-side storage of any kind.
- WebP output, PWA/offline install, API endpoint.

Production URL: <filled in by deployer>
