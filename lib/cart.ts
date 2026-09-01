import type { CartItem, Product, StockState } from "@/types";

/** `localStorage` key for the cart — see `components/providers/cart-provider.tsx`. */
export const CART_STORAGE_KEY = "speedcore-cart";

/**
 * Frontend `Product`/`Service` mock data has no numeric inventory count
 * (`stockState` is only a tri-state — see `types/index.ts`), so cart
 * quantity caps are derived from it. These numbers mirror the plausible
 * `stockQuantity` values `prisma/seed.ts` assigns to each `stockState` when
 * seeding the database, so a cart quantity cap here matches what the DB
 * would actually report if the frontend read live inventory.
 */
const STOCK_QUANTITY_BY_STATE: Record<StockState, number> = {
  "in-stock": 25,
  "low-stock": 4,
  "out-of-stock": 0,
};

export function maxQuantityForStock(stockState: StockState): number {
  return STOCK_QUANTITY_BY_STATE[stockState];
}

/** Snapshots a `Product` into a `CartItem` at add-to-cart time. */
export function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    nameAr: product.nameAr,
    image: product.image,
    price: product.discountPrice ?? product.price,
    currency: product.currency,
    quantity,
    stockState: product.stockState,
  };
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export type CartItemIssue =
  | { type: "removed" }
  | { type: "out-of-stock" }
  | { type: "quantity-exceeds-stock"; maxQuantity: number };

/**
 * Cross-checks stored cart items against the current product catalog —
 * a product may have been removed or gone out of stock since it was added.
 * Used by `/cart` to surface per-item warnings and block checkout on
 * unresolved issues (CLAUDE.md Phase 7 Step 3/14 "invalid item").
 */
export function findCartItemIssue(item: CartItem, products: Product[]): CartItemIssue | null {
  const product = products.find((candidate) => candidate.id === item.productId);
  if (!product) return { type: "removed" };
  if (product.stockState === "out-of-stock") return { type: "out-of-stock" };
  const maxQuantity = maxQuantityForStock(product.stockState);
  if (item.quantity > maxQuantity) return { type: "quantity-exceeds-stock", maxQuantity };
  return null;
}
