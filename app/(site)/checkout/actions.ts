"use server";

import { getProductsByIds } from "@/lib/products-data";
import {
  isValidEmail,
  isValidPhone,
  exceedsMaxLength,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
} from "@/lib/validation";
import { getOrCreateStoreSettings } from "@/lib/settings-data";
import { computeStockStatus } from "@/lib/stock-status";
import { resolveGuestCustomer } from "@/lib/guest-customer";
import { prisma } from "@/lib/db";

/**
 * Order creation — the one place Prisma is touched for Checkout (CLAUDE.md
 * Phase 7 Step 10: keep database access server-side, never import Prisma
 * into a Client Component). `CheckoutView` calls this directly as a Server
 * Action; Next.js compiles it to an RPC call rather than bundling this
 * module's code (or `DATABASE_URL`) into client JS.
 *
 * Price/availability re-derivation (Phase 12b.1): `input.items` only ever
 * carries `productId`/`quantity` from the client — price was never trusted
 * from the client even before this phase. What changed is the source of
 * truth for that re-derivation: `getProductsByIds` (one query, no N+1) now
 * reads the real, live `Product` rows instead of the frozen
 * `lib/mock/products.ts` snapshot, so a price change or a product being
 * unpublished (`status` no longer `ACTIVE`) in the database is honored
 * immediately at Checkout.
 *
 * Order integrity (Phase 2): `input.items` is aggregated by `productId`
 * before any price/stock work (Part B — a caller submitting the same
 * product across multiple lines gets one OrderItem, not several), and the
 * final, aggregated per-product quantity is decremented from
 * `Product.stockQuantity` atomically, in the same transaction as the
 * `Order`/`OrderItem` rows, via a guarded `UPDATE ... WHERE stockQuantity >=
 * quantity` (Part C) — see the transaction below for exactly why this is
 * safe under concurrent checkouts for the same product.
 */

/** Sane per-product ceiling on a single order line's *aggregated* quantity — guards against integer-overflow/unreasonable-value input, independent of live stock (Part B). Not a stock-derived number; `lib/cart.ts`'s `maxQuantityForStock` is a separate, cart-display-only concept and is not reused here. */
const MAX_ORDER_ITEM_QUANTITY = 500;

/** Thrown inside the transaction to abort it when the guarded stock decrement affects zero rows — caught outside and mapped to the existing `out-of-stock` error (Part C). Never leaks past `createOrder`. */
class InsufficientStockError extends Error {
  constructor(public readonly productId: string) {
    super(`Insufficient stock for product ${productId}`);
  }
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: string; quantity: number }[];
}

export type CheckoutErrorCode =
  | "missing-fields"
  | "invalid-length"
  | "invalid-email"
  | "invalid-phone"
  | "empty-cart"
  | "invalid-product"
  | "out-of-stock"
  | "maintenance"
  | "server-error";

