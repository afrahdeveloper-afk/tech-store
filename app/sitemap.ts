import type { MetadataRoute } from "next";

import { mockProducts } from "@/lib/mock/products";
import { mockServiceItems } from "@/lib/mock/service-items";
import { SITE_URL } from "@/lib/site-config";

/**
 * Next.js Metadata Route API (`app/sitemap.ts` → served at `/sitemap.xml`).
 *
 * Lists every public, crawlable route: the static content pages plus one
 * entry per product/service detail page, generated from the same mock
 * catalog data that currently powers `/products` and `/services` (see
 * `lib/mock/products.ts` / `lib/mock/service-items.ts`) — matches
 * `generateStaticParams` on those `[id]` routes exactly. Cart/checkout/
 * booking/account/login/register are deliberately excluded — they're
 * private, transactional, or (booking) not a distinct indexable content
 * page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = mockProducts.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = mockServiceItems.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...serviceRoutes];
}
