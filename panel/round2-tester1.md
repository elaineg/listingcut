# Priya — Round 2

## Round-1 concerns, re-checked first
1. **Shadow naming collision — FIXED.** The cleanup control is now "Remove cast shadow —
   Cleans the dark shadow under your subject" and the export drop-shadow control is now plainly
   "Drop shadow" (reveals Soft/Medium/Strong). Two different words, no overlap. It now sits
   right under Background + next to Margin, so I found it without hunting. I no longer had to
   stop and reason about which "shadow" was which. This was my main blocker — resolved.
2. **Export preview too small to see the shadow — PARTIALLY FIXED.** Toggling Drop shadow ON
   now visibly changes the Live-preview thumbnail (clear soft shadow under the subject on the
   beige bg vs. flat when off), and the download button relabels to "…(with drop shadow)…".
   At Soft it's now perceptible where in R1 it was "barely visible." The thumbnail itself is
   still on the smaller side, so it's improved rather than nailed.

**CLARITY: Yes.** Unchanged and still strong. H1 + the green "Your photos never leave this
device — everything runs in your browser" pill + "free, no upload, no signup" answer my one
objection before I ask. Three example tiles cover my headshot/avatar case.

**VALUE: Yes.** Re-ran my full flow cold: dropped a photo, the model downloaded, got a clean
cutout, exported on White and on a Color (beige) bg with Drop shadow on and off. Decisive for
me: I watched the network the whole run and saw **ZERO image-bearing POST/PUT requests** and
**zero console errors** — nothing left the machine, which is the whole reason I'd use this over
remove.bg. Download button states exactly what I get ("JPEG on this background (with drop
shadow) — 1080×1080 (Square) · beige"). For an occasional avatar on a solid color, this beats
trusting a server upload or fighting GIMP.

**ADVOCACY: 9/10.** Up from 8. My naming blocker is genuinely gone and the shadow now shows in
preview, so the two things that held me back in R1 are addressed. The lead I'd give a peer is
unchanged and rare: "client-side, nothing leaves your machine, no signup" — verifiable in the
network tab. Held off 10 only because the live-preview thumbnail is still smallish, so for a
fussy headshot I'd still download once to confirm the shadow/edges at full size — minor, not a
blocker. I'd bring this up unprompted to engineers who hate uploading their face.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["Live-preview thumbnail still smallish — I'd download once to confirm shadow/edges at full size"],
 "priorConcernsAddressed": "all"}
```
