# Panel round 3 — Tester 2 (Marcus Tran, full-time Poshmark/Depop seller, ~80 listings/wk, MacBook + Chrome)

## Prior concerns — were they fixed?
1. **Silent blank cutouts marked "Done" and zipped** — FIXED, and done right. I dropped 5 photos
   (4 products + 1 flat near-blank). The flat one showed "Check this one — cutout looks nearly empty"
   in the queue instead of "Done", AND the ZIP button updated to "Download all (ZIP) — 4 photos" —
   the suspect photo is excluded from the ZIP but still has its own Download button if I want it.
   Exactly the trust fix a 20-photo batch needs.
2. **Can't append photos after a batch finishes** — NOT FIXED. After my batch completed there was
   zero `input[type=file]` left on the page and no "Add more" text anywhere; the only path is still
   "Start over", which wipes results. Same as round 2.
3. **No padding/margin control** — FIXED. New "Margin — space around the product" slider (default 6%)
   in the Marketplace export panel, with "Live preview · eBay 1600×1600" updating beside it.

## Clarity — Yes
Pitch to a friend, unchanged and accurate: "Drop up to 20 product photos, it strips backgrounds
in-browser — nothing uploaded — and gives you a ZIP of white-bg JPEGs pre-sized and pre-named for
eBay/Poshmark/Etsy/Depop. Free, no watermark, no account." The dropzone copy ("up to 20", "one-time
~50 MB tool") and the new "Check this one" flag all read instantly. Nothing confused me.

## Value — Yes
Today: Photoroom free tier (watermark/upsell nags) + Canva. This beats both for volume work. 5-photo
batch finished in 48s including the one-time model download; ZIP arrived as
`listingcut-ebay-1600x1600.zip` with files like `item0-ebay-1600x1600.jpg` — no renaming. The blank
flag means I can actually trust a big batch unattended now, and the margin slider kills my last
Canva step (re-padding crops). I have already stopped opening Photoroom for this in spirit; this
round removed the last reason to double-check its output.

Remaining want: append photos to a finished batch — between items I either ZIP-and-start-over or
plan batches per listing. Workable (each listing is its own batch anyway) but it's the one rough edge.

## Advocacy — 10/10
I asked for batch+ZIP in round 1, got it in round 2; asked for blank-result flagging and a margin
control in round 2, got both here, implemented better than I specified (flagged photo auto-excluded
from the ZIP). I already pitch tools like this unprompted in my reseller group and this is now the
unambiguous rec: "free, no watermark, no login, 20 at a time, flags the duds, zips the rest." The
missing append-to-batch is the only nit and it doesn't change what I'd tell people.

```json
{"tester": 2, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 10,
 "topComplaints": ["Still can't append photos after a batch finishes — no file input remains, only Start over which wipes results"],
 "priorConcernsAddressed": "some"}
```
