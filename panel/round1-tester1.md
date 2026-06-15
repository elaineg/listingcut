# Priya — Round 1

**CLARITY: Yes.** The H1 "Remove any background — keep your photo on this device" plus the
green pill "Your photos never leave this device — everything runs in your browser" told me
exactly what it does and answered my one objection before I had to ask. The subhead "free,
no upload, no signup" is the line that made me actually stay. The three example tiles
(White/Color/Transparent, with "headshots & avatars" under Transparent) told me my use case
is covered. I knew how to start in well under 30s — one obvious drop zone.

**VALUE: Yes (for my occasional case).** Today I either pay/trust remove.bg (upload my
face to someone's server — no) or fight GIMP for 10 minutes. I confirmed in the network
tab equivalent: across 3 full runs there were ZERO image-bearing POST/PUT requests, and the
footer says so too. The model downloads once (~50MB) and processing was fast; cutout on my
test portrait was clean. Got a real 1080×1080 JPEG out. For a conference bio / GitHub avatar
on a solid color, this genuinely beats my current options. Not daily, but exactly right when
I need it.

**ADVOCACY: 8/10.** I'd bring it up to a peer who asked, and the "client-side, nothing
leaves your machine" angle is the thing I'd lead with — that's the rare hook engineers trust.
Held back from 9-10 by: (1) the SHADOW NAMING COLLISION — there's a "Remove shadow
(auto-cleans cast shadows)" checkbox up top AND a separate "Shadow" (add drop-shadow) toggle
in Export background. Same word, opposite jobs; I had to stop and reason about which was which.
(2) The new Shadow toggle works (reveals Soft/Medium/Strong, and the download button relabels
to "(with shadow)" — nice confirmation), but the live-preview thumbnail is small enough that
the shadow is barely visible until you download. A larger preview would sell it.

## What worked
- Privacy claim is real and verifiable (no egress) — decisive for me.
- One-screen flow, obvious drop zone, fast after model load.
- Marketplace + social size presets; download label states exactly what you'll get.
- Shadow intensity (Soft/Medium/Strong) is a thoughtful touch Photoroom charges for.

## What held me back
- Two controls both named around "shadow" with opposite meanings — confusing.
- Export live-preview thumbnail too small to judge the shadow before downloading.
- Minor: clicking the top White/Color/Transparent tiles vs the Export-background toggle felt
  like two ways to do the same thing; wasn't sure which was authoritative.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8,
 "topComplaints": ["'Remove shadow' (cleanup) vs 'Shadow' (add drop-shadow) share the same word, opposite meaning", "Export live-preview thumbnail too small to actually see the shadow before downloading"],
 "priorConcernsAddressed": "n/a"}
```
