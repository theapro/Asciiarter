import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { CHAR_PRESETS } from "../presets";
import type { AsciiSettings } from "../types";

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
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="p-5 pb-3">
        <CardTitle>Settings</CardTitle>
        <CardDescription>Conversion controls (compact).</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 p-5 pt-0">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ascii-width">Width (chars)</Label>
            <div className="flex items-center gap-3">
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
                className="ui-range"
              />
              <div className="w-12 text-right text-sm tabular-nums">
                {value.width}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="charset-preset">Charset preset</Label>
            <select
              id="charset-preset"
              className="h-10 w-full rounded-lg border border-input/60 bg-background/10 px-3 text-sm"
              value={
                CHAR_PRESETS.find((p) => p.value === value.charset)?.value ??
                "__custom__"
              }
              onChange={(e) => {
                const next = e.target.value;
                if (next === "__custom__") return;
                onChange({ ...value, charset: next });
              }}
              disabled={disabled}
            >
              {CHAR_PRESETS.map((p) => (
                <option key={p.name} value={p.value}>
                  {p.name}
                </option>
              ))}
              <option value="__custom__">Custom</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="charset">Custom charset</Label>
            <Input
              id="charset"
              value={value.charset}
              onChange={(e) => onChange({ ...value, charset: e.target.value })}
              disabled={disabled}
              placeholder=" .:-=+*#%@"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={value.color}
                  onChange={(e) =>
                    onChange({ ...value, color: e.target.checked })
                  }
                  disabled={disabled}
                />
                <span className="absolute inset-0 rounded-md border border-input/70 bg-background/10 shadow-sm transition peer-checked:border-primary/70 peer-checked:bg-primary/20 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 ring-offset-background" />
                <span className="relative h-2.5 w-2.5 rounded-sm bg-primary opacity-0 transition peer-checked:opacity-100" />
              </span>
              Color preview
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={value.invert}
                  onChange={(e) =>
                    onChange({ ...value, invert: e.target.checked })
                  }
                  disabled={disabled}
                />
                <span className="absolute inset-0 rounded-md border border-input/70 bg-background/10 shadow-sm transition peer-checked:border-primary/70 peer-checked:bg-primary/20 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 ring-offset-background" />
                <span className="relative h-2.5 w-2.5 rounded-sm bg-primary opacity-0 transition peer-checked:opacity-100" />
              </span>
              Invert mapping
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
