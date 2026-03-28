import { useCallback, useEffect, useState } from "react";

function readLocalStorageValue<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeLocalStorageValue<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
) {
  const [state, setState] = useState<T>(() => {
    const stored = readLocalStorageValue<T>(key);
    if (stored !== undefined) return stored;
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    writeLocalStorageValue(key, state);
  }, [key, state]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  return [state, set] as const;
}
