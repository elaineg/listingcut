# Tomás — Operations analyst at a mid-size company

Device: corporate Windows laptop, Edge (tested at 1280px). Cold open, no prior context.

## Clarity — Yes (within 5s)
I'd tell a coworker: "Paste a product or headshot, it cuts out the background and gives you a
clean cutout on white, a color, a gradient, or transparent — free, in the browser, nothing to
install." The H1 "Remove any background — keep your photo on this device" plus the subline
"free, no upload, no signup" nailed it instantly. The three example tiles (White / Color /
Transparent) made the output obvious before I clicked anything.

What sealed it for MY profile: the blue "Private by design — your photo never leaves this
device. ...turn on airplane mode — it still works. Or open the Network tab — zero image uploads"
callout. That is the exact sentence that gets a wary corporate analyst past "I'm not pasting
company imagery into a random site." I checked it: during sample processing there were 0 POST/PUT
requests; only the WASM model CDN was contacted, never my image. The claim is real, and that
matters more to me than any feature.

## Value — Yes
Today I either bug a designer for a one-off product shot or fight Excel/PowerPoint's "Remove
Background" tool, which is clumsy and butchers handle/hair edges. remove.bg does it well but
gates on signup/credits — a non-starter when IT blocks installs and I won't register a work
account on a random site. This did a clean cutout of the sample mug (handle hole and rim
preserved) in one session, no login, ~10s after the one-time model download. For the rare slide
or SharePoint header where I need a product on a branded background, this genuinely saves me time
and a favor-ask.

## GRADIENT mode — discoverable, clear, and it worked
Discoverable: it's a 4th pill right in the "Export background" selector (White / Color /
**Gradient** / Transparent) — no hunting. Selecting it revealed 6 labeled preset chips (Soft gray,
Warm sunset, Cool blue, Mint, Peach, Slate), a custom From/To picker with BOTH native color
swatches and hex fields (#bfdbfe → #1d4ed8), and an Angle toggle (Vertical/Horizontal/Diagonal).
I downloaded a Square 1080 JPEG: valid 1080×1080 file with the cool-blue vertical gradient baked
cleanly behind the cutout. The custom HEX inputs are the killer detail for me — I can drop my
company's exact brand hex for a SharePoint header instead of settling for a preset. Zero console
errors throughout.

## Advocacy — 8/10
I'd bring this up unprompted to anyone on my team who's ever wrestled PowerPoint's background
remover. It does a paywalled job for free, no signup, and — critically — proves it doesn't upload
my data, which clears the one objection that kills most "free online tools" at a corporate desk.
Not a 9–10 because: (1) the gradient/export controls are a fairly dense wall of pills + swatches +
hex + angle stacked below the fold — powerful but slightly busy for a first-timer; (2) it's a
genuinely occasional need for me (a few times a month), so it's "great when I need it" rather than
a daily habit. Both are honest ceilings, not bugs. Nothing confused or broke.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["Export/gradient panel is dense — many pills + 6 swatches + From/To hex + angle stacked below the fold, a bit busy on first encounter", "Occasional-use tool for an ops analyst (a few times/month), so habit-forming value is capped vs. recurrence bar"], "priorConcernsAddressed": "n/a"}
```
