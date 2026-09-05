import type { MetadataRoute } from "next";

import { getProductSlugs } from "@/lib/products-data";
import { getServiceSlugs } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site-config";

/**
 * Next.js Metadata Route API (`app/sitemap.ts` → served at `/sitemap.xml`).
 *
 * Lists every public, crawlable route: the static content pages plus one
 * entry per product/service detail page, generated from the real Prisma
 * catalog (Phase 12b — previously `lib/mock/products.ts` /
 * `lib/mock/service-items.ts`) — matches `generateStaticParams` on those
 * `[id]` routes exactly. Cart/checkout/booking/account/login/register are
 * deliberately excluded — they're private, transactional, or (booking) not
 * a distinct indexable content page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const [productSlugs, serviceSlugs] = await Promise.all([getProductSlugs(), getServiceSlugs()]);

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...serviceRoutes];
}
