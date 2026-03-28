import * as React from "react";

import {
  clampHexColor,
  hexToHslCssValue,
  readableForegroundHsl,
} from "../../lib/color";
import { useLocalStorageState } from "../../lib/useLocalStorageState";

export type Theme = "dark" | "light";

export type ThemeColors = {
  primary: string;
  glow2: string;
  glow3: string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
  setColors: (next: ThemeColors) => void;
  setColor: (key: keyof ThemeColors, value: string) => void;
};

const DEFAULT_COLORS: ThemeColors = {
  primary: "#00f3ff",
  glow2: "#ff2b9d",
  glow3: "#8b5cf6",
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function applyColorVars(theme: Theme, colors: ThemeColors) {
  const root = document.documentElement;
  const primary = clampHexColor(colors.primary, DEFAULT_COLORS.primary);
  const glow2 = clampHexColor(colors.glow2, DEFAULT_COLORS.glow2);
  const glow3 = clampHexColor(colors.glow3, DEFAULT_COLORS.glow3);

  const primaryHsl = hexToHslCssValue(primary);
  const glow2Hsl = hexToHslCssValue(glow2);
  const glow3Hsl = hexToHslCssValue(glow3);

  if (primaryHsl) {
    root.style.setProperty("--primary", primaryHsl);
    root.style.setProperty("--ring", primaryHsl);
    root.style.setProperty("--glow-1", primaryHsl);
    const fg = readableForegroundHsl(primary);
    if (fg) root.style.setProperty("--primary-foreground", fg);
  }

  if (glow2Hsl) root.style.setProperty("--glow-2", glow2Hsl);
  if (glow3Hsl) root.style.setProperty("--glow-3", glow3Hsl);

  // Small contrast tweak for light mode borders when using very bright accents.
  if (theme === "light") {
    root.style.setProperty("--ring", primaryHsl ?? "187 100% 50%");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorageState<Theme>(
    "asciiarter-theme",
    "dark",
  );
  const [colors, setColors] = useLocalStorageState<ThemeColors>(
    "asciiarter-colors",
    DEFAULT_COLORS,
  );

  React.useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  React.useEffect(() => {
    applyColorVars(theme, colors);
  }, [theme, colors]);

  const setColor = React.useCallback(
    (key: keyof ThemeColors, value: string) => {
      setColors((prev) => ({ ...prev, [key]: value }));
    },
    [setColors],
  );

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      colors,
      setColors,
      setColor,
    }),
    [theme, setTheme, toggleTheme, colors, setColors, setColor],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