export type CheckoutResult = { success: true; orderNumber: string } | { success: false; error: CheckoutErrorCode };

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${random}`;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  // Defense-in-depth for `StoreSettings.maintenanceMode`: `proxy.ts` already
  // rewrites every customer-facing *page* load to `/maintenance`, but a
  // Server Action is directly callable regardless of what page rendered its
  // trigger (same rule CLAUDE.md's admin auth already documents) — someone
  // with `/checkout` already open before maintenance was switched on could
  // otherwise still submit a real order while the store is "down". Checked
  // first, before any other validation, so a maintenance window never
  // partially validates a request it's going to reject anyway.
  const settings = await getOrCreateStoreSettings();
  if (settings.maintenanceMode) {
    return { success: false, error: "maintenance" };
  }

  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  const phone = input.customerPhone?.trim();

  if (!name || !email || !phone) {
    return { success: false, error: "missing-fields" };
  }
  // Maximum-length validation (Phase 2, Part A) — checked before format
  // validation so an over-long value never even reaches the email/phone
  // regexes; kept alongside the existing checks below via a shared new
  // `invalid-length` code so a genuinely too-long value gets its own honest
  // message instead of being folded into `missing-fields`/`invalid-email`.
  if (exceedsMaxLength(name, MAX_NAME_LENGTH) || exceedsMaxLength(email, MAX_EMAIL_LENGTH) || exceedsMaxLength(phone, MAX_PHONE_LENGTH)) {
    return { success: false, error: "invalid-length" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }
  if (!isValidPhone(phone)) {
    return { success: false, error: "invalid-phone" };
  }
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "empty-cart" };
  }

  // Aggregate duplicate product lines by productId BEFORE any price/stock
  // work (Phase 2, Part B) — a caller could otherwise submit the same
  // productId across multiple lines (e.g. [{A,2},{A,3}]) and have it become
  // two separate OrderItem rows instead of one combined quantity=5 line.
  // Also the one place raw client-supplied quantities are sanity-checked
  // (positive integer, bounded) before they ever reach stock/price math —
  // malformed or unreasonable values are rejected with the same generic
  // `invalid-product` code the unknown-product branch below already uses,
  // rather than a new code that would reveal internal limits.
  const quantityByProductId = new Map<string, number>();
  for (const line of input.items) {
    const productId = typeof line.productId === "string" ? line.productId.trim() : "";
    const quantity = line.quantity;
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_ITEM_QUANTITY) {
      return { success: false, error: "invalid-product" };
    }
    const aggregated = (quantityByProductId.get(productId) ?? 0) + quantity;
    if (aggregated > MAX_ORDER_ITEM_QUANTITY) {
      return { success: false, error: "invalid-product" };
    }
    quantityByProductId.set(productId, aggregated);
  }

  // Re-derive price/availability from the database server-side rather than
  // trusting whatever the client sent — one query for every distinct
  // product (no N+1), only `ACTIVE` products match, so a removed/unpublished
  // product id simply isn't in `productById` and falls into the
  // `invalid-product` branch below.
  const products = await getProductsByIds([...quantityByProductId.keys()]);
  const productById = new Map(products.map((product) => [product.id, product]));

  const lineItems: { productId: string; quantity: number; unitPrice: number; nameSnapshot: string; currency: string }[] = [];
  for (const [productId, quantity] of quantityByProductId) {
    const product = productById.get(productId);
    if (!product) {
      return { success: false, error: "invalid-product" };
    }
    if (product.stockState === "out-of-stock") {
      // Fast path only — a catalog-wide read taken before the transaction,
      // so it can be stale under concurrency. The authoritative check is the
      // guarded, atomic decrement inside the transaction below; this just
      // avoids opening a transaction for a request that's already known to
      // fail. Deliberately NOT clamped down to a smaller quantity (Part B's
      // explicit "do not simply clamp" rule) — an insufficient quantity is a
      // rejection, not a silent reduction.
      return { success: false, error: "out-of-stock" };
    }
    lineItems.push({
      productId: product.id,
      quantity,
      unitPrice: product.discountPrice ?? product.price,
      nameSnapshot: product.name,
      currency: product.currency,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  // The catalog is single-currency in practice (IQD); take the first line's
  // currency rather than hardcoding the schema's default, so this still
  // does the right thing if that ever changes.
  const currency = lineItems[0].currency;

  try {
    const orderNumber = generateOrderNumber();

    await prisma.$transaction(async (tx) => {
      // Atomic, guarded inventory decrement (Phase 2, Part C) — one product
      // at a time, each a single `UPDATE ... WHERE stockQuantity >= quantity`
      // (Prisma's `updateMany` + a `decrement` op compiles to exactly that
      // one guarded SQL statement). Run inside this transaction, so:
      //  - If two checkouts for the same product run concurrently, Postgres
      //    serializes them on that row (the first UPDATE holds the row lock
      //    until commit/rollback) — the second one's WHERE clause is
      //    evaluated against the first's already-applied decrement, so
      //    overselling is impossible regardless of ordering.
      //  - `count !== 1` means the guard failed (not enough stock *right
      //    now*, possibly because a concurrent order just took it) —
      //    throwing here aborts the whole transaction, so no Order/OrderItem
      //    row is ever created for a request that can't be fully fulfilled
      //    (never a partial order).
      for (const item of lineItems) {
        const decremented = await tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (decremented.count !== 1) {
          throw new InsufficientStockError(item.productId);
        }

        // Recompute StockStatus from the just-decremented quantity, using
        // the exact same threshold rule the Admin product form already uses
        // (`lib/stock-status.ts`) — no new StockStatus values invented. Safe
        // to read back inside the same transaction: the UPDATE above already
        // holds this row's lock, so no concurrent writer can change it
        // between the decrement and this read.
        const updated = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { stockQuantity: true },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stockStatus: computeStockStatus(updated.stockQuantity) },
        });
      }

      // Database Security Audit remediation (Sept 2026): was an unconditional
      // `tx.customer.upsert` — see `lib/guest-customer.ts`'s doc comment for
      // why that let anyone overwrite a registered customer's name/phone by
      // email alone, and exactly what this now does instead.
      const customer = await resolveGuestCustomer(tx, { name, email, phone });

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          subtotal,
          discountTotal: 0,
          total: subtotal,
          currency,
        },
      });

      // One OrderItem per final, aggregated product line (Part B) — never
      // per raw input line, so duplicate submitted lines can't produce
      // duplicate OrderItem rows for the same product.
      await tx.orderItem.createMany({
        data: lineItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productNameSnapshot: item.nameSnapshot,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.unitPrice * item.quantity,
        })),
      });
    });

    return { success: true, orderNumber };
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      // Same error code the pre-transaction fast-path above already returns
      // for a known-out-of-stock product — this is the authoritative,
      // concurrency-safe version of that same rejection, not a new business
      // rule (Part C explicitly requires the app's *existing*
      // insufficient-stock error here, not a new one).
      return { success: false, error: "out-of-stock" };
    }
    console.error("createOrder failed:", err);
    return { success: false, error: "server-error" };
  }
}
