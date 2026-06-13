# Panel synthesis — listingcut round 3

URL tested: https://listingcut-hn2mhsdkh-elainegao.vercel.app
Exit bar: ≥9/10 with advocacy ≥9 AND Yes/Yes. **Result: 8/10 at bar. One short — loop continues to round 4.**

## Score table (round 2 → round 3)

| # | Persona | Clarity | Value | Advocacy | Prior concerns |
|---|---------|---------|-------|----------|----------------|
| 1 | Darlene | Yes | Yes | 9 → **9** | some (layout order unchanged) |
| 2 | Marcus | Yes | Yes | 9 → **10** | blank-flag exceeded ask; append-to-batch still missing |
| 3 | Rita | Yes | Yes | 8 → **9** | all (retry + margin verified) |
| 4 | Kevin | Yes | Yes | 9 → **9** | all (retry verified under flaky network) |
| 5 | Amara | Yes | Yes | 9 → **9** | all |
| 6 | Tom | Yes | Yes | 9 → **9** | all (Etsy back in subtitle) |
| 7 | Jess | Yes | Yes | 8 → **9** | all (zoom/pan, feathered brush, bg toggle) |
| 8 | Priya | Yes | Yes → Marginal | 9 → **4** | none; round-1 dealbreaker returned |
| 9 | Caleb | Yes | Marginal | 8 → 8 | some (citation landed; wait + append didn't) |
| 10 | Helen | Yes | Yes | 8 → **9** | some |

## What blocks the bar

### A. Cutout consistency — cast shadows / blobs survive into exports (T8 advocacy 4; echoed T10)
Priya's 4 photos all kept a brown cast-shadow blob under the product, AND the blob inflates the alpha bounding box so the product sits top-left with dead white space. Her words: "cutout consistency is the whole product; fix that and the persona returns to 9." Helen also had two blobs, one shipping unnoticed. Manual Touch up across 20 photos defeats the value vs Fiverr.
Fix (post-process the model's alpha mask, deterministic canvas work):
1. Connected-component pass on the alpha channel: keep the dominant subject component(s), drop disconnected blobs below a small fraction of the subject area (also fixes Helen's smudges automatically).
2. "Remove shadow" toggle (default ON): suppress semi-transparent dark regions (low alpha + low luminance) that the model keeps for cast shadows; keep soft edges by only acting on pixels well inside the shadow signature.
3. Compute the export crop/centering from the CLEANED mask so the subject centers properly.

### B. Batch usability for 20-photo sessions (T8 — second consecutive round)
Tiny queue thumbnails, no way to review results before zipping; ZIP is one preset at a time (eBay + Shopify = two passes). Fix: click a row to open that photo's full result (already exists — make thumbnails larger and obviously clickable / add a per-row preview expand), and let "Download all (ZIP)" include multiple selected presets (checkboxes in a small popover; default = current preset).

### C. Cheap recurring polish (one pass)
- Human error copy instead of raw "Failed to fetch" (T4, T6 — both said it's their only 10-blocker): e.g. "Couldn't download the background-removal tool — check your connection and tap Retry."
- "1 photo ismarked" missing space (T5) — the known JSX inline-tag space-drop; audit siblings.
- "Add more photos" after a batch completes instead of only Start over (T2, T9 — second time).
- Touch up: confirm before discarding unsaved brush work when exiting via row click (T7).

### D. Not actionable / accepted
- T9 (Caleb) stays the likely allowed miss: adjacent skeptic, value Marginal, remaining asks are the ~12s/photo model speed (architecture-bound) and dropzone copy honesty — soften "after that it's fast" to "next photos take ~10 s" as part of C.
- Model fine-detail ceiling (whiskers/hair — T7), per-photo speed (T9): model-bound.
- T1's layout-order nit (cutout above white preview): single-persona, she's at 9, leave alone this round to avoid destabilizing the 8 nines.

## Round 4 fix list
1. Mask auto-clean: connected-component blob removal + shadow-suppression toggle + crop from cleaned mask (A — T8, T10)
2. Batch review affordance + multi-preset ZIP (B — T8)
3. Polish pass: friendly fetch-error copy, ismarked typo, "Add more photos", touch-up discard confirm, honest dropzone timing copy (C — T2,T4,T5,T6,T7,T9)
