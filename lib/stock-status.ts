import type { StockStatus } from "@/lib/generated/prisma/enums";

/**
 * The one place `Product.stockQuantity -> StockStatus` thresholds live —
 * extracted (Phase 2, Part C) from `app/admin/(dashboard)/products/actions.ts`'s
 * `createProduct`/`updateProduct`, which inlined this same rule twice. Values
 * are unchanged from that existing rule (no new StockStatus values, no new
 * thresholds invented): 0 -> OUT_OF_STOCK, 1-5 -> LOW_STOCK, 6+ -> IN_STOCK.
 *
 * Consumed by both the Admin product form (an admin editing `stockQuantity`
 * directly) and `app/(site)/checkout/actions.ts`'s inventory decrement (a
 * checkout reducing `stockQuantity`) — one rule, two writers, no drift.
 */
export function computeStockStatus(stockQuantity: number): StockStatus {
  if (stockQuantity === 0) return "OUT_OF_STOCK";
  if (stockQuantity <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}
