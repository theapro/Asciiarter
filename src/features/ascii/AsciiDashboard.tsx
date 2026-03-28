import * as React from "react";

import { useLocalStorageState } from "../../lib/useLocalStorageState";
import { convertImageFileToAscii } from "./convert";
import { DEFAULT_CHARSET } from "./presets";
import { ConverterCard } from "./components/ConverterCard";
import { SettingsCard } from "./components/SettingsCard";
import type { AsciiResult, AsciiSettings } from "./types";

const DEFAULT_SETTINGS: AsciiSettings = {
  width: 150,
  charset: DEFAULT_CHARSET,
  color: true,
  invert: false,
};

export function AsciiDashboard() {
  const [settings, setSettings] = useLocalStorageState<AsciiSettings>(
    "asciiarter-ascii-settings",
    DEFAULT_SETTINGS,
  );
  const [result, setResult] = React.useState<AsciiResult | null>(null);
  const [lastFile, setLastFile] = React.useState<File | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const run = React.useCallback(
    async (file: File) => {
      setIsBusy(true);
      setLastFile(file);
      try {
        const r = await convertImageFileToAscii(file, settings);
        setResult(r);
      } finally {
        setIsBusy(false);
      }
    },
    [settings],
  );

  const regenerate = React.useCallback(() => {
    if (!lastFile) return;
    void run(lastFile);
  }, [lastFile, run]);

  const clear = React.useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ConverterCard
        result={result}
        settings={settings}
        isBusy={isBusy}
        canRegenerate={Boolean(lastFile)}
        onFile={run}
        onRegenerate={regenerate}
        onClear={clear}
      />

      <SettingsCard value={settings} onChange={setSettings} disabled={isBusy} />
    </div>
  );
}
