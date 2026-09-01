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
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account", "/login", "/register"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
