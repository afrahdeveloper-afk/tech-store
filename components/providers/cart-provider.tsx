"use client";

import * as React from "react";

import type { CartItem } from "@/types";
import { CART_STORAGE_KEY, cartCount, cartSubtotal, maxQuantityForStock } from "@/lib/cart";

/**
 * Client-side cart, persisted to `localStorage`. Mirrors
 * `language-provider.tsx`'s `useSyncExternalStore` + module-level pub/sub
 * pattern for the same reason: a value that must survive refresh/navigation
 * but has no server-rendered form (`getServerSnapshot` returns a stable
 * empty cart, matching what an unhydrated page renders).
 *
 * Per CLAUDE.md Phase 7 Step 4, this stays a local/`localStorage` cart —
 * no server cart model exists (or is needed) in `prisma/schema.prisma`; a
 * cart only becomes a real database row (`Order`) at checkout, via
 * `app/checkout/actions.ts`.
 */

let listeners: Array<() => void> = [];
const EMPTY_CART: CartItem[] = [];

// Cache the last-read raw string alongside its parsed form so `getSnapshot`
// returns the *same* array reference when the underlying storage hasn't
// changed — required by `useSyncExternalStore` to avoid re-rendering (or
// looping) on every call.
let cachedRaw: string | null = null;
let cachedCart: CartItem[] = EMPTY_CART;

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

function readCart(): CartItem[] {
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY_CART;
      cachedCart = Array.isArray(parsed) ? parsed : EMPTY_CART;
    } catch {
      cachedCart = EMPTY_CART;
    }
  }
  return cachedCart;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function writeCart(next: CartItem[]) {
  cachedCart = next;
  cachedRaw = JSON.stringify(next);
  window.localStorage.setItem(CART_STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

interface AddItemResult {
  /** How many units were actually added (may be less than requested if stock capped it). */
  added: number;
  /** True if the requested quantity was reduced to respect the stock cap. */
  clamped: boolean;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => AddItemResult;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(subscribe, readCart, getServerSnapshot);

  const addItem = React.useCallback((item: CartItem): AddItemResult => {
    const current = readCart();
    const max = maxQuantityForStock(item.stockState);
    const existing = current.find((candidate) => candidate.productId === item.productId);

    if (existing) {
      const desired = existing.quantity + item.quantity;
      const finalQuantity = Math.min(desired, max);
      const next = current.map((candidate) =>
        candidate.productId === item.productId
          ? { ...candidate, quantity: finalQuantity, price: item.price, stockState: item.stockState }
          : candidate
      );
      writeCart(next);
      return { added: finalQuantity - existing.quantity, clamped: finalQuantity < desired };
    }

    const finalQuantity = Math.min(item.quantity, max);
    if (finalQuantity <= 0) {
      return { added: 0, clamped: true };
    }
    writeCart([...current, { ...item, quantity: finalQuantity }]);
    return { added: finalQuantity, clamped: finalQuantity < item.quantity };
  }, []);

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const target = current.find((candidate) => candidate.productId === productId);
    if (!target) return;

    const clampedQuantity = Math.max(0, Math.min(quantity, maxQuantityForStock(target.stockState)));
    const next =
      clampedQuantity === 0
        ? current.filter((candidate) => candidate.productId !== productId)
        : current.map((candidate) =>
            candidate.productId === productId ? { ...candidate, quantity: clampedQuantity } : candidate
          );
    writeCart(next);
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    writeCart(readCart().filter((candidate) => candidate.productId !== productId));
  }, []);

  const clear = React.useCallback(() => writeCart(EMPTY_CART), []);

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
