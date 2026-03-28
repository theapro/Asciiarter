import type { AsciiResult } from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type RenderAsciiParams = {
  fontSize: number;
  charAspect?: number;
  monoColor?: string;
  background?: string;
  brightenColors?: boolean;
};

export function renderAsciiToCanvas(
  canvas: HTMLCanvasElement,
  result: AsciiResult,
  params: RenderAsciiParams,
) {
  const charAspect = params.charAspect ?? 0.55;
  const fontSize = clamp(params.fontSize, 2, 64);

  canvas.width = Math.ceil(result.width * fontSize * charAspect);
  canvas.height = Math.ceil(result.height * fontSize);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

  if (params.background) {
    ctx.fillStyle = params.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (!result.colors) {
    ctx.fillStyle = params.monoColor ?? "#ffffff";
    for (let y = 0; y < result.lines.length; y++) {
      ctx.fillText(result.lines[y] ?? "", 0, Math.round(y * fontSize));
    }
    return;
  }

  const brighten = params.brightenColors ?? true;
  const colors = result.colors;

  for (let y = 0; y < result.height; y++) {
    const line = result.lines[y] ?? "";
    for (let x = 0; x < result.width; x++) {
      const char = line[x] ?? " ";
      const c = (y * result.width + x) * 3;
      let r = colors[c] ?? 0;
      let g = colors[c + 1] ?? 0;
      let b = colors[c + 2] ?? 0;

      if (brighten) {
        r = Math.min(255, Math.round(r * 1.15));
        g = Math.min(255, Math.round(g * 1.15));
        b = Math.min(255, Math.round(b * 1.15));
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillText(
        char,
        Math.round(x * fontSize * charAspect),
        Math.round(y * fontSize),
      );
    }
  }
}
