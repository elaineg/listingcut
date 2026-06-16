# Run 20260616 gradient deepen — Round 1

App: listingcut (local prod server http://localhost:3210)
Feature under test: GRADIENT background mode (4th Background option: 6 preset chips, custom From/To hex + native pickers, vertical/horizontal/diagonal angle; composes with size/margin/shadow; sticky; applies to batch ZIP).
Bar: advocacy ≥9 ∧ clarity=Yes ∧ value=Yes.

## Per-tester verdicts

| # | Persona | Clarity | Value | Advocacy | At bar? |
|---|---------|---------|-------|----------|---------|
| 1 | Priya — Sr backend SWE | Yes | Marginal | 8 | No |
| 2 | Marcus — Frontend eng | Yes | Yes | 8 | No |
| 3 | Wen — Marketing data analyst | Yes | Marginal | 6 | No |
| 4 | Tomás — Ops analyst | Yes | Yes | 8 | No |
| 5 | Dana — Demand-gen marketer | Yes | Yes | 8 | No |
| 6 | Jules — Content/community marketer | Yes | Yes | 8 | No |
| 7 | Aisha — Product designer | Yes | Yes | 8 | No |
| 8 | Rob — Brand/visual designer | Yes | Yes | 8 | No |
| 9 | Elena — Eng manager | Yes | Yes | 8 | No |
| 10 | Sam — Product manager | Yes | Yes | 8 | No |

**AT-BAR COUNT: 0/10.** Clarity 10/10 Yes. Value 8/10 Yes (Priya + Wen Marginal on personal frequency, not on quality).

## Gradient feature reception (friction #39 — discoverability)

Uniformly POSITIVE. Every tester who tried it found the gradient mode:
- **Discoverable**: all 10 found it immediately as the 4th segment beside White/Color/Transparent — no one reported it as undiscoverable or confusing.
- **Clear**: 6 labeled preset chips (rendered as real mini-gradient swatches per Aisha), From/To hex + native color pickers, and the angle control all read correctly.
- **Worked**: testers verified real gradients baked into exported JPEGs at correct preset sizes (1080×1080, 1200×627) with custom brand hex pairs retained exactly (Rob #FF6A00→#1A1A2E, Dana #FF6B00→#7C3AED, Wen #7B2FF7); live preview composited correctly; download button relabeled to reflect the gradient; sticky across Start-over (Aisha, Rob); zero console errors reported by anyone.
- Several said the gradient is precisely what NUDGED their score UP (Jules, Elena 7→8, Aisha). It is a net-positive feature, well received, not a blocker to advocacy.

## Holdbacks — classified

### KNOWN STRUCTURAL CEILING (unrelated to gradients, unfixable in free-client-side premise — do NOT treat as gradient regressions)
- **Free @imgly fine-hair MATTE quality / edge trust**: Aisha, Rob, (and Marcus, Elena, Priya echo it) — won't fully trust on hair/fur; only sample is a hard-edged mug so headshot edge quality is taken on faith. This is the documented ~honest-8 ceiling.
- **~50MB one-time model download ETA / silent first-run wait**: Dana, Elena, Marcus, Priya — flagged the cold-start download as a wait/risk on flaky wifi. Pre-existing non-feature item (Tomás's classic item; here it surfaced via others too).
- **Personal frequency mismatch**: Priya (twice-a-year → Value Marginal, adv 8), Wen (monthly, not weekly → Value Marginal, adv 6), Tomás/Elena (occasional). Audience-fit ceiling, not a defect.
- Priya's extra skeptic nit: "airplane mode still works" copy is only true AFTER first-run model download (cold start pulls chunks from staticimgly.com CDN — photo private, usage visible). Copy-precision nit, pre-existing privacy-proof family, not a gradient issue.

### NEW gradient-adjacent items surfaced this round (minor polish; NOT advocacy-blocking — every gradient-trier still landed at 8, held back by the ceiling above, not by these)
- **No save-as-preset for a custom brand gradient**: Jules, Aisha, Rob, Sam all independently want to save/name a two-hex brand gradient so they don't re-type hexes each session. Most-repeated gradient request (4 testers). Enhancement, not a bug.
- **From/To default coupling (Wen)**: setting only "From" leaves "To" at the default blue, producing an unintended two-tone for a user who wanted a single brand hue. Minor UX nit (arguably "use Color mode for a single hue").
- **Hex field ↔ native swatch echo (Sam)**: hex text field doesn't visibly echo a color picked via the native swatch — two color paths feel redundant/unsynced. Minor; Wen/Tomás/Rob reported From/To hex syncing fine, so this is a polish inconsistency, not a hard break.
- **No proof gradient applies across the batch ZIP (Dana)**: she couldn't confirm in-session that the chosen gradient is applied identically to every image in the batch ZIP. (Spec says it does — this is a visibility/reassurance gap, not a confirmed failure.)
- Minor: same-hue subject/gradient blend wanting an edge/shadow pop (Dana); angle limited to 3 presets, no arbitrary degree/radial (Aisha, Rob); no copy-to-clipboard (Jules).

## Read for go/no-go
No NEW, FIXABLE, advocacy-BLOCKING gradient defect emerged. The gradient feature itself was a clean success — discoverable, clear, working, zero console errors, and it pushed several scores UP. The 0/10 at-bar is the SAME known structural ceiling listingcut always PARKs against (edge-quality matte trust + ~50MB download + audience frequency), now uniformly capping testers at 8 rather than the usual ~6-advocate split. The gradient-adjacent items (save-preset, From/To default, hex echo, batch-ZIP reassurance) are minor polish, none of which any tester named as the reason they withheld a 9.
