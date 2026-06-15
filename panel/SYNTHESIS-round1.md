# ListingCut — Panel Synthesis, Round 1 (DEEPEN: export-background selector White|Color|Transparent)

NOTE: This run REGENERATED the 10 panel profiles from the post-2026-06-12 ICP roster
(computer-work pros — marketers, designers, PMs, engineers, data analysts, managers),
REPLACING the old marketplace-seller personas used in prior rounds. Every tester here is a
non-seller using a listing-framed tool — which is exactly why positioning dominates the
findings below.

## Score table

| Name   | Role (ICP)             | Clarity | Value | Advocacy |
|--------|------------------------|---------|-------|----------|
| Priya  | Engineer (headshot)    | Yes     | No    | 6        |
| Marcus | Dev (PNG assets)       | Yes     | Yes   | 5        |
| Wen    | Data/reporting         | Yes     | Yes   | 7        |
| Tomás  | Corp/IT (slides)       | Yes     | Yes   | 8        |
| Dana   | Marketer (ads)         | Yes     | Yes   | 8        |
| Jules  | Social marketer        | Yes     | Yes   | 8        |
| Aisha  | Designer (slides/Fig)  | Yes     | Yes   | 8        |
| Rob    | Designer (client)      | Yes     | Yes   | 7        |
| Elena  | Manager (team photos)  | Yes     | Yes   | 7        |
| Sam    | PM (decks)             | Yes     | Yes   | 7        |

Result: **0/10 at the 9-advocacy bar.** Best = 8 (four testers). Clarity is universal
(10/10 "Yes") — job legibility is solved. The ceiling is value-fit + one reliability bug.

## Complaints grouped by cause

### A. Reseller framing — DOMINANT, recurs across 9 of 10 personas
Flagged by Priya, Marcus, Wen, Tomás, Dana, Jules, Aisha, Rob, Elena, Sam.
The headline ("Listing-ready product photos"), the subhead (white-bg JPEG for
eBay/Etsy/Poshmark/Depop/Facebook), ALL size presets, and the "Marketplace export" section
title make every computer-work persona feel "this isn't for me." Concrete effects:
- **Caveated recommendations** — the literal reason no one reaches 9: "I'd have to tell a
  peer 'ignore the eBay stuff'" (Jules, Elena, Sam); "wouldn't bring it up unprompted to my
  engineering peers" (Priya).
- **The NEW background feature — the thing that broadens beyond sellers (brand-color
  ads/social/decks, transparent slide/mock cutouts) — is INVISIBLE above the fold.** It only
  appears AFTER processing. "I nearly bounced before discovering the color feature" (Dana);
  "buried under seller framing — I'd never have known to come here for it" (Priya); "weak on
  advertising that it even exists" (Dana); "'Marketplace export' label made me almost skip
  the very feature that serves me" (Wen). This is the
  added-feature-buried-panel-surfaces-not-function lesson in the wild.
- Priya's lone value=No is downstream of framing: nothing signals people/headshot work, so
  she won't trust the model on faces and won't bring it to her team.

### B. Size presets all marketplace — recurs across 4 personas (Dana, Jules, Sam, Aisha; Wen adjacent)
No social/marketing/presentation sizes; "Custom" is buried last after five seller presets,
so non-sellers hunt or re-type every time. Specific asks:
- LinkedIn / ad / email: 1200×627, 600px hero (Dana).
- Social: 1080×1080 square, 1080×1920 Story (Jules).
- Presentation 16:9 (Sam).
- "A generic-design / Custom entry point would make me feel addressed" (Aisha, Wen, Sam).

### C. Download-button label lags / goes stale — recurs across 4 personas (Priya, Tomás, Sam; Wen adjacent)
After switching to Color/hex the button still read "· white" for a beat or never updated
(Tomás: "·white" never updated; Priya: lagged a beat; Sam: defaulted to white so "nothing
happened"). For work assets this makes users stop and re-verify what they're exporting.
**UX implication: the label MUST reflect the chosen background instantly.**

### D. Export panel intermittently never renders — Marcus (single-persona, but a hard bug → advocacy 5)
On 4 of 6 sample runs the entire export panel (selector + presets + download) silently never
appeared after the cutout completed — no spinner, no error. "Silent no-op is the worst
failure mode — looks broken." Lowest advocacy on the panel. → P0 reliability bug to builder.

### E. State-loss quirks — single-persona each
- Dana: choosing "Custom" size silently reset Export background Color → White, losing her
  hex (re-doing the exact work she came to escape).
- Jules: a size-chip tap silently got "eaten" (didn't register first try).
- Rob: with one image there's no ZIP affordance and no signal that bg/size/margin apply to
  ALL photos — batch-confidence gap for volume work.

### F. Unproven on hard edges — recurs across 2 designers (Rob, Aisha; single-segment)
Sample is a vector-clean mug ("easy mode"); they won't trust client deliverables until they
see hair/fuzzy fabric survive. Not a round-1 reframing item — a credibility ceiling for the
designer segment; note for future (a harder real-photo sample or a "try your own" nudge).

## Read for the iteration
Clarity is done. The 9-bar is blocked almost entirely by ONE thing: the app reads as a
seller-only tool, so 9/10 computer-work pros caveat their recommendation — and the very
feature that serves them (color/transparent backgrounds) is hidden until after processing.
Fix = reframe the landing to include non-sellers WITHOUT dropping the seller case (A),
surface the background value prop above the fold (A), add a few non-seller presets + group
them (B), make the download label instant (C) and the panel reliable (D). C/D/E go to the
builder as bugs; A/B are the UX-brief reframing.
