import { prisma } from "@/lib/db";
import { createBookingImageSignedUrls } from "@/lib/storage";
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
  /** Photos the customer attached when booking (Customer Booking Gallery / Global Image System). */
  images: BookingImageRef[];
}

/** One image on a `BookingDetail` — see `BookingDetail.images`. */
export interface BookingImageRef {
  id: string;
  url: string;
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

/**
 * The customer's `limit` most recent Order+Booking activity items, newest
 * first — for the Dashboard Overview's "Recent Activity" preview. Deliberately
 * separate from `getCustomerActivity` (not a slice of it): that function
 * fetches the *entire* history with full line-item/relation detail, which
 * would be wasteful to pull in full just to show 5 rows. Each underlying
 * query is capped with `take: limit` at the database level instead.
 */
export async function getRecentCustomerActivity(customerId: string, limit: number): Promise<ActivityItem[]> {
  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: limit, select: orderSelect }),
    prisma.booking.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: limit, select: bookingSelect }),
  ]);

  const items: ActivityItem[] = [
    ...orders.map(toOrderActivityItem),
    ...bookings.map(toBookingActivityItem),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

/** Order/Booking statuses that count as "still happening" for the Dashboard's Active/In Progress stat — excludes every terminal status (DELIVERED/COMPLETED/CANCELLED). */
const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED"];
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"];

export interface NextAppointment {
  id: string;
  bookingNumber: string;
  serviceName: string;
  serviceNameAr: string | null;
  preferredDate: Date;
  preferredTime: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  totalBookings: number;
  /** Orders + bookings whose status is not yet terminal. */
  activeCount: number;
  /** The soonest still-active booking with a preferred date today or later, or null if none. */
  nextAppointment: NextAppointment | null;
}

/**
 * Lightweight counts/aggregates for the Dashboard Overview's stat cards — no
 * chart data, no full-row fetches. Every query is either a `count` or a
 * single-record `findFirst`, all indexed on `customerId`
 * (`@@index([customerId])` on both `Order` and `Booking`), run in one
 * `Promise.all` rather than sequentially.
 */
export async function getCustomerDashboardStats(customerId: string): Promise<DashboardStats> {
  // Matches the exact "start of today, local time" convention
  // `app/booking/actions.ts` already uses for its past-date validation, so a
  // booking made for today still counts as upcoming here.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalOrders, totalBookings, activeOrders, activeBookings, nextBooking] = await Promise.all([
    prisma.order.count({ where: { customerId } }),
    prisma.booking.count({ where: { customerId } }),
    prisma.order.count({ where: { customerId, status: { in: ACTIVE_ORDER_STATUSES } } }),
    prisma.booking.count({ where: { customerId, status: { in: ACTIVE_BOOKING_STATUSES } } }),
    prisma.booking.findFirst({
      where: {
        customerId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        preferredDate: { gte: startOfToday },
      },
      orderBy: { preferredDate: "asc" },
      select: {
        id: true,
        bookingNumber: true,
        serviceNameSnapshot: true,
        preferredDate: true,
        preferredTime: true,
        service: { select: { nameAr: true } },
      },
    }),
  ]);

  const nextAppointment: NextAppointment | null =
    nextBooking && nextBooking.preferredDate
      ? {
          id: nextBooking.id,
          bookingNumber: nextBooking.bookingNumber,
          serviceName: nextBooking.serviceNameSnapshot,
          serviceNameAr: nextBooking.service.nameAr,
          preferredDate: nextBooking.preferredDate,
          preferredTime: nextBooking.preferredTime,
        }
      : null;

  return {
    totalOrders,
    totalBookings,
    activeCount: activeOrders + activeBookings,
    nextAppointment,
  };
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

  // Supplementary query, not added to the shared `bookingSelect` above —
  // `getCustomerActivity`'s list view never renders images, so fetching them
  // for every row in someone's whole order/booking history would be waste;
  // only this single-booking detail read needs the full set (same reasoning
  // as `lib/products-data.ts`'s `getProductBySlug`).
  //
  // Security Correction (Sept 2026): Booking photos live in a PRIVATE
  // Storage bucket — `fetchBookingRow` above already scoped `{id, customerId}`
  // and returned nothing if this booking doesn't belong to this customer
  // (the function already returned early in that case, before this line is
  // even reached), so by the time we're here the caller IS authorized to see
  // these photos. Only now do we fetch `path` and mint fresh, short-lived
  // signed URLs — never the removed `url` column.
  const images = await prisma.bookingImage.findMany({
    where: { bookingId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, path: true },
  });
  const signedUrls = await createBookingImageSignedUrls(images.map((image) => image.path));
  const imageRefs: BookingImageRef[] = images
    .map((image) => ({ id: image.id, url: signedUrls.get(image.path) }))
    .filter((image): image is BookingImageRef => typeof image.url === "string");

  return {
    ...toBookingActivityItem(booking),
    notes: booking.notes,
    updatedAt: booking.updatedAt,
    customerName: booking.customer.name,
    customerEmail: booking.customer.email,
    customerPhone: booking.customer.phone,
    images: imageRefs,
  };
}
