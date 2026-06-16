# Add-shadow Panel — SYNTHESIS Round 2

Feature under test: **Add Drop shadow on export** (deepen).
Round-2 build applied the round-1 fixes: renamed the colliding controls
("Drop shadow" for the export effect vs "Remove cast shadow — Cleans the dark shadow
under your subject" for the input cleanup), repositioned Drop shadow next to
Export background + Margin, and fixed Rob's order-sensitive hex-reset bug.

## Score table (R1 → R2)

| # | Tester | Role | Clarity | Value | Advocacy | R1→R2 Δ | At bar? |
|---|--------|------|---------|-------|----------|---------|---------|
| 1 | Priya | Engineer (occasional) | Yes | Yes | 9 | 8→9 (+1) | ✅ |
| 2 | Marcus | Frontend engineer | Yes | Yes | 9 | 8→9 (+1) | ✅ |
| 3 | Wen | Marketing data analyst | Yes | Yes | 9 | 8→9 (+1) | ✅ |
| 4 | Tomás | Operations analyst | Yes | Yes | 8 | 8→8 (0) | — |
| 5 | Dana | Marketer | Yes | Yes | 9 | 8→9 (+1) | ✅ |
| 6 | Jules | Content/community marketer | Yes | Yes | 9 | 7→9 (+2) | ✅ |
| 7 | Aisha | Designer | Yes | Yes | 8 | 8→8 (0) | — |
| 8 | Rob | Freelance brand designer | Yes | **Yes** | 8 | 6→8 (+2) | — |
| 9 | Elena | Engineering manager | Yes | Yes | 8 | 8→8 (0) | — |
| 10 | Sam | PM (mobile) | Yes | Yes | 9 | 8→9 (+1) | ✅ |

**Clarity: 10/10 Yes. Value: 10/10 Yes (Rob recovered Marginal→Yes once the hex-reset
bug was fixed). Advocacy: median 9, range 8–9.**

**At the bar (adv≥9 ∧ clarity=Yes ∧ value=Yes) = 6/10:** Priya, Marcus, Wen, Dana, Jules, Sam.

The 4 holdouts are all **honest-8, clarity=Yes, value=Yes** — none is a No/Marginal and
none faults the Drop-shadow feature on function. After the round-1 naming + placement +
state-bug fixes, NO tester faulted the shadow rendering or its controls.

---

## Remaining complaints grouped by cause

### A. MODEL-MATTE CEILING — RECURRING, not addressable (Aisha, Rob, Elena)
This is the sole driver of all three design/EM holdouts capping at 8, and it is the free
in-browser @imgly model's fine-hair / saturated-edge matting limit — not a UX or feature
defect.
- **Aisha (8):** R1 color fringing is now MEASURABLY FIXED (neutral edge, no halo); UI and
  shadow craft no longer cost anything. The remaining gap is "SOLELY model matte quality" —
  flyaway strands clipped, hairline soft rather than crisp. "If the matte hit Photoroom's
  edge fidelity, this is a 9."
- **Rob (8, up from 6):** Value recovered Marginal→Yes — the hex-reset bug is confirmed
  fixed (set #e5004c, toggled Drop shadow off→on, hex survived to the corner pixel; same in
  the 2-photo batch ZIP). What keeps him off 9 is "purely the matte/edge quality for client
  deliverables" — color halo + clipped fuzzy hair on saturated backgrounds means he can't
  ship a portrait client-final without a Photoshop edge pass. "Fix the edge matte and this
  is a 9."
- **Elena (8):** Both her asks (naming, surfacing the toggle) are genuinely fixed and she
  says that buys back the polish she'd docked — but the score holds at 8 on the OTHER half
  of her R1 reasoning: lingering hair/shoulder edge softness she'd eyeball before trusting
  on a team page, AND genuinely occasional use (won't come up unprompted often enough for a
  9). Model-matte + recurrence, not the feature.

**PARK — known ceiling. Not fixable without swapping the model, which balloons the ~50MB
download and breaks the free-client-side premise.** Consistent with this app's prior PARKs
at 7–8/10.

### B. PRE-EXISTING NON-FEATURE — DEFERRED (Tomás)
Tomás (8, unchanged) explicitly confirms his two blockers were NOT the target of this round
(`priorConcernsAddressed: none`, expected). He re-tested the shadow controls fresh and
praised them (naming gone, placement right, live preview + relabeled CTA), but neither
shadow change moves his number because:
- **Privacy is still a claim, not a verifiable proof point** — he wants a "works offline,
  disconnect to prove it" demonstration for wary corporate users; without it he "forwards
  quietly, doesn't evangelize."
- **First-photo ~50MB model download still has no ETA** — a silent multi-minute stall on a
  throttled corporate network is where a coworker bails.
"Fix either of those and I'm at 9." Both are pre-existing, non-feature items; flag as a
future-deepen candidate.

### C. POLISH NITS — below blocker, not scored against (defer)
- Priya/Dana/Sam: live-preview thumbnail still smallish / brand-color (hex) entry below the
  fold / no proactive shadow nudge near the preview + mobile size-grid sits above the
  Background/Margin/Drop-shadow block. All explicitly "minor, not a blocker."
- Marcus: shadow angle/offset control (flagged nice-to-have, not blocking).
- Jules: per-photo size override for the odd-one-out in a batch (acceptable).

---

## Verdict for the orchestrator
**6/10 at the bar (Priya/Marcus/Wen/Dana/Jules/Sam=9).** Took 2 rounds: R1 0/10 → R2 6/10.
The 4 holdouts are honest 8s, all clarity=Yes value=Yes, none faulting the Drop-shadow
feature:
- **Aisha/Rob/Elena = model-matte ceiling (A)** — PARK, not addressable free-client-side.
- **Tomás = pre-existing non-feature (B)** — privacy proof point + download ETA, defer to a
  future deepen.
The Drop-shadow feature itself was praised and faulted by no one on function after the R1
naming/placement/state-bug fixes. This is an honest 8-class landing, consistent with the
app's documented free-client-side ceiling — PARK, do not chase the 9-bar with more UX work.
