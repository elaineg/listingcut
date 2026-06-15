---
NAME: Tomás
CLARITY (understand what it does & how within ~30s cold?): Yes — the H1 "Listing-ready product photos in your browser," the before/after mug, and the green "Your photo never leaves this device — everything runs in your browser" badge told me what it does and that it's safe, all above the fold.
VALUE (would you actually use this for real work?): Yes — IT blocks installs and I won't paste company shots into a random site, but I confirmed in the network requests that ZERO image data is uploaded, so for the occasional product shot needing a white or branded-color background on a slide/SharePoint header this beats the manual fiddling I do in PowerPoint today.
ADVOCACY (1-10: likely to recommend to a peer): 8 — the no-upload claim is provably real and it gives away a paid-tool job for free; one stale label and the reseller-only framing keep it off a 9.
TOP FRICTION: After switching to Color and setting hex #1a73e8, the download button still read "...1600×1600 (eBay) · white" — the "· white" never updated to my custom color. The tab and swatch ring updated, but for a company asset that stale label makes me stop and re-verify what I'm exporting.
WHAT WORKED: I checked the network traffic and saw NO image POSTs anywhere — only the WASM model loads from a CDN. That client-side proof is what flips me from "wary of a random site" to "I'll actually use this on a work image."
NEW-FEATURE TAKE: Yes — discoverable and clear. The "Marketplace export — choose background, size, and download" section with the White / Color / Transparent segmented control sits right under the cutout. Color opened a native picker plus a hex field and preset swatches (including a blue I'd use for a branded header); Transparent yields a PNG I'd drop straight into slides. It did what I expected; only the download-button label lagging the chosen color undercut my confidence.
---

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Download button label still says '· white' after picking a custom Color — stale label makes me distrust what I'm actually exporting for a company asset", "Headline/subhead frame it entirely for eBay/Etsy/Poshmark resellers; nothing signals the slide/SharePoint-header use case, so a corporate user almost bounces as 'not for me'"], "priorConcernsAddressed": "n/a"}
```
