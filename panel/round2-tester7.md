# Round 2 — Tester 7: Jess Nakamura (freelance graphic designer, MacBook Pro / Chrome)

## Prior concerns — re-checked first
1. **No refine/erase brush — FIXED.** There's now a "Touch up" button with Erase / Restore /
   Size slider / Undo / Done / Cancel. I verified it end-to-end: erase strokes change the
   canvas AND the downloaded transparent PNG and eBay JPEG (byte-diff confirmed). I used it
   to remove the green leaf from my white-tiger torture image. Caveats: **no zoom** in the
   touch-up view (the 1000px image edits at ~796px — precise work on a small leaf is fiddly;
   I clipped the tiger's flank on my first pass), and the brush edge is hard, no feathering.
2. **No dark-background edge preview — NOT FIXED.** Still only the checkerboard transparency
   view and the white live preview. The faint dark fringe along the fur edge is still only
   discoverable after export. This was half of my "easy 9" condition.
3. **No batch mode — FIXED, well.** Dropzone now takes up to 20 photos; 3 photos finished in
   24.5s *including* the one-time model download (photos 2–3 took ~3s each), and there's a
   "Download all (ZIP) — 3 photos, eBay 1600×1600" button. A 30-item closet clear-out is now
   realistic. Bonus: when I accidentally fed it two corrupt files, it failed per-file with
   "The source image could not be decoded." and kept going — correct behavior.

## Clarity — Yes
Same pitch in under 10 seconds: "Free in-browser background remover that outputs white-bg
JPEGs pre-sized for eBay/Etsy/Poshmark/Depop; nothing uploads." H1, marketplace presets, and
the lock badge still do the work. New copy "Stray smudge or missing edge? Use Touch up…"
tells users the brush exists at exactly the right moment. Still the clearest landing state
on this panel for me.

## Value — Yes
Today: Photoshop Select Subject ($23/mo, better edges, 30s). For me personally it stays
Photoshop. For the clients I'd recommend this to: remove.bg free tier caps at ~0.25MP;
this gives full-res 1600×1600 exports, presets, batch+ZIP, touch-up, no signup. That now
covers the whole reseller workflow (cut → fix → size → batch download) in one free tab.

## Output quality
Auto mask is unchanged from round 1 (same model): green leaf still attached to the hind leg,
semi-transparent patches on foreleg/belly still bleed magenta in my composite test, whiskers
lost. The difference is recourse now exists — Erase removed the leaf, and Restore claims to
paint product back over holes (I exercised Erase thoroughly; Restore only briefly).

## Advocacy — 8
Up from 7. The two biggest blockers (unfixable masks, no batch) are gone, and I would now
bring this up to a client who asks for a remove.bg alternative. What keeps it off 9–10:
- No zoom/pan in Touch up — fixing a thumbnail-sized artifact on a trackpad is trial-and-error.
- Still no dark/colored background preview toggle to catch edge halos before download.
- Hard-edged brush against a soft AI mask leaves visible square-ish scallops if you overdo it.
Add touch-up zoom and a dark preview and this is a 9 for the no-Photoshop crowd.

```json
{"tester": 7, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8,
 "topComplaints": ["Touch up has no zoom/pan — precise erasing of small artifacts is fiddly and easy to overshoot", "Still no dark-background preview to catch edge halos before download", "Hard-edged brush (no feathering) leaves visible scallops next to the soft AI mask edge"],
 "priorConcernsAddressed": "some"}
```
