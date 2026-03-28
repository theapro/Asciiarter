"use client";

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
import type { AsciiResult, AsciiSettings } from "../types";
import { Copy, RefreshCw, Search, Trash2 } from "lucide-react";

export type OutputCardProps = {
  result: AsciiResult | null;
  settings: AsciiSettings;
  isBusy?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  onClear?: () => void;
};

export function OutputCard({
  result,
  settings,
  isBusy,
  canRegenerate,
  onRegenerate,
  onClear,
}: OutputCardProps) {
  // Matnni nusxalash funksiyasi
  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch (err) {
      console.error("Nusxalashda xatolik:", err);
    }
  };

  // Har bir qatorni rangli spanlar bilan render qilish
  // Bu usul ham rangni saqlaydi, ham matnni tanlash imkonini beradi
  const renderRichAscii = () => {
    if (!result) return null;

    const lines = result.text.split("\n");
    return lines.map((line, y) => (
      <div key={y} className="flex leading-none whitespace-pre">
        {line.split("").map((char, x) => {
          const colorIndex = (y * result.width + x) * 3;
          const r = result.colors?.[colorIndex];
          const g = result.colors?.[colorIndex + 1];
          const b = result.colors?.[colorIndex + 2];
          return (
            <span
              key={`${x}-${y}`}
              style={{
                color:
                  settings.color &&
                  r !== undefined &&
                  g !== undefined &&
                  b !== undefined
                    ? `rgb(${r}, ${g}, ${b})`
                    : "inherit",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <Card
      id="output"
      className="flex h-full min-h-0 flex-col shadow-xl border-muted/40 bg-card overflow-hidden"
    >
      <CardHeader className="p-5 pb-4 border-b bg-muted/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Output{" "}
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-tighter">
                Text Mode
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Sichqoncha bilan belgilab nusxa olishingiz mumkin
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              disabled={!result || isBusy}
              className="h-9 gap-2"
            >
              <Copy className="h-4 w-4" /> Copy Matn
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onRegenerate}
              disabled={!canRegenerate || isBusy}
              className="h-9 w-9"
            >
              <RefreshCw className={isBusy ? "animate-spin" : ""} size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={!result || isBusy}
              className="h-9 w-9 text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0 bg-background/10 overflow-hidden relative group">
        {/* Kontent maydoni: scroll-auto va font-mono juda muhim */}
        <div
          className="h-full w-full overflow-auto p-6 scrollbar-thin scrollbar-thumb-white/10"
          style={{ cursor: "text" }}
        >
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Search size={32} strokeWidth={1} className="opacity-20" />
              <p className="text-sm italic">Natija kutilmoqda...</p>
            </div>
          ) : (
            <div
              className="inline-block font-mono font-bold selection:bg-white/20"
              style={{
                fontSize: "12px", // Harflar aniq ko'rinishi uchun
                lineHeight: "1", // Harflar orasidagi masofani yo'qotish uchun
                letterSpacing: "0.1em",
                minWidth: "max-content",
              }}
            >
              {renderRichAscii()}
            </div>
          )}
        </div>

        {isBusy && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex items-center gap-3 text-white">
              <RefreshCw className="animate-spin" />
              <span>Tayyorlanmoqda...</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 border-t bg-muted/5 text-[10px] font-mono text-muted-foreground">
        {result && (
          <div className="flex justify-between w-full">
            <span>FILESYSTEM: {result.fileName}</span>
            <span>
              GRID: {result.width}x{result.height} CHRS
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
