import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'yuru_movie_calendar_column_widths';
const DEFAULT_WIDTHS = [1, 1, 1, 1, 1, 1, 1];

function loadWidths(): number[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 7 && parsed.every((v: unknown) => typeof v === 'number' && v > 0)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_WIDTHS];
}

export function useCalendarColumnWidths() {
  const [widths, setWidths] = useState<number[]>(loadWidths);

  const updateWidth = useCallback((index: number, delta: number) => {
    setWidths((prev) => {
      const next = [...prev];
      const nextIndex = index + 1;
      if (nextIndex >= 7) return prev;

      const minWidth = 0.3;
      let newCurrent = next[index] + delta;
      let newNext = next[nextIndex] - delta;

      if (newCurrent < minWidth) {
        newNext += newCurrent - minWidth;
        newCurrent = minWidth;
      }
      if (newNext < minWidth) {
        newCurrent += newNext - minWidth;
        newNext = minWidth;
      }

      next[index] = Math.max(minWidth, newCurrent);
      next[nextIndex] = Math.max(minWidth, newNext);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetWidths = useCallback(() => {
    const defaults = [...DEFAULT_WIDTHS];
    setWidths(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }, []);

  const gridTemplateColumns = useMemo(
    () => widths.map((w) => `${w}fr`).join(' '),
    [widths]
  );

  return { widths, updateWidth, resetWidths, gridTemplateColumns };
}
