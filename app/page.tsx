"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Preset = {
  id: string;
  label: string;
  chip: string;
  width: number | "square";
  height: number | "square";
  sizeText: string;
};

const PRESETS: Preset[] = [
  {
    id: "ebay",
    label: "eBay",
    chip: "eBay 1600×1600",
    width: 1600,
    height: 1600,
    sizeText: "1600×1600",
  },
  {
    id: "etsy",
    label: "Etsy",
    chip: "Etsy 2000×2000",
    width: 2000,
    height: 2000,
    sizeText: "2000×2000",
  },
  {
    id: "poshmark",
    label: "Poshmark",
    chip: "Poshmark square",
    width: "square",
    height: "square",
    sizeText: "1200×1200",
  },
];

const POSHMARK_SIZE = 1200;

type Phase = "idle" | "downloading" | "removing" | "done" | "error";

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "20px 20px",
};

function presetCanvasSize(preset: Preset): { w: number; h: number } {
  if (preset.width === "square" || preset.height === "square") {
    return { w: POSHMARK_SIZE, h: POSHMARK_SIZE };
  }
  return { w: preset.width, h: preset.height };
}

/** Find the bounding box of non-transparent pixels in the cutout. */
function trimBounds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): { x: number; y: number; w: number; h: number } {
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w, h }; // nothing detected; use full image
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      type,
      quality
    );
  });
}

