import Link from "next/link";
import "./globals.css";

/**
 * Top-level fallback 404 — required by Next.js whenever an app has more than
 * one root layout (see `app/(site)/layout.tsx` and `app/admin/layout.tsx`,
 * added for Phase 12's Admin Dashboard). With a single root layout, Next
 * renders `app/not-found.tsx` inside it automatically for any unmatched URL;
 * with multiple root layouts, Next can no longer assume which one a totally
 * unmatched path (one that isn't under `(site)` or `admin` at all) belongs
 * to, so this file must exist at the true top level and supply its own
 * complete `<html>/<body>` — it is not nested inside `(site)`'s layout, so
 * it can't use `LanguageProvider`/`Navbar`/`Footer` (those only wrap
 * `(site)`). Kept intentionally plain and English-only rather than
 * duplicating the bilingual chrome; `(site)`'s own richer, bilingual
 * `not-found.tsx` still handles `notFound()` calls raised from within the
 * public site's own routes (e.g. an unknown product/service slug already has
 * its own more specific `not-found.tsx`, and any other in-site 404 falls
 * back to `app/(site)/not-found.tsx`).
 *
 * `force-dynamic` (Stage 9 — CSP hardening): same reasoning as
 * `app/maintenance/page.tsx` — this file has no data fetch and would
 * otherwise be statically prerendered as the build's `/_not-found` route,
 * whose `<script>` tags then carry no per-request `nonce` and get blocked
 * outright by the `'strict-dynamic'` CSP `proxy.ts` sets (confirmed live).
 */
export const dynamic = "force-dynamic";

export default function TopLevelNotFound() {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">404</p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Back to Home
        </Link>
      </body>
    </html>
  );
}
