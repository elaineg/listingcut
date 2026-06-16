# Wen — Marketing data analyst

**Persona note:** I live in BigQuery/Sheets/Looker Studio and barely touch images. My one real
use here is the occasional profile photo or logo on a brand-color background for a report cover
or wiki page — a once-in-a-while convenience, not a weekly habit.

## Clarity — Yes
In 5 seconds I knew exactly what it is. The h1 "Remove any background — keep your photo on this
device" plus the subhead "Drop a photo and get a clean cutout on white, your brand color, or
transparent — free, no upload, no signup" nails it. The three example tiles (White / Color /
Transparent) made the output instantly legible. As someone who "distrusts tools that transform
data invisibly," the line **"Private by design — your photo never leaves this device… turn on
airplane mode — it still works. Or open the Network tab — zero image uploads"** is the single
best thing on the page. That's the language that earns my trust, and it's the reason I'd actually
paste a colleague's headshot in. I'd tell a friend: "free in-browser background remover, nothing
gets uploaded, exports straight to social/marketplace sizes."

## Value — Marginal (for ME — would be Yes for a designer)
Today for the rare cover-image job I'd either (a) bug a designer in Slack, or (b) use remove.bg's
free tier (watermark/size-capped) then drop it into Figma/Canva to add a brand background. This
app genuinely collapses that into one step: cut out + brand background + correct export size in a
single screen, no Canva round-trip. For me it's **Marginal only because my frequency is low** —
I'd hit this maybe monthly, not weekly, so it won't build a habit. But on the rare day I need it,
it's clearly faster and cheaper than my current path, and the no-upload privacy means I can run an
internal employee photo through it without a second thought. For an actual marketer/designer on my
team this is a flat Yes.

## GRADIENT mode — discoverable, clear, and it worked (the highlight for me)
This is the exact feature my use case wants. Discoverability: good — "Gradient" sits right beside
White/Color/Transparent in the Export background selector; I found it without hunting. Clear: yes —
selecting it revealed 6 well-labeled preset chips (Soft gray, Warm sunset, Cool blue, Mint, Peach,
Slate — each with a proper aria-label/title), a From/To hex pair with native color pickers, and a
Vertical/Horizontal/Diagonal angle toggle. I typed my brand purple `#7B2FF7` into From, hit enter,
and the live preview updated. Downloaded JPEG ("Download JPEG on this gradient — 1080×1080") was a
real 1080×1080 file with a true purple→blue vertical gradient and a clean-edged mug composited on
top — **WYSIWYG, download matched preview exactly.** Zero console errors throughout. As a data
person, that fidelity (what I see = what I get, no surprise transform) is what makes me trust it.
Minor nit: when I only set the **From** color, **To** stayed at its default blue, so I got a
two-tone result I didn't fully intend — a quick "match To to From" or a one-click solid-from-
gradient affordance would help non-designers who just want a single brand hue with a subtle fade.

## Advocacy — 7… being honest, a real 6
I want to be critical here, not polite. The product is well-built and the gradient feature is
exactly right, but my **personal** recommendation strength is capped by frequency: I won't bring
this up unprompted in my data circle because we don't hit image work often. I'd absolutely forward
it to the one designer/marketer on my team the next time they complain about remove.bg's paywall —
but that's a prompted, targeted recommend, not an unprompted evangelize. Nothing here confused or
broke; the score is about fit, not quality. For a design/marketing-heavy panelist this is a 9.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Marginal", "advocacy": 6, "topComplaints": ["Frequency mismatch for a data analyst — useful but not weekly, so no habit forms", "Gradient: changing only 'From' leaves 'To' at default blue, giving an unintended two-tone for users who want one brand hue"], "priorConcernsAddressed": "n/a"}
```
