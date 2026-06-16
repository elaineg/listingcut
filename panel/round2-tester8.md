# Rob — Round 2

Freelance brand designer, weekly cutout-on-exact-brand-hex grunt work. Baseline: "I could do
this in Photoshop (Select Subject) in ~4 min." Re-ran my real flow on the new build.

## Re-check of my Round-1 complaints
1. **Shadow toggle reset my brand hex to default beige — FIXED.** Confirmed cold: default
   color was #F5F0E6 (the beige I saw revert to). I set #e5004c, toggled Drop shadow OFF→ON,
   and the hex inputs stayed #e5004c. Export filename = `portrait-square-1080x1080-e5004c.jpg`
   and the actual corner pixel reads rgb(228,0,75) ≈ #e4004b — my exact hex survived to the
   pixels. Did the same in the 2-photo batch ZIP with shadow on: both files came out
   `product1/2-square-1080x1080-e5004c.jpg`, red bg confirmed. The order-sensitive bug is gone.
2. **Naming collision (Drop shadow vs Remove cast shadow) — FIXED.** They're now plainly
   distinct: "Remove cast shadow — Cleans the dark shadow under your subject" (an input toggle)
   vs "Drop shadow" with Soft/Medium/Strong (an export effect). No more confusion.
3. **Color-fringe halo / clipped fuzzy hair — UNCHANGED, and I was told it's a model limit.**
   I accept that. My fixture is a flat illustrated head so I can't re-demo the hair fringe here,
   but I'm taking the build note at face value: the in-browser model still can't hold flyaways
   or kill the saturated-color halo. That remains my one real gap.

## 1. CLARITY — Yes
Unchanged and still the best part. "Remove any background — keep your photo on this device,"
clean cutout on white / brand color / transparent, free no upload no signup. Got it in 10s.

## 2. VALUE — Yes (up from Marginal)
With the hex-reset bug gone, the ergonomics now reliably beat my Photoshop loop for everything
short of client-final: type my exact brand hex once, it rides into presets, margin, drop
shadow, AND a 2-photo batch ZIP with hex-stamped filenames. That's a genuine weekly time save
for listings, social, ad comps and internal mocks — work I'd otherwise hand-crank in PS. Last
round the bug made me not trust the export; now I do.

## 3. ADVOCACY — 8/10 (was 6)
Two fixes moved me +2. I can now trust that what I set is what I get — the export honestly
labels and stamps #e5004c, and the batch is a real volume win that Photoroom paywalls. I'd
bring this up to designer friends for fast brand-hex cutouts.
What keeps it off 9–10 is purely the **matte/edge quality for client deliverables**: on real
saturated-background photos the model still leaves a color halo and clips fuzzy hair to a dome,
so I can't ship a portrait straight to a client without a PS edge pass. That's a model limit,
not a UX flaw — but it's the line between "great for volume/internal" and "replaces my PS step
for paid work." Fix the edge matte and this is a 9.

```json
{"tester": 8, "round": 2, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["matte/edge quality (color halo + clipped fuzzy hair on saturated backgrounds) keeps exports off client-final without a Photoshop edge pass — stated model limit"], "priorConcernsAddressed": "some"}
```
