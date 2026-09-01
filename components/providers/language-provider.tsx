"use client";

import * as React from "react";

import { dictionaries, type Dictionary, type Lang } from "@/lib/i18n/translations";

/**
 * Client-side language toggle. There is no locale-routing infrastructure yet
 * (see the i18n note in `types/index.ts`), so the active language lives in
 * `localStorage` and is read via `useSyncExternalStore` — React's built-in
 * mechanism for a value that differs between the server-rendered snapshot
 * and the real client one (`getServerSnapshot` returns "en", matching
 * `app/layout.tsx`'s `lang="en" dir="ltr"`; a returning Arabic-preference
 * visitor resyncs to "ar" right after hydration). This avoids a manual
 * `useEffect` + `setState` on mount, which is otherwise flagged by
 * `react-hooks/set-state-in-effect`.
 *
 * This is the one "small client component" the RTL/LTR + Arabic/English
 * requirement forces: any section whose visible text depends on the toggle
 * must itself be a Client Component, since a Server Component's output
 * can't react to client-only state. Sections that don't render translated
 * copy stay server-rendered.
 */

const STORAGE_KEY = "speedcore-lang";

// Module-level pub/sub so `useSyncExternalStore` re-renders every subscribed
// component when `toggleLanguage` writes a new value — `localStorage`'s own
// `storage` event only fires in *other* tabs, not the one that wrote it.
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

function getSnapshot(): Lang {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "ar" ? "ar" : "en";
}

function getServerSnapshot(): Lang {
  return "en";
}

function writeLang(lang: Lang) {
  window.localStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dictionary;
  toggleLanguage: () => void;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Mirrors the resolved language onto <html> — a DOM sync, not a setState,
  // so it's a legitimate effect rather than something to derive during render.
  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLanguage = React.useCallback(() => {
    writeLang(getSnapshot() === "en" ? "ar" : "en");
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: dictionaries[lang],
      toggleLanguage,
    }),
    [lang, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
