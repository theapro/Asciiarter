"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { Settings2, Maximize2, Palette, Repeat, Type, ChevronDown, Check } from "lucide-react";
import { CHAR_PRESETS } from "../presets";
import type { AsciiSettings } from "../types";
import { cn } from "../../../lib/utils";

export type SettingsCardProps = {
  value: AsciiSettings;
  onChange: (next: AsciiSettings) => void;
  disabled?: boolean;
};

function setNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function SettingsCard({ value, onChange, disabled }: SettingsCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Tashqariga bosilganda dropdownni yopish
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPreset = CHAR_PRESETS.find((p) => p.value === value.charset);

  return (
    /* overflow-visible muhim, aks holda dropdown card ichidan chiqolmaydi */
    <Card className="flex h-full min-h-0 flex-col shadow-2xl border-muted/40 bg-gradient-to-b from-card to-background ring-1 ring-white/5 relative overflow-visible">
      <CardHeader className="p-6 pb-4 border-b bg-muted/20 backdrop-blur-md shrink-0 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl ring-1 ring-primary/20">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-xl font-extrabold tracking-tight">Configuration</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-60">
              Output Parameters
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* isOpen bo'lganda overflow-visible qilamiz, aks holda overflow-y-auto */}
      <CardContent className={cn(
        "min-h-0 flex-1 space-y-6 p-6 scrollbar-thin transition-all",
        isOpen ? "overflow-visible" : "overflow-y-auto"
      )}>
        {/* Width Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ascii-width" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <Maximize2 className="h-3.5 w-3.5" /> Output Width
            </Label>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
              {value.width} chars
            </span>
          </div>
          <input
            id="ascii-width"
            type="range"
            min={60}
            max={260}
            step={2}
            value={value.width}
            onChange={(e) =>
              onChange({
                ...value,
                width: setNumber(e.target.value, value.width),
              })
            }
            disabled={disabled}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-all hover:accent-primary/80"
          />
        </div>

        <Separator className="opacity-50" />

        {/* Custom Dropdown Section */}
        <div className="space-y-4 relative">
          <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
            <Type className="h-3.5 w-3.5" /> Character Presets
          </Label>
          
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-xl border border-input/60 bg-background px-3 py-2 text-sm font-medium transition-all shadow-sm",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                isOpen && "border-primary ring-2 ring-primary/20",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="truncate">
                {currentPreset ? currentPreset.name : "✨ Custom Charset"}
              </span>
              <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Floating Dropdown Module - z-index va absolute joylashuv */}
            {isOpen && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-[100] w-full rounded-xl border border-muted bg-popover p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-50">
                  Standard Sets
                </div>
                <div className="max-h-[160px] overflow-y-auto scrollbar-none">
                  {CHAR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        onChange({ ...value, charset: p.value });
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
                        value.charset === p.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                      )}
                    >
                      {p.name}
                      {value.charset === p.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                <div className="my-1 h-px bg-muted" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center rounded-lg px-2 py-2 text-sm text-primary font-semibold hover:bg-primary/5"
                >
                  ✨ Custom Set Mode
                </button>
              </div>
            )}
          </div>

          <div className="relative group pt-1">
            <Input
              id="charset"
              value={value.charset}
              onChange={(e) => onChange({ ...value, charset: e.target.value })}
              disabled={disabled}
              placeholder=" .:-=+*#%@"
              className="bg-muted/30 border-dashed font-mono text-center tracking-[0.3em] h-11 rounded-xl focus-visible:ring-primary/30"
            />
            {!disabled && (
               <div className="absolute -top-2 left-3 px-1.5 bg-background text-[9px] font-bold text-muted-foreground uppercase tracking-tighter border rounded">
                 Active Set
               </div>
            )}
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Toggle Switches */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <label className={cn(
            "group flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-muted/20 transition-all cursor-pointer",
            value.color ? "border-primary/40 bg-primary/5 shadow-inner" : "hover:bg-muted/40",
            disabled && "opacity-50 pointer-events-none"
          )}>
            <input
              type="checkbox"
              className="sr-only"
              checked={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.checked })}
            />
            <Palette className={cn("h-5 w-5 mb-2 transition-colors", value.color ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[11px] font-bold uppercase tracking-tight">Full Color</span>
          </label>

          <label className={cn(
            "group flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent bg-muted/20 transition-all cursor-pointer",
            value.invert ? "border-primary/40 bg-primary/5 shadow-inner" : "hover:bg-muted/40",
            disabled && "opacity-50 pointer-events-none"
          )}>
            <input
              type="checkbox"
              className="sr-only"
              checked={value.invert}
              onChange={(e) => onChange({ ...value, invert: e.target.checked })}
            />
            <Repeat className={cn("h-5 w-5 mb-2 transition-colors", value.invert ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[11px] font-bold uppercase tracking-tight">Invert</span>
          </label>
        </div>
      </CardContent>

      <div className="p-4 bg-muted/5 border-t shrink-0 rounded-b-xl">
         <p className="text-[9px] text-center text-muted-foreground uppercase tracking-[0.2em] font-medium italic">
            Changes apply in real-time
         </p>
      </div>
    </Card>
  );
}