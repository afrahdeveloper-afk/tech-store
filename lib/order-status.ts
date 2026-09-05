import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Legal `OrderStatus` transitions — the single source of truth shared by
 * `app/admin/(dashboard)/orders/actions.ts` (server-side enforcement) and
 * `components/admin/orders/order-status-form.tsx` (the Select only offers
 * legal next statuses). Plain module, not `"use server"` — a Server Actions
 * file may only export async functions, so this pure lookup has to live
 * outside `actions.ts` to be importable from a Client Component too.
 * DELIVERED/CANCELLED are terminal.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
