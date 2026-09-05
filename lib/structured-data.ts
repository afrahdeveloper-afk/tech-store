/**
 * Server-rendered JSON-LD builders for `/products/[id]` and `/services/[id]`
 * (Phase 10 SEO Batch 2, H3). No new dependency — plain object builders plus
 * a manual escape for safe inline embedding, consumed by each route's
 * `page.tsx` via a `<script type="application/ld+json">` tag.
 */
import type { Product, Service, StockState } from "@/types";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

/**
 * Serializes JSON-LD for safe embedding via `dangerouslySetInnerHTML`.
 * Escapes `<`, `>`, and `&` so a string field (e.g. a product name) can
 * never break out of the `<script>` tag or inject an HTML entity — the
 * mitigation recommended by the JSON-LD spec's security considerations.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const STOCK_TO_AVAILABILITY: Record<StockState, string> = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "out-of-stock": "https://schema.org/OutOfStock",
};

/** `Product` + `Offer` JSON-LD for `/products/[id]` — existing fields only. */
export function buildProductJsonLd(product: Product) {
  const url = `${SITE_URL}/products/${product.slug}`;
  const price = product.discountPrice ?? product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    // Omit the field entirely when there's no real photo — a fabricated
    // `${SITE_URL}` (no path) "image" would be worse than none at all.
    ...(product.image ? { image: `${SITE_URL}${product.image}` } : {}),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency,
      price,
      availability: STOCK_TO_AVAILABILITY[product.stockState],
    },
  };
}

/** `Service` JSON-LD for `/services/[id]` — existing fields only. */
export function buildServiceJsonLd(service: Service) {
  const url = `${SITE_URL}/services/${service.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: service.currency,
      price: service.price,
      availability: service.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
