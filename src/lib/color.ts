export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export function normalizeHexColor(input: string) {
  const raw = input.trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return (
      "#" +
      hex
        .split("")
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    );
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return "#" + hex.toLowerCase();
  return null;
}

export function hexToRgb(hexInput: string): Rgb | null {
  const hex = normalizeHexColor(hexInput);
  if (!hex) return null;

  const value = parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6;
    else if (max === gg) h = (bb - rr) / delta + 2;
    else h = (rr - gg) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

export function hexToHslCssValue(hexInput: string) {
  const rgb = hexToRgb(hexInput);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb);
  const hh = Math.round(h);
  const ss = Math.round(s * 100);
  const ll = Math.round(l * 100);
  return `${hh} ${ss}% ${ll}%`;
}

function srgbToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: Rgb) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function readableForegroundHsl(hexInput: string) {
  const rgb = hexToRgb(hexInput);
  if (!rgb) return null;
  const lum = relativeLuminance(rgb);
  const darkText = "228 39% 7%";
  const lightText = "210 40% 98%";
  return lum > 0.52 ? darkText : lightText;
}

export function clampHexColor(input: string, fallback: string) {
  const normalized = normalizeHexColor(input);
  return normalized ?? fallback;
}
