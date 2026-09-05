"use client";

import { useLanguage } from "@/components/providers/language-provider";

/**
 * Generic route-level loading placeholder (perf audit P1-4 — 13 of 15
 * storefront route segments had no `loading.tsx` at all, falling back to a
 * blank page during server render). Deliberately generic rather than a
 * bespoke skeleton per page: the goal is "not a blank screen while this
 * resolves," not a pixel-exact preview of each page's final layout — that's
 * what `products-skeleton.tsx`/`services-skeleton.tsx` already do for the
 * two routes that earned a hand-shaped one in an earlier phase. Same
 * `animate-pulse` + `bg-muted` visual language as those, no other motion.
 *
 * `variant` picks the closest generic shape to the page it's covering:
 *  - `detail` — a large media block beside/above a few text lines (Product/
 *    Service Details).
 *  - `form` — stacked labeled-field bars (Checkout, Booking, Login, Register).
 *  - `rows` — a short list of card-shaped rows (Cart, Account).
 *  - `text` — a few paragraph-width lines (About).
 */
export function RouteLoadingSkeleton({ variant }: { variant: "detail" | "form" | "rows" | "text" }) {
  const { t } = useLanguage();

  return (
    <div role="status" aria-label={t.common.loading} className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded-full bg-muted" />
      </div>

      {variant === "detail" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="flex flex-col gap-3">
            <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
            <div className="mt-2 h-6 w-32 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 h-11 w-full max-w-xs animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      )}

      {variant === "form" && (
        <div className="flex max-w-xl flex-col gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
          <div className="mt-2 h-11 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
      )}

      {variant === "rows" && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="size-16 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "text" && (
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
        </div>
      )}
    </div>
  );
}
