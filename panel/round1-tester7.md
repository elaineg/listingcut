# Aisha — Product designer

Round 1. Desktop 1440px, trackpad. Used cold; ran the bundled sample.

## Clarity — Yes
Within 5s I'd tell a friend: "It's a free, no-login background remover that runs in your
browser — drop a photo, get a clean cutout on white, your brand color, a gradient, or
transparent, and download it at slide/social sizes." The hero "Remove any background — keep
your photo on this device" + the three preview cards (White/Color/Transparent with use-case
captions "listings / ads & social / headshots & avatars") nailed it instantly. The
"Private by design — your photo never leaves this device. Turn on airplane mode" line is a
confident, considered touch that landed the no-upload promise without me doubting it.

## Value — Yes
Today I'd fire up Photoshop's Remove Background or pay remove.bg, then drop the cutout onto
a colored frame in Figma by hand. This did it in one screen with no app-switch: the cutout
was clean (handle hole properly cut, no halo/fringe), and the size presets (Slide 16:9,
Square, Story) mean I get a frame-ready asset without resizing in Figma. For a quick FigJam
or slide mock this genuinely saves me the Photoshop round-trip.

## GRADIENT mode — discoverable, clear, well-crafted, worked
- Discoverable: yes — it's a 4th pill right beside White/Color/Transparent in the Export
  selector; I saw it without hunting.
- Craft: this is the most considered part of the UI. The 6 preset chips render as actual
  mini-gradient swatches (not text labels) — Soft gray / Warm sunset / Cool blue / Mint /
  Peach / Slate — selected chip gets a clean blue ring matching the Background pill language.
  From/To hex fields sync live with native color pickers. The Angle row (Vertical/Horizontal/
  Diagonal) reuses the same segmented-pill style — consistent design system, no orphan
  controls. Best detail: when I typed a custom From/To (#ff6b6b → #4ecdc4) a 7th "custom"
  chip appeared at the end showing MY gradient as a live swatch and stole the selection ring.
  That's a thoughtful, first-class-custom touch.
- Worked: live preview updated on every preset/angle/hex change. Diagonal custom rendered
  correctly (coral→teal corner-to-corner). The downloaded 1080×1080 JPEG had the Peach
  gradient composited cleanly behind the crisp cutout. Gradient mode stayed sticky across
  Start over. Zero console/page errors throughout. The download button relabeling to
  "Download JPEG on this gradient — 1080×1080 (Square)" is a nice state-honest detail.

## Advocacy — 8/10
I'd bring this up unprompted to designer friends as "the free no-Photoshop cutout tool, and
the gradient backgrounds are actually nice." Held back from 9: (1) the gradient angle is only
3 presets — as a designer I want an arbitrary angle/degree (or at least a 45° vs corner
distinction), and there's no radial option; (2) the gradient presets are tasteful but I can't
save my own brand gradient as a reusable preset — the custom chip resets, so on the next photo
I re-enter my hex. Both are polish gaps, not blockers — the core craft is real, which is why
it clears my bar.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Gradient angle limited to vertical/horizontal/diagonal — no arbitrary degree or radial", "Can't save a custom brand gradient as a reusable preset; re-enter hex per session"], "priorConcernsAddressed": "n/a"}
```
