import type { AsciiResult, AsciiSettings } from "./types";

type ImageSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function loadImageSource(file: File): Promise<ImageSource> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });

  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

export async function convertImageFileToAscii(
  file: File,
  settings: AsciiSettings,
): Promise<AsciiResult> {
  const {
    source,
    width: srcW,
    height: srcH,
    cleanup,
  } = await loadImageSource(file);

  try {
    const charsetRaw = settings.charset.trim().length
      ? settings.charset
      : " .:-=+*#%@";
    const charset = Array.from(charsetRaw);
    const lastIndex = Math.max(0, charset.length - 1);
    const charAspect = 0.55;

    const outW = clamp(Math.round(settings.width), 40, 320);
    const outH = clamp(Math.round((outW * charAspect * srcH) / srcW), 10, 320);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    ctx.drawImage(source, 0, 0, outW, outH);
    const imageData = ctx.getImageData(0, 0, outW, outH);
    const data = imageData.data;

    const colors = new Uint8ClampedArray(outW * outH * 3);
    const lines = new Array<string>(outH);

    for (let y = 0; y < outH; y++) {
      const row: string[] = new Array(outW);
      for (let x = 0; x < outW; x++) {
        const idx = (y * outW + x) * 4;
        const r = data[idx] ?? 0;
        const g = data[idx + 1] ?? 0;
        const b = data[idx + 2] ?? 0;

        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const t = clamp(brightness / 255, 0, 1);
        const mapped = settings.invert ? t : 1 - t;
        const charIndex = Math.min(lastIndex, Math.floor(mapped * lastIndex));
        row[x] = charset[charIndex] ?? " ";

        const c = (y * outW + x) * 3;
        colors[c] = r;
        colors[c + 1] = g;
        colors[c + 2] = b;
      }

      lines[y] = row.join("");
      if (y % 24 === 0) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    }

    const text = lines.join("\n");
    return {
      fileName: file.name,
      width: outW,
      height: outH,
      lines,
      text,
      colors,
    };
  } finally {
    cleanup();
  }
}
