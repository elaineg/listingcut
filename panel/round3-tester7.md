# Round 3 — Tester 7: Jess Nakamura (freelance graphic designer, MacBook Pro / Chrome)

## Prior concerns — re-checked first
1. **No zoom/pan in Touch up — FIXED.** Scroll/pinch zoom works (I edited at 231% and 405%,
   confirmed by the new "Reset zoom (405%)" button), there's a dedicated Pan tool, and the
   helper text "Scroll or pinch to zoom · use Pan to move around" makes it discoverable.
   Precisely erasing the stray leaf at the tiger's hind leg is now a 10-second job instead of
   trial-and-error.
2. **No dark-background preview — FIXED.** Touch up now has a "Preview background:
   Checker / White / Dark" toggle. Dark instantly exposed the fur-edge fringe I used to only
   find after export. Two caveats: it lives only inside Touch up (the main result view is
   still checker+white only), and the dark view ghosts the original photo faintly behind the
   cutout, so it's a fringe-spotting tool rather than a true final-output preview. Acceptable.
3. **Hard-edged brush — FIXED.** Erase strokes now have visibly feathered, soft edges
   (verified at 2x crop of the canvas); no more square-ish scallops against the AI mask.

I verified edits persist: a max-size erase pass changed both the canvas, the main cutout
preview, and the downloaded transparent PNG (byte-diff vs pre-edit baseline).

## New issue found (minor)
While in Touch up, clicking elsewhere — e.g. the photo's row in "Your photos" — exits and
**silently discards all brush work**, no "discard changes?" prompt. I lost a full edit pass
this way (the file-row button is even labeled "Done", same word as the save button). One
confirm dialog would fix it.

## Clarity — Yes
Same 10-second pitch: "Free in-browser background remover that outputs marketplace-sized
white-background JPEGs for eBay/Etsy/Poshmark/Depop; photos never upload anywhere." H1
"Listing-ready product photos in your browser", the preset buttons, and the lock badge do
all the work. Unchanged and still the clearest landing page I've tested on this panel.

## Value — Yes
Me personally: Photoshop Select Subject stays faster and cleaner on hair/whiskers, so I'm
not switching. But for the small-business clients I evaluate tools for, this now beats the
free alternatives outright: remove.bg free caps at ~0.25MP; this does full-res 1600×1600+
exports, batch of 20 with ZIP, and a genuinely usable repair brush (zoom + soft edge + dark
QA preview) with no signup. The whole reseller loop — cut, inspect on dark, fix, size,
batch download — happens in one free tab.

## Output quality
Auto mask is the same model as rounds 1–2: whiskers still lost, faint semi-transparent
patches on the foreleg/belly, leaf still attached pre-touch-up. The difference is the repair
loop is now professional-feeling: zoom to 400%, soft erase, dark-bg check. That's the right
trade for a free tool; I no longer hit a wall the tool can't recover from.

## Advocacy — 9
I said last round "add touch-up zoom and a dark preview and this is a 9 for the
no-Photoshop crowd" — both shipped, and brush feathering came along too. I will bring this
up unprompted next time a client asks about remove.bg or a Canva-Pro-only feature. Held off
10 by: mask quality ceiling on fine detail (whiskers/hair — model-bound), dark preview not
available on the final composite outside Touch up, and the silent discard-on-exit edge case.

```json
{"tester": 7, "round": 3, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["Leaving Touch up by clicking the photo row silently discards all brush edits — needs a confirm prompt", "Dark edge-check preview exists only inside Touch up and ghosts the original photo; no dark preview of the final export", "Auto-mask fine detail (whiskers, hair) still below paid tools — model-bound ceiling"],
 "priorConcernsAddressed": "all"}
```
