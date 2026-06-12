# Panel synthesis — listingcut round 2

URL tested: https://listingcut-p7jb3c7sc-elainegao.vercel.app
Exit bar: ≥9/10 with advocacy ≥9 AND Yes/Yes. **Result: 6/10 at bar. Loop continues to round 3.**

## Score table (round 1 → round 2)

| # | Persona | Clarity | Value | Advocacy | Prior concerns |
|---|---------|---------|-------|----------|----------------|
| 1 | Darlene | Yes | Yes | 8 → **9** | all addressed |
| 2 | Marcus | Yes | Marginal → Yes | 6 → **9** | all addressed |
| 3 | Rita | Yes | Yes | 8 → 8 | 2 of 4 fixed; NEW bug capped score |
| 4 | Kevin | Yes | Yes | 8 → **9** | 3 of 4 fixed |
| 5 | Amara | Yes | Yes | 8 → **9** | all addressed |
| 6 | Tom | Yes | Yes | 8 → **9** | all addressed |
| 7 | Jess | Yes | Yes | 7 → 8 | some (brush works, no zoom/dark preview) |
| 8 | Priya | Yes | Yes | 6 → **9** | all addressed |
| 9 | Caleb | Yes | Marginal | 6 → 8 | all addressed |
| 10 | Helen | Yes | Marginal → Yes | 5 → 8 | all addressed |

Round-1 themes (batch, brush existence, hierarchy, presets, disclosure) all landed — every tester moved up or held. What remains is narrower.

## Complaints behind the four <9 scores, grouped

### A. Reliability: model-fetch failure is a dead end (T3, T4 — independently reproduced; T2 adjacent)
T3's first run failed: both photos red "Failed to fetch", NO retry — only page reload recovers. T4 hit the identical state on a transient failure (screenshot evidence both). T2 found the sibling bug: an empty cutout is marked "Done" and silently zipped as a blank white JPEG. Fix: per-photo Retry button on failure rows; detect near-empty cutouts (alpha coverage below threshold) and mark "Check this one" instead of silent Done.

### B. Touch-up precision (T7, T10)
T7: no zoom/pan so precise fixes are fiddly; hard-edged brush leaves scallops; wants a dark-background preview toggle to see edge halos. Explicit: "zoom + dark preview would make it a 9." T10: finger-erasing fiddly at mobile sizes (zoom + soft brush addresses it). Fix: pinch/wheel zoom + drag pan in the Touch up editor, soft-edged (feathered) brush, and a preview-background toggle (checker/white/dark).

### C. Hero copy under-sells the marketplace coverage + the claim has no backing (T5, T6, T9, T10)
Subtitle regression says only "eBay & Poshmark": Etsy vanished (T6 — it's what hooked her), Depop unnamed (T5), Facebook unnamed (T10). T9 wants substantiation for "sell faster." Fix: subtitle names eBay, Etsy, Poshmark, Depop, Facebook; back the claim with eBay's own photo guideline (recommendation of clean/white backgrounds) phrased factually — no invented statistics.

### D. Margin/placement control (T3 — second consecutive round; echoed by T2 "padding control")
Tall vase nearly touches the frame; deprioritized in round 1, now capping an 8 for a core target persona. Fix: a simple margin slider (e.g. 2–15%, default 6%) applied to the composite; persists like the preset.

### E. Not actionable this round (noted for the report)
- ~50 MB first-run model download (T9, T10): inherent to the client-side/privacy architecture; already disclosed pre-upload.
- `vercel.live` script (T4): Vercel preview-toolbar injection — absent on production deployments; no code change.
- T9's value is still "Marginal" — adjacent skeptic who doesn't believe he needs the product; C is the only lever we have. He may be the one allowed miss.
- 10-blockers from testers already at 9 (append-to-batch, multi-preset ZIP, larger thumbnails, gray halo on textured glaze, lost whiskers — model-bound): out of scope for the bar.

## Round 3 fix list
1. Per-photo Retry on fetch failure; flag near-empty cutouts instead of silent Done (A — T2,T3,T4)
2. Touch up: zoom/pan, feathered brush, preview background toggle checker/white/dark (B — T7,T10)
3. Subtitle names all five marketplaces; factual eBay-guideline backing for the white-background claim (C — T5,T6,T9,T10)
4. Margin slider, sticky, default 6% (D — T2,T3)
