# Round 1 — Tester 4: Kevin Doyle (software engineer, occasional eBay seller, privacy-skeptic)

## Clarity — Yes
30 seconds in, I could tell a friend: "Drop in a product photo, it strips the background
client-side and spits out a white-background JPEG at eBay/Etsy/Poshmark dimensions. No
account, no upload." The headline "Listing-ready product photos in your browser" plus the
before/after mug graphic made it instant. The green lock badge "Your photo never leaves
this device — everything runs in your browser" is exactly the claim that made me stay
instead of closing the tab. Nothing on screen confused me.

## Privacy audit (the reason I came)
I watched the network tab through the whole session. Verdict: the claim is TRUE.
- Zero POST/PUT requests at any point — not on sample, not on my own upload, not on download.
- The ML model (~couple dozen chunked files) is fetched via GET from `staticimgly.com`
  (img.ly's open-source background-removal package). That's model weights coming DOWN,
  nothing going up. Honest.
- One ding: a `vercel.live` script loads on the page. It's Vercel's toolbar, not analytics
  on my image, but a "nothing leaves this device" page should be free of third-party JS
  it doesn't need. A privacy-skeptic notices.

## Value — Yes
Today I either fuzzy-select in GIMP for 10–15 minutes per photo or just ship the cluttered-
desk shot and eat the worse listing. This did a clean cutout of my test photo in ~27s
(first run, including the model download; the model should be cached after) and gave me a
correctly-sized 2000×2000 white-bg JPEG named `test-item-etsy-2000x2000.jpg`. The exact-
dimension export is the underrated part — I always have to look up eBay's size rules.
That's a genuine save over GIMP for the 6–10 photos I do per selling spree.

## What holds it back
1. One image at a time. A selling session is 4 photos per item × 3 items. No batch, and
   "Start over" nukes the result — I'd want to queue several and download all.
2. No edge touch-up. My synthetic test had clean edges; real electronics have cables and
   matte black corners the model will chew. There's no brush/refine tool, so when the
   cutout is 90% right I'm back in GIMP anyway for the last 10%.
3. No hint that the ~40MB model download is coming. On first use the spinner just sits
   there; I'd add "downloading model (one-time, ~40MB)" so people on slow links don't bail.
4. Minor: the marketplace download button label lags the chip selection by a beat
   (still said "Download 1600×1600 JPEG" right after I picked Etsy; it did update).

## Advocacy — 8
I would actually mention this in a "stop paying remove.bg / stop uploading your photos"
conversation — the verified client-side claim is the differentiator and it's rare that the
marketing copy survives a network-tab inspection. It's not a 9 because batch and edge
refinement are missing, so for a real multi-item selling session it only covers part of
the job. Fix batch + a refine brush and I'd push it unprompted.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8,
 "topComplaints": ["no batch processing for multi-photo selling sessions",
 "no edge refine/brush tool for imperfect cutouts",
 "no warning about the large one-time model download; vercel.live third-party script on a privacy-pitch page"],
 "priorConcernsAddressed": "n/a"}
```
