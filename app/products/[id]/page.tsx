import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mockProducts } from "@/lib/mock/products";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { buildProductJsonLd, jsonLdScript } from "@/lib/structured-data";

/**
 * Route segment is named `[id]` per CLAUDE.md's "Main Routes", but the value
 * matched is each product's `slug` — every existing link to a product detail
 * page (`product-card.tsx`, `category-card.tsx` indirectly, etc.) already
 * points at `/products/${product.slug}`.
 */
function findProduct(id: string) {
  return mockProducts.find((product) => product.slug === id);
}

export function generateStaticParams() {
  return mockProducts.map((product) => ({ id: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = findProduct(id);
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
      images: [{ url: product.image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = findProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = mockProducts
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 4);

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
