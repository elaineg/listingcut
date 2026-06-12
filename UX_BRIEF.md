# ListingCut — UX Brief

## 1. Problem statement
Turn any product photo into a clean, white-background listing photo sized for eBay, Etsy, or Poshmark — free, in seconds, and your photo never leaves your device.

## 2. Primary user action
Drop a photo into one big drop zone that dominates the landing view. Inside the drop zone sits a small worked example (sample product photo → its white-bg cutout) with a "Try the sample" link, so a visitor sees the outcome before uploading anything. One drop does everything: cutout appears side-by-side with the original, presets and downloads light up — no second submit step.

## 3. Emotional tone
Trustworthy and brisk — like a good utility knife. Clean geometric sans, cool neutral palette (white/slate) with one confident accent for the action, generous whitespace; nothing salesy, nothing cluttered. Lead with "listing-ready photos," not "AI."

## 4. Design decisions
1. **Honest two-phase progress, never a frozen page.** The instant a file drops, the drop zone becomes a status card with two labeled steps: "Downloading model (one-time, ~50 MB)" with a real percentage bar, then "Removing background…" with an animated indeterminate bar plus elapsed seconds. Copy sets expectations ("first run takes longer; next photos are fast"). The validator can watch the state change.
2. **Privacy as a structural element, not a footnote.** A badge directly under the headline — "Your photo never leaves this device — everything runs in your browser" — and it repeats inside the status card during processing ("processing locally, nothing uploaded"). It is the reason to pick this over remove.bg, so it appears before and during the wait.
3. **Presets visible from second zero, results ready in one click.** The three preset chips (eBay 1600×1600, Etsy 2000×2000, Poshmark square) are on screen at load — disabled with a "drop a photo first" hint — so the differentiator is understood without uploading. After processing: side-by-side original vs cutout-on-checkerboard, "Download PNG," and a live white-bg composite thumbnail that updates as the preset changes, with one "Download JPEG" button naming the exact size ("Download 1600×1600 JPEG").

## 5. 5-second check (above the fold, cold visitor)
- Headline: "Listing-ready product photos in your browser"
- Subtitle: "Remove the background, get a white-background JPEG sized for eBay, Etsy, or Poshmark — free, no upload, no signup."
- Privacy badge: "Your photo never leaves this device."
- Primary action: large drop zone — "Drag & drop an image or click to upload" — containing the sample before/after pair and "Try the sample."
- Preset chips visible (disabled): eBay 1600×1600 · Etsy 2000×2000 · Poshmark square.
