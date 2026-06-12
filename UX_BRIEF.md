# ListingCut — UX Brief (round 2)

## 1. Problem statement
Turn any product photo — or a whole batch — into clean, white-background listing photos sized for eBay, Etsy, Poshmark, Depop, or Facebook — free, in seconds, and your photos never leave your device.

## 2. Primary user action
Drop one or many photos into one big drop zone that dominates the landing view. Inside it: the sample before/after pair with "Try the sample," plus two short trust lines — "Drop up to 20 photos at once" and "First photo downloads a one-time ~50 MB tool — after that it's fast" (the pre-upload disclosure, visible BEFORE any file is chosen). One drop does everything: photos process in order, results appear as they finish, downloads light up — no second submit step.

## 3. Emotional tone
Trustworthy and brisk — a good utility knife. Clean geometric sans, cool white/slate palette with one confident accent, generous whitespace. Lead with "listing-ready photos," not "AI." Keep what round 1 proved: headline, marketplace sub-line, and privacy badge stay exactly where they are.

## 4. Design decisions
1. **Batch is just "drop more" — a vertical queue, not a dashboard.** Multiple files render as one simple list of rows: thumbnail, filename, and a plain-word status ("Waiting… / Removing background… / Done"). Photos process one at a time top-to-bottom; the first finished result opens large automatically so a single-photo user's experience is unchanged. Each row has its own download; a single "Download all (ZIP) — 12 photos, eBay 1600×1600" button appears once 2+ are done, named with the sticky preset. No checkboxes, no settings per row.
2. **Fixing a flaw is one obvious button, not an editor.** On any result, one secondary button: "Touch up." It swaps the side-by-side for the cutout over a faint copy of the original with exactly two big toggle tools — "Erase" (remove leftover smudges/shadows) and "Restore" (paint the product back) — plus a size slider and Undo. Done returns to the result; exports include the fix. Copy frames it as recovery: "Fix spots the auto-cutout missed."
3. **The white JPEG is the answer; the PNG is the expert option.** Primary button is the big accent "Download white JPEG — 1600×1600 (eBay)," label updating the instant a chip is tapped (never lagging the selection). Below it, a quiet secondary "Download transparent PNG" with the hint "PNG with no background — most marketplaces want the white JPEG above." The checkerboard preview is captioned "Checkered area = transparent (no background)." On iOS, a one-line hint under the buttons: "On iPhone: tap Download, then Save Image to add it to your camera roll."
4. **Presets cover the seller's actual marketplace and never reset.** Chips: eBay 1600×1600 · Etsy 2000×2000 · Poshmark square · Depop 1280×1280 · Facebook 1200×1200 · Custom (two small width/height fields). The chosen preset is sticky across every photo in the queue and across "start over." Chips remain visible-but-disabled before upload, with the round-1 "drop a photo first" hint.

## 5. 5-second check (above the fold, cold visitor)
- Headline: "Listing-ready product photos in your browser"
- Subtitle: "Remove the background, get a white-background JPEG sized for your marketplace — free, no upload, no signup."
- Why-it-matters line: "eBay & Poshmark feature white-background photos — clean listings sell faster."
- Privacy badge: "Your photos never leave this device."
- Primary action: large drop zone — "Drag & drop photos (up to 20) or click to upload" — with the sample before/after, "Try the sample," and the one-time ~50 MB note.
- Preset chips visible (disabled): eBay · Etsy · Poshmark · Depop · Facebook · Custom.

Carryover from round 1, still required: two-phase progress (model download with real percentage in EVERY path, then "Removing background…" with elapsed seconds), privacy line repeated during processing, and the live preset-composite preview — which must render on small Android screens (the 360px grey-box bug is a validator check).
