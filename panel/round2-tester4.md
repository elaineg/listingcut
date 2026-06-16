# Tomás — Round 2

Operations analyst, locked-down corporate Windows/Edge, IT blocks installs. I use this for the occasional product shot on a clean/branded background for a deck or SharePoint header — and I will not feed company imagery to a site that uploads it.

## Re-check of MY round-1 complaints
The two things I flagged were privacy-as-a-claim and the model download having no ETA. I was told upfront neither was the target of this round — confirmed: footer still reads "your images are never uploaded to any server" (a claim, no "disconnect to verify" proof point), and there's still no time estimate on the ~50MB download. So **priorConcerns = none addressed** (expected).

What DID change — the shadow controls — I re-tested fresh:
- The naming collision is gone. The cutout option up top is now "Remove cast shadow"; the export toggle is "Drop shadow." Two clearly different things, no confusion.
- "Drop shadow" moved into the bottom control row next to Background (White/Color/Transparent) and the Margin slider — exactly where I'd look. I found it without scanning.
- Works on White and Color; toggling it on reveals Soft/Medium/Strong, preview updates live, and the download CTA relabels to "Download JPEG on this background (with shadow)" so I know what I'm getting.

## 1. CLARITY — Yes
Same strong read as R1, in under 10s: h1 "Remove any background — keep your photo on this device" = function + privacy hook, subline "free, no upload, no signup," and the use-case row including "slides & mockups." The reorganized controls are if anything clearer.

## 2. VALUE — Yes
Still beats my real alternatives (bug a designer over Teams and wait a day, or fight PowerPoint's clumsy Remove Background). Cutout was clean and fast (~12s after model load on my run), the Slide 16:9 preset is my exact deck size, and the now-better-placed Drop shadow makes a product sit on the slide instead of looking pasted-on — Photoroom paywalls that. In my network capture, zero uploads/POSTs fired, so the no-upload promise held again.

## 3. ADVOCACY — 8/10
Unchanged from R1, and honestly so. The shadow rename/move is a real polish win and removed the one mild confusion I had, but it doesn't move my number because my two blockers are untouched (and weren't meant to be this round):
- Privacy is still "trust me" text. It's the entire reason a wary corporate user would risk company imagery, and without a verifiable proof point ("disconnect your wifi — it still works") I forward this quietly, I don't evangelize it.
- First-photo ~50MB model download still has no ETA; on a throttled corporate network that silent multi-minute stall is where a coworker bails.

Fix either of those and I'm at 9.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Privacy is still a claim, not verifiable — add an 'works offline, disconnect to prove it' proof point for wary corporate users", "First-photo ~50MB model download still has no time estimate; risky on a throttled work network"], "priorConcernsAddressed": "none"}
```