/** Composite the trimmed cutout centered on a white canvas of the preset size. */
async function compositeWhite(
  cutoutUrl: string,
  targetW: number,
  targetH: number
): Promise<Blob> {
  const img = await loadImage(cutoutUrl);
  const src = document.createElement("canvas");
  src.width = img.naturalWidth;
  src.height = img.naturalHeight;
  const srcCtx = src.getContext("2d", { willReadFrequently: true })!;
  srcCtx.drawImage(img, 0, 0);
  const b = trimBounds(srcCtx, src.width, src.height);

  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);

  const margin = 0.06; // 6% white border around the subject
  const boxW = targetW * (1 - margin * 2);
  const boxH = targetH * (1 - margin * 2);
  const scale = Math.min(boxW / b.w, boxH / b.h);
  const drawW = b.w * scale;
  const drawH = b.h * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    src,
    b.x,
    b.y,
    b.w,
    b.h,
    (targetW - drawW) / 2,
    (targetH - drawH) / 2,
    drawW,
    drawH
  );
  return canvasToBlob(out, "image/jpeg", 0.92);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [downloadPct, setDownloadPct] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [baseName, setBaseName] = useState("photo");
  const [presetId, setPresetId] = useState("ebay");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelCachedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const processing = phase === "downloading" || phase === "removing";

  const process = useCallback(async (blob: Blob, name: string) => {
    setError(null);
    setBaseName(name.replace(/\.[^.]+$/, "") || "photo");
    setCutoutUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCutoutBlob(null);
    setPreviewUrl(null);
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setDownloadPct(modelCachedRef.current ? 100 : 0);
    setPhase(modelCachedRef.current ? "removing" : "downloading");
    setElapsed(0);
    const startedAt = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    try {
      // Dynamic import keeps the ~MB inference runtime out of the initial
      // bundle and guarantees it only ever loads in the browser.
      const { removeBackground } = await import("@imgly/background-removal");
      const result = await removeBackground(blob, {
        progress: (key: string, current: number, total: number) => {
          if (key.startsWith("fetch")) {
            setDownloadPct(total > 0 ? Math.round((current / total) * 100) : 0);
            if (total > 0 && current >= total) setPhase("removing");
          } else {
            setPhase("removing");
          }
        },
        output: { format: "image/png" },
      });
      modelCachedRef.current = true;
      setCutoutBlob(result);
      setCutoutUrl(URL.createObjectURL(result));
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Background removal failed");
      setPhase("error");
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        setError("Please drop a JPEG or PNG image.");
        setPhase("error");
        return;
      }
      void process(file, file.name);
    },
    [process]
  );

  const trySample = useCallback(async () => {
    // Rasterize the bundled SVG sample to a PNG blob, then run the same
    // pipeline a real photo would go through.
    const img = await loadImage("/sample.svg");
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    canvas.getContext("2d")!.drawImage(img, 0, 0, 800, 800);
    const blob = await canvasToBlob(canvas, "image/png");
    void process(blob, "sample-mug");
  }, [process]);

  // Regenerate the live white-background composite preview when the preset
  // or the cutout changes.
  useEffect(() => {
    if (!cutoutUrl) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    const p = PRESETS.find((x) => x.id === presetId)!;
    const { w, h } = presetCanvasSize(p);
    compositeWhite(cutoutUrl, w, h)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [cutoutUrl, presetId]);

  const downloadPng = useCallback(() => {
    if (cutoutBlob) downloadBlob(cutoutBlob, `${baseName}-cutout.png`);
  }, [cutoutBlob, baseName]);

  const downloadJpeg = useCallback(async () => {
    if (!cutoutUrl) return;
    setExporting(true);
    try {
      const { w, h } = presetCanvasSize(preset);
      const blob = await compositeWhite(cutoutUrl, w, h);
      downloadBlob(blob, `${baseName}-${preset.id}-${w}x${h}.jpg`);
    } finally {
      setExporting(false);
    }
  }, [cutoutUrl, preset, baseName]);

  return (
    <main className="flex-1 bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-12 sm:pt-16">
        {/* Hero */}
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            ListingCut
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Listing-ready product photos in your browser
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Remove the background, get a white-background JPEG sized for eBay,
            Etsy, or Poshmark — free, no upload, no signup.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
            Your photo never leaves this device — everything runs in your
            browser
          </div>
        </header>

        {/* Drop zone / status card / results */}
        <section className="mt-10">
          {phase === "idle" || phase === "error" ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Drag and drop an image or click to upload"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragOver
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-300 bg-white hover:border-sky-400"
              }`}
            >
              <p className="text-xl font-semibold">
                Drag &amp; drop an image or click to upload
              </p>
              <p className="mt-1 text-sm text-slate-500">
                JPEG or PNG · processed entirely on this device
              </p>

              {/* Worked example inside the drop zone */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <figure className="w-28 sm:w-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/sample.svg"
                    alt="Sample product photo: mug on a cluttered background"
                    className="w-full rounded-lg border border-slate-200"
                  />
                  <figcaption className="mt-1 text-xs text-slate-500">
                    Your photo
                  </figcaption>
                </figure>
                <span className="text-2xl text-slate-400" aria-hidden="true">
                  →
                </span>
                <figure className="w-28 sm:w-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/sample-cutout.svg"
                    alt="Same mug on a clean white listing background"
                    className="w-full rounded-lg border border-slate-200"
                  />
                  <figcaption className="mt-1 text-xs text-slate-500">
                    White-bg listing photo
                  </figcaption>
                </figure>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void trySample();
                }}
                className="mt-5 text-sm font-semibold text-sky-600 underline underline-offset-4 hover:text-sky-700"
              >
                Try the sample
              </button>

              {phase === "error" && error ? (
                <p className="mt-5 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error} — try another image.
                </p>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          ) : null}

          {processing ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm">
              <h2 className="text-lg font-semibold">Working on your photo…</h2>
              <p className="mt-1 text-sm text-slate-500">
                First run takes longer while the model downloads; next photos
                are fast.
              </p>

              <div className="mt-6 space-y-5">
                {/* Step 1: model download */}
                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span
                      className={
                        phase === "downloading"
                          ? "text-sky-700"
                          : "text-slate-400"
                      }
                    >
                      1. Downloading model (one-time, ~50 MB)
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {downloadPct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                      style={{ width: `${downloadPct}%` }}
                    />
                  </div>
                </div>

                {/* Step 2: inference */}
                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span
                      className={
                        phase === "removing"
                          ? "text-sky-700"
                          : "text-slate-400"
                      }
                    >
                      2. Removing background…
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {elapsed}s
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    {phase === "removing" ? (
                      <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-sky-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-sm font-medium text-emerald-700">
                Processing locally, nothing uploaded.
              </p>
            </div>
          ) : null}

          {phase === "done" && originalUrl && cutoutUrl ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Done — here’s your cutout</h2>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("idle");
                    setError(null);
                  }}
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  Start over
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original photo"
                    className="aspect-square w-full rounded-lg border border-slate-200 object-contain"
                  />
                  <figcaption className="mt-1 text-xs text-slate-500">
                    Original
                  </figcaption>
                </figure>
                <figure>
                  <div
                    className="aspect-square w-full overflow-hidden rounded-lg border border-slate-200"
                    style={CHECKERBOARD}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cutoutUrl}
                      alt="Cutout with transparent background"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <figcaption className="mt-1 text-xs text-slate-500">
                    Cutout (transparent)
                  </figcaption>
                </figure>
              </div>

              <button
                type="button"
                onClick={downloadPng}
                className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Download PNG (transparent)
              </button>
            </div>
          ) : null}
        </section>

        {/* Presets — visible from second zero */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">
            Marketplace export{" "}
            <span className="font-normal text-slate-500">
              — white background, exact size
            </span>
          </h2>
          {phase !== "done" ? (
            <p className="mt-1 text-sm text-slate-500">Drop a photo first.</p>
          ) : null}
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Marketplace preset"
          >
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={presetId === p.id}
                disabled={phase !== "done"}
                onClick={() => setPresetId(p.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  presetId === p.id && phase === "done"
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-sky-400"
                }`}
              >
                {p.chip}
              </button>
            ))}
          </div>

          {phase === "done" ? (
            <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row">
              <figure className="w-40">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`White-background preview at ${preset.chip}`}
                    className="w-full rounded-lg border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="aspect-square w-full animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
                )}
                <figcaption className="mt-1 text-xs text-slate-500">
                  Live preview · {preset.chip}
                </figcaption>
              </figure>
              <button
                type="button"
                onClick={() => void downloadJpeg()}
                disabled={exporting}
                className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {exporting
                  ? "Preparing JPEG…"
                  : `Download ${preset.sizeText} JPEG`}
              </button>
            </div>
          ) : null}
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          All processing happens in your browser with an open-source model —
          your images are never uploaded to any server.
        </footer>
      </div>
    </main>
  );
}
