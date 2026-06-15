# Aisha — Round 1

**1. CLARITY — Yes.** Cold, I knew in under 10 seconds: "drop a photo, get a clean cutout on white, your brand color, or transparent — free, no upload, no signup." The three preview tiles (White/Color/Transparent, each with a use-case caption: listings / ads & social / headshots & avatars) double as a value demo, which is a considered touch — I'd explain it to a designer friend as "free, in-browser background remover, no Photoshop, no login." The privacy pill "Your photos never leave this device" is the right reassurance in the right spot. Hierarchy, type rhythm, and spacing feel deliberate.

**2. VALUE — Yes.** Today I either pay/round-trip through Photoshop's Remove BG or use remove.bg / Photoroom (both paywall the good exports and the drop-shadow). This did it free, locally, no signup, and the export presets (Square, Story, eBay/Etsy/Poshmark/Depop, 16:9 slide) mean I drop straight into a FigJam/slide without resizing. The Margin slider and Shadow toggle save me a manual layer-styles pass. Real recurring pain solved in one session — I'd reach for this for quick mock/slide assets weekly.

**3. ADVOCACY — 8/10.**
SHADOW CRAFT (the new feature): genuinely good. At Strong on white it's a soft, diffuse, directionally-consistent contact shadow hugging the bottom-right — not a fake hard offset. Soft→Strong scales believably. This is the considered version of what Photoroom charges for. No complaint here.
UI CRAFT: high. Two-step progress ("Downloading model… / Removing background"), "Processing locally, nothing uploaded" microcopy, before/after side-by-side with a checkerboard transparency legend, a "Touch up" affordance with honest copy ("Hair or edges not perfect?"). Empty/loading states are handled, which is what usually trips these tools.
WHAT HOLDS THE 2 POINTS — separate from the shadow: (a) MATTE QUALITY — visible purple/magenta color fringing along the subject's edge (spill from the original background not decontaminated); a designer zooming in on a real headshot will see this and it's the difference between "ship" and "redo in PS." (b) A small COPY/STATE bug: the download button read "Download white JPEG (with shadow)" while I'd selected the *Color* demo tile — the top tiles are marketing, the real export bg toggle is a second White/Color/Transparent group lower down. Two controls with the same labels doing different things is a craft snag I'd fix.

## What worked
- Considered, honest UI: progress steps, privacy microcopy, before/after with transparency legend, Touch-up with candid edge-quality copy.
- Shadow looks natural and diffuse, scales sensibly Soft→Strong — not a fake offset.
- Marketplace + social export presets land assets straight into my workflow; no signup, instant.

## What held me back
- Edge matte shows color fringing (model decontamination limit) — a designer notices on real photos.
- Duplicate White/Color/Transparent controls (top demo tiles vs. lower export toggle) caused a momentary "which one exports?" + a stale "(with shadow)" label.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Edge matte color fringing (spill not decontaminated) — visible on zoom, model-bound not shadow", "Duplicate White/Color/Transparent controls (demo tiles vs export toggle) + stale 'white JPEG (with shadow)' label confused which control exports"], "priorConcernsAddressed": "n/a"}
```
