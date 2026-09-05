"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import type { Product } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Body, Caption, Display, H2, Small } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductsGrid } from "@/components/products/products-grid";
import { ProductGallery } from "@/components/products/product-gallery";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

/**
 * `/products/[id]`'s content. A Client Component because every piece of
 * text here is bilingual and the quantity stepper needs local state — the
 * route shell (`app/products/[id]/page.tsx`) stays a Server Component that
 * resolves the product and passes it down, per the Architecture Rules.
 */
export function ProductDetailView({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { t, lang } = useLanguage();
  const [quantity, setQuantity] = React.useState(1);

  const name = lang === "ar" ? product.nameAr ?? product.name : product.name;
  const description = lang === "ar" ? product.descriptionAr ?? product.description : product.description;
  const categoryName = product.categoryName
    ? lang === "ar"
      ? (product.categoryNameAr ?? product.categoryName)
      : product.categoryName
    : null;
  const highlights = (lang === "ar" ? product.highlightsAr ?? product.highlights : product.highlights) ?? [];

  const hasDiscount = typeof product.discountPrice === "number";
  const isOutOfStock = product.stockState === "out-of-stock";
  const stockLabel =
    product.stockState === "in-stock"
      ? t.products.inStock
      : product.stockState === "low-stock"
        ? t.products.lowStock
        : t.products.outOfStock;
  const stockVariant =
    product.stockState === "in-stock" ? "success" : product.stockState === "low-stock" ? "warning" : "error";

  const formatPrice = (value: number) => value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US");

  // Never fabricate a gallery entry from an empty `product.image` — only
  // fall back to the single legacy `image` field when it's actually set;
  // a product with truly zero photos gets a plain placeholder instead of
  // `ProductGallery` (which itself renders nothing for an empty array).
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [{ id: product.id, url: product.image, isPrimary: true }]
        : [];

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-12 lg:py-14">
      <Breadcrumb
        items={[
          { label: t.productDetails.breadcrumbHome, href: "/" },
          { label: t.productDetails.breadcrumbProducts, href: "/products" },
          { label: name },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {galleryImages.length > 0 ? (
          <ProductGallery
            images={galleryImages}
            productName={name}
            isOutOfStock={isOutOfStock}
            discountBadgeLabel={hasDiscount ? t.products.discountBadge : undefined}
          />
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            <ImagePlaceholder iconClassName="size-10" />
          </div>
        )}

        <div className="flex flex-col gap-5">
          {categoryName ? <Caption className="text-accent">{categoryName}</Caption> : null}
          <Display as="h1" className="text-2xl sm:text-3xl lg:text-4xl">
            {name}
          </Display>

          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold text-primary">
              {formatPrice(hasDiscount ? product.discountPrice! : product.price)} {product.currency}
            </span>
            {hasDiscount ? (
              <span className="font-mono text-base text-muted-foreground line-through">
                {formatPrice(product.price)} {product.currency}
              </span>
            ) : null}
          </div>

          <Badge variant={stockVariant} className="w-fit">
            {stockLabel}
          </Badge>

          <Body className="text-muted-foreground">{description}</Body>

          {highlights.length > 0 ? (
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              <Small className="font-semibold text-foreground">{t.productDetails.highlightsHeading}</Small>
              <ul className="flex flex-col gap-1.5">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <div
              role="group"
              aria-label={t.productDetails.quantityLabel}
              className="flex items-center rounded-lg border border-border"
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                aria-label={t.productDetails.decreaseQuantity}
                className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <Minus className="size-3.5" aria-hidden="true" />
              </button>
              <span className="min-w-9 px-1 text-center text-sm font-medium text-foreground" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                disabled={isOutOfStock}
                aria-label={t.productDetails.increaseQuantity}
                className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <AddToCartButton
              product={product}
              quantity={quantity}
              t={t}
              size="lg"
              className="flex-1 sm:flex-none"
            />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="flex flex-col gap-6 border-t border-border pt-10">
          <H2>{t.productDetails.relatedHeading}</H2>
          <ProductsGrid products={relatedProducts} lang={lang} t={t} />
        </div>
      ) : null}
    </Container>
  );
}
