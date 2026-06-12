# Round 2 — Tester 4: Kevin Doyle (software engineer, occasional eBay seller, privacy-skeptic)

## Prior concerns from round 1 — addressed?
1. **No batch processing — FIXED.** Dropzone now says "Drag & drop photos (up to 20)". I
   dropped 3 cluttered-desk shots at once; all processed (~29s total), each row has its own
   Download, plus "Download all (ZIP) — 3 photos, eBay 1600×1600" which gave me one
   `listingcut-ebay-1600x1600.zip`. Exactly what a multi-item selling session needs.
2. **No edge refine tool — FIXED.** New "Touch up" button opens an editor with Erase /
   Restore brushes, a size slider, and Undo. Done/Cancel commit cleanly back to the preview.
   Minor nit: inside the editor it's hard to see what's kept vs removed — the removed
   background is just a slightly-dimmed version of the original, no checkerboard like the
   main preview has.
3. **No model-download warning — FIXED.** "First photo downloads a one-time ~50 MB tool —
   after that it's fast" sits right in the dropzone. Honest and clear.
4. **vercel.live third-party script — NOT FIXED.** Still loads on a page whose whole pitch
   is "nothing leaves this device". It's the only non-essential third party left.

## Privacy re-audit
Watched every request across three sessions: **zero POST/PUT/anything-upload, ever** —
landing, sample, 3-photo batch, touch-up, ZIP download. Only GETs to the app domain,
`staticimgly.com` (model weights coming down), and `vercel.live`. The claim still survives
a network-tab inspection. That remains rare and is why I keep talking about this app.

## New problem found
My very first batch attempt failed: all 3 photos showed red **"Failed to fetch"** (a
transient model-download failure) and there was **no Retry button** — only "Start over".
A raw fetch error as user-facing copy, and a dead end. I retried in a fresh session and it
worked, but someone on flaky Wi-Fi hits this, sees three red errors, and concludes the app
is broken. Needs a per-item Retry and a human error message ("couldn't download the
background-removal tool — check your connection and retry").

## Clarity — Yes
Same as round 1: "drop product photos, it strips backgrounds in-browser, exports white-bg
JPEGs at exact marketplace sizes, nothing uploaded." The lock badge + "up to 20" + the
~50 MB note make the whole model of the app legible in 15 seconds.

## Value — Yes
Today: GIMP fuzzy-select, 10–15 min/photo, or ship the cluttered shot. This round it did
3 photos in 29s with one ZIP at eBay dimensions. With batch + touch-up the tool now covers
the whole selling-session job, not just one photo — I no longer fall back to GIMP for the
last 10%.

## Advocacy — 9
All three of my structural complaints were fixed and the privacy claim still verifies. I
would (and will) bring this up unprompted in "stop uploading your photos to remove.bg"
threads. What keeps it from a 10: the no-retry "Failed to fetch" dead end on a flaky first
load, and `vercel.live` still riding along on a privacy-pitch page.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["transient 'Failed to fetch' fails whole batch with no Retry button — only Start over",
 "vercel.live third-party script still loads on a 'nothing leaves this device' page",
 "touch-up editor lacks checkerboard contrast between kept and removed areas"],
 "priorConcernsAddressed": "some"}
```
