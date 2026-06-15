# Wen — Round 1

Marketing data analyst. Light fit: I occasionally need a headshot on a neutral/brand
background for a Looker Studio report cover or a wiki page. My default today is asking a
designer in Slack or fighting with the GIMP magic-wand. I came in skeptical of any tool
that transforms my image invisibly.

## 1. CLARITY — Yes
The H1 "Remove any background — keep your photo on this device" plus "free, no upload, no
signup" told me exactly what it is in well under 30s. The three preview tiles
(White / Color / Transparent) with use-case captions ("listings", "ads & social",
"headshots & avatars") nailed who it's for without me reading a paragraph. The green
"Your photos never leave this device — everything runs in your browser" badge is the line
that earned my trust — that's the one thing I needed to hear before uploading a colleague's
face. The honest "First photo downloads a one-time ~50 MB tool" note set expectations; in
my test the cutout was ready in ~12s (model was cached fast), no surprises.

## 2. VALUE — Yes
For my once-in-a-while job this genuinely beats my alternatives. Bugging a designer costs
me a half-day of latency; the GIMP route costs me 15 minutes and a bad edge. Here I got a
clean head-and-shoulders cutout, picked White, set a 6% margin, and exported a 1080×1080
JPEG in under a minute — no account, nothing uploaded. The marketplace/social size presets
(Slide 16:9, Square, Story) mean I get a report-cover-ready file without resizing in Sheets
or a separate tool afterward. The white is TRUE white, not a sneaky light-gray fill — I
checked the exported pixels, which matters to my data-hygiene paranoia.

## 3. ADVOCACY — 8/10
I'd recommend it to teammates who occasionally need a clean headshot, and I'd mention the
"no upload, runs locally" angle unprompted because that's the part people don't believe.
What keeps it off a 9–10 for ME specifically: it's a light-fit tool — I use this maybe
monthly, so it'll never be a habit I evangelize weekly. Two concrete nits: (1) there are
TWO shadow controls and the naming collides — "Remove shadow (auto-cleans cast shadows)" up
by the photo, and the NEW "Shadow" add-a-drop-shadow toggle buried down in the Export panel.
First read, I thought "Shadow" might re-add the thing "Remove shadow" just stripped.
(2) The new Shadow toggle is below the fold; I only found it after scrolling into "Export
background". An analyst skims — I'd have missed it. As a feature it's good: Soft/Medium/
Strong rendered a real, tasteful offset shadow on white, exactly the Photoroom paid effect.

## What worked
- Trust copy ("never leave this device") + true-white export — no invisible transforms.
- Fast cutout, clean edges on head+shoulders; size presets save a downstream resize step.
- New Shadow control produces a genuinely nice soft drop-shadow (verified in the download).

## What held me back
- Two "shadow" controls with near-identical labels — confusing on first read.
- Shadow toggle hidden below the fold in the Export panel; easy to miss.
- Faint blue edge fringe on a high-contrast background (minor matting artifact).

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["Two 'shadow' controls (Remove shadow vs new Shadow) with colliding labels confuse first read", "New Shadow toggle is below the fold in Export panel — easy to miss", "Faint blue edge fringe on high-contrast backgrounds"], "priorConcernsAddressed": "n/a"}
```
