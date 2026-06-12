"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Preset = {
  id: string;
  label: string;
  chip: string;
  width: number | "square" | "custom";
  height: number | "square" | "custom";
};

const PRESETS: Preset[] = [
  { id: "ebay", label: "eBay", chip: "eBay 1600×1600", width: 1600, height: 1600 },
  { id: "etsy", label: "Etsy", chip: "Etsy 2000×2000", width: 2000, height: 2000 },
  {
    id: "poshmark",
    label: "Poshmark",
    chip: "Poshmark square",
    width: "square",
    height: "square",
  },
  { id: "depop", label: "Depop", chip: "Depop 1280×1280", width: 1280, height: 1280 },
  {
    id: "facebook",
    label: "Facebook",
    chip: "Facebook 1200×1200",
    width: 1200,
    height: 1200,
  },
  { id: "custom", label: "Custom", chip: "Custom", width: "custom", height: "custom" },
];

const POSHMARK_SIZE = 1200;
const MAX_FILES = 20;
const PREVIEW_MAX = 480; // small preview canvas: fast + avoids mobile canvas limits

type Phase = "idle" | "downloading" | "removing";

type ItemStatus = "waiting" | "processing" | "done" | "error";

type QueueItem = {
  id: string;
  name: string;
  baseName: string;
  file: Blob;
  originalUrl: string;
  cutoutUrl: string | null;
  cutoutBlob: Blob | null;
  status: ItemStatus;
  error?: string;
};

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "20px 20px",
};

function clampDim(raw: string, fallback: number): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(4000, Math.max(200, n));
}

