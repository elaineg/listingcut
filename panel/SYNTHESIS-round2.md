# ListingCut — Panel Synthesis, Round 2 (DEEPEN, computer-work ICP)

Result: **3/10 at the 9-advocacy bar** (Tomás, Dana, Jules = 9), up from **0/10 in Round 1**.
All Round-1 bugs CONFIRMED FIXED across testers (label lag, panel intermittent non-render,
Custom-size resetting the color, mobile chip-tap-eaten, batch-ZIP value legibility).

## Score table

| # | Name   | Clarity | Value | Advocacy | Prior concerns addressed |
|---|--------|---------|-------|----------|--------------------------|
| 1 | Priya  | Yes     | No    | 7        | some (label-lag fixed; still no face/headshot signal) |
| 2 | Marcus | Yes     | Yes   | 8        | all (panel non-render fixed 6/6) |
| 3 | Wen    | Yes     | Yes   | 8        | all |
| 4 | Tomás  | Yes     | Yes   | **9**    | all |
| 5 | Dana   | Yes     | Yes   | **9**    | all |
| 6 | Jules  | Yes     | Yes   | **9**    | all |
| 7 | Aisha  | Yes     | Yes   | 7        | yes on positioning; edge-quality still blocker (down from 8) |
| 8 | Rob    | Yes     | Yes   | 8        | batch value fully clear; edge-quality untested-on-hair |
| 9 | Elena  | Yes     | Yes   | 8        | some (seller residue remains lower on page) |
| 10| Sam    | Yes     | Yes   | 8        | mostly (seller residue remains lower on page) |

Clarity: **10/10 Yes**. Value: **9/10 Yes** (Priya the lone No).

## Complaints behind advocacy<9 or value=No, grouped by cause

### A. RESIDUAL SELLER GRAVITY — RECURRING, dominant (6+ testers) — caps Wen 8, Elena 8, Sam 8; named nit at Tomás 9, Dana 9, Jules 9; echoed by Marcus
Even after the R1 reframe, non-sellers still LAND in a seller default. Concrete cues:
- (a) preset list LEADS with the **MARKETPLACES** group (eBay/Etsy/Poshmark/Depop/Facebook) above "Social & Other" (Wen, Tomás, Dana, Elena, Sam).
- (b) default selected chip + live-preview default is **"eBay 1600×1600"**; default download reads **"(eBay)"** (Elena, Sam).
- (c) the **"eBay's own photo guidelines recommend a clean white background"** line is the lone social-proof line and sits prominently under the subhead (Elena, Sam, Jules — off-key for a social/IG user).
- (d) margin help says **"space around the product"** (Elena).
- (e) brand name **"ListingCut"** (Wen — noted, not addressed this round).
Effect: a marketer/designer/PM scans past four resale sites + seller cues before reaching Slide/Square/Link-Ad. Highly fixable; plausibly lifts Wen/Elena/Sam to 9 and clears the standing nit for the three 9s.

### B. NO FACE/HEADSHOT SIGNAL — single persona but the ONLY value=No (Priya 7, value=No)
Nothing signals or proves the tool is meant for FACES (headshots/avatars). Use-case line is
object/marketing-only (listings, ads & social, slides); sample is a mug; no face example.
Priya can't tell if the model handles hair/face edges and never feels addressed. Cheap copy-level
cue fixes the signal; a clean-cutting face sample is higher-effort/model-dependent (stretch).

### C. EDGE QUALITY ON HARD IMAGES — RECURRING, model-bound (Aisha 7 DOWN from 8; Rob 8)
On a real portrait the @imgly cutout left an opaque background blob on the lower-right shoulder
and hard-clipped flyaway hair (Aisha — a concrete, visible miss now caps her HARDER than R1's
untested unknown). Rob: never watched it survive hair/fabric because every demo is a hard-edged
product (mug/phone). Underlying segmentation-model quality, not the new feature. Fix is honesty +
discoverable touch-up at the result, plus investigating a higher-quality model variant; do NOT
over-promise perfect hair.

### D. FIRST-RUN MODEL DOWNLOAD READS AS "STUCK" — single persona (Marcus 8)
The one-time ~50MB model download blocks the first cutout and could read as stuck to a teammate
on their very first try. Mostly expectation-setting; the size is a hard constraint.

### E. BATCH/ZIP DISCOVERABILITY — single persona (Rob 8, secondary)
ZIP only appears after 2+ photos fully succeed, with no prior signal; a first-timer can't tell
the tool scales until they happen to drop two good ones. (Carryover nicety, not a R2 blocker.)

## Priority for the fix stage
1. **A — neutralize the seller default** (group ordering + neutral default preset + soften eBay line + "subject" copy). Single highest-leverage change; converts three 8s and removes the nit on three 9s.
2. **B — add a headshots/avatars use-case cue** (copy-level; addresses the only value=No).
3. **C — make Touch up discoverable at the result + honest edge expectations**; investigate higher-quality @imgly variant.
4. **D — reassure the two-phase download→processing progress.**
