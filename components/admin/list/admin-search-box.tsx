"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";

/**
 * Debounced search box for an Admin list toolbar — local text state,
 * debounced 350ms (matching `ProductsExplorer`'s own debounce delay) before
 * calling `onCommit` with the settled value. The caller (each module's
 * toolbar) owns writing that into the URL via `useAdminListParams`.
 */
export function AdminSearchBox({
  value,
  onCommit,
  placeholder,
  label,
}: {
  value: string;
  onCommit: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const [text, setText] = React.useState(value);
  const debounced = useDebouncedValue(text, 350);

  // Reset local text if the committed URL value changes from elsewhere (e.g.
  // "Clear filters") — an "adjusting state" comparison during render, not an
  // effect+setState, same pattern this codebase already uses for this exact
  // kind of prop/URL resync (see `admin-header.tsx`'s quick search).
  const [lastValue, setLastValue] = React.useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== debounced) setText(value);
  }

  React.useEffect(() => {
    if (debounced !== value) onCommit(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full min-w-0 sm:max-w-xs sm:flex-1">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} aria-label={label} className="ps-9" />
    </div>
  );
}
