"use client";

import * as React from "react";
import { Check, ShoppingCart } from "lucide-react";

import type { Product } from "@/types";
import type { Dictionary } from "@/lib/i18n/translations";
import { toCartItem } from "@/lib/cart";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/**
 * The one interactive piece of "Add to Cart" — deliberately small per
 * CLAUDE.md's Architecture Rules ("Server Component → small Client
 * Component → Interactive UI"), so `ProductCard` (used from both server-
 * and client-rendered lists) and `ProductDetailView` can each stay/mostly
 * stay non-interactive and just drop this in.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  t,
  size = "default",
  className,
}: {
  product: Product;
  quantity?: number;
  t: Dictionary;
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
}) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isOutOfStock = product.stockState === "out-of-stock";

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleClick = () => {
    if (isOutOfStock) return;
    addItem(toCartItem(product, quantity));
    setFeedback(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFeedback(false), 2000);
  };

  return (
    <Button
      type="button"
      size={size}
      disabled={isOutOfStock}
      onClick={handleClick}
      className={cn("flex-1", className)}
    >
      {feedback ? (
        <Check data-icon="inline-start" aria-hidden="true" />
      ) : (
        <ShoppingCart data-icon="inline-start" aria-hidden="true" />
      )}
      <span aria-live="polite">{feedback ? t.cart.addedToCart : t.products.addToCart}</span>
    </Button>
  );
}
