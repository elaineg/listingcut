# Aisha — Round 2

## Prior concerns — re-checked first
- **R1 complaint (b): duplicate White/Color/Transparent controls + stale "white JPEG (with shadow)" label → FIXED.** Background, Margin, and Drop shadow now sit together in one "Export background — choose background, size, and download" group. The download CTA tracks state correctly: with White + Drop shadow ON it reads "Download white JPEG (with drop shadow) — 1080×1080 (Square)"; Transparent gives a separate "Download transparent PNG". No more mismatch between the top demo tiles and the real export control.
- **Naming collision (Drop shadow vs Remove cast shadow) → FIXED.** They're now plainly distinct: "Remove cast shadow — Cleans the dark sha[dow] under your subject" lives up by the photo; "Drop shadow" (with Soft/Medium/Strong radio segments) lives in the export panel. I no longer have to guess which does what.
- **R1 complaint (a): edge matte color fringing → MEASURABLY BETTER.** Zoomed on the transparent cutout hairline, the purple/magenta spill I called out in R1 is gone — the edge reads neutral, no halo of the original background. What remains is soft matting on flyaway strands (model limit), not contamination.

## Fresh answers
**1. CLARITY — Yes.** Same fast read as R1: hero "Remove any background — keep your photo on this device", subhead "free, no upload, no signup", use-case captions (headshots / ads & social / slides / listings), privacy pill. I'd pitch it to a designer friend in one line: free in-browser background remover, no Photoshop, no login.

**2. VALUE — Yes.** Today I round-trip through Photoshop Remove BG or hit the remove.bg / Photoroom paywall (they gate the good export AND the drop-shadow). This does cutout + on-brand color + transparent + a natural drop shadow + marketplace/slide presets, free and local. The export presets drop straight into a slide/FigJam with no resize. Recurring weekly value for quick mock assets.

**3. ADVOCACY — 8/10.**
- **UI CRAFT (the change under test): improved, now genuinely considered.** Grouping Background + Margin + Drop shadow into one labeled export block, with the distinct "Remove cast shadow" affordance separated near the photo, removes the only craft snag I flagged in R1. Labels are honest and state-accurate, the shadow strength is a clean Soft/Medium/Strong segmented control that only reveals once the toggle is on (nice progressive disclosure). Type rhythm, spacing, before/after-with-checkerboard, two-step progress + "processing locally" microcopy all still feel deliberate.
- **SHADOW CRAFT: still good** — diffuse, directional, scales believably; not a fake hard offset. No complaint.
- **WHAT HOLDS THE 2 POINTS — now SOLELY model matte quality.** The fringing is fixed, so the UI/shadow craft no longer costs anything. The remaining gap is the in-browser model's hair-edge matte: flyaway strands get clipped and the hairline is slightly soft rather than crisp strand-by-strand. On a real headshot a designer zooming in still sees this — it's the difference between "ship to a client deck" and "redo the hair in PS." That is a stated model limit, not a craft defect, and it's the entire reason I'm at 8 not 9–10. If the matte hit Photoroom's edge fidelity, this is a 9.

```json
{"tester": 7, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Hair-edge matte still soft/clipped on fine strands — model-bound limit, now the ONLY gap (UI/shadow craft fixed)"], "priorConcernsAddressed": "all"}
```
