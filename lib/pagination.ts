/**
 * Safely parses a `?page=` URL search-param string into a finite, sane
 * pagination page number (Stage 8 — API & Input Security). Every call site
 * that reads a page number from the URL used to write
 * `Math.max(1, Number(value) || 1)` inline — that idiom already turns a
 * non-numeric string into `1` (`Number("abc")` is `NaN`, and `NaN` is
 * falsy, so `|| 1` catches it), but does NOT catch a value that converts to
 * `Infinity` (`Number("1e400")`, or any sufficiently long digit string) —
 * `Infinity` is truthy, so it passes straight through unchanged. Every
 * admin `queryAdminX` list function (`lib/admin-data.ts`) feeds this page
 * number into a raw Prisma `skip` argument as part of the *same* `Promise.all`
 * that computes `totalPages`, so an `Infinity` skip reaches Prisma (and
 * throws a validation error) before this project's own
 * `Math.min(page, totalPages)` re-clamp ever gets a chance to run.
 *
 * Dependency-free and safe to import from both a Server Component (every
 * `app/admin/(dashboard)/*` list page.tsx) and a Client Component
 * (`components/products/products-explorer.tsx`) — no server-only import
 * here, unlike `lib/admin-data.ts`/`lib/products-data.ts` themselves.
 */

/** Well beyond any real page count this app's data volumes could ever produce — a defensive ceiling so a pathological `?page=` value can't force a needlessly large `skip` even when it's technically a finite number (e.g. `Number.MAX_SAFE_INTEGER`). */
const MAX_REASONABLE_PAGE = 1_000_000;

export function parsePageParam(value: string | undefined | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(MAX_REASONABLE_PAGE, Math.max(1, Math.floor(parsed)));
}
