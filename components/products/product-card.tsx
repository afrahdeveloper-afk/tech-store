import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Body, Caption, H3, Small } from "@/components/ui/typography";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

/**
 * Reusable product card — built for the homepage's Featured Products
 * section but written to also serve the future `/products` grid (per
 * CLAUDE.md's Products spec: image, category, name, description, price,
 * discount, stock state, Add to Cart, View Details). No `useLanguage()`
 * here so it stays usable from either a client or (later) server list —
 * the resolved language/dictionary are passed down as props instead.
 *
 * `priority` (perf audit P1-3, default `false`): every grid that renders
 * this card is responsible for passing `priority` on the one card that's
 * actually above the fold (its own first item, index 0) — this component
 * has no way to know its own position in a grid, so it can't decide that
 * itself. Never default this to `true`; marking every card priority would
 * make the browser front-load every product image at once instead of just
 * the LCP candidate, working against the image it's meant to help.
 */
export function ProductCard({
  product,
  lang,
  t,
  priority = false,
}: {
  product: Product;
  lang: Lang;
  t: Dictionary;
  priority?: boolean;
}) {
  const name = lang === "ar" ? product.nameAr ?? product.name : product.name;
  const description = lang === "ar" ? product.descriptionAr ?? product.description : product.description;
  const categoryName = product.categoryName
    ? lang === "ar"
      ? (product.categoryNameAr ?? product.categoryName)
      : product.categoryName
    : null;
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

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            className={cn(
              // Fixed square frame + object-contain (never `cover`): a
              // product photo must stay fully visible and never crop, so
              // the container's aspect ratio is what's fixed here, not the
              // source image's own dimensions (see Global Image System).
              "object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4 lg:p-5",
              isOutOfStock && "opacity-60 grayscale-[0.3]"
            )}
          />
        ) : (
          <ImagePlaceholder />
        )}
        {hasDiscount && !isOutOfStock ? (
          <Badge variant="accent" className="absolute start-3 top-3">
            {t.products.discountBadge}
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName ? <Caption>{categoryName}</Caption> : null}
        <H3 as="h3" className="text-base leading-snug font-semibold">
          <Link
            href={`/products/${product.slug}`}
            className="rounded-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {name}
          </Link>
        </H3>
        <Body className="line-clamp-2 text-sm text-muted-foreground">{description}</Body>

        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-base font-semibold text-primary">
            {(hasDiscount ? product.discountPrice! : product.price).toLocaleString(
              lang === "ar" ? "ar-SA" : "en-US"
            )}{" "}
            {product.currency}
          </span>
          {hasDiscount ? (
            <span className="font-mono text-sm text-muted-foreground line-through">
              {product.price.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
            </span>
          ) : null}
        </div>

        <Badge variant={stockVariant} className="w-fit">
          {stockLabel}
        </Badge>

        <div className="mt-3 flex items-center gap-2">
          <AddToCartButton product={product} t={t} />
          <Button asChild variant="outline">
            <Link href={`/products/${product.slug}`}>
              <Small as="span">{t.products.viewDetails}</Small>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
