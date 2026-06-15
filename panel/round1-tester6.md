# Jules — Round 1

Content & community marketer. I crank out social graphics all day across X/LinkedIn/Mastodon
and a Discord, and I constantly need a subject cut out onto a consistent brand color at
per-platform sizes. Tested desktop + mobile (375px), real cutout + Color/Shadow + batch.

## 1. CLARITY — Yes
Cold, in under 10 seconds I'd tell a friend: "Drop a photo, it removes the background right in
your browser — free, no signup — and exports it onto white, your brand color, or transparent at
Instagram/Story/ad sizes." The H1 "Remove any background — keep your photo on this device," the
"free, no upload, no signup" line, and the three example tiles (White/Color/Transparent) do all
the work. The "Your photos never leave this device" badge is exactly the reassurance my
allergic-to-logins self wants. Nothing confused me.

## 2. VALUE — Yes
Today I do this in Figma + Photoroom/remove.bg: remove.bg paywalls volume, Photoroom charges for
the drop-shadow specifically, and I still re-export per platform by hand. Here I got a clean
cutout, picked my exact brand hex (#F5F0E6 — there's a hex field, not just preset swatches),
turned Shadow on at Soft/Medium/Strong, and one-clicked a 1080×1080 JPEG. The downloaded file was
a real 1080×1080 with the shadow correctly baked in. The shadow was easy to find (right under the
background picker in Export) and looks tasteful — genuinely makes a flat cutout pop for a post.
Per-platform presets (Story 1080×1920, Link/Ad 1200×627, plus marketplace sizes) save the
re-export dance. This replaces two paid tools for my single most common task.

## What worked
- Shadow toggle is findable, has intensity (Soft/Medium/Strong), and renders correctly in export.
- Custom brand-color hex input, not just fixed swatches — critical for on-brand graphics.
- Per-platform social sizes built in. No signup, runs locally, instant after model loads.
- It flagged a weak cutout on my second test image ("Check this one — cutout looks nearly empty")
  instead of silently shipping garbage. That honesty earns trust.

## What held me back
- NO batch ZIP / "Download all." I dropped 2 photos; each became its own row with its own Download
  button — no "download all" anywhere. My whole pitch for a tool like this is dropping 15 photos
  and getting a ZIP back. Right now I'd still be clicking Download 15 times AND re-setting
  size/color per photo. This is the one thing standing between "nice" and "saves my afternoon."
- Settings seem to apply per-open-photo, so a consistent brand bg+shadow across a batch isn't
  one-shot — I'd reconfigure each. Tied to the no-ZIP gap.
- First-photo model download is a real wait (~50MB). Fine once, but a cold first impression risk.

## 3. ADVOCACY — 7/10
The cutout, the brand-hex color, and the new shadow are legitimately better than the paid tools I
use, and "free + no signup" is the line I'd lead with. But I can't honestly call it a 9 because the
headline promise for a marketer — batch a stack of graphics and get them all back at once — isn't
delivered: there is no ZIP/download-all and settings don't apply across the batch. Ship a
"Download all (ZIP)" with shared bg/size/shadow and this jumps to a 9 I'd post about unprompted.

```json
{"tester": 6, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 7, "topComplaints": ["No batch ZIP / Download-all — must download each photo individually", "Background/size/shadow settings apply per-open-photo, not across the whole batch", "First-photo ~50MB model download is a noticeable cold-start wait"], "priorConcernsAddressed": "n/a"}
```
