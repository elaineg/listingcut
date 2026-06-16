# ListingCut — UX Brief (round 8 — prove the face cutout)

> Round-3 result: 7/10 at the 9 bar (Marcus, Wen, Tomás, Dana 10, Jules, Elena, Sam; up
> from 3/10 R2, 0/10 R1). Clarity 10/10, Value 10/10. The R2 neutralize-the-default work
> landed in full. The three holdouts all sit at 8: PRIYA (the only clearly-fixable one),
> AISHA, ROB. This round does TWO small things, NOT a redesign:
> (1) PROVE the face cutout — Priya reads "Headshots & avatars" but every visual is still
> the mug, so she has the signal with no PROOF; she'd hit 9 with a clean-cutting FACE
> example. (2) Fix a recurring color-label nit (Sam R1+R3, Elena): Color mode defaults to
> white #ffffff so the button still reads "white JPEG" until a color is picked — reads as
> "nothing happened." HONEST CEILING: Aisha (8) and Rob (8) confirmed the @imgly model
> clips fine/wispy hair on REAL portraits — Aisha calls the raw edge "a real ceiling," Rob's
> is structural (per-image manual touch-up doesn't scale to 20 assets/week). We do NOT swap
> the model (would balloon the ~50 MB download and break free + small-bundle). The face
> sample must therefore showcase the model AT ITS BEST and Touch up stays prominent; these
> two are an honest free-client-side 8. A SAMPLE + a LABEL fix, NOT a redesign.

## 1. Problem statement
Drop in any photo — a product, a headshot, anything — and get a clean cutout on the background you need: pure white, your brand color, or transparent, free, in seconds, with the photo never leaving your device.
(Used for headshots & avatars, brand-color ads and social, transparent cutouts in slides and mockups, and white listing photos.)

## 2. Primary user action
Drop one or many photos into one big drop zone that dominates the landing view. Inside it: the sample before/after pair with "Try the sample," plus two short trust lines — "Drop up to 20 photos at once" and (honest timing) "First photo downloads a one-time ~50 MB tool; after that each photo takes about 10 seconds" (the pre-upload disclosure, visible BEFORE any file is chosen). One drop does everything: photos process in order, results appear as they finish, downloads light up — no second submit step. NEW: the three background outcomes (white / brand color / transparent) are SHOWN above the fold so a non-seller instantly sees the tool is for them before processing anything.

## 3. Emotional tone
Trustworthy and brisk — a good utility knife. Clean geometric sans, cool white/slate palette with one confident accent, generous whitespace. Lead with the cutout-on-any-background job, not "AI" and not "listings only." Keep what prior rounds proved: privacy badge, batch queue, hierarchy, presets, and the model-size disclosure stay exactly where they are — this round changes the FRAMING words and surfaces the background value earlier, not the flow.

## 4. Design decisions
6. **(ROUND 8, top priority) PROVE the face cutout — a clean headshot example, not just headshot copy.** Priya (the only fixable holdout) reads "Headshots & avatars" and believes the SIGNAL, but every visual — the three hero tiles AND the "Try the sample" demo — is the mug, so she has no PROOF the model cuts a face/hair cleanly before she commits her own photo. Add a FACE example to the experience: a **second one-click sample, "Try a headshot,"** sitting beside "Try the sample (product)" in the drop zone, and/or swap one of the three hero before/after tiles to a face. Clicking "Try a headshot" runs the full real cutout + export flow on a bundled portrait, showing the result on white / brand-color / transparent just like the mug sample. CRITICAL QUALITY CONSTRAINT: the bundled face must actually cut CLEANLY — choose a portrait with **relatively short or tidy hair and strong subject/background separation** so it PROVES quality and showcases the model at its best. A face sample that shows wispy-hair clipping would BACKFIRE for the edge-sensitive testers (Aisha, Rob) — do NOT pick a flyaway-curl portrait. SOURCING: use only a freely/permissively-licensed or self-evidently-usable image (no paid/unlicensed stock); bundle it like sample-mug.png and verify in-browser that it cuts well. FALLBACK: if no clean-licensed face image can be reliably bundled, do NOT ship a poor cutout — instead strengthen the headshot affordance/copy (e.g. the "Headshots & avatars" cue + a labeled face placeholder) and accept the proof gap; record the decision in the run log. This is the single change that moves Priya 8→9. NOTE: this does NOT promise perfect hair anywhere — it shows the model at its BEST; Touch up (decision 2) stays the honest recovery path for hard images.

0. **The landing speaks to everyone who needs a cutout — and now leads with a NEUTRAL default, not a seller one.** The headline/subhead name the OUTCOME, not the audience: "cutout on the background you need — white, brand color, or transparent." Above the fold, beside/under the sample, show the SAME sample cutout previewed three ways — on white, on a brand color, on transparent (checkerboard) — each one-word-labeled (White · Color · Transparent) so a marketer/designer/PM/engineer sees their use case proved BEFORE processing, and a seller still sees the white listing photo. Section title is the neutral **"Export background."** NEW (round 7): the use-case microcopy now leads with people and generalizes — **"Headshots & avatars · ads & social · slides & mockups · marketplace listings"** — so a face/headshot user (Priya, the only value=No) is explicitly named, and the seller case is present but no longer first. NEW (round 7): the "eBay's own photo guidelines…" line is DEMOTED from the dominant subline to ONE item in a short, even list of use cases (or moved beside the marketplace presets where it's contextually relevant) — it must NOT be the lone social-proof line under the subhead; for a social/IG user (Jules, Sam, Elena) a marketplace-only citation reads off-key. No seller language is removed — eBay/Etsy/etc. remain as full preset options — but they no longer monopolize the frame.

1. **Batch is just "drop more" — bigger thumbnails, review before you zip.** Multiple files render as one simple list of rows: thumbnail, filename, plain-word status ("Waiting… / Removing background… / Done"). NEW: thumbnails are larger and obviously tappable (cursor-pointer, hover lift) — clicking any row opens that photo's full result for a real before-you-zip review. Photos process one at a time top-to-bottom; the first finished result opens large automatically. Each row has its own download; "Download all (ZIP) — 12 photos" appears once 2+ are done. NEW: a small, unobtrusive "Sizes…" link beside the ZIP button opens a tiny popover of preset checkboxes (default = current sticky preset) so one ZIP can carry, say, eBay AND Poshmark in a single download — no second pass. A failed row shows a red status with its own **Retry** button — never "reload the page." If a cutout comes back nearly empty, the row says **"Check this one"** — never silently zipped as a blank white square.
2. **The cutout cleans itself — shadows and blobs gone before you ever look.** NEW: the cutout you see is already auto-cleaned. Stray disconnected blobs and smudges are dropped automatically and invisibly (no toggle, no copy — it just looks right), and the export crop centers from the cleaned shape so the product never sits top-left in dead white space. Cast shadows are handled by ONE plain-words toggle, **"Remove shadow"** (default ON), sitting quietly near the result — flip it off only if a soft shadow was wanted. No "alpha," "mask," or "connected-component" language ever reaches the user. Touch up stays the manual backstop, not the main event: one secondary "Touch up" button swaps to the cutout over a faint original with "Erase"/"Restore" toggles, size slider, Undo, pinch + scroll-wheel zoom with drag-to-pan, a feathered (soft-edged) brush, and a three-way preview-background toggle (checker / white / dark). NEW: exiting Touch up with unsaved brush work (including via a row click) asks "Discard your touch-ups?" before throwing the work away. NEW (round 7) — make Touch up DISCOVERABLE right at the result and set HONEST edge expectations. On hard images (hair, fuzzy fabric) the underlying @imgly model leaves stray shoulder blobs and hard-clipped flyaway hair (Aisha, Rob — model-bound, not the new feature). So: (a) the "Touch up" affordance sits prominently beside the result, not buried — a considered-craft user forgives a miss they can clearly fix; phrase it as recovery, e.g. **"Hair or edges not perfect? Touch up to refine →"** so the expectation is set honestly without over-promising perfect hair. (b) BUILDER DECISION (weigh in build, record in run log): investigate whether a higher-quality @imgly/background-removal model variant is available and whether the larger download is worth it; if adopted, keep the two-phase progress honest. Do NOT claim flawless hair anywhere. Copy frames Touch up as recovery: "Fix spots the auto-cutout missed."
3. **Failures, copy, and "what next" all speak plain English.** NEW: a download/network failure never shows raw "Failed to fetch" — it reads "Couldn't download the background-removal tool — check your connection and tap Retry." NEW: when a batch finishes, an **"Add more photos"** button sits beside "Start over," so a seller appends to the same session instead of wiping it (sticky preset and margin carry over). All inline status copy is space-audited — no glued "1 photo ismarked" — across every sibling string. None of this moves the existing layout; these are word and button additions only.

4. **The JPEG is the answer; the PNG is the expert option — and the button says what you'll get.** Primary button is the big accent download; its label always names size + preset + the chosen background and updates SYNCHRONOUSLY in the same tick as a chip/mode/swatch/hex change — NEVER a lagged or stale "· white" after Color is chosen (round-1 testers Tomás/Priya/Sam saw it lag or never update, which made them stop and re-verify a work asset; the label and the live composite must agree before the click, every time): White → "Download white JPEG — 1080×1080 (Square)" (neutral default, round 7 — no longer "(eBay)"); Color → "Download JPEG on this background — 1080×1080 (Square)" with a tiny color dot in the button matching the fill (or "Download beige JPEG — …" when a named swatch is active). NEW (round 8, recurring nit — Sam R1+R3, Elena): the instant **Color** mode is selected, the label must STOP reading "white JPEG" even before the user picks a color — because Color mode currently defaults the fill to white #ffffff, the button stayed "Download white JPEG…" and read as "nothing happened." Pick the CLEANER of two fixes: (i) default Color mode to a NON-white starting fill (a neutral like light gray, or the first preset swatch) so the label/preview visibly differ from White the moment Color is chosen; OR (ii) the instant Color is selected, switch the label to "Download JPEG on this background…" regardless of the white value. Either way, selecting Color must produce an IMMEDIATE visible change in label + preview; Transparent → "Download transparent PNG — 1080×1080." (Picking a marketplace chip flips the label to e.g. "1600×1600 (eBay)" instantly.) The chosen background is legible BEFORE the click — in this label and in the live composite preview. Below the primary, the quiet secondary "Download transparent PNG" (original size, NOT preset-sized) stays with hint "PNG with no background — most marketplaces want the JPEG above." Checkerboard caption: "Checkered area = transparent (no background)." iOS hint: "On iPhone: tap Download, then Save Image to add it to your camera roll."
5. **One export-controls cluster — preset, background, margin — sits together, co-equal, and never resets.** This row is the differentiator and must be discoverable in the first 5 seconds: it lives directly with the result/preview, not below the fold or in a menu. Three siblings of equal visual weight, left to right: (a) preset chips, GROUPED under two tiny labels so non-sellers find their size fast. NEW (round 7) — NEUTRALIZE THE SELLER DEFAULT (the dominant R2 blocker — Wen, Elena, Sam, plus the nit for the three 9s; non-sellers scanned past four resale sites to reach their size). Two coordinated changes, builder picks the cleanest combination but BOTH the ordering and the default must read neutral: (i) lead with a neutral/general group FIRST — **General & Social**: **Square 1080×1080 · Story 1080×1920 · Link/Ad 1200×627 · Slide 16:9 (1920×1080) · Custom (width/height fields)** — and place **Marketplaces** (eBay 1600×1600 · Etsy 2000×2000 · Poshmark square · Depop 1280×1280 · Facebook 1200×1200) SECOND; (ii) change the DEFAULT selected preset from "eBay 1600×1600" to a neutral general size — **Square 1080×1080** — so the live-preview default reads "Square 1080×1080" and the default download button reads "Square," NOT "(eBay)" (Elena, Sam: the page defaults a non-seller straight into a seller size). Custom stays in the visible general group, NOT buried. ALL marketplace presets remain fully available — do NOT regress the seller use case; eBay/Etsy/Poshmark/Depop/Facebook still one tap away in the Marketplaces group. (b) NEW: an **Export background** selector — three plain-words segmented options **White · Color · Transparent**, with **White selected by default so it looks and behaves EXACTLY like today** (existing users see no change); (c) the **Margin** slider (2–15%, default 6%, NEW (round 7) help text generalized from "Space around the product" → **"Space around the subject"** so it reads for headshots/logos, not only products — Elena) that re-renders the live composite as it moves. NEW: choosing **Color** reveals its sub-controls INLINE, right under/beside the segmented control — ~6 preset swatches (white, black, light gray, beige #F5F0E6, brand blue, brand red), a native color picker (`<input type="color">`), and an editable #RRGGBB field; the active fill shows as the selected swatch and live-recomposites the preview. These sub-controls expand in place and must NOT push the editable preview or the queue off-screen — the preview stays visible while you pick. White and Transparent show no sub-controls. Preset, background mode, chosen color, AND margin are all sticky across every photo and across "start over." NEW (round 6, UX of a round-1 bug): switching SIZE preset (including to Custom or any Social/Other size) must NEVER reset the Export-background mode or the entered hex — Dana lost her brand blue when she picked Custom; background choice and size are independent and both persist. NEW: the export-controls cluster must RELIABLY appear once a cutout completes — round-1 Marcus saw it silently fail to render on 4 of 6 runs with no error; a silent no-op reads as broken. If the cluster ever can't render, show a plain-words retry, never nothing. Chips, the background selector, and the slider are all visible-but-disabled before upload with the "drop a photo first" hint.

## 5. 5-second check (above the fold, cold visitor)
- Headline (NEW): "Remove any background — keep your photo on this device" — or equally valid: "Clean cutouts on any background, free, in your browser." Names the OUTCOME, not the audience.
- Subtitle (NEW): "Drop a photo — a product, a headshot, anything — and get a clean cutout on white, your brand color, or transparent — free, no upload, no signup." A marketer/designer/PM/engineer AND a headshot user instantly sees it's for them; sellers still read "white background."
- Use-case line (round 7 — leads with people, seller case last): "Headshots & avatars · ads & social · slides & mockups · marketplace listings." (Seller case present, not dominant.)
- Background-outcome preview (NEW, round 8 — now with a FACE): the sample cutout shown three ways above the fold — on white, on a brand color, on transparent (checkerboard) — labeled White · Color · Transparent. At least one of the visible above-the-fold examples must show a clean FACE/headshot cutout (a hero tile and/or a "Try a headshot" sample), so the headshot promise is PROVED with imagery, not only named in copy (Priya). The face example must cut cleanly — tidy hair, good separation.
- Two one-click samples (NEW, round 8): "Try the sample" (product/mug) AND "Try a headshot" (face), side by side in the drop zone, so a face user can verify the full cutout + export flow on a person before committing their own photo.
- eBay-guideline line (round 7): DEMOTED — no longer the lone social-proof subline. It appears, if at all, as one neutral item among use cases or beside the marketplace presets, never as the dominant line under the subhead (Elena, Sam, Jules). Factual, no invented statistics.
- Privacy badge: "Your photos never leave this device."
- Primary action: large drop zone — "Drag & drop photos (up to 20) or click to upload" — with the sample before/after, "Try the sample," and the one-time ~50 MB note.
- Export-controls cluster visible (disabled): preset chips GROUPED with the NEUTRAL group FIRST — General & Social (Square · Story · Link/Ad · Slide 16:9 · Custom) then Marketplaces (eBay · Etsy · Poshmark · Depop · Facebook) — with **Square 1080×1080 preselected by default** (NOT eBay), the **Export background** selector (White · Color · Transparent, White preselected), and the margin slider — co-equal, above the fold. A cold non-seller lands in a neutral size and reads their use case in 5s; every marketplace size is still one tap away.

**NEW for round 8 (prove the face cutout + fix the color label) — validator checks first:**
- A FACE/headshot example is present and visible: either a clean face cutout in one of the above-the-fold hero tiles, or a second one-click sample labeled "Try a headshot" (ideally both). Clicking "Try a headshot" runs the full real cutout + export flow on a bundled portrait.
- The bundled face cutout is CLEAN: tidy/short hair, clear subject/background separation, no obvious wispy-hair clipping or background blob in the result. (If no clean-licensed face image could be bundled, the fallback — strengthened headshot copy/affordance — is acceptable and must be noted in the run log; do NOT ship a poor face cutout.)
- The face image is freely/permissively licensed (no paid/unlicensed stock).
- Color-label fix: selecting **Color** mode produces an IMMEDIATE visible change — the download button no longer reads "white JPEG" the instant Color is chosen (either Color defaults to a non-white fill, or the label switches to "Download JPEG on this background…"). No "nothing happened" moment.
- No regression: product sample, neutral Square default, General & Social presets first, all marketplace presets one tap away, prominent honest Touch-up affordance all still intact.

## Add shadow (additive — secondary refinement INSIDE the export-controls cluster)
Friction this addresses: a new control dropped onto an already-dense panel keeps burning panel rounds on discoverability/clutter. So Shadow is NOT a new banner, NOT above the grid, NOT a competing section — it nests inside the existing **Export background** cluster as the LAST, lowest-weight item.

- **Placement (exact):** inside the existing export-controls cluster, AFTER the Margin slider — the order within the cluster is now (a) preset chips, (b) Export background segmented control + its inline color sub-controls, (c) Margin slider, (d) **Shadow** — visually grouped with Background + Margin (same indentation, same row container, no new heading, no divider that reads as a fresh section). It is the quietest, last control in the cluster, not a hero.
- **Control type + default:** a single small **toggle labeled "Shadow"**, **default OFF**. When OFF, no sub-control is shown (the export behaves exactly like today — byte-for-byte, no regression).
- **Progressive disclosure:** turning Shadow ON reveals ONE small **3-step segmented control "Soft · Medium · Strong"** (default **Soft**) inline beside/under the toggle. Use the segmented control, NOT a slider: three named, tappable steps are lower-friction on touch, need no fine-drag, and read as "pick a feel," not "calibrate a number" — and they keep the cluster compact. The intensity control is HIDDEN while OFF (keeps panel density down); it appears only when the toggle is ON.
- **Disabled-in-Transparent state (must not look like a bug):** when Export background = Transparent, the Shadow toggle is **visibly DISABLED (greyed, not removed)** with a one-line inline/hover reason — **"Shadow needs a solid background (White or Color)."** Keep it present-but-dimmed rather than hidden so it doesn't read as broken or missing; switching back to White/Color re-enables it and restores the prior on/off + intensity state. (Disabled ≠ error: no red, no alarm styling.)
- **Live preview + label (synchronous, like background mode):** toggling Shadow or changing the intensity step updates the live composite preview IN THE SAME TICK as the change — the soft shadow appears/disappears/re-softens immediately, no submit. The primary download button reflects shadow state the same way it already reflects mode/size: when ON it reads e.g. **"Download white JPEG (with shadow) — 1080×1080 (Square)"**; when OFF it drops the "(with shadow)" qualifier. Label + preview must AGREE before the click, every time — consistent with the existing synchronous background-mode label rule (decision 4).
- **Sticky:** Shadow on/off + chosen intensity persist across photos and "Start over" exactly like background mode/color/margin, and apply to both single export and "Download all (ZIP)."

## Add Gradient background (additive — a 4th equal mode in the Background selector)
Friction #39 (a feature added to a dense app ships UNDISCOVERABLE and burns panel rounds just
surfacing it): Gradient must be first-class in the Background selector from the first paint, not
a buried add-on. Friction #19/#61 (a new control writes the SAME shared export-settings object as
color/margin/shadow): a naive handler that re-initializes the slice clobbers a sibling field —
gradient state must be independent of margin/shadow/color and survive switching modes.

- **Placement — a 4th equal chip:** the Export background selector becomes **White · Color ·
  Gradient · Transparent** — four segmented options of EQUAL visual weight, in that order
  (Gradient between Color and Transparent). White/Color/Transparent are visually UNCHANGED;
  White stays selected by default so existing users see no change. Gradient (like the others) is
  visible-but-disabled before a cutout exists with the same "drop a photo first" treatment.
- **Progressive disclosure — mirror Color exactly:** selecting Gradient reveals its sub-controls
  INLINE, right under/beside the segmented control, the same way Color reveals its hex picker —
  and NOT before. The reveal contains, in one compact group: (1) **~6 preset gradient swatches**
  (soft gray, warm sunset, cool blue, mint, peach, slate) rendered as little gradient chips you
  tap; (2) a **custom two-color picker** — two #RRGGBB fields each paired with a native
  `<input type="color">`, labeled simply "From" / "To"; (3) an **angle control** — vertical /
  horizontal / diagonal preset buttons (a 0–360° slider is acceptable if it stays compact). The
  active gradient shows as the selected swatch (or "Custom" when the pickers are edited). These
  sub-controls expand IN PLACE and must NOT push the editable preview or the queue off-screen —
  the preview stays visible while you pick (same constraint as Color). White/Color/Transparent
  show no gradient sub-controls.
- **Live preview — synchronous:** tapping a preset swatch, editing either custom color, or
  changing the angle re-composites the live preview IN THE SAME TICK — the whole canvas behind
  the centered subject fills with the gradient immediately, no submit. The primary download button
  reads **"Download JPEG on this gradient — 1080×1080 (Square)"** while Gradient is active (with the
  size/preset qualifier like the other modes), and label + preview must AGREE before the click.
- **Composition (no surprises):** the gradient fills the WHOLE canvas behind the subject and
  composes with the chosen preset SIZE and the Margin slider (subject stays centered at the chosen
  margin). The existing **Drop shadow** toggle stays available in Gradient mode and renders the
  soft shadow OVER the gradient, exactly as it does over a solid color — only Transparent disables
  shadow.
- **Sticky + independent (the friction #19/#61 guardrail):** the gradient choice — preset-or-custom,
  both colors, and the angle — persists across photos and "Start over" exactly like background
  mode / color / margin / shadow, and applies to BOTH single export AND "Download all (ZIP)" (every
  photo gets the same gradient). Changing Margin, toggling Shadow, or switching Gradient→Color→
  Gradient must NEVER reset the chosen gradient — each setting is independent; the mode switch
  restores the previously-chosen gradient, not a default.
- **5-second rule still holds:** the page still reads instantly as a background remover — Gradient
  is one more quiet segmented option inside the existing export cluster, NOT a new banner, hero, or
  landing-density element. Do not add any "New: gradients" badge. Discoverability comes from the
  4th chip sitting co-equal in the Background selector, nothing more.

## Round-1 fixes (Add-shadow panel — naming + placement only; ceiling PARKED)
Round-1 result: 0/10 fully pass; clarity 10/10, value 9/10. NO tester faulted the shadow
feature itself. Sub-bar scores are driven by a naming collision (6 testers), the toggle's
burial (3–4 testers), one state bug (Rob), and the known @imgly matte/hair ceiling (Rob 6,
part of Aisha 8 — PARKED, do NOT touch). This section fixes ONLY the first three. Do NOT
chase edge fringe / hair clipping (model limit), batch-ZIP scope, privacy proof-point,
marketplace framing, or angle/offset controls — all deferred (see SYNTHESIS-round1.md).

1. **Naming collision — exact final labels (the dominant blocker, 6 testers).** Two controls
   share the word "shadow" with opposite jobs. The top control auto-cleans the subject's CAST
   shadow during matting (default ON, removes a dark fringe under the subject). The new export
   control ADDS a drop-shadow. Verified jobs from tester descriptions; rename BOTH so they can
   never be confused:
   - **NEW export control:** rename `Shadow` → **`Drop shadow`** (clearly additive; this is the
     artifact Photoroom calls "instant shadow"). When ON, the download-button qualifier becomes
     **`(with drop shadow)`** (was `(with shadow)`), e.g. "Download white JPEG (with drop
     shadow) — 1080×1080 (Square)". The intensity segmented control stays `Soft · Medium ·
     Strong`. Disabled-in-Transparent reason text becomes **"Drop shadow needs a solid
     background (White or Color)."**
   - **TOP cleanup control:** rename `Remove shadow (auto-cleans cast shadows from cutouts)`
     → **`Remove cast shadow`** with helper text **"Cleans the dark shadow under your subject"**
     (default ON, unchanged behavior). This keeps "shadow" only where the meaning is
     "the original shadow in the photo," while the additive control owns the word "drop." The
     two strings — "Remove cast shadow" vs "Drop shadow" — no longer collide on a fast read.
     Rename is label/helper only; the cleanup logic is untouched (minimal/safe).

2. **Discoverability — exact placement (3–4 testers; toggle was stranded under the size grid).**
   The new toggle must NOT sit below the size-preset grid. Move it INTO the export-controls
   cluster grouped with Background + Margin, in this exact order: (a) preset chips, (b) Export
   background segmented control + inline color sub-controls, (c) Margin slider, (d) **Drop
   shadow** toggle — immediately AFTER Margin, in the SAME row container / same indentation as
   Background and Margin, NOT after the size grid and NOT in its own section. A returning user
   reaching the Background+Margin block sees Drop shadow there without scrolling past the size
   chips. Keep it the quietest, last item in the cluster (no new heading, no divider that reads
   as a fresh section). Do NOT add a "New: drop shadow" banner or any landing-density element
   (documented added-feature-buried + landing-density friction) — placement inside the existing
   cluster is the entire fix.

3. **State bug (code, no UX decision — for the builder).** Rob: toggling Drop shadow off→on then
   changing intensity reset the chosen brand hex back to default beige on one export. Drop-shadow
   on/off + intensity must be fully independent of background mode/color/hex — toggling shadow
   must NEVER reset the entered hex or selected swatch. Sticky-state rule from decision 5 applies:
   shadow state and color state persist independently across photos and "Start over".

## Prove privacy + keep first-load alive (additive — landing trust proof + download ETA)
This round deepens the EXISTING landing + first-load only. Two changes: (1) turn the passive
privacy line into a prominent, VERIFIABLE trust proof above the fold; (2) add a counting-down
ETA to the one-time model download so first load feels alive, not frozen (panel holdout Tomás
read percent+elapsed as "the page is broken"). No flow changes, no new banner stack.

### (1) Privacy proof — one prominent, verifiable trust strip (NOT a 4th banner)
Friction this addresses (added-feature-buried + landing-density): a privacy claim added to a
dense landing ships as either invisible fine print OR yet another banner in a stack. The fix is
CONSOLIDATION, not addition — there is ONE trust element on the landing, and it is the proof.

- **Consolidation decision (exact):** the landing today carries (a) a fine-print privacy line
  ("Your photos never leave this device") and (b) the pre-upload ~50 MB model disclosure. Merge
  the privacy line INTO the new proof element and DELETE the standalone fine-print line — do not
  keep both. The ~50 MB disclosure stays where it is (inside/under the drop zone, as pre-upload
  copy), because it answers a different question (how long) and must not be swallowed by the
  trust strip. Net result on the landing: exactly TWO informational lines near the drop zone —
  the prominent privacy PROOF (trust) and the quiet ~50 MB timing note (expectation) — never a
  3rd or 4th stacked banner.
- **Placement (exact):** a single horizontal trust strip pinned DIRECTLY ABOVE the drop zone
  (between the use-case line and the drop zone), full drop-zone width, so a cold visitor's eye
  hits it on the way into the primary action. It is the ONE colored/bordered element in that
  zone — the drop zone stays the visual hero; the strip is a confident supporting band, not a
  competing card.
- **Visual treatment:** a soft-tinted pill/band (cool accent at low saturation — e.g. slate or
  the brand accent at ~8% fill) with a lock or shield glyph at the left, ONE line of bold proof
  copy, and a smaller second line that is the verify instruction. Distinct enough to read as
  "trust, proven," quiet enough not to shout over the drop zone. No red, no warning styling.
- **Exact copy (two lines, both visible above the fold):**
  - Line 1 (bold): **"Private by design — your photo never leaves this device."**
  - Line 2 (smaller, the VERIFY affordance): **"100% in your browser. Don't take our word for it:
    turn on airplane mode — it still works. Or open the Network tab — zero image uploads."**
  - The verify line is the load-bearing part: a skeptic must be able to NAME how to check it in
    5 seconds, not just read a claim. Keep both verification cues (offline + Network tab) — they
    serve different skeptics (the casual user trusts "airplane mode," the engineer trusts the
    Network tab).
- **During processing (carryover, tightened):** the privacy reassurance repeats once, quietly,
  beside the progress indicator — "Still on your device — nothing uploaded." — so the proof
  holds through the one moment a user might fear an upload is happening.
- **5-second test:** a stranger who never scrolls sees the strip, reads "never leaves this
  device," AND can repeat back at least one way to verify it (airplane mode / Network tab).

### (2) Download ETA — make the one-time download feel alive
Friction this addresses (Tomás, holdout): percent + elapsed-seconds with NO remaining estimate
read as a frozen page during the ~50 MB download. People tolerate a wait they can SEE shrinking.

- **What shows during download (one compact indicator, not a new panel):**
  - A progress bar plus a numeric percent (kept).
  - NEW: a counting-DOWN remaining estimate beside the percent — **"~12s left"** — computed from
    observed download rate (bytes-so-far ÷ elapsed → bytes/sec → remaining bytes ÷ rate). It
    appears only once enough bytes have arrived to estimate a stable rate (suppress for the first
    ~1s / until a sane number exists — never show "~0s left" or a wild "~600s left" spike); until
    then show the reassurance line alone. Smooth the rate (rolling average) so the number ticks
    DOWN steadily and doesn't jitter up and down.
  - NEW: a steady one-line reassurance UNDER the bar: **"Setting up the one-time tool (~50 MB) —
    this happens once, then it's instant. You can keep this tab open."** This is the "it's not
    frozen" anchor; it stays constant while the percent/ETA move.
- **Transition copy (download → inference, exact):** when the bar reaches 100%, the indicator
  swaps the download line for **"Almost there — removing background…"** with the existing elapsed
  seconds. The ETA string ("~Ns left") disappears at 100% (it's download-only); the reassurance
  line is replaced by the "removing background" state so the user never sees a stale "downloading"
  message after bytes finish.
- **Applies in every path** including the bundled sample(s) — the first cold load of "Try the
  sample" / "Try a headshot" shows the same download bar + ETA, since that's a user's true first
  experience.
- **5-second test:** within seconds of first load a user sees a number that is going DOWN ("left")
  and a sentence telling them it's a one-time setup — first load reads as alive, not broken.

### Round validator checks (privacy proof + ETA)
- (a) ONE prominent privacy-proof strip sits directly above the drop zone, above the fold, with
  bold "never leaves this device" copy AND a concrete self-verify cue (airplane mode and/or
  Network tab) a stranger can name in 5 seconds.
- (b) The old standalone fine-print privacy line is GONE (merged into the strip) — the landing
  shows the proof strip + the ~50 MB timing note only, NOT a stack of 3+ banners.
- (c) During the one-time download the indicator shows a counting-DOWN "~Ns left" alongside the
  percent, derived from observed rate, that decreases on a cold load.
- (d) A steady "this happens once / not frozen / keep the tab open" reassurance line is present
  during download.
- (e) At 100% the copy transitions to "removing background…" and the "~Ns left" string is gone.
- (f) No regression: drop zone is still the hero, ~50 MB pre-upload disclosure intact, no new
  landing banner clutter, all prior carryover (samples, neutral default, export cluster) intact.

**Round-2 validator checks:** (a) the two controls read "Remove cast shadow" and "Drop shadow"
— no two controls share the bare word "shadow"; (b) the Drop-shadow toggle appears directly
after the Margin slider inside the export-controls cluster, above/within the Background+Margin
group, NOT below the size grid, and is visible without extra scrolling once a user reaches that
cluster; (c) download button reads "(with drop shadow)" when ON; (d) toggling Drop shadow does
not reset the chosen hex/swatch; (e) no banner / landing-density was added; (f) shadow feature,
intensity, sticky, and Transparent-disabled behaviors from "Add shadow" still intact.

Carryover, still required: two-phase progress (model download with real percentage in EVERY path, then "Removing background…" with elapsed seconds), privacy line repeated during processing, live preset-composite preview rendering on 360px Android screens. Validator checks carried from round 4: cutouts come back free of stray blobs/smudges with no user action; cast shadows gone by default and a plain-words "Remove shadow" toggle (default ON) flips it back; export centers the subject (no top-left dead space); row thumbnails are larger and clickable into a full result; a "Sizes…" control lets one ZIP carry multiple presets; "Couldn't download… tap Retry" replaces "Failed to fetch"; "Add more photos" appends to a finished batch; exiting Touch up with unsaved strokes confirms before discarding; dropzone says "~10 seconds" per photo; no glued "ismarked" text. Carryover still required: per-photo Retry; "Check this one"; zoom/pan + feathered brush + preview-bg toggle; all five marketplaces in the subtitle; margin slider persists across photos. NEW for round 7 (neutralize the seller default — addresses the dominant R2 residual blocker, 6+ testers): (1) the preset chips lead with a NEUTRAL group FIRST (General & Social: Square/Story/Link-Ad/Slide 16:9/Custom) and Marketplaces SECOND — a cold non-seller does NOT scan past four resale sites to reach their size; (2) the DEFAULT selected preset is a neutral size (Square 1080×1080) so the live preview reads "Square 1080×1080" and the default download button reads "Square," NOT "(eBay)"; (3) ALL marketplace presets remain fully available and one tap away (seller case not regressed); (4) the "eBay's own photo guidelines" line is NOT the lone social-proof subline under the subhead — demoted to one neutral use-case item or beside the marketplace presets; (5) the use-case line leads with "Headshots & avatars" so a face/headshot user is explicitly addressed (Priya value=No); (6) margin help reads "Space around the subject," not "...product"; (7) a discoverable "Touch up to refine hair/edges" affordance sits prominently beside the result with honest expectations (no perfect-hair promise). Carryover from round 6: headline + subhead name the cutout-on-any-background OUTCOME; three background outcomes previewed above the fold BEFORE processing; section titled "Export background"; download-button label updates SYNCHRONOUSLY with mode/chip/swatch/hex (never stale "· white"); switching size preset (incl. Custom) does NOT reset background mode or hex; export-controls cluster reliably renders after every cutout (no silent no-op). Carryover from round 5: default White exports byte-for-byte like today; Color reveals inline swatches + native picker + #RRGGBB without pushing preview/queue off-screen; Color #FF0000 → red corner pixels at preset size respecting margin; Transparent → preset-sized PNG with alpha-0 corners; mode + color survive "Start over" and photo switches; ZIP bundles every photo in the active mode/color.
