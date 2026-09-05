import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/products-data";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { buildProductJsonLd, jsonLdScript } from "@/lib/structured-data";

/**
 * Route segment is named `[id]` per CLAUDE.md's "Main Routes", but the value
 * matched is each product's `slug` — every existing link to a product detail
 * page (`product-card.tsx`, `category-card.tsx` indirectly, etc.) already
 * points at `/products/${product.slug}`. Resolved via a real Prisma query
 * (Phase 12b) instead of `lib/mock/products.ts`.
 */
export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) {
    return { title: "Product Not Found — Speed Core" };
  }

  const title = `${product.name} — Speed Core`;
  // English description only — matches the existing `description` field
  // (bilingual `nameAr`/`descriptionAr` remain UI-only via useLanguage(),
  // same as the title above; see the i18n note in types/index.ts).
  const description = product.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.slug}`,
      // Omit entirely when the product has no photo yet — never a
      // fabricated/empty image URL (see types/index.ts's Product.image note).
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(product.image ? { images: [product.image] } : {}),
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildProductJsonLd(product)) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
