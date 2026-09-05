"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import type { Product } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";
import { useCart } from "@/components/providers/cart-provider";
import { findCartItemIssue } from "@/lib/cart";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Caption, Display, Body, H2, Small } from "@/components/ui/typography";
import { EmptyState } from "@/components/shared/empty-state";
import { CartLineItem } from "@/components/cart/cart-line-item";

/**
 * `/cart`'s entire content. A Client Component top to bottom — cart state
 * only exists client-side (`localStorage`, see `cart-provider.tsx`), so
 * there's nothing here a Server Component could usefully render first (the
 * route shell `app/cart/page.tsx` still stays a Server Component for its
 * static metadata, per the Architecture Rules — and, since Phase 12b.1,
 * also fetches `products` (a real Prisma query) for this component to
 * revalidate cart items against, since this Client Component can't call
 * Prisma itself.
 */
export function CartView({ products }: { products: Product[] }) {
  const { t, lang } = useLanguage();
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  const issues = items.map((item) => findCartItemIssue(item, products));
  const hasBlockingIssue = issues.some((issue) => issue !== null);

  const formatPrice = (value: number) => value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US");
  const currency = items[0]?.currency;

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <Caption className="text-accent">{t.cart.pageEyebrow}</Caption>
        <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
          {t.cart.pageHeading}
        </Display>
        <Body className="text-muted-foreground">{t.cart.pageDescription}</Body>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t.cart.emptyTitle}
          description={t.cart.emptyDescription}
          action={{ label: t.cart.browseProducts, href: "/products" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <ul className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item, index) => (
              <CartLineItem
                key={item.productId}
                item={item}
                issue={issues[index]}
                lang={lang}
                t={t}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <H2 as="h2" className="text-lg">
              {t.cart.summaryHeading}
            </H2>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Small className="text-muted-foreground">{t.cart.subtotalLabel}</Small>
              <span className="font-mono text-base font-semibold text-foreground">
                {formatPrice(subtotal)} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Small className="font-medium text-foreground">{t.cart.totalLabel}</Small>
              <span className="font-mono text-lg font-semibold text-primary">
                {formatPrice(subtotal)} {currency}
              </span>
            </div>

            {hasBlockingIssue ? (
              <p role="alert" className="text-sm text-destructive">
                {t.cart.checkoutBlockedNotice}
              </p>
            ) : null}

            {hasBlockingIssue ? (
              <Button size="lg" className="mt-1" disabled>
                {t.cart.checkoutCta}
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-1">
                <Link href="/checkout">{t.cart.checkoutCta}</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/products">{t.cart.continueShopping}</Link>
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
