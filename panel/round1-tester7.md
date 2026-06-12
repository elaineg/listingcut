# Round 1 — Tester 7: Jess Nakamura (freelance graphic designer, MacBook Pro / Chrome)

## Clarity — Yes
Within 10 seconds I could pitch it: "Free in-browser background remover that spits out
white-background JPEGs pre-sized for eBay/Etsy/Poshmark — nothing gets uploaded."
What helped: the H1 "Listing-ready product photos in your browser," the subhead naming the
three marketplaces, and the green lock badge "Your photo never leaves this device." The
before/after mug graphic plus "Try the sample" made the flow obvious. Zero confusion. This
is one of the clearest landing states I've tested.

## Value — Yes (for my clients; Marginal for me personally)
Today I use Photoshop's Select Subject — better edges, 30 seconds, but $23/month, which is
exactly why my small-business clients ask me for alternatives. Their current "free" options
are remove.bg (free tier caps you at ~0.25MP previews — useless for a 1600px eBay listing)
or emailing me photos. This app gives full-resolution output free, and the marketplace
presets are a genuinely smart touch: my downloaded files were exactly 1600×1600 (eBay) and
2000×2000 (Etsy), correct white background, no signup. That's a real workflow saver for a
reseller — they normally remove background in one tool, then resize/pad to square in
another. Processing took ~24s on first run (clearly labeled "model downloads once, ~50 MB")
and ~20s after — slow next to Photoshop but fine for the audience.

## Output quality (the part I judge harshly)
I tested with a white tiger photo (fur edges, busy foliage background) and composited the
transparent PNG over magenta to inspect the mask:
- Fur edge: respectable for a free in-browser model — soft, mostly halo-free on white.
  A faint dark fringe along the back/ears shows on saturated backgrounds.
- **Residual background**: a green leaf/vine from the background was left attached to the
  hind leg — clearly visible even in the white-bg eBay export. A buyer would see it.
- **Mask holes**: semi-transparent patches on the foreleg and belly let the background
  bleed through; on the white export this reads as a milky ghost/haze under the body.
- Fine detail: whiskers mostly lost. Expected at this tier, but it's why I keep Photoshop.
The killer gap: there is **no refine/erase brush and no "preview on dark" toggle**. When
the model leaves a green leaf on the product, the user has zero recourse except a different
photo. Photoshop, remove.bg, and even Canva all offer manual touch-up.

## Advocacy — 7
And I mean a true 7, not a polite one. I *would* mention this to clients who ask for a free
remove.bg replacement — the presets, full-res output, and privacy story are genuinely good,
and clean product shots on plain surfaces will fare better than my torture-test image. But
I can't bring it up unprompted while a botched mask is unfixable in-app. What holds it back:
1. No manual touch-up/erase brush for residual background (my green-leaf case) or mask holes.
2. No edge-check preview (dark/colored background toggle) — users will only discover halos
   after the listing is live.
3. ~20s per photo is tolerable for one listing, tedious for a 30-item closet clear-out; no
   batch mode.
Fix #1 and #2 and this is an easy 9 for the no-Photoshop crowd.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 7,
 "topComplaints": ["No refine/erase brush — residual background (green leaf left on product) and semi-transparent mask holes are unfixable in-app", "No dark-background preview to catch edge halos before download", "~20s per photo and no batch mode for multi-item sellers"],
 "priorConcernsAddressed": "n/a"}
```
