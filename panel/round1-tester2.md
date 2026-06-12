# Panel round 1 — Tester 2 (Marcus Tran, full-time Poshmark/Depop seller, ~80 listings/wk, MacBook + Chrome)

## Clarity — Yes
30 seconds in I could tell a friend: "Drag a product photo in, it strips the background and
spits out a white-background JPEG already sized for eBay/Etsy/Poshmark — runs in your browser,
no account." The headline "Listing-ready product photos in your browser," the before/after mug
graphic, and "free, no upload, no signup" did all the work. The green "Your photo never leaves
this device" badge is a nice touch, though I care less about privacy than about not seeing a
watermark prompt. Nothing confused me. "Try the sample" is a smart zero-commitment first click.

## Value — Marginal (good per-photo, broken for volume)
Today: Photoroom free tier on my phone (constant upsell interstitials, watermark nags) and
Canva on the laptop. What I measured here:
- One-time model download: ~22–25s with a progress bar that says exactly that ("one-time, ~50 MB"). Fair, clearly communicated. Fine setup cost.
- After that, each photo: ~11–14s from "Start over" to a downloaded `photo0-ebay-1600x1600.jpg`. Exact 1600×1600, genuinely white background, clean cutout edges on a busy background. Filename includes the size — small thing, saves me renaming.
- Size choice sticks between photos (stayed on eBay), and "Download PNG (transparent)" exists too. Good.

The dealbreaker for my workflow: **no batch**. The file input only takes ONE image, and after
each result I have to click "Start over," re-open the picker, wait, click download. At 80
listings/week (often 4–8 photos each) that's hundreds of click-wait-click loops. Photoroom's
paid batch exists for a reason; even free Canva lets me work a multi-image canvas. For a
one-off photo this beats both — no watermark, no upsell, no login. For my actual volume it
doesn't change my week yet.

Smaller wants: no way to fix a bad cutout (erase/restore brush) when the model misses, and no
padding/margin control around the subject for the marketplace crop.

## Advocacy — 6/10
I'd mention it to other resellers as "watermark-free background remover, surprisingly decent,"
but I wouldn't bring it up unprompted because the answer to their first question — "can I dump
20 photos in?" — is no. What holds it back, in order:
1. No multi-file / drag-a-folder batch processing with a "download all (zip)" button.
2. The "Start over" → re-pick loop adds dead seconds per photo; let me drop the next photo onto the result screen.
3. No cutout touch-up tool for when the model clips part of the item (mine lost a sliver of the white label edge).
Ship batch + zip download and this jumps to an 8–9 for me; I'd drop Photoroom that day.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Marginal", "advocacy": 6,
 "topComplaints": ["No batch upload / download-all — single photo at a time is unusable at 80 listings/week",
 "Start over → re-pick loop between every photo adds friction; allow dropping next photo on result screen",
 "No erase/restore brush to fix cutout misses"],
 "priorConcernsAddressed": "n/a"}
```
