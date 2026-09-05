"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Shared URL-state helper for every Admin list page's toolbar (search/filter/
 * sort/pagination) — mirrors `components/products/products-explorer.tsx`'s
 * `updateParams`/`buildPageHref` pattern (the one already-proven approach in
 * this codebase for "filter state lives in the URL, not local state"), just
 * factored out since seven admin modules need the identical logic instead of
 * seven copies of it.
 *
 * Unlike `ProductsExplorer`, no client-side data fetching happens here — the
 * Admin list pages are plain Server Components that read `searchParams` and
 * query Prisma directly (`lib/admin-data.ts`'s `queryAdminX` functions), so
 * changing the URL alone is enough to get fresh, server-filtered results;
 * `app/admin/(dashboard)/*\/loading.tsx` provides the loading state during
 * that navigation instead of a hand-rolled fetch status state machine.
 */
export function useAdminListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = React.useCallback(
    (patch: Record<string, string | null>, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (options?.resetPage !== false && !("page" in patch)) {
        params.delete("page");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const buildPageHref = React.useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (targetPage <= 1) params.delete("page");
      else params.set("page", String(targetPage));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  return { searchParams, updateParams, buildPageHref };
}
