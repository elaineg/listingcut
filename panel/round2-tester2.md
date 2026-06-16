# Marcus — Round 2

**Role:** Frontend engineer, 2 yrs. Desktop Chrome (1280px), devtools open. I want quick transparent PNG cutouts for placeholders / Storybook / README screenshots without wiring a script.

## Prior concern re-check (R1 = 8)
- **Naming collision ("Remove shadow" top vs "Shadow" export) — FIXED.** The two controls are now unambiguous: the cleanup one reads **"Remove cast shadow — Cleans the dark shadow under your subject"** (now with a one-line subtitle that tells me exactly what it does), and the export one is **"Drop shadow"** with Soft/Medium/Strong, sitting right next to Export background (White/Color/Transparent) + Margin. No more "shadow vs shadow" double-take. Even better: the primary download button reads **"Download white JPEG (with drop shadow) — 1080×1080 (Square)"** — the live label now says "drop shadow" too, so it's consistent end to end. This fully resolves my round-1 gap. No angle/offset control was added, which is fine — I flagged that as nice-to-have, not a blocker.

## 1. CLARITY — Yes
Unchanged and strong. H1 "Remove any background — keep your photo on this device" + "free, no upload, no signup" + "Your photos never leave this device — everything runs in your browser" tells me what it is and that it's client-side in well under 30s. I'd pitch it as "drag a photo in, get a clean transparent/white/brand-color PNG instantly, runs entirely in your browser, free."

## 2. VALUE — Yes
Today I burn remove.bg credits or hand-mask in Figma. Dropped item0.jpg, the ~50MB model downloaded once, cutout came out clean-edged, exported a White JPEG that downloaded as `item0-square-1080x1080.jpg`. Size presets (Square/Story/Link-Ad/16:9 + eBay/Etsy/Depop/etc.), margin slider, and the free Drop-shadow (the Photoroom-paid feature) mean I don't bounce to another tool. For a placeholder/demo asset this is exactly what I'd reach for.

## 3. ADVOCACY — 9/10
Raising 8 → 9: the naming fix removed the one piece of friction that made me hesitate to drop the link cold in Slack. Now everything reads cleanly — segmented controls, no CSS jank, **0 console errors** the whole session, sensible filenames, live WYSIWYG download label. I'd share this unprompted. Held back from 10 only by the usual local-model edge: I tested a solid-shape subject, so I still can't personally vouch for hair/fine-edge quality on a real photo — but the "Hair or edges not perfect? Use Touch up" affordance is a solid honest answer to that, so it's a small gap, not a worry.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Hair/fine-edge quality unverified on my solid-shape test subject (usual local-model ceiling; Touch up mitigates)", "Drop shadow still fixed-position — no angle/offset (nice-to-have, not blocking)"], "priorConcernsAddressed": "all"}
```
