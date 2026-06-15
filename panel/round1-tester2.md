# Marcus — Round 1

**Role:** Frontend engineer, 2 yrs. Desktop Chrome, devtools open. I want quick transparent PNG cutouts for placeholders / Storybook / README screenshots without wiring a script.

## 1. CLARITY — Yes
H1 "Remove any background — keep your photo on this device" plus "free, no upload, no signup" told me exactly what it is in well under 30s. The three sample thumbnails (Orange/Cool/Transparent) and "Your photos never leave this device" reassured me it's client-side — which for me is the whole pitch over remove.bg. I'd describe it to a teammate as "drag a photo in, get a clean transparent PNG instantly, runs in your browser, free."

## 2. VALUE — Yes
Today I either pay/burn free credits on remove.bg or hand-mask in Figma when I need a quick cutout — both are slower than this. Dropped a photo, model resolved fast (~15s, cached after first), got a clean cutout, exported a White JPEG that downloaded as `photo0-square-1080x1080.jpg` and a transparent PNG. The size presets (Square/Story/Link-Ad/16:9 + eBay/Etsy/etc.) and the margin slider mean I don't re-crop in another tool. The new Shadow toggle adds a genuinely soft, grounded drop-shadow (Soft/Medium/Strong) — that's the Photoroom-paid feature, free here. For a placeholder/demo asset on white this is exactly what I'd reach for.

## 3. ADVOCACY — 8/10
Clean enough that I'd drop the link in team Slack. Gap to 9–10:
- Two different "shadow" controls is momentarily confusing: a "Remove shadow (auto-cleans cast shadows)" checkbox up top near the cutout AND the "Shadow" add-shadow toggle down in Export. Reading fast, "Remove shadow" vs "Shadow" sit in different sections and I had to think for a beat about which does what. Worth disambiguating the labels.
- I couldn't fully judge hair/fine-edge quality on my test subject (a solid-shape image) — that's the usual local-model ceiling and the reason I'd verify on a real photo before recommending unconditionally.

## What worked
- Instant, no-signup, client-side — the exact reason I'd pick it over remove.bg.
- Download button label updates live to "Download white JPEG (with shadow) — 1080×1080" — clear WYSIWYG.
- Shadow is easy to find at the bottom of Export background; Soft/Medium/Strong only appears when enabled (clean progressive disclosure). CSS/craft felt tidy — segmented radio controls, no jank, 0 console errors the whole session.
- Sensible filenames on export.

## What held me back
- "Remove shadow" (top) vs "Shadow" (export) naming collision.
- Shadow intensity is good but a direction/angle/offset control would make it pro-grade; current version is fixed-position soft shadow.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Two 'shadow' controls — 'Remove shadow' (top) vs 'Shadow' add-shadow (export) — labels collide and confused me for a beat", "Add-shadow has intensity but no angle/offset; fine-edge/hair quality unverifiable on my solid-shape test subject"], "priorConcernsAddressed": "n/a"}
```
