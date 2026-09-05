"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Loading placeholder shaped like `ProductCard`, shown while `/products`'
 * simulated query is in flight. Grid dimensions mirror `ProductsGrid` so
 * layout doesn't jump when real cards swap in.
 *
 * A small Client Component purely so the `aria-label` can be translated
 * (`useLanguage()`, same reasoning as `ProductsPageHeader`) — it's rendered
 * both from a Client Component (`ProductsExplorer`) and directly from the
 * Server Component route shell (`app/products/page.tsx`'s `Suspense`
 * fallback), so it can't take `t` as a prop from every call site.
 */
export function ProductsSkeleton({ count = 8 }: { count?: number }) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-label={t.products.loading}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className={cn("h-3 w-16 animate-pulse rounded-full bg-muted")} />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="mt-1 h-4 w-20 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