function presetDims(
  preset: Preset,
  customW: string,
  customH: string
): { w: number; h: number } {
  if (preset.width === "square") return { w: POSHMARK_SIZE, h: POSHMARK_SIZE };
  if (preset.width === "custom")
    return { w: clampDim(customW, 2000), h: clampDim(customH, 2000) };
  return { w: preset.width as number, h: preset.height as number };
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

/* ---------------------------------------------------------------------------
 * Touch-up editor: erase/restore brush over the cutout, faint original below.
 * ------------------------------------------------------------------------- */

function TouchUpEditor({
  cutoutUrl,
  originalUrl,
  onDone,
  onCancel,
}: {
  cutoutUrl: string;
  originalUrl: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const undoStack = useRef<HTMLCanvasElement[]>([]);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<"erase" | "restore">("erase");
  const [brush, setBrush] = useState(28);
  const [ready, setReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadImage(cutoutUrl), loadImage(originalUrl)])
      .then(([cut, orig]) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = cut.naturalWidth;
        canvas.height = cut.naturalHeight;
        canvas.getContext("2d")!.drawImage(cut, 0, 0);
        originalImgRef.current = orig;
        const mask = document.createElement("canvas");
        mask.width = canvas.width;
        mask.height = canvas.height;
        maskRef.current = mask;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [cutoutUrl, originalUrl]);

  const toCanvasPt = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
      scale: canvas.width / rect.width,
    };
  }, []);

  const applySegment = useCallback(
    (
      a: { x: number; y: number },
      b: { x: number; y: number },
      brushPx: number
    ) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const strokePath = (c: CanvasRenderingContext2D) => {
        c.lineCap = "round";
        c.lineJoin = "round";
        c.lineWidth = brushPx;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x + 0.01, b.y + 0.01); // ensure dots render
        c.stroke();
      };
      if (tool === "erase") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        strokePath(ctx);
        ctx.restore();
      } else {
        const mask = maskRef.current!;
        const mctx = mask.getContext("2d")!;
        mctx.save();
        mctx.globalCompositeOperation = "source-over";
        mctx.clearRect(0, 0, mask.width, mask.height);
        mctx.strokeStyle = "#fff";
        strokePath(mctx);
        mctx.globalCompositeOperation = "source-in";
        mctx.drawImage(originalImgRef.current!, 0, 0, mask.width, mask.height);
        mctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(mask, 0, 0);
        ctx.restore();
      }
    },
    [tool]
  );

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current!;
    const snap = document.createElement("canvas");
    snap.width = canvas.width;
    snap.height = canvas.height;
    snap.getContext("2d")!.drawImage(canvas, 0, 0);
    undoStack.current.push(snap);
    if (undoStack.current.length > 15) undoStack.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const snap = undoStack.current.pop();
    if (!canvas || !snap) return;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(snap, 0, 0);
    ctx.restore();
    setCanUndo(undoStack.current.length > 0);
  }, []);

  const finish = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const blob = await canvasToBlob(canvas, "image/png");
      onDone(blob);
    } finally {
      setSaving(false);
    }
  }, [onDone]);

  return (
    <div>
      <p className="text-sm text-slate-600">
        Fix spots the auto-cutout missed — <strong>Erase</strong> removes leftover
        smudges or shadows, <strong>Restore</strong> paints the product back.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-300 p-0.5" role="radiogroup" aria-label="Touch-up tool">
          {(["erase", "restore"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tool === t}
              onClick={() => setTool(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize ${
                tool === t ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Size{" "}
          <input
            type="range"
            min={8}
            max={80}
            value={brush}
            onChange={(e) => setBrush(Number(e.target.value))}
            className="w-28 accent-sky-600"
          />
        </label>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Undo
        </button>
      </div>

      {loadError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Couldn’t open the editor for this photo.
        </p>
      ) : (
        <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-fill opacity-25"
          />
          <canvas
            ref={canvasRef}
            className="relative block h-auto w-full cursor-crosshair touch-none"
            onPointerDown={(e) => {
              if (!ready) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pushUndo();
              drawing.current = true;
              const pt = toCanvasPt(e);
              lastPt.current = pt;
              applySegment(pt, pt, brush * pt.scale);
            }}
            onPointerMove={(e) => {
              if (!drawing.current || !lastPt.current) return;
              const pt = toCanvasPt(e);
              applySegment(lastPt.current, pt, brush * pt.scale);
              lastPt.current = pt;
            }}
            onPointerUp={() => {
              drawing.current = false;
              lastPt.current = null;
            }}
            onPointerCancel={() => {
              drawing.current = false;
              lastPt.current = null;
            }}
          />
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => void finish()}
          disabled={!ready || saving}
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Done"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Main page
 * ------------------------------------------------------------------------- */

export default function Home() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [downloadPct, setDownloadPct] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [presetId, setPresetId] = useState("ebay"); // sticky across photos + start over
  const [customW, setCustomW] = useState("2000");
  const [customH, setCustomH] = useState("2000");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelCachedRef = useRef(false);
  const runningRef = useRef(false);
  const idRef = useRef(0);
  const itemsRef = useRef<QueueItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const dims = presetDims(preset, customW, customH);
  const sizeName =
    preset.id === "custom" ? `Custom ${dims.w}×${dims.h}` : preset.chip;
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const doneItems = items.filter((i) => i.status === "done");
  const anyProcessing = items.some(
    (i) => i.status === "processing" || i.status === "waiting"
  );
  const processingItem = items.find((i) => i.status === "processing") ?? null;

  useEffect(() => {
    const t = setTimeout(() => {
      const ua = navigator.userAgent;
      setIsIOS(
        /iPad|iPhone|iPod/.test(ua) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    itemsRef.current = itemsRef.current.map((i) =>
      i.id === id ? { ...i, ...patch } : i
    );
    setItems(itemsRef.current);
  }, []);

  const processItem = useCallback(
    async (item: QueueItem) => {
      updateItem(item.id, { status: "processing" });
      setDownloadPct(modelCachedRef.current ? 100 : 0);
      setPhase(modelCachedRef.current ? "removing" : "downloading");
      setElapsed(0);
      const startedAt = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      }, 1000);
      try {
        // Dynamic import keeps the inference runtime out of the initial bundle
        // and guarantees it only ever loads in the browser.
        const { removeBackground } = await import("@imgly/background-removal");
        const result = await removeBackground(item.file, {
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
        updateItem(item.id, {
          status: "done",
          cutoutBlob: result,
          cutoutUrl: URL.createObjectURL(result),
        });
        // First finished result opens large automatically.
        setSelectedId((prev) => prev ?? item.id);
      } catch (e) {
        updateItem(item.id, {
          status: "error",
          error: e instanceof Error ? e.message : "Background removal failed",
        });
      } finally {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [updateItem]
  );

  const pump = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      for (;;) {
        const next = itemsRef.current.find((i) => i.status === "waiting");
        if (!next) break;
        await processItem(next);
      }
    } finally {
      runningRef.current = false;
      setPhase("idle");
    }
  }, [processItem]);

  const enqueue = useCallback(
    (files: { blob: Blob; name: string }[]) => {
      setError(null);
      const room = MAX_FILES - itemsRef.current.length;
      const accepted = files.slice(0, Math.max(0, room));
      if (accepted.length === 0) return;
      const newItems: QueueItem[] = accepted.map(({ blob, name }) => {
        idRef.current += 1;
        return {
          id: `q${idRef.current}`,
          name,
          baseName: name.replace(/\.[^.]+$/, "") || "photo",
          file: blob,
          originalUrl: URL.createObjectURL(blob),
          cutoutUrl: null,
          cutoutBlob: null,
          status: "waiting",
        };
      });
      itemsRef.current = [...itemsRef.current, ...newItems];
      setItems(itemsRef.current);
      void pump();
    },
    [pump]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const list = Array.from(files ?? []);
      const valid = list.filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type));
      if (list.length > 0 && valid.length === 0) {
        setError("Please drop JPEG or PNG images.");
        return;
      }
      enqueue(valid.map((f) => ({ blob: f, name: f.name })));
    },
    [enqueue]
  );

  const trySample = useCallback(async () => {
    // Rasterize the bundled SVG sample to a PNG blob, then run it through the
    // exact pipeline a real photo takes (incl. the model-download progress UI).
    const img = await loadImage("/sample.svg");
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    canvas.getContext("2d")!.drawImage(img, 0, 0, 800, 800);
    const blob = await canvasToBlob(canvas, "image/png");
    enqueue([{ blob, name: "sample-mug.png" }]);
  }, [enqueue]);

  const startOver = useCallback(() => {
    for (const it of itemsRef.current) {
      URL.revokeObjectURL(it.originalUrl);
      if (it.cutoutUrl) URL.revokeObjectURL(it.cutoutUrl);
    }
    itemsRef.current = [];
    setItems([]);
    setSelectedId(null);
    setEditing(false);
    setError(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    // presetId / custom size deliberately untouched: selection is sticky.
  }, []);

  // Regenerate the live white-background composite preview when the selected
  // cutout or the preset changes. Rendered small (≤480px) so it stays fast and
  // inside mobile canvas limits.
  const selectedCutoutUrl = selected?.cutoutUrl ?? null;
  useEffect(() => {
    if (!selectedCutoutUrl) return;
    let cancelled = false;
    const p = PRESETS.find((x) => x.id === presetId)!;
    const { w, h } = presetDims(p, customW, customH);
    const scale = PREVIEW_MAX / Math.max(w, h);
    compositeWhite(
      selectedCutoutUrl,
      Math.max(1, Math.round(w * scale)),
      Math.max(1, Math.round(h * scale))
    )
      .then((blob) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        setPreviewFailed(false);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => {
        if (!cancelled) setPreviewFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCutoutUrl, presetId, customW, customH]);

  const downloadPng = useCallback(() => {
    if (selected?.cutoutBlob)
      downloadBlob(selected.cutoutBlob, `${selected.baseName}-cutout.png`);
  }, [selected]);

  const exportJpegFor = useCallback(
    async (item: QueueItem) => {
      if (!item.cutoutUrl) return null;
      const blob = await compositeWhite(item.cutoutUrl, dims.w, dims.h);
      return {
        blob,
        filename: `${item.baseName}-${preset.id}-${dims.w}x${dims.h}.jpg`,
      };
    },
    [dims.w, dims.h, preset.id]
  );

  const downloadJpeg = useCallback(
    async (item: QueueItem) => {
      setExporting(true);
      try {
        const out = await exportJpegFor(item);
        if (out) downloadBlob(out.blob, out.filename);
      } finally {
        setExporting(false);
      }
    },
    [exportJpegFor]
  );

  const downloadZip = useCallback(async () => {
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Set<string>();
      for (const item of itemsRef.current.filter((i) => i.status === "done")) {
        const out = await exportJpegFor(item);
        if (!out) continue;
        let name = out.filename;
        let n = 2;
        while (used.has(name)) {
          name = out.filename.replace(/\.jpg$/, `-${n}.jpg`);
          n += 1;
        }
        used.add(name);
        zip.file(name, out.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `listingcut-${preset.id}-${dims.w}x${dims.h}.zip`);
    } finally {
      setZipping(false);
    }
  }, [exportJpegFor, preset.id, dims.w, dims.h]);

  const statusText = (item: QueueItem) => {
    switch (item.status) {
      case "waiting":
        return "Waiting…";
      case "processing":
        return phase === "downloading"
          ? `Downloading model… ${downloadPct}%`
          : "Removing background…";
      case "done":
        return "Done";
      case "error":
        return item.error ?? "Failed";
    }
  };

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
            Remove the background, get a white-background JPEG sized for your
            marketplace — free, no upload, no signup.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
            eBay &amp; Poshmark feature white-background photos — clean listings
            sell faster.
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
            </svg>{" "}
            Your photo never leaves this device — everything runs in your
            browser
          </div>
        </header>

        {/* Drop zone / queue / results */}
        <section className="mt-10">
          {items.length === 0 ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Drag and drop photos or click to upload"
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
                Drag &amp; drop photos (up to 20) or click to upload
              </p>
              <p className="mt-1 text-sm text-slate-500">
                JPEG or PNG · processed entirely on this device
              </p>
              {/* Pre-upload disclosure: batch + one-time model download */}
              <p className="mt-3 text-sm text-slate-600">
                Drop up to 20 photos at once — they’re processed one by one.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                First photo downloads a one-time ~50 MB tool — after that it’s
                fast.
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

              {error ? (
                <p className="mt-5 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error} — try another image.
                </p>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Your photos{" "}
                  <span className="font-normal text-slate-500">
                    ({doneItems.length}/{items.length} done)
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={startOver}
                  disabled={anyProcessing}
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-40"
                >
                  Start over
                </button>
              </div>

              {/* Queue: plain vertical list, one row per photo */}
              <ul className="mt-4 divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.status === "done") {
                          setSelectedId(item.id);
                          setEditing(false);
                        }
                      }}
                      disabled={item.status !== "done"}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left ${
                        item.id === selectedId ? "ring-2 ring-sky-500 ring-offset-2" : ""
                      } ${item.status === "done" ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span
                        className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200"
                        style={item.cutoutUrl ? CHECKERBOARD : undefined}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.cutoutUrl ?? item.originalUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {item.name}
                        </span>
                        <span
                          className={`block text-xs ${
                            item.status === "error"
                              ? "text-red-600"
                              : item.status === "done"
                                ? "text-emerald-600"
                                : "text-slate-500"
                          }`}
                        >
                          {statusText(item)}
                        </span>
                      </span>
                    </button>
                    {item.status === "done" ? (
                      <button
                        type="button"
                        aria-label={`Download ${item.name} as white JPEG`}
                        onClick={() => void downloadJpeg(item)}
                        disabled={exporting}
                        className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Download
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>

              {doneItems.length >= 2 ? (
                <button
                  type="button"
                  onClick={() => void downloadZip()}
                  disabled={zipping}
                  className="mt-3 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                >
                  {zipping
                    ? "Preparing ZIP…"
                    : `Download all (ZIP) — ${doneItems.length} photos, ${sizeName}`}
                </button>
              ) : null}
            </div>
          )}

          {processingItem ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm">
              <h2 className="text-lg font-semibold">Working on your photo…</h2>
              <p className="mt-1 text-sm text-slate-500">
                {processingItem.name} — first run takes longer while the model
                downloads; next photos are fast.
              </p>

              <div className="mt-6 space-y-5">
                {/* Step 1: model download */}
                <div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span
                      className={
                        phase === "downloading" ? "text-sky-700" : "text-slate-400"
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
                        phase === "removing" ? "text-sky-700" : "text-slate-400"
                      }
                    >
                      2. Removing background…
                    </span>
                    <span className="tabular-nums text-slate-500">{elapsed}s</span>
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

          {selected && selected.status === "done" && selected.cutoutUrl ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Done — here’s your cutout</h2>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Touch up
                  </button>
                ) : null}
              </div>

              {editing ? (
                <div className="mt-4">
                  <TouchUpEditor
                    cutoutUrl={selected.cutoutUrl}
                    originalUrl={selected.originalUrl}
                    onDone={(blob) => {
                      const oldUrl = selected.cutoutUrl;
                      updateItem(selected.id, {
                        cutoutBlob: blob,
                        cutoutUrl: URL.createObjectURL(blob),
                      });
                      if (oldUrl) URL.revokeObjectURL(oldUrl);
                      setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.originalUrl}
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
                          src={selected.cutoutUrl}
                          alt="Cutout with transparent background"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <figcaption className="mt-1 text-xs text-slate-500">
                        Checkered area = transparent (no background)
                      </figcaption>
                    </figure>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Stray smudge or missing edge? Use <strong>Touch up</strong> to
                    fix spots the auto-cutout missed.
                  </p>
                </>
              )}
            </div>
          ) : null}
        </section>

        {/* Presets + downloads */}
        <section className="mt-8">
          <h2 className="text-base font-semibold">
            Marketplace export{" "}
            <span className="font-normal text-slate-500">
              — white background, exact size
            </span>
          </h2>
          {doneItems.length === 0 ? (
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
                disabled={doneItems.length === 0}
                onClick={() => setPresetId(p.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  presetId === p.id && doneItems.length > 0
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-sky-400"
                }`}
              >
                {p.chip}
              </button>
            ))}
          </div>

          {presetId === "custom" ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <label className="flex items-center gap-1.5">
                Width{" "}
                <input
                  type="number"
                  min={200}
                  max={4000}
                  value={customW}
                  disabled={doneItems.length === 0}
                  onChange={(e) => setCustomW(e.target.value)}
                  onBlur={() => setCustomW(String(clampDim(customW, 2000)))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 tabular-nums"
                />
              </label>
              <span className="text-slate-400">×</span>
              <label className="flex items-center gap-1.5">
                Height{" "}
                <input
                  type="number"
                  min={200}
                  max={4000}
                  value={customH}
                  disabled={doneItems.length === 0}
                  onChange={(e) => setCustomH(e.target.value)}
                  onBlur={() => setCustomH(String(clampDim(customH, 2000)))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 tabular-nums"
                />
              </label>
              <span className="text-slate-500">px</span>
            </div>
          ) : null}

          {selected && selected.status === "done" ? (
            <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row">
              <figure className="w-40 max-w-full">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`White-background preview at ${preset.chip}`}
                    width={dims.w}
                    height={dims.h}
                    className="block h-auto w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                  />
                ) : previewFailed ? (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-center text-xs text-slate-500">
                    Preview unavailable — the download still works.
                  </div>
                ) : (
                  <div className="aspect-square w-full animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
                )}
                <figcaption className="mt-1 text-xs text-slate-500">
                  Live preview · {sizeName}
                </figcaption>
              </figure>
              <div className="w-full sm:flex-1">
                <button
                  type="button"
                  onClick={() => void downloadJpeg(selected)}
                  disabled={exporting}
                  className="w-full rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
                >
                  {exporting
                    ? "Preparing JPEG…"
                    : `Download white JPEG — ${dims.w}×${dims.h} (${preset.label})`}
                </button>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={downloadPng}
                    className="w-full rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                  >
                    Download transparent PNG
                  </button>
                  <p className="mt-1.5 text-xs text-slate-500">
                    PNG with no background — most marketplaces want the white
                    JPEG above.
                  </p>
                </div>
                {isIOS ? (
                  <p className="mt-3 text-xs text-slate-500">
                    On iPhone: tap Download, then Save Image to add it to your
                    camera roll.
                  </p>
                ) : null}
              </div>
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
