"use client";

import * as React from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { cn } from "../../../lib/utils";
import { useElementSize } from "../../../lib/useElementSize";
import { renderAsciiToCanvas } from "../render";
import type { AsciiResult, AsciiSettings } from "../types";
import {
  Copy,
  FileText,
  ImageIcon,
  RefreshCw,
  Trash2,
  Upload,
  Layers,
  Download,
} from "lucide-react";

// --- Helper Functions ---
const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 200);
};

function downloadCanvas(filename: string, canvas: HTMLCanvasElement) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildColoredHtml(result: AsciiResult, brighten = true) {
  if (!result.colors) return null;
  const { width, height, lines, colors } = result;
  let out = "";
  for (let y = 0; y < height; y++) {
    const line = lines[y] ?? "";
    let runKey = -1, runR = 0, runG = 0, runB = 0, runText = "";
    for (let x = 0; x < width; x++) {
      const char = line[x] ?? " ";
      const c = (y * width + x) * 3;
      let r = colors[c] ?? 0, g = colors[c + 1] ?? 0, b = colors[c + 2] ?? 0;
      if (brighten) {
        r = Math.min(255, Math.round(r * 1.15));
        g = Math.min(255, Math.round(g * 1.15));
        b = Math.min(255, Math.round(b * 1.15));
      }
      const key = (r << 16) | (g << 8) | b;
      if (runKey !== -1 && key !== runKey) {
        out += `<span style="color:rgb(${runR},${runG},${runB})">${escapeHtml(runText)}</span>`;
        runText = "";
      }
      if (runKey === -1 || key !== runKey) {
        runKey = key; runR = r; runG = g; runB = b;
      }
      runText += char;
    }
    if (runText) out += `<span style="color:rgb(${runR},${runG},${runB})">${escapeHtml(runText)}</span>`;
    out += "\n";
  }
  return out;
}

function isFileDrag(e: React.DragEvent) {
  return Array.from(e.dataTransfer.types ?? []).includes("Files");
}

export type ConverterCardProps = {
  result: AsciiResult | null;
  settings: AsciiSettings;
  isBusy?: boolean;
  canRegenerate?: boolean;
  onFile: (file: File) => void;
  onRegenerate?: () => void;
  onClear?: () => void;
};

export function ConverterCard({
  result,
  settings,
  isBusy,
  canRegenerate,
  onFile,
  onRegenerate,
  onClear,
}: ConverterCardProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const size = useElementSize(stageRef);

  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleFile = React.useCallback((file: File | undefined) => {
    if (file && file.type.startsWith("image/")) {
      onFile(file);
    }
  }, [onFile]);

  const onDrop = React.useCallback((e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const output = React.useMemo(() => {
    if (!result) return null;
    if (!settings.color) return { mode: "mono" as const };
    const html = buildColoredHtml(result, true);
    return html ? { mode: "html" as const, html } : { mode: "mono" as const };
  }, [result, settings.color]);

  const asciiStyle = React.useMemo(() => {
    if (!result || size.width < 40) return undefined;
    const pad = 48;
    const w = size.width - pad;
    const h = size.height - pad;
    const charAspect = 0.6;
    const fontW = w / (result.width * charAspect);
    const fontH = h / result.height;
    const fontSize = Math.max(2, Math.floor(Math.min(fontW, fontH)));

    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${fontSize}px`,
      letterSpacing: "0px",
      fontVariantLigatures: "none" as const,
      textRendering: "geometricPrecision" as const,
    };
  }, [result, size.width, size.height]);

  const onDownloadPng = React.useCallback(() => {
    if (!result) return;
    const canvas = document.createElement("canvas");
    renderAsciiToCanvas(canvas, settings.color ? result : { ...result, colors: undefined }, {
      fontSize: 16,
      charAspect: 0.6,
      background: "transparent",
      brightenColors: true,
      monoColor: "hsl(var(--primary))",
    });
    downloadCanvas("ascii.png", canvas);
  }, [result, settings.color]);

  return (
    <Card className="flex h-full min-h-0 flex-col shadow-2xl border-muted/40 bg-gradient-to-b from-card to-background overflow-hidden ring-1 ring-white/5">
      <CardHeader className="p-6 pb-4 border-b bg-muted/20 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl ring-1 ring-primary/20">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Asciiarter
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-60">
                Visual Processing Unit
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={isBusy}
            />

            <Button
              variant="default"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
              className="h-9 px-4 rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
            >
              <Upload className="h-4 w-4" /> 
              <span className="hidden sm:inline">Upload Image</span>
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

            {/* Export Actions Panel */}
            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-full border shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                disabled={!result || isBusy}
                className="h-7 w-7 sm:w-auto sm:h-7 rounded-full gap-1.5 px-2 text-xs hover:bg-primary/10"
              >
                <Copy className="h-3.5 w-3.5" /> 
                <span className="hidden md:inline font-medium">Copy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => result && downloadText("ascii.txt", result.text)}
                disabled={!result || isBusy}
                className="h-7 w-7 sm:w-auto sm:h-7 rounded-full gap-1.5 px-2 text-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden md:inline font-medium text-[10px]">TXT</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadPng}
                disabled={!result || isBusy}
                className="h-7 w-7 sm:w-auto sm:h-7 rounded-full gap-1.5 px-2 text-xs"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline font-medium text-[10px]">PNG</span>
              </Button>
            </div>

            <div className="flex items-center gap-1 ml-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={onRegenerate}
                disabled={!canRegenerate || isBusy}
                className="h-8 w-8 rounded-full transition-transform hover:rotate-180 duration-500"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isBusy && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={!result || isBusy}
                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-6">
        <div
          className={cn(
            "relative flex h-full min-h-0 items-stretch",
            "rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5",
            "overflow-hidden transition-all duration-300 ease-in-out",
            isDragging && "border-primary ring-4 ring-primary/10 bg-primary/5 scale-[0.99]",
            !result && "hover:border-muted-foreground/40"
          )}
          onDragOver={(e) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div
            ref={stageRef}
            className="relative grid h-full w-full place-items-center p-4 overflow-auto scrollbar-thin scrollbar-thumb-muted"
          >
            {!result ? (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Upload className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold tracking-tight">Drag & drop your masterpiece</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                    SVG, PNG, JPG, or WEBP
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <pre
                  className={cn(
                    "m-0 max-h-full max-w-full whitespace-pre font-mono leading-none",
                    "select-text cursor-text transition-all duration-500",
                    isBusy ? "opacity-20 blur-sm" : "opacity-100 blur-0"
                  )}
                  style={asciiStyle}
                  {...(output?.mode === "html"
                    ? { dangerouslySetInnerHTML: { __html: output.html } }
                    : { children: result.text })}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-3 border-t bg-muted/10 backdrop-blur-sm">
        {result ? (
          <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-tight">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background border shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="truncate max-w-[120px] text-foreground/80 font-medium lowercase">
                   {result.fileName}
                </span>
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground/80">
              <span className="px-2 py-0.5 rounded-md border bg-background/50">
                {result.width} <span className="opacity-40">×</span> {result.height}
              </span>
              <span className="px-2 py-0.5 rounded-md border bg-background/50 font-bold text-primary/80">
                {(result.text.length / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/20 border border-muted-foreground/10">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">Awaiting Input</span>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
             </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}