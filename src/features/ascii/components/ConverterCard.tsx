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
} from "lucide-react";

export type ConverterCardProps = {
  result: AsciiResult | null;
  settings: AsciiSettings;
  isBusy?: boolean;
  canRegenerate?: boolean;
  onFile: (file: File) => void;
  onRegenerate?: () => void;
  onClear?: () => void;
};

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
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildColoredHtml(result: AsciiResult, brighten = true) {
  if (!result.colors) return null;
  const { width, height, lines, colors } = result;

  let out = "";
  for (let y = 0; y < height; y++) {
    const line = lines[y] ?? "";

    let runKey = -1;
    let runR = 0;
    let runG = 0;
    let runB = 0;
    let runText = "";

    for (let x = 0; x < width; x++) {
      const char = line[x] ?? " ";
      const c = (y * width + x) * 3;
      let r = colors[c] ?? 0;
      let g = colors[c + 1] ?? 0;
      let b = colors[c + 2] ?? 0;

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
        runKey = key;
        runR = r;
        runG = g;
        runB = b;
      }
      runText += char;
    }

    if (runText) {
      out += `<span style="color:rgb(${runR},${runG},${runB})">${escapeHtml(runText)}</span>`;
    }
    out += "\n";
  }

  return out;
}

function isFileDrag(e: React.DragEvent) {
  return Array.from(e.dataTransfer.types ?? []).includes("Files");
}

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

  const canCopy = Boolean(result?.text);

  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleFile = React.useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith("image/")) {
        onFile(file);
      }
    },
    [onFile],
  );

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const output = React.useMemo(() => {
    if (!result) return null;
    if (!settings.color) return { mode: "mono" as const };
    const html = buildColoredHtml(result, true);
    return html
      ? ({ mode: "html" as const, html } as const)
      : ({ mode: "mono" as const } as const);
  }, [result, settings.color]);

  const asciiStyle = React.useMemo(() => {
    if (!result) return undefined;

    // stageRef has p-4; subtract it to avoid clipping
    const pad = 32;
    const w = Math.max(1, size.width - pad);
    const h = Math.max(1, size.height - pad);
    if (w < 40 || h < 40) return undefined;

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
    const effective: AsciiResult = settings.color
      ? result
      : { ...result, colors: undefined };

    renderAsciiToCanvas(canvas, effective, {
      fontSize: 16,
      charAspect: 0.6,
      background: "transparent",
      brightenColors: true,
      monoColor: "hsl(var(--primary))",
    });

    downloadCanvas("ascii.png", canvas);
  }, [result, settings.color]);

  return (
    <Card className="flex h-full min-h-0 flex-col shadow-xl border-muted/40 bg-card overflow-hidden">
      <CardHeader className="p-5 pb-4 border-b bg-muted/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Asciiarter
            </CardTitle>
            <CardDescription className="text-xs">
              Image to ASCII Converter
            </CardDescription>
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
              className="h-9 gap-2 shadow-sm"
            >
              <Upload className="h-4 w-4" /> Upload
            </Button>

            <Separator
              orientation="vertical"
              className="h-6 mx-1 hidden sm:block"
            />

            {/* Action Group */}
            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                disabled={!canCopy || isBusy}
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => result && downloadText("ascii.txt", result.text)}
                disabled={!canCopy || isBusy}
                className="h-7 gap-1.5 px-2 text-xs font-bold"
              >
                <FileText className="h-3.5 w-3.5" /> TXT
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadPng}
                disabled={!result || isBusy}
                className="h-7 gap-1.5 px-2 text-xs font-bold"
              >
                <ImageIcon className="h-3.5 w-3.5" /> PNG
              </Button>
            </div>

            <Separator
              orientation="vertical"
              className="h-6 mx-1 hidden sm:block"
            />

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={onRegenerate}
                disabled={!canRegenerate || isBusy}
                title="Regenerate"
                className="h-9 w-9 transition-all"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isBusy && "animate-spin")}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onClear}
                disabled={!result || isBusy}
                title="Clear"
                className="h-9 w-9 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-5 pt-0">
        <div
          className={cn(
            "relative flex h-full min-h-0 items-stretch",
            "rounded-lg border border-dashed border-border/70 bg-background/10",
            "overflow-hidden transition-all duration-200",
            isDragging && "border-primary/80 bg-primary/10",
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
            className="relative grid h-full w-full place-items-center p-4"
          >
            {!result ? (
              <div className="space-y-2 text-center pointer-events-none">
                <div className="text-[11px] tracking-[0.2em] text-primary font-bold">
                  DROP IMAGE HERE
                </div>
                <div className="text-sm text-muted-foreground">
                  jpg / png / gif / webp
                </div>
              </div>
            ) : (
              <pre
                className={cn(
                  "m-0 max-h-full max-w-full whitespace-pre font-mono",
                  "select-text cursor-text",
                )}
                style={asciiStyle}
                {...(output?.mode === "html"
                  ? { dangerouslySetInnerHTML: { __html: output.html } }
                  : { children: result.text })}
              />
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t bg-muted/5 text-[11px] text-muted-foreground font-mono">
        {result ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[200px] text-foreground">
                {result.fileName}
              </span>
            </div>
            <div className="flex items-center gap-4 tabular-nums">
              <span>
                {result.width}×{result.height} chars
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span>{(result.text.length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        ) : (
          <div className="w-full text-center opacity-50 uppercase tracking-widest">
            No file loaded
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
