# Elena — Round 1

Engineering manager, 8 reports, half my day in meetings. I'd reach for this only between
calls — to drop a headshot on a clean background for a team page or an org-chart slide.
30-second patience budget, laptop + phone.

## 1. CLARITY — Yes
Inside 5 seconds I'd tell a friend: "Drop a photo, it cuts out the background and hands you
a clean cutout on white, a brand color, or transparent — free, in the browser, no login."
The headline "Remove any background — keep your photo on this device", the "free, no upload,
no signup" line, and the "Headshots & avatars" tag plus the three example tiles (White /
Color / Transparent) told me instantly it covers MY use case, not just product listings.
Nothing confused me.

## 2. VALUE — Yes
Today I do this the annoying way: ping a designer on Slack, or fight with the macOS Preview
"remove background" (decent but no colored backdrop, no sizing) or remove.bg (makes me sign
up / paywalls the good export). Here: dropped a headshot, model downloaded and the cutout
was done in ~13 seconds total — comfortably inside my patience window — picked a Color
background, flipped Shadow on, downloaded a 1080×1080 square. Zero setup, no account. That's
genuinely faster than my current path and it's the exact artifact I need for a profile tile.

## What worked
- Speed: first-photo model download + cutout finished in ~13s. The "~50 MB one-time tool,
  next photos ~10s each" note set my expectation before I waited, so the wait didn't annoy.
- The Shadow toggle is a trivially-obvious extra, NOT a fiddly distraction: one checkbox,
  with Soft/Medium/Strong presets, and the download button relabels to "...(with shadow)".
  The soft shadow on a beige background looked like something a designer would hand me —
  this is the Photoroom-paid feature, free here.
- Color picker with a hex field means I can match our actual brand color for the team page.
- Mobile above-the-fold is clean and legible — I could do this from my phone between meetings.

## What held me back
- "Shadow" sits at the very bottom under a Margin slider and the size grid; on first pass I
  didn't notice it was new or even there until I scrolled the whole export panel. A manager
  skimming for 20 seconds would likely miss it.
- Two different "shadow" controls coexist — a "Remove shadow" checkbox up top (cleans cast
  shadows from the cutout) and the new "Shadow" toggle at the bottom (adds a drop shadow).
  Same word, opposite jobs; for half a second I thought I'd toggled the wrong one.
- Cutout edge around hair/shoulders softened slightly on my test image. For a polished
  team-page headshot I'd want to eyeball it before trusting it — the "Touch up" button helps
  but adds a step I don't have time for between meetings.

## 3. ADVOCACY — 8/10
I'd recommend it, and for a one-off headshot I'd reach for it again — it cleared the
no-setup, no-signup, sub-30s bar that everything else fails. Not a 9–10 because my use is
genuinely occasional (I'm not cutting out photos weekly), so it won't come up unprompted
often; and the duplicate "shadow" wording plus the buried new toggle cost it polish. Fix
the naming collision and surface Shadow nearer the background choice and it's a 9 for me.

```json
{"tester": 9, "round": 1, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["Two controls both say 'shadow' (Remove shadow vs Shadow) with opposite jobs — momentarily confusing", "New Shadow toggle is buried at the bottom of the export panel below the size grid; easy to miss", "Cutout edges softened around hair/shoulders; I'd want to verify before trusting for a team page"], "priorConcernsAddressed": "n/a"}
```
