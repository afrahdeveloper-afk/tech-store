import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

/**
 * Next.js Metadata Route API (`app/robots.ts` → served at `/robots.txt`).
 *
 * Disallows the account/checkout flow — pages that are either private
 * per-customer data or have no SEO value as a crawl target (cart/checkout
 * are transactional, not content) — while leaving every public catalog/
 * content route crawlable. `/about`, `/products`, `/services`, and their
 * detail pages are intentionally NOT disallowed.
 *
 * `/admin` (Phase 12) is disallowed the same way — a private store backend,
 * not indexable content — as a path prefix, so this one entry already covers
 * `/admin/login` and every future `/admin/*` section. `app/admin/layout.tsx`
 * also sets `robots: { index: false, follow: false }` directly as
 * belt-and-suspenders.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account", "/login", "/register", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
