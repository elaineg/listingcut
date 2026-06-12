# ListingCut — UX Brief (round 3)

## 1. Problem statement
Turn any product photo — or a whole batch — into clean, white-background listing photos sized for eBay, Etsy, Poshmark, Depop, or Facebook — free, in seconds, and your photos never leave your device.

## 2. Primary user action
Drop one or many photos into one big drop zone that dominates the landing view. Inside it: the sample before/after pair with "Try the sample," plus two short trust lines — "Drop up to 20 photos at once" and "First photo downloads a one-time ~50 MB tool — after that it's fast" (the pre-upload disclosure, visible BEFORE any file is chosen). One drop does everything: photos process in order, results appear as they finish, downloads light up — no second submit step.

## 3. Emotional tone
Trustworthy and brisk — a good utility knife. Clean geometric sans, cool white/slate palette with one confident accent, generous whitespace. Lead with "listing-ready photos," not "AI." Keep what rounds 1–2 proved: headline, marketplace sub-line, privacy badge, batch queue, hierarchy, presets, and disclosure stay exactly where they are.

## 4. Design decisions
1. **Batch is just "drop more" — and a failure is never a dead end.** Multiple files render as one simple list of rows: thumbnail, filename, plain-word status ("Waiting… / Removing background… / Done"). Photos process one at a time top-to-bottom; the first finished result opens large automatically. Each row has its own download; "Download all (ZIP) — 12 photos, eBay 1600×1600" appears once 2+ are done, named with the sticky preset. NEW: a failed row shows a red status with its own **Retry** button — never "reload the page." NEW: if a cutout comes back nearly empty (alpha coverage below a small threshold), the row says **"Check this one"** with the result shown for inspection — it is never marked Done or silently zipped as a blank white square.
2. **Touch up is one obvious button — now precise enough to trust.** On any result, one secondary button "Touch up" swaps to the cutout over a faint original with two big toggles — "Erase" and "Restore" — plus size slider and Undo. NEW: pinch (touch) and scroll-wheel zoom with drag-to-pan, so finger-sized fixes work on a phone; the brush is soft-edged (feathered) so strokes blend instead of leaving scallops; a three-way preview-background toggle (checker / white / dark) reveals edge halos before export. Done returns to the result; exports include the fix. Copy frames it as recovery: "Fix spots the auto-cutout missed."
3. **The white JPEG is the answer; the PNG is the expert option.** Primary button is the big accent "Download white JPEG — 1600×1600 (eBay)," label updating the instant a chip is tapped. Below it, quiet secondary "Download transparent PNG" with hint "PNG with no background — most marketplaces want the white JPEG above." Checkerboard caption: "Checkered area = transparent (no background)." iOS hint: "On iPhone: tap Download, then Save Image to add it to your camera roll."
4. **Presets — and now margin — cover the seller's marketplace and never reset.** Chips: eBay 1600×1600 · Etsy 2000×2000 · Poshmark square · Depop 1280×1280 · Facebook 1200×1200 · Custom (width/height fields). NEW: beside the chips, one small **Margin** slider (2–15%, default 6%) labeled in plain words ("Space around the product") that re-renders the live composite as it moves. Preset AND margin are sticky across every photo in the queue and across "start over." Chips remain visible-but-disabled before upload with the "drop a photo first" hint.

## 5. 5-second check (above the fold, cold visitor)
- Headline: "Listing-ready product photos in your browser"
- Subtitle: "Remove the background, get a white-background JPEG sized for eBay, Etsy, Poshmark, Depop, or Facebook — free, no upload, no signup." (all five named — no marketplace vanishes)
- Why-it-matters line: "eBay's own photo guidelines recommend a clean white background." (factual, sourced from eBay's published guidance — no invented sell-faster statistics)
- Privacy badge: "Your photos never leave this device."
- Primary action: large drop zone — "Drag & drop photos (up to 20) or click to upload" — with the sample before/after, "Try the sample," and the one-time ~50 MB note.
- Preset chips visible (disabled): eBay · Etsy · Poshmark · Depop · Facebook · Custom — with the margin slider beside them.

Carryover, still required: two-phase progress (model download with real percentage in EVERY path, then "Removing background…" with elapsed seconds), privacy line repeated during processing, live preset-composite preview rendering on 360px Android screens. Validator checks for round 3: per-photo Retry on a failed row; "Check this one" on near-empty cutouts; zoom/pan + feathered brush + preview-background toggle in Touch up; all five marketplaces in the subtitle; margin slider persists across photos.
