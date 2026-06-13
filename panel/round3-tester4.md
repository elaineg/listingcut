# Round 3 — Tester 4: Kevin Doyle (software engineer, occasional eBay seller, privacy-skeptic)

## Prior concerns from round 2 — addressed?
1. **No per-item Retry on transient failure — FIXED (mostly).** I simulated a flaky network
   by blocking the model-weights host mid-batch: both rows went red and each now has its own
   **Retry** button instead of the old "Start over" dead end. I restored the network, clicked
   Retry, and the photo processed to Done. Real recovery path, exactly what I asked for.
   Remaining nit: the error copy is still the raw `Failed to fetch` — no human message like
   "couldn't download the background-removal tool, check your connection". The button fixes
   the dead end; the copy still looks like an uncaught exception.
2. **Touch-up editor kept/removed contrast — FIXED.** Editor now has a "Preview background:
   Checker / White / Dark" toggle, and removed areas render on a checkerboard by default.
   Erasing vs restoring is now unambiguous.
3. **vercel.live on a privacy-pitch page — can't fully verify.** It still loads on this
   preview URL (1 request), but I'm told that's the Vercel preview-deploy toolbar and won't
   exist on the production domain. Plausible — it's a known Vercel artifact — but as a
   skeptic I can only sign off on what I watched. Worth a re-check on the real prod domain.

## Privacy re-audit (round 3)
Logged every request across a 3-photo batch, touch-up session, and the failure/retry flow:
**zero non-GET requests in any session.** Hosts contacted: the app domain, staticimgly.com
(model weights, download only), blob: URLs (local), and one vercel.live GET (see above).
Three rounds running, the "your photo never leaves this device" claim survives a full
network-tab audit. That is still the rarest thing about this app.

## Clarity — Yes
"Drop product photos, it removes the background in your browser, exports white-bg JPEGs at
exact eBay/Etsy/Poshmark sizes, nothing is uploaded." Lock badge + "up to 20" + the honest
~50 MB first-load note make the whole model legible in 15 seconds. Unchanged and still good.

## Value — Yes
Today: GIMP fuzzy-select at 10–15 min/photo, or shipping cluttered-desk shots. This round:
3 photos batch-processed in ~65s (includes model download), per-row Downloads plus one
"Download all (ZIP) — eBay 1600×1600". With batch, touch-up, and now a working retry path,
it covers a full selling session end to end. I don't open GIMP for this anymore.

## Advocacy — 9
Both of my actionable round-2 complaints were fixed and the privacy claim verified for a
third straight round. I already bring this up unprompted in "stop uploading photos to
remove.bg" threads. Short of a 10: the failure state still surfaces raw `Failed to fetch`
as user-facing copy (looks broken even though Retry now saves you), and I'd want to run my
network audit once on the production domain to confirm vercel.live is genuinely absent.

```json
{"tester": 4, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["error copy is still raw 'Failed to fetch' — Retry works but message should be human-readable",
 "vercel.live absence on production domain unverified (preview URL still loads it)"],
 "priorConcernsAddressed": "all"}
```
