"use server";

import { mockProducts } from "@/lib/mock/products";
import { maxQuantityForStock } from "@/lib/cart";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { prisma } from "@/lib/db";

/**
 * Order creation — the one place Prisma is touched for Checkout (CLAUDE.md
 * Phase 7 Step 10: keep database access server-side, never import Prisma
 * into a Client Component). `CheckoutView` calls this directly as a Server
 * Action; Next.js compiles it to an RPC call rather than bundling this
 * module's code (or `DATABASE_URL`) into client JS.
 */

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: string; quantity: number }[];
}

export type CheckoutErrorCode =
  | "missing-fields"
  | "invalid-email"
  | "invalid-phone"
  | "empty-cart"
  | "invalid-product"
  | "out-of-stock"
  | "server-error";

export type CheckoutResult = { success: true; orderNumber: string } | { success: false; error: CheckoutErrorCode };

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${random}`;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  const phone = input.customerPhone?.trim();

  if (!name || !email || !phone) {
    return { success: false, error: "missing-fields" };
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

  // Re-derive price/availability from the catalog server-side rather than
  // trusting whatever the client sent — `lib/mock/products.ts` is the one
  // source of truth for product data (nothing reads the DB catalog yet, see
  // CLAUDE.md "Current Project Status").
  const lineItems: { productId: string; quantity: number; unitPrice: number; nameSnapshot: string; currency: string }[] = [];
  for (const line of input.items) {
    const product = mockProducts.find((candidate) => candidate.id === line.productId);
    if (!product) {
      return { success: false, error: "invalid-product" };
    }
    if (product.stockState === "out-of-stock") {
      return { success: false, error: "out-of-stock" };
    }
    const quantity = Math.max(1, Math.min(line.quantity, maxQuantityForStock(product.stockState)));
    lineItems.push({
      productId: product.id,
      quantity,
      unitPrice: product.discountPrice ?? product.price,
      nameSnapshot: product.name,
      currency: product.currency,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  // The catalog is single-currency in practice; take the first line's
  // currency rather than hardcoding the schema's IQD default, since mock
  // product prices are still SAR-labeled (see CLAUDE.md Known Issues).
  const currency = lineItems[0].currency;

  try {
    const orderNumber = generateOrderNumber();

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email },
        update: { name, phone },
        create: { name, email, phone },
      });

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
    console.error("createOrder failed:", err);
    return { success: false, error: "server-error" };
  }
}
