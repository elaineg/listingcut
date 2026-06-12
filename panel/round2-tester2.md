# Panel round 2 — Tester 2 (Marcus Tran, full-time Poshmark/Depop seller, ~80 listings/wk, MacBook + Chrome)

## Prior concerns — were they fixed?
1. **No batch upload / download-all** — FIXED. Dropzone now says "Drag & drop photos (up to 20) or
   click to upload." I dropped 5 at once; queue showed "Your photos (0/5 done)" with per-item status,
   all 5 done in ~55s INCLUDING the one-time model download. New "Download all (ZIP) — 5 photos,
   eBay 1600×1600" button delivered `listingcut-ebay-1600x1600.zip` instantly, files named
   `item0-ebay-1600x1600.jpg` etc. Exactly what I asked for.
2. **Start over → re-pick loop** — MOSTLY FIXED via batch. With 20-at-a-time the per-photo re-pick
   loop is gone for a normal listing session. But once a batch finishes there is still NO way to add
   more photos to the queue — the file input disappears and the only path is "Start over," which
   wipes results. Minor now, but appending to a finished batch would round it out.
3. **No erase/restore brush** — FIXED. "Touch up" opens an editor with Erase / Restore / brush Size /
   Undo, with the faded original behind the cutout so you can paint the product back. Copy is clear:
   "Erase removes leftover smudges or shadows, Restore paints the product back." Brush strokes worked.

## Clarity — Yes
Same pitch as before, now stronger: "Drop up to 20 product photos, it strips backgrounds in your
browser and gives you a ZIP of white-background JPEGs sized for eBay/Poshmark/Etsy — free, no
watermark, no account." The dropzone line "Drop up to 20 photos at once — they're processed one by
one" and "First photo downloads a one-time ~50 MB tool — after that it's fast" set expectations
perfectly. Nothing confused me.

## Value — Yes
Today: Photoroom free tier (upsell interstitials, watermark nags) + Canva. This now beats both for my
actual volume: ~8–9s per photo hands-off after the one-time model load, size choice persists, ZIP at
the end, filenames pre-suffixed with marketplace size so I don't rename. For a 6-photo listing this is
drop → wait a minute → one ZIP. That genuinely changes my week; I'd stop opening Photoroom.

One real flag: two of my five test photos came back as a BLANK white 1600×1600 (model found no
subject) and the app still marked them "Done" and zipped them with no warning. My test images were
synthetic flat-color graphics, so real garment photos will likely fare better — but in a 20-photo
batch a silent blank means I could upload an empty photo to eBay. Flag near-empty cutouts ("this one
looks empty — check it") in the queue. Restore brush did let me recover it manually.

Remaining smaller wants: append photos to a finished batch instead of "Start over"; a padding/margin
control around the subject for marketplace crops.

## Advocacy — 9/10
I said batch + ZIP would make this an 8–9 and I'd drop Photoroom that day — they shipped batch, ZIP,
AND the touch-up brush, and throughput is real. I'd bring this up unprompted in my reseller group:
"watermark-free, no-login background remover that does 20 at a time and zips them." What keeps it
from a 10: silent blank results in a batch, no append-to-batch after finishing, no padding control.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["Failed/empty cutouts are marked Done and zipped silently — flag near-empty results in the batch queue",
 "Can't append more photos after a batch finishes; only option is Start over which wipes results",
 "No padding/margin control around the subject for marketplace crops"],
 "priorConcernsAddressed": "all"}
```
