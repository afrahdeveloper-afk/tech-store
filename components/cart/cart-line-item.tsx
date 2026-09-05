"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { CartItem } from "@/types";
import type { CartItemIssue } from "@/lib/cart";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

/**
 * One `/cart` row. A Client Component (quantity stepper + remove need
 * handlers) — kept isolated from `CartView` per the same "small interactive
 * piece" reasoning as `AddToCartButton`.
 */
export function CartLineItem({
  item,
  issue,
  lang,
  t,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  issue: CartItemIssue | null;
  lang: Lang;
  t: Dictionary;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const name = lang === "ar" ? item.nameAr ?? item.name : item.name;
  const lineTotal = item.price * item.quantity;
  const formatPrice = (value: number) => value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US");

  const issueLabel =
    issue?.type === "removed"
      ? t.cart.issueRemovedTitle
      : issue?.type === "out-of-stock"
        ? t.cart.issueOutOfStockTitle
        : issue?.type === "quantity-exceeds-stock"
          ? t.cart.issueQuantityAdjustedTitle
          : null;
  const issueDescription =
    issue?.type === "removed"
      ? t.cart.issueRemovedDescription
      : issue?.type === "out-of-stock"
        ? t.cart.issueOutOfStockDescription
        : issue?.type === "quantity-exceeds-stock"
          ? t.cart.issueQuantityAdjustedDescription.replace("{max}", String(issue.maxQuantity))
          : null;

  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center",
        issue && "border-destructive/40"
      )}
    >
      <Link
        href={`/products/${item.slug}`}
        className="relative block size-20 shrink-0 self-start overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:self-center"
      >
        {item.image ? (
          <Image src={item.image} alt={name} fill sizes="80px" className="object-contain p-2" />
        ) : (
          <ImagePlaceholder />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <Link
          href={`/products/${item.slug}`}
          className="w-fit rounded-sm text-sm font-semibold text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {name}
        </Link>
        <span className="font-mono text-sm text-muted-foreground">
          {formatPrice(item.price)} {item.currency}
        </span>
        {issueLabel && issueDescription ? (
          <Badge variant="error" className="mt-1 w-fit">
            {issueLabel} — {issueDescription}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div role="group" aria-label={t.cart.quantityLabel} className="flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
            aria-label={t.cart.decreaseQuantity}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-8 px-1 text-center text-sm font-medium text-foreground" aria-live="polite">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
            aria-label={t.cart.increaseQuantity}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        <span className="font-mono text-sm font-semibold text-primary">
          {formatPrice(lineTotal)} {item.currency}
        </span>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          aria-label={`${t.cart.removeItem}: ${name}`}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
