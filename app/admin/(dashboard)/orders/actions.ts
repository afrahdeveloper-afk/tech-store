"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { ORDER_TRANSITIONS } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Orders — status transitions only. No create/delete: an `Order` is only
 * ever created by `app/(site)/checkout/actions.ts`'s `createOrder`, and
 * deleting a financial record isn't semantically valid (see CLAUDE.md's
 * Admin Dashboard scope: "Delete/cancel only where semantically valid" —
 * for Orders that means a status change to `CANCELLED`, never a hard
 * delete). Re-checks `getCurrentAdmin()`, same as every other admin Server
 * Action. Valid transitions live in `lib/order-status.ts` (a Server Actions
 * file may only export async functions, so the lookup table can't live
 * here — it's shared with the Client Component Select that only offers
 * legal next statuses).
 */

export type OrderStatusMutationErrorCode = "unauthorized" | "not-found" | "invalid-transition" | "server-error";
export type OrderStatusMutationResult = { success: true } | { success: false; error: OrderStatusMutationErrorCode };

export async function updateOrderStatus(id: string, nextStatus: OrderStatus): Promise<OrderStatusMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return { success: false, error: "not-found" };

  if (!ORDER_TRANSITIONS[order.status].includes(nextStatus)) {
    return { success: false, error: "invalid-transition" };
  }

  try {
    await prisma.order.update({ where: { id }, data: { status: nextStatus } });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("updateOrderStatus failed:", err);
    return { success: false, error: "server-error" };
  }
}
