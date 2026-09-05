"use client";

import * as React from "react";

/**
 * Tracks a CSS media query client-side via `useSyncExternalStore` — same
 * "client-only value, no `setState`-in-effect" pattern `language-provider.tsx`
 * uses for `localStorage`. The server snapshot is always `false` (there's no
 * viewport to measure during SSR), so the very first client render can flip
 * once after hydration; that's fine for callers gating decorative/optional
 * content (e.g. which hero visual mounts), not for anything layout-critical.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = React.useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = React.useCallback(() => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Convenience wrapper for the one query used across this codebase so far. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
