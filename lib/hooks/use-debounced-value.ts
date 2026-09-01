"use client";

import * as React from "react";

/**
 * Returns `value`, delayed by `delayMs` after it stops changing. Used to
 * debounce the products search box so filtering doesn't re-run on every
 * keystroke (see the Search rules in CLAUDE.md — "Use: Debounce").
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
