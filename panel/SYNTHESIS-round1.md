# Add-shadow Panel — SYNTHESIS Round 1

## Score table

| # | Tester | Role | Clarity | Value | Advocacy |
|---|--------|------|---------|-------|----------|
| 1 | Priya | Engineer (occasional) | Yes | Yes | 8 |
| 2 | Marcus | Frontend engineer | Yes | Yes | 8 |
| 3 | Wen | Marketing data analyst | Yes | Yes | 8 |
| 4 | Tomás | Operations analyst | Yes | Yes | 8 |
| 5 | Dana | Marketer | Yes | Yes | 8 |
| 6 | Jules | Content/community marketer | Yes | Yes | 7 |
| 7 | Aisha | Designer | Yes | Yes | 8 |
| 8 | Rob | Freelance brand designer | Yes | **Marginal** | 6 |
| 9 | Elena | Engineering manager | Yes | Yes | 8 |
| 10 | Sam | PM (mobile) | Yes | Yes | 8 |

**Clarity: 10/10 Yes. Value: 9/10 Yes (Rob Marginal). Advocacy: median 8, range 6–8.**

**Fully-passing (adv≥9 ∧ clarity=Yes ∧ value=Yes) = 0/10.**

The new Add-shadow FEATURE itself was praised by every tester who judged it in isolation
(Aisha "genuinely good", Rob "as a feature, that's a 9", Marcus/Tomás/Jules/Dana/Elena/Sam
all called it the Photoroom-paid effect, free). NO ONE faulted the shadow rendering. The
sub-9 scores are driven almost entirely by two FIXABLE feature-adjacent issues plus the
known model ceiling — not by the shadow feature's quality.

---

## Complaints grouped by cause

### A. NAMING / LABELING COLLISION — RECURRING (6 testers, dominant)
Priya, Marcus, Wen, Dana, Elena, Sam.
The app has a top cleanup control **"Remove shadow (auto-cleans cast shadows from cutouts)"**
(default ON, strips the subject's cast shadow during matting) AND the NEW export
**"Shadow"** toggle (adds a drop-shadow). Same word, opposite jobs, in different sections.
Every one of the six "had to stop and reason about which is which"; Wen explicitly feared the
new toggle would "re-add the thing Remove shadow just stripped." This is the single most
recurrent complaint on the panel and is purely a copy fix. **REAL / dominant.**

### B. DISCOVERABILITY / BURIAL — RECURRING (3–4 testers)
Wen, Elena, Sam (and Dana "a touch buried below the color swatches").
The new toggle landed at the very BOTTOM of the Export panel, below the size-preset grid and
margin slider. Skimmers (Elena 20s budget, Sam came specifically for shadow) nearly missed
the headline feature; on mobile (Sam) it's a long scroll past the result. The brief's intent
was for it to nest with Background + Margin — the build placed it after the size grid
instead. **REAL.** (Fix = placement only; do NOT add a banner / landing-density — documented
added-feature-buried + landing-density friction.)

### C. REAL STATE BUG — single tester, code fix (no UX decision)
Rob: toggling Drop-shadow off→on then changing level reset the chosen brand hex back to the
default beige on one export. Order-sensitive state reset. Builder fixes in code; noted here
for completeness. **REAL (code), single-repro.**

### D. MODEL-MATTE CEILING — RECURRING but PARKED (do not fix)
Aisha (purple/magenta edge fringing), Rob (green/cyan halo on saturated bg + fuzzy hair
clipped to a smooth dome), Wen (faint blue edge fringe on high-contrast bg), Marcus/Elena
(couldn't verify hair on their subjects). This is the free @imgly model's decontamination +
hair limit, already documented as the honest ceiling in UX_BRIEF round 8. It is the sole
driver of Rob's Value=Marginal/6 and a piece of Aisha's 8. **PARK — known ceiling, not
addressable without swapping the model (breaks free + ~50MB bundle).**

### E. PRE-EXISTING / OTHER — DEFERRED this round (not feature-related)
- Jules (7): no batch ZIP / Download-all + per-batch shared settings. *(Note: Rob saw a
  working 2-photo ZIP that carried settings — possible inconsistency, but this is a
  pre-existing batch-scope gap, not the shadow feature. Deferred.)*
- Tomás: privacy is a claim, wants a "works offline, disconnect to prove it" proof point;
  ~50MB model download has no time estimate. *(Pre-existing trust/perf, deferred.)*
- Dana: marketplace-first framing still briefly reads as "reseller tool." *(Pre-existing
  framing — round-7 work; deferred.)*
- Marcus: wants shadow angle/offset control (pro-grade). *(Scope creep; deferred.)*
- Priya/Dana: live-preview shadow thumbnail too small / wants before-after shadow preview.
  *(Single/double-tester polish, deferred — not a blocker.)*
- Sam: long mobile single-column scroll between result and export controls. *(Partly
  overlaps burial fix B; otherwise pre-existing layout, deferred.)*

---

## Verdict for the orchestrator
0/10 fully pass. NO tester faulted the shadow feature's quality. Of the 10:
- **6 sub-bar purely on the naming collision (A)** and **3–4 also on burial (B)** — both are
  small, fixable copy + placement changes addressed in UX_BRIEF "Round-1 fixes" below.
- **Rob (6) and part of Aisha (8) are the model-matte ceiling (D)** — PARK, do not chase.
- The rest (E) are pre-existing non-feature gaps — defer; do not open this round.
Fixing A + B (and the Rob state bug C) is the high-leverage round-2 move; the residual
ceiling means this feature lands as an honest 8-class addition, consistent with the app's
documented free-client-side ceiling.
