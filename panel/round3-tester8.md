# Round 3 — Tester 8 (Priya Patel, Shopify/eBay seller, Windows laptop + Chrome)

## Prior concerns from round 2 — were they fixed?
1. **ZIP exports one preset at a time — NOT FIXED.** The ZIP button still follows whichever
   single preset is selected ("Download all (ZIP) — 2 photos, Etsy 2000×2000"). To get my
   eBay 1600 AND Shopify 2000 sizes I still download two ZIPs. Minor, same as before.
2. **Queue thumbnails too small to review a batch — NOT FIXED.** The queue rows still show
   ~48px thumbnails. Clicking a row swaps the big preview one photo at a time, same as round
   2. No grid/lightbox to eyeball all cutouts at full size before zipping.

## NEW PROBLEM — the round-1 shadow smudge is BACK, and it's in every export
I dropped 4 phone-case photos (case on a beige table with a cast shadow — same kind of shot
as rounds 1 and 2). This time ALL FOUR exported eBay JPEGs kept a big brown shadow blob under
the product, and because the blob widens the crop, the case sits crammed in the top-left with
a huge empty white area to the right and below. None of these four is listable on eBay. In
round 2 this exact scenario came out clean — this is a regression of my original dealbreaker.
The Touch up tool (Erase/Restore/Pan, zoom, checker/white/dark preview) does exist and could
hand-erase the blob, but erasing 20 photos one by one is exactly the labor I pay Fiverr to
avoid. Also, on my first batch, photo 1 of 4 errored with "Failed to fetch" after the model
download; a Retry button fixed it (good touch), but the second full run took ~3 minutes for 4
photos, slower than round 2's ~42 seconds for 3.

## Clarity — Yes
Unchanged and still strong: "Free in-browser tool that cuts the background off product photos
and gives you white-background JPEGs sized for eBay/Etsy/Poshmark — batches of 20, ZIP
download, nothing uploaded anywhere." Headline, mug before/after, "free, no upload, no
signup", and "Drag & drop photos (up to 20)" tell the whole story in 30 seconds.

## Value — Marginal
Today: Fiverr, $15 per 20 photos, 2-day turnaround. Round 2 this app genuinely beat that. This
round it didn't: every photo in my batch came back with a dirty brown shadow blob and bad
framing, so my choices are hand-erasing each one in Touch up (the manual labor I'm paying to
skip) or sending the batch to Fiverr anyway. The batch+ZIP plumbing is still great — the
cutout quality is what regressed, and cutout quality is the entire product.

## Advocacy — 4
Last round I was at 9 and ready to post it in my reseller group. I'm glad I didn't, because if
a friend ran her batch and got brown blobs under all 20 products, that's my credibility gone.
Held back by: (a) the shadow smudge regression on every photo in my batch — round 1's
dealbreaker, returned; (b) exports off-center with dead white space because the crop includes
the blob; (c) a "Failed to fetch" flake on first run (Retry saved it); (d) my two round-2 asks
(multi-size ZIP, batch review view) untouched. Fix the cutout consistency and I'm back to 9 —
the rest of the product is already there.

```json
{"tester": 8, "round": 3, "clarity": "Yes", "value": "Marginal", "advocacy": 4,
 "topComplaints": ["Shadow smudge regression: brown cast-shadow blob left in ALL 4 exported JPEGs, product off-center with dead white space",
 "One photo failed with 'Failed to fetch' on first batch (Retry worked)",
 "Round-2 asks unaddressed: ZIP is one preset at a time; no full-size batch review view"],
 "priorConcernsAddressed": "none"}
```
