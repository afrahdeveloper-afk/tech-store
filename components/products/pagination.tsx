import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Prev/next + page-of-total pagination for `/products`. Chevrons flip via
 * `rtl:rotate-180` rather than swapping icons, matching the pattern used in
 * `category-card.tsx`/`service-card.tsx`.
 *
 * Prev/Next render as real `Link`s (crawlable `<a href>`, e.g.
 * `/products?page=2`) rather than button `onClick` handlers — see H4 in the
 * Phase 10 SEO audit. `replace` + `scroll={false}` keep the same SPA-like,
 * non-history-stacking, non-scroll-jumping behavior the old `router.replace`
 * call had; a disabled end (page 1's "Previous", the last page's "Next") has
 * no `href` to link to, so it renders as a genuinely disabled button instead
 * of a link, matching native disabled-control semantics/keyboard behavior.
 */
export function Pagination({
  page,
  totalPages,
  previousHref,
  nextHref,
  previousLabel,
  nextLabel,
  pageOfLabel,
}: {
  page: number;
  totalPages: number;
  /** `null` when there is no previous page (already on page 1). */
  previousHref: string | null;
  /** `null` when there is no next page (already on the last page). */
  nextHref: string | null;
  previousLabel: string;
  nextLabel: string;
  /** Template containing "{page}" and "{total}" placeholders. */
  pageOfLabel: string;
}) {
  if (totalPages <= 1) return null;

  const label = pageOfLabel.replace("{page}", String(page)).replace("{total}", String(totalPages));

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      <Button variant="outline" disabled={!previousHref} aria-label={previousLabel} asChild={Boolean(previousHref)}>
        {previousHref ? (
          <Link href={previousHref} replace scroll={false}>
            <ChevronLeft data-icon="inline-start" className="rtl:rotate-180" aria-hidden="true" />
            {previousLabel}
          </Link>
        ) : (
          <>
            <ChevronLeft data-icon="inline-start" className="rtl:rotate-180" aria-hidden="true" />
            {previousLabel}
          </>
        )}
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {label}
      </span>
      <Button variant="outline" disabled={!nextHref} aria-label={nextLabel} asChild={Boolean(nextHref)}>
        {nextHref ? (
          <Link href={nextHref} replace scroll={false}>
            {nextLabel}
            <ChevronRight data-icon="inline-end" className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        ) : (
          <>
            {nextLabel}
            <ChevronRight data-icon="inline-end" className="rtl:rotate-180" aria-hidden="true" />
          </>
        )}
      </Button>
    </nav>
  );
}
