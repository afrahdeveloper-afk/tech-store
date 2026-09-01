"use client";

import { useLanguage } from "@/components/providers/language-provider";

/**
 * Loading placeholder shaped like `ServiceCategoriesExplorer`'s collapsed
 * state, shown by `app/services/loading.tsx` while the route segment
 * renders. Mirrors `components/products/products-skeleton.tsx`, including
 * being a small Client Component so its `aria-label` can be translated.
 */
export function ServicesSkeleton({ count = 8 }: { count?: number }) {
  const { t } = useLanguage();

  return (
    <div role="status" aria-label={t.services.loading} className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="size-11 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
