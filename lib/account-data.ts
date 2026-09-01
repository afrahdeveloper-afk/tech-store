import { prisma } from "@/lib/db";
import type { OrderStatus, BookingStatus } from "@/lib/generated/prisma/enums";

/**
 * Server-only data-access for the Customer Account phase (see CLAUDE.md).
 * Every function here takes `customerId` from `getCurrentCustomer()` (never
 * a client-supplied id) and folds it directly into the Prisma `where`
 * clause — that's the actual authorization boundary per this phase's
 * Security/Authorization rules: a query for someone else's order/booking id
 * simply returns nothing, rather than being checked-and-rejected after the
 * fact. Keeps Prisma out of Server/Client Components, same discipline as
 * `app/checkout/actions.ts` / `app/booking/actions.ts`.
 *
 * Only the fields the account UI actually renders are selected (no
 * `passwordHash`, no unrelated relations) — see CLAUDE.md Step 20.
 *
 * Note on `updatedAt` (used by the detail pages' status timeline as a
 * "Last updated" date for terminal statuses): `Order`/`Booking` have no
 * dedicated `deliveredAt`/`completedAt` column, only `createdAt`/`updatedAt`
 * (Prisma's `@updatedAt`, touched on *any* row edit). Rather than adding a
 * migration for a column nothing else needs yet, the UI shows `updatedAt`
 * honestly labeled "Last updated" — not "Completed on" — when status is
 * DELIVERED/COMPLETED/CANCELLED. Revisit with a real timestamp column if a
 * future requirement needs a guaranteed-accurate completion date.
 */

export interface OrderLineItem {
  id: string;
  productNameSnapshot: string;
  /** The live product's Arabic name, when the product still exists — search only, display always uses the English snapshot (see the module note). */
  productNameArLive: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  categoryName: string | null;
  categoryNameAr: string | null;
}

export interface OrderActivityItem {
  kind: "order";
  id: string;
  number: string;
  createdAt: Date;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderLineItem[];
}

export interface BookingActivityItem {
  kind: "booking";
  id: string;
  number: string;
  createdAt: Date;
  status: BookingStatus;
  serviceName: string;
  serviceNameAr: string | null;
  subserviceName: string | null;
  subserviceNameAr: string | null;
  categoryName: string | null;
  categoryNameAr: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  durationMinutes: number | null;
  price: number | null;
  currency: string | null;
}

export type ActivityItem = OrderActivityItem | BookingActivityItem;

export interface OrderDetail extends OrderActivityItem {
  subtotal: number;
  discountTotal: number;
  /** Last time this row changed — see `lib/account-data.ts`'s module note on why this isn't a dedicated "delivered at" timestamp. */
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface BookingDetail extends BookingActivityItem {
  notes: string | null;
  /** Last time this row changed — see `lib/account-data.ts`'s module note on why this isn't a dedicated "completed at" timestamp. */
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  total: true,
  subtotal: true,
  discountTotal: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { name: true, email: true, phone: true } },
  items: {
    select: {
      id: true,
      productNameSnapshot: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
      product: { select: { nameAr: true, category: { select: { name: true, nameAr: true } } } },
    },
  },
} as const;

const bookingSelect = {
  id: true,
  bookingNumber: true,
  status: true,
  serviceNameSnapshot: true,
  priceSnapshot: true,
  preferredDate: true,
  preferredTime: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { name: true, email: true, phone: true } },
  service: {
    select: {
      name: true,
      nameAr: true,
      currency: true,
      durationMinutes: true,
      subservice: {
        select: {
          name: true,
          nameAr: true,
          serviceCategory: { select: { name: true, nameAr: true } },
        },
      },
    },
  },
} as const;

type OrderRow = NonNullable<Awaited<ReturnType<typeof fetchOrderRow>>>;
type BookingRow = NonNullable<Awaited<ReturnType<typeof fetchBookingRow>>>;

function fetchOrderRow(where: { id: string; customerId: string }) {
  return prisma.order.findFirst({ where, select: orderSelect });
}

function fetchBookingRow(where: { id: string; customerId: string }) {
  return prisma.booking.findFirst({ where, select: bookingSelect });
}

function toOrderActivityItem(order: OrderRow): OrderActivityItem {
  return {
    kind: "order",
    id: order.id,
    number: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total.toNumber(),
    currency: order.currency,
    items: order.items.map((item) => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      productNameArLive: item.product?.nameAr ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      lineTotal: item.lineTotal.toNumber(),
      categoryName: item.product?.category.name ?? null,
      categoryNameAr: item.product?.category.nameAr ?? null,
    })),
  };
}

function toBookingActivityItem(booking: BookingRow): BookingActivityItem {
  return {
    kind: "booking",
    id: booking.id,
    number: booking.bookingNumber,
    createdAt: booking.createdAt,
    status: booking.status,
    serviceName: booking.service.name,
    serviceNameAr: booking.service.nameAr,
    subserviceName: booking.service.subservice.name,
    subserviceNameAr: booking.service.subservice.nameAr,
    categoryName: booking.service.subservice.serviceCategory.name,
    categoryNameAr: booking.service.subservice.serviceCategory.nameAr,
    preferredDate: booking.preferredDate,
    preferredTime: booking.preferredTime,
    durationMinutes: booking.service.durationMinutes,
    price: booking.priceSnapshot?.toNumber() ?? null,
    currency: booking.service.currency,
  };
}

/** The customer's complete Order + Booking history, newest first. */
export async function getCustomerActivity(customerId: string): Promise<ActivityItem[]> {
  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, select: orderSelect }),
    prisma.booking.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, select: bookingSelect }),
  ]);

  const items: ActivityItem[] = [
    ...orders.map(toOrderActivityItem),
    ...bookings.map(toBookingActivityItem),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** A single order, scoped to `customerId` — returns null if it doesn't exist or belongs to someone else. */
export async function getCustomerOrder(customerId: string, orderId: string): Promise<OrderDetail | null> {
  const order = await fetchOrderRow({ id: orderId, customerId });
  if (!order) return null;

  return {
    ...toOrderActivityItem(order),
    subtotal: order.subtotal.toNumber(),
    discountTotal: order.discountTotal.toNumber(),
    updatedAt: order.updatedAt,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    customerPhone: order.customer.phone,
  };
}

/** A single booking, scoped to `customerId` — returns null if it doesn't exist or belongs to someone else. */
export async function getCustomerBooking(customerId: string, bookingId: string): Promise<BookingDetail | null> {
  const booking = await fetchBookingRow({ id: bookingId, customerId });
  if (!booking) return null;

  return {
    ...toBookingActivityItem(booking),
    notes: booking.notes,
    updatedAt: booking.updatedAt,
    customerName: booking.customer.name,
    customerEmail: booking.customer.email,
    customerPhone: booking.customer.phone,
  };
}
