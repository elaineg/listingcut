# ListingCut — Panel Synthesis, Round 3

> URL tested this round serves the neutralized-default build. Exit bar: advocacy ≥9 AND
> Yes/Yes. **Result: 7/10 at the 9 bar** (Marcus 9, Wen 9, Tomás 9, Dana 10, Jules 9,
> Elena 9, Sam 9) — up from 3/10 in R2 and 0/10 in R1. Holdouts all sit at **8**: Priya,
> Aisha, Rob. Clarity 10/10, Value 10/10 (Priya's R2 value=No flipped to Yes). The R2
> fixes — neutralized seller default, General & Social presets first, neutral Square 1080
> default, demoted eBay line, "Headshots & avatars" copy lead, honest Touch-up framing —
> all landed and directly caused every R2→R3 jump. Loop continues to round 4.

## Score table

| # | Name   | Clarity | Value | Advocacy | Prior addressed |
|---|--------|---------|-------|----------|-----------------|
| 1 | Priya  | Yes     | Yes   | 8        | some            |
| 2 | Marcus | Yes     | Yes   | 9        | all             |
| 3 | Wen    | Yes     | Yes   | 9        | all             |
| 4 | Tomás  | Yes     | Yes   | 9        | all             |
| 5 | Dana   | Yes     | Yes   | 10       | all             |
| 6 | Jules  | Yes     | Yes   | 9        | all             |
| 7 | Aisha  | Yes     | Yes   | 8        | all             |
| 8 | Rob    | Yes     | Yes   | 8        | some            |
| 9 | Elena  | Yes     | Yes   | 9        | all             |
| 10| Sam    | Yes     | Yes   | 9        | all             |

Mean advocacy 8.7. Value = Yes for all 10.

## Remaining complaints, grouped by cause

### A. No face/headshot PROOF — the only clearly-fixable holdout (Priya, 8)
The "Headshots & avatars" copy gave Priya the SIGNAL faces are supported, so her R2 value
blocker is gone (value=Yes). But every VISUAL is still the mug: the three hero tiles, the
"Try the sample" demo (sample-mug.png), and all result imagery. She has the signal but no
PROOF the model cuts a face/hair cleanly. Her exact words: "a face example would give me
the proof." She'd go to 9 with a clean-cutting face sample. **Highest-leverage R4 fix** —
converts an 8 to a 9 and is in our control IF a clean-licensed face image can be sourced.

### B. Model-bound edge ceiling — largely NOT fixable this run (Aisha 8, Rob 8)
The free in-browser @imgly model clips fine/wispy hair. Both confirmed it on REAL portraits
this round (no longer fear — tested):
- Aisha (8, up from 7): hair came back SOFT/feathered, not hard-clipped, no opaque blob —
  better than feared. But the raw edge is "a real ceiling" for a high-res hero comp; she'd
  still want a touch-up pass. The honest Touch-up framing landed and earned the bump.
- Rob (8): silhouette/body/face clean with no halo, but fine curl tips clip to a hard
  outline. Touch-up is per-image manual brushwork, not hair matting — it can't scale to his
  20-client-assets/week volume. His 8 is **structural**: the time-win that would make him
  switch is erased by hand-painting hair on every asset.
Both explicitly noted the defensible choice NOT to swap the model (would balloon the ~50MB
download). **Do NOT chase a model swap.** The R4 move is indirect: make the face sample (A)
showcase the model at its BEST and keep Touch-up prominent. Aisha/Rob are an **honest 8
ceiling** for a free, client-side tool — capping below 9 is the cost of free + no-signup +
small download.

### C. Recurring color-label nit — minor but 3x flagged (Sam R1+R3, Elena)
In Color mode the background defaults to white (#ffffff), so the download button still reads
"white JPEG" until an actual color is picked — reads as "nothing happened" and made Sam
double-check. Minor, not a blocker, but surfaced across two separate rounds → small R4
clarity fix.

### D. Out-of-scope / structural ceilings (noted, not actionable as friction)
- **Brand name "ListingCut"** (Wen): UI is neutral now but the name still telegraphs
  "seller" before load. Rename is out of scope for a DEEPEN run.
- **First-cutout ~50MB model wait** (Marcus, Elena): explained honestly; the wait itself
  persists on slow networks. Pre-warm/smaller-first-model is a future polish.
- **Multi-size batch ZIP unproven on single sample** (Jules, Sam): "Sizes…" + batch exist
  but the one-mug sample doesn't prove the 20-image promise.
- **Premature-download temptation** (Tomás): result-card download buttons sit above the
  Export panel where size is chosen.
- **Remembered recent brand colors** (Dana, already a 10): pure wish, not friction.

## Round-4 fix list
1. Add a HEADSHOT/FACE example — a second one-click sample ("Try a headshot") and/or a face
   in the hero tiles — that demonstrably cuts CLEANLY (short/clear hair, good separation).
   Addresses Priya (8→9) and showcases the model at its best for Aisha/Rob. Hard constraint:
   freely/permissively-licensed image, verify it cuts well; fall back to copy if not.
2. Fix the Color-mode label nit: default Color to a non-white starting color OR relabel the
   button the instant Color is selected. Addresses Sam/Elena.
Not a redesign — a face-sample addition plus a small color-label clarity fix.

## Honest read on reaching the bar
**9/10 is reachable IFF the face sample lands** — Priya is the only fixable holdout and is
explicitly conditional on a clean face proof. **10/10 is NOT realistically reachable this
run:** Aisha and Rob are model-bound 8s (Aisha a livable quality ceiling; Rob structural —
manual touch-up doesn't scale to volume). Neither moves without a larger/better model, which
would balloon the download and break the free + small-bundle value prop — a trade correctly
declined. Target R4 outcome: **8/10 (Priya recovered), Aisha/Rob accepted as an honest
free-client-side ceiling.** If a clean-licensed face image can't be reliably bundled, expect
to hold at 7/10 with the proof gap acknowledged.
