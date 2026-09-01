"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, PackageSearch } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { mockCategories } from "@/lib/mock/categories";
import { mockSubcategories } from "@/lib/mock/subcategories";
import { fetchProducts, type ProductQueryResult, type ProductSort } from "@/lib/mock/fetch-products";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ProductsToolbar } from "@/components/products/products-toolbar";
import { ProductsGrid } from "@/components/products/products-grid";
import { ProductsSkeleton } from "@/components/products/products-skeleton";
import { Pagination } from "@/components/products/pagination";
import { EmptyState } from "@/components/shared/empty-state";

const VALID_SORTS: ProductSort[] = ["featured", "price-asc", "price-desc", "name-asc"];

function readSort(value: string | null): ProductSort {
  return VALID_SORTS.includes(value as ProductSort) ? (value as ProductSort) : "featured";
}

/**
 * Owns `/products`' entire search/filter/sort/pagination experience. Filter
 * state (category, subcategory, sort, page) lives in the URL query string —
 * read fresh from `useSearchParams` every render, not copied into local
 * state — so it stays correct when a `Link` (e.g. a homepage category card's
 * `?category=slug`) navigates here without remounting this component, and so
 * results are shareable/bookmarkable. The search text box is the one
 * exception: it's debounced locally before being written to the URL, so
 * typing doesn't thrash history/fetches on every keystroke.
 */
export function ProductsExplorer() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get("category") ?? "";
  const subcategorySlug = searchParams.get("subcategory") ?? "";
  const sort = readSort(searchParams.get("sort"));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const committedSearch = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = React.useState(committedSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = React.useState<ProductQueryResult | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);

  // The query this render's committed filters describe. Reset to "loading"
  // during render when it changes (React's sanctioned "adjusting state"
  // pattern — see the mobile-menu-close in `navbar.tsx` for the same idea)
  // rather than via `setState` inside the fetch effect below, which
  // `react-hooks/set-state-in-effect` flags as a cascading-render risk.
  const queryKey = JSON.stringify({ committedSearch, categorySlug, subcategorySlug, sort, page, lang, retryToken });
  const [lastQueryKey, setLastQueryKey] = React.useState(queryKey);
  if (queryKey !== lastQueryKey) {
    setLastQueryKey(queryKey);
    setStatus("loading");
  }

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

  // Builds a real, crawlable href for a given target page (current filters
  // preserved, `page` set/omitted) — used by `Pagination`'s Prev/Next links
  // instead of a JS-only `onClick` (see H4 in the Phase 10 SEO audit).
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

  // Push the debounced search text into the URL once it settles, but only
  // when it actually differs from what's already there (avoids an extra
  // no-op history replace on first render). Intentionally reacts to
  // `debouncedSearch` alone — `updateParams`/`searchParams` change on every
  // navigation this effect itself causes, which would otherwise loop.
  React.useEffect(() => {
    if (debouncedSearch !== committedSearch) {
      updateParams({ q: debouncedSearch || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  React.useEffect(() => {
    let cancelled = false;
    fetchProducts({ search: committedSearch, categorySlug, subcategorySlug, sort, page, lang })
      .then((response) => {
        if (cancelled) return;
        setResult(response);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [committedSearch, categorySlug, subcategorySlug, sort, page, lang, retryToken]);

  const activeCategory = mockCategories.find((category) => category.slug === categorySlug);
  const availableSubcategories = activeCategory
    ? mockSubcategories.filter((subcategory) => subcategory.categoryId === activeCategory.id)
    : [];
  const hasActiveFilters = Boolean(searchInput || categorySlug || subcategorySlug || sort !== "featured");

  const handleClearFilters = () => {
    setSearchInput("");
    updateParams({ q: null, category: null, subcategory: null, sort: null });
  };

  const countLabel =
    status === "success" && result
      ? (result.total === 1 ? t.products.resultsCountOne : t.products.resultsCountOther).replace(
          "{count}",
          result.total.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")
        )
      : status === "loading"
        ? t.products.loading
        : "";

  return (
    <div className="flex flex-col gap-6">
      <ProductsToolbar
        t={t}
        lang={lang}
        categories={mockCategories}
        subcategories={availableSubcategories}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        categoryValue={categorySlug}
        onCategoryChange={(value) => updateParams({ category: value || null, subcategory: null })}
        subcategoryValue={subcategorySlug}
        onSubcategoryChange={(value) => updateParams({ subcategory: value || null })}
        sortValue={sort}
        onSortChange={(value) => updateParams({ sort: value === "featured" ? null : value })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {countLabel ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {countLabel}
        </p>
      ) : null}

      {status === "loading" ? <ProductsSkeleton /> : null}

      {status === "error" ? (
        <EmptyState
          icon={AlertTriangle}
          tone="error"
          title={t.products.errorTitle}
          description={t.products.errorDescription}
          action={{ label: t.products.retry, onClick: () => setRetryToken((token) => token + 1) }}
        />
      ) : null}

      {status === "success" && result && result.items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={t.products.emptyTitle}
          description={t.products.emptyDescription}
          action={hasActiveFilters ? { label: t.products.clearFilters, onClick: handleClearFilters } : undefined}
        />
      ) : null}

      {status === "success" && result && result.items.length > 0 ? (
        <>
          <ProductsGrid products={result.items} lang={lang} t={t} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            previousHref={result.page > 1 ? buildPageHref(result.page - 1) : null}
            nextHref={result.page < result.totalPages ? buildPageHref(result.page + 1) : null}
            previousLabel={t.products.paginationPrevious}
            nextLabel={t.products.paginationNext}
            pageOfLabel={t.products.paginationPageOf}
          />
        </>
      ) : null}
    </div>
  );
}
