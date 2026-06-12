# Panel synthesis — listingcut round 1

URL tested: https://listingcut-bdvk0kpc7-elainegao.vercel.app
Exit bar: ≥9/10 testers with advocacy ≥9 AND clarity=Yes AND value=Yes. **Result: 0/10 at bar. Loop continues.**

## Score table

| # | Persona | Clarity | Value | Advocacy |
|---|---------|---------|-------|----------|
| 1 | Darlene (low-tech eBay, iPhone) | Yes | Yes | 8 |
| 2 | Marcus (Poshmark 80/wk, Mac) | Yes | Marginal | 6 |
| 3 | Rita (Etsy ceramics, Edge) | Yes | Yes | 8 |
| 4 | Kevin (privacy-skeptic eng, Firefox) | Yes | Yes | 8 |
| 5 | Amara (Depop, Pixel 7) | Yes | Yes | 8 |
| 6 | Tom (low-tech Etsy, iPad) | Yes | Yes | 8 |
| 7 | Jess (designer skeptic, Mac) | Yes | Yes | 7 |
| 8 | Priya (Shopify/eBay batches, Win) | Yes | Yes | 6 |
| 9 | Caleb (sneaker skeptic, iPhone) | Yes | Marginal | 6 |
| 10 | Helen (FB Marketplace, Android) | Yes | Marginal | 5 |

Clarity is solved: 10/10 Yes — headline, marketplace sub-line, and privacy badge all land. Every point below the bar is value depth or trust, not comprehension.

## Complaints behind every score <9, grouped by cause

### A. Core action doesn't scale — no batch upload (RECURRING: T2, T3, T4, T5, T8)
The single biggest score-limiter, named by the heaviest target users. T2 (80 listings/wk): "the Start-over loop kills throughput — that's the gap between this and dropping Photoroom." T8 (20-photo Fiverr batches): "the adoption blocker." T3: sessions are 12+ photos. Fix: `multiple` file input + drag-drop of many files, sequential queue with per-item status, results list with per-item downloads and a download-all (ZIP) for the selected preset.

### B. Trust-breaking output flaws with no recovery tool (RECURRING: T7, T8, T10; echoed T2, T4)
T7 (torture test): leaf residue attached to subject, semi-transparent mask holes that bleed background into composites. T8: cast shadow kept → brown smudge on the "white" export, "can't trust output unsupervised." T10: leftover smudges, no clean-up tool. Model quality itself is fixed (imgly RMBG), so the recovery path is an erase/restore brush on the cutout before export. This is the decider for T7/T8/T10.

### C. Download hierarchy & jargon confuse low-tech users (RECURRING: T1, T6, T9, T10)
"Download PNG (transparent)" leads, checkerboard preview reads as "broken photo" (T6, T10), and users must guess which file eBay wants (T9). Fix: marketplace JPEG is the primary, size-named button; transparent PNG demoted to secondary with a plain-language hint ("PNG with no background — most marketplaces want the white JPEG above"); checkerboard preview labeled in plain words.

### D. Preset gaps and preset behavior (T5, T8, T10; T3, T4)
Depop seller sees no Depop preset (T5); Facebook Marketplace absent and unmentioned (T10); no custom/Shopify size (T8). T3 reports preset resetting to eBay between photos (T2 saw it persist — make persistence explicit/sticky regardless); T4 saw the download-button label lag the chip selection. Fix: add Depop 1280×1280 and Facebook 1200×1200 chips + a custom-size input; preset choice persists across photos; label updates synchronously.

### E. First-run model download surprises (T1, T4, T5, T9, T10)
~50 MB download disclosed only after upload (bad on mobile data — T5, T10); one of T1's three sessions never finished in 120s; T4 hit a long spinner state with no "downloading model" message; T9 nearly bailed at 17.6s. Fix: disclose "first photo downloads a ~50 MB model (one time)" on the drop zone before upload; ensure download-phase message+percent shows in every path; keep elapsed-seconds counter.

### F. Single-persona items (judgment calls)
- T9: page never says *why* white backgrounds matter → one line of copy ("eBay & Poshmark feature white-background photos; clean listings sell faster"). Cheap, include.
- T10: live preview rendered as empty grey box on Android Chrome 360px (downloaded file fine) → real bug, fix.
- T10: wants a Facebook preset (covered in D). FB Marketplace doesn't require white bg — adjacent persona; preset + copy is enough, not building a FB-specific flow.
- T1: iPhone guidance for getting the JPEG into camera roll → one-line hint near download buttons on iOS. Cheap, include.
- T4: `vercel.live` third-party script undermines the privacy pitch → that's the Vercel preview-deploy toolbar, absent on production; no code change. Note for report.
- T4/T2: per-photo ~11–24s even cached — model-bound; batch queue (A) absorbs the wait. No separate fix.
- T3: margin/placement control — deprioritized: single-persona, scope creep; default 6% margin satisfied others.

## Round 2 fix list (each maps to complaints above)
1. Batch upload + queue + per-item results + ZIP download-all (A — T2,T3,T4,T5,T8)
2. Erase/restore touch-up brush on cutout (B — T7,T8,T10)
3. Reorder downloads: preset JPEG primary, PNG secondary + plain-language hints (C — T1,T6,T9,T10)
4. Presets: add Depop 1280×1280, Facebook 1200×1200, custom size; sticky selection; synchronous label (D — T3,T4,T5,T8,T10)
5. Pre-upload model-size disclosure + robust download-phase progress in all paths (E — T1,T4,T5,T9,T10)
6. "Why white backgrounds" line (T9); Android preview grey-box bug (T10); iOS camera-roll hint (T1)
