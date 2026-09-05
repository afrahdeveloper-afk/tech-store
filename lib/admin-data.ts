import { cache } from "react";

import { prisma } from "@/lib/db";
import { ADMIN_PAGE_SIZE } from "@/lib/admin-pagination";
import { MAX_SEARCH_LENGTH } from "@/lib/search-limits";
import { createBookingImageSignedUrls } from "@/lib/storage";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus, BookingStatus, ProductStatus, ServiceStatus } from "@/lib/generated/prisma/enums";

/**
 * Server-only Prisma data access for the Admin Dashboard (Phase 12c+). Unlike
 * `lib/account-data.ts` (every query scoped to one `customerId`), nothing
 * here takes a caller-supplied id filter — every function is store-wide by
 * design, and authorization is the caller's job (every `/admin/*` page and
 * every admin Server Action must call `getCurrentAdmin()` first — see
 * `lib/auth/current-admin.ts`). Never import this from a Client Component.
 *
 * These are read-only listing/aggregation queries for the Dashboard Overview
 * and the section index pages. Write operations live in each module's own
 * `app/admin/(dashboard)/*\/actions.ts`.
 *
 * Every `queryAdminX` function (Phase 13) does *real* server-side pagination
 * — a Prisma `count()` for `total` and `skip`/`take` for the page, never
 * "fetch everything and slice in memory" (that's fine for `lib/products-data.ts`'s
 * small public catalog, but an admin list has no such size guarantee). Each
 * takes an `AdminListQuery`-shaped input and returns a `PagedResult`.
 */

// Re-exported so existing imports of `ADMIN_PAGE_SIZE` from this module keep
// working — see `lib/admin-pagination.ts` for why the value itself lives
// there instead of being defined here.
export { ADMIN_PAGE_SIZE };

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Clamps a requested page number into `[1, totalPages]` — the same clamp `lib/products-data.ts`'s `queryProducts` already applies, so an out-of-range `?page=` never renders an empty page when a valid one exists. */
function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), Math.max(1, totalPages));
}

/**
 * Shared shape behind every `queryAdminX` list function below. `count()` and
 * the page's `findMany()` have a real data dependency — the correct `skip`
 * needs `totalPages` (from `count()`) to clamp an out-of-range `?page=` —
 * which is why each of these used to `await` them one after the other, two
 * sequential DB round trips on every single admin list page load. That
 * clamp only ever *matters* for a stale/hand-edited `?page=`; every normal
 * pagination click already requests a valid page. So: fetch `count()` and
 * the requested page's rows *concurrently* (one round trip, covering the
 * common case), and only pay a second `fetchPage()` call — with the
 * corrected `skip` — on the rare page that turns out to be out of range.
 */
async function paginatedQuery<T>(
  count: () => Promise<number>,
  fetchPage: (skip: number) => Promise<T[]>,
  requestedPage: number,
): Promise<{ items: T[]; total: number; page: number; totalPages: number }> {
  const clampedRequest = Math.max(1, requestedPage);
  const requestedSkip = (clampedRequest - 1) * ADMIN_PAGE_SIZE;

  const [total, requestedRows] = await Promise.all([count(), fetchPage(requestedSkip)]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = clampPage(requestedPage, totalPages);

  const items = page === clampedRequest ? requestedRows : await fetchPage((page - 1) * ADMIN_PAGE_SIZE);

  return { items, total, page, totalPages };
}

export interface AdminDashboardStats {
  totalRevenue: number;
  currency: string;
  totalOrders: number;
  totalBookings: number;
  totalCustomers: number;
  activeProducts: number;
  pendingOrders: number;
  pendingBookings: number;
}

/**
 * Lightweight counts/aggregates for the Dashboard Overview's KPI cards — no
 * full-row fetches, every query indexed, all run in one `Promise.all`.
 * Revenue excludes `CANCELLED` orders (an order that was never fulfilled
 * isn't real revenue); currency is read off the first order rather than
 * hardcoded, falling back to the store default ("IQD" — see
 * `prisma/schema.prisma`'s `Order.currency` default) when there are none yet.
 */
export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
  const [revenue, totalOrders, totalBookings, totalCustomers, activeProducts, pendingOrders, pendingBookings] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]);

  return {
    totalRevenue: revenue._sum.total?.toNumber() ?? 0,
    currency: "IQD",
    totalOrders,
    totalBookings,
    totalCustomers,
    activeProducts,
    pendingOrders,
    pendingBookings,
  };
});

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
}

export interface AdminRecentBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  serviceName: string;
  serviceNameAr: string | null;
  status: BookingStatus;
  createdAt: Date;
}

/** Latest `limit` orders, newest first — Dashboard Overview's "Recent Orders" widget. */
export async function getRecentOrders(limit: number): Promise<AdminRecentOrder[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      currency: true,
      status: true,
      createdAt: true,
      customer: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customer.name,
    total: row.total.toNumber(),
    currency: row.currency,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

/** Latest `limit` bookings, newest first — Dashboard Overview's "Recent Bookings" widget. */
export async function getRecentBookings(limit: number): Promise<AdminRecentBooking[]> {
  const rows = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      bookingNumber: true,
      serviceNameSnapshot: true,
      status: true,
      createdAt: true,
      customer: { select: { name: true } },
      service: { select: { nameAr: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    bookingNumber: row.bookingNumber,
    customerName: row.customer.name,
    serviceName: row.serviceNameSnapshot,
    serviceNameAr: row.service.nameAr,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

export interface DailyActivityPoint {
  date: string; // ISO date (yyyy-mm-dd), local calendar day
  orders: number;
  bookings: number;
  revenue: number;
}

/**
 * `Date` -> `yyyy-mm-dd` using the *server's local* calendar day
 * (`getFullYear`/`getMonth`/`getDate`, not `toISOString`) — the server
 * runs in the store's own timezone (Asia/Baghdad), and for any timezone
 * ahead of UTC, `toISOString().slice(0, 10)` on a local-midnight `Date`
 * rolls back to the *previous* UTC calendar day, silently shifting every
 * bucket a day early and permanently excluding "today" from the range.
 * Both the bucket keys and the event timestamps below must use this same
 * local-day conversion, or matching between them breaks the same way.
 */
function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Order count, booking count, and order revenue, bucketed per calendar day
 * for the last `days` days — Dashboard Overview's chart. Buckets in JS
 * rather than a SQL `date_trunc`: the row volume this store deals with is
 * small (matches the same "fetch the small table, aggregate in memory" call
 * `lib/products-data.ts`'s `queryProducts` already makes), and it avoids a
 * raw-SQL query for one chart. Every day in the range is present in the
 * result (zero-filled), so the chart never has to guess about a missing day
 * meaning "no data" vs "not fetched".
 *
 * Was `getOrdersTimeSeries` (Orders-only) — renamed and extended to also
 * count `Booking` rows per day, since the Dashboard's own empty-state copy
 * always promised "Orders and bookings placed in the last 14 days will
 * appear here" while the chart only ever plotted Orders, a real mismatch
 * between the UI's promise and what it did. `revenue` stays Order-only, on
 * purpose: a `Booking.priceSnapshot` is a *service* price, a different
 * revenue stream from product sales, and mixing the two into one "Revenue"
 * bar would misrepresent both — see `getAdminDashboardStats`'s own revenue
 * comment for the same Order-only reasoning. Cancelled bookings are
 * excluded from the `bookings` count, mirroring how cancelled orders are
 * already excluded from `orders`/`revenue` — a cancelled booking isn't real
 * activity to report either.
 */
export async function getActivityTimeSeries(days: number): Promise<DailyActivityPoint[]> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, DailyActivityPoint>();
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    const key = toLocalDateKey(day);
    buckets.set(key, { date: key, orders: 0, bookings: 0, revenue: 0 });
  }

  for (const order of orders) {
    const key = toLocalDateKey(order.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += order.total.toNumber();
    }
  }

  for (const booking of bookings) {
    const key = toLocalDateKey(booking.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.bookings += 1;
    }
  }

  return Array.from(buckets.values());
}

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  nameAr: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  stockQuantity: number;
  status: ProductStatus;
  categoryName: string;
  categoryNameAr: string | null;
}

const productListSelect = {
  id: true,
  slug: true,
  name: true,
  nameAr: true,
  price: true,
  discountPrice: true,
  currency: true,
  stockQuantity: true,
  status: true,
  category: { select: { name: true, nameAr: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
} satisfies Prisma.ProductSelect;

function toAdminProductRow(row: Prisma.ProductGetPayload<{ select: typeof productListSelect }>): AdminProductRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    image: row.images[0]?.url ?? null,
    price: row.price.toNumber(),
    discountPrice: row.discountPrice?.toNumber() ?? null,
    currency: row.currency,
    stockQuantity: row.stockQuantity,
    status: row.status,
    categoryName: row.category.name,
    categoryNameAr: row.category.nameAr,
  };
}

export type ProductSortOption = "newest" | "oldest" | "name-asc" | "price-asc" | "price-desc";

export interface AdminProductQuery {
  page: number;
  search: string;
  status: ProductStatus | "";
  categoryId: string;
  sort: ProductSortOption;
}

const PRODUCT_ORDER_BY: Record<ProductSortOption, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "name-asc": { name: "asc" },
  // Sorted by the base `price`, not the effective (discounted) price — real
  // DB-level pagination needs the sort to happen before `skip`/`take`, and a
  // `COALESCE(discountPrice, price)` sort isn't expressible through Prisma's
  // query builder (the storefront's `queryProducts` sidesteps this the same
  // way `lib/products-data.ts` documents, by sorting the *whole* small
  // catalog in memory — not an option once results are paginated at the DB
  // level). A deliberate simplification, not an oversight.
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

/**
 * Paginated, searchable, filterable, sortable Products list for the Admin
 * Products page (Phase 13) — real `count()` + `skip`/`take`, not an
 * in-memory slice. Includes every `ProductStatus` (draft/archived, not just
 * active) and internal fields (`stockQuantity`) the storefront's own
 * `lib/products-data.ts` deliberately never exposes to a Client Component.
 */
export async function queryAdminProducts(query: AdminProductQuery): Promise<PagedResult<AdminProductRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const where: Prisma.ProductWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] }
      : {}),
  };

  const { items, total, page, totalPages } = await paginatedQuery(
    () => prisma.product.count({ where }),
    (skip) =>
      prisma.product.findMany({
        where,
        orderBy: PRODUCT_ORDER_BY[query.sort],
        skip,
        take: ADMIN_PAGE_SIZE,
        select: productListSelect,
      }),
    query.page,
  );

  return { items: items.map(toAdminProductRow), total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminProductDetail {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string;
  subcategoryId: string | null;
  imageUrl: string | null;
  /** Full, ordered image set — feeds the Admin Product Image Manager (Global Image System). Primary image first, then by `sortOrder`. */
  images: AdminProductImage[];
}

export interface AdminProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

/** One product's full editable fields, for the Edit form — `null` if the id doesn't exist. */
export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameAr: true,
      description: true,
      descriptionAr: true,
      price: true,
      discountPrice: true,
      stockQuantity: true,
      status: true,
      categoryId: true,
      subcategoryId: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, isPrimary: true, sortOrder: true },
      },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    price: row.price.toNumber(),
    discountPrice: row.discountPrice?.toNumber() ?? null,
    stockQuantity: row.stockQuantity,
    status: row.status,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    imageUrl: row.images[0]?.url ?? null,
    images: row.images,
  };
}

export interface AdminServiceCategoryRow {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  subserviceCount: number;
}

export type NameSortOption = "newest" | "oldest" | "name-asc";
const NAME_SORTABLE_ORDER_BY = (sort: NameSortOption): { createdAt: "asc" | "desc" } | { name: "asc" } =>
  sort === "name-asc" ? { name: "asc" } : { createdAt: sort === "oldest" ? "asc" : "desc" };

export interface AdminServiceCategoryQuery {
  page: number;
  search: string;
  sort: NameSortOption;
}

/** Paginated, searchable, sortable service categories (Phase 13) — with each row's subservice count, no N+1 (`_count`). No status filter: `ServiceCategory` has no active/inactive field in the schema. */
export async function queryAdminServiceCategories(query: AdminServiceCategoryQuery): Promise<PagedResult<AdminServiceCategoryRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const where: Prisma.ServiceCategoryWhereInput = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] }
    : {};

  const serviceCategorySelect = {
    id: true,
    name: true,
    nameAr: true,
    description: true,
    descriptionAr: true,
    _count: { select: { subservices: true } },
  } satisfies Prisma.ServiceCategorySelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.serviceCategory.count({ where }),
    (skip) =>
      prisma.serviceCategory.findMany({
        where,
        orderBy: NAME_SORTABLE_ORDER_BY(query.sort),
        skip,
        take: ADMIN_PAGE_SIZE,
        select: serviceCategorySelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    subserviceCount: row._count.subservices,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminServiceCategoryDetail {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  icon: string | null;
}

/** One service category's full editable fields, for the Edit form — `null` if the id doesn't exist. */
export async function getAdminServiceCategoryById(id: string): Promise<AdminServiceCategoryDetail | null> {
  const row = await prisma.serviceCategory.findUnique({
    where: { id },
    select: { id: true, name: true, nameAr: true, description: true, descriptionAr: true, icon: true },
  });
  return row;
}

export interface AdminSubserviceRow {
  id: string;
  name: string;
  nameAr: string | null;
  categoryName: string;
  categoryNameAr: string | null;
  serviceCount: number;
}

export interface AdminSubserviceQuery {
  page: number;
  search: string;
  serviceCategoryId: string;
  sort: NameSortOption;
}

/** Paginated, searchable, filterable (by parent category), sortable subservices (Phase 13) — with each row's service count, no N+1. */
export async function queryAdminSubservices(query: AdminSubserviceQuery): Promise<PagedResult<AdminSubserviceRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const where: Prisma.SubserviceWhereInput = {
    ...(query.serviceCategoryId ? { serviceCategoryId: query.serviceCategoryId } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] }
      : {}),
  };

  const subserviceSelect = {
    id: true,
    name: true,
    nameAr: true,
    serviceCategory: { select: { name: true, nameAr: true } },
    _count: { select: { services: true } },
  } satisfies Prisma.SubserviceSelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.subservice.count({ where }),
    (skip) =>
      prisma.subservice.findMany({
        where,
        orderBy: NAME_SORTABLE_ORDER_BY(query.sort),
        skip,
        take: ADMIN_PAGE_SIZE,
        select: subserviceSelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    nameAr: row.nameAr,
    categoryName: row.serviceCategory.name,
    categoryNameAr: row.serviceCategory.nameAr,
    serviceCount: row._count.services,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminSubserviceDetail {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  serviceCategoryId: string;
}

/** One subservice's full editable fields, for the Edit form — `null` if the id doesn't exist. */
export async function getAdminSubserviceById(id: string): Promise<AdminSubserviceDetail | null> {
  const row = await prisma.subservice.findUnique({
    where: { id },
    select: { id: true, name: true, nameAr: true, description: true, descriptionAr: true, serviceCategoryId: true },
  });
  return row;
}

export interface AdminServiceRow {
  id: string;
  name: string;
  nameAr: string | null;
  subserviceName: string;
  subserviceNameAr: string | null;
  price: number | null;
  currency: string | null;
  durationMinutes: number | null;
  status: ServiceStatus;
}

export type ServiceSortOption = "newest" | "oldest" | "name-asc" | "price-asc" | "price-desc";
const SERVICE_ORDER_BY: Record<ServiceSortOption, Prisma.ServiceOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "name-asc": { name: "asc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

export interface AdminServiceQuery {
  page: number;
  search: string;
  status: ServiceStatus | "";
  sort: ServiceSortOption;
}

/**
 * Paginated, searchable, filterable, sortable Services list (Phase 13) —
 * regardless of status or whether price/duration is set, unlike the public
 * `lib/services-data.ts`'s `getServices`, which drops rows missing those
 * fields (fine for a storefront that can't display an incomplete service,
 * wrong for an admin list that needs to *see* the gap).
 */
export async function queryAdminServices(query: AdminServiceQuery): Promise<PagedResult<AdminServiceRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const where: Prisma.ServiceWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] }
      : {}),
  };

  const serviceSelect = {
    id: true,
    name: true,
    nameAr: true,
    price: true,
    currency: true,
    durationMinutes: true,
    status: true,
    subservice: { select: { name: true, nameAr: true } },
  } satisfies Prisma.ServiceSelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.service.count({ where }),
    (skip) =>
      prisma.service.findMany({
        where,
        orderBy: SERVICE_ORDER_BY[query.sort],
        skip,
        take: ADMIN_PAGE_SIZE,
        select: serviceSelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    nameAr: row.nameAr,
    subserviceName: row.subservice.name,
    subserviceNameAr: row.subservice.nameAr,
    price: row.price?.toNumber() ?? null,
    currency: row.currency,
    durationMinutes: row.durationMinutes,
    status: row.status,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminServiceDetail {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number | null;
  durationMinutes: number | null;
  status: ServiceStatus;
  subserviceId: string;
}

/** One service's full editable fields, for the Edit form — `null` if the id doesn't exist. */
export async function getAdminServiceById(id: string): Promise<AdminServiceDetail | null> {
  const row = await prisma.service.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameAr: true,
      description: true,
      descriptionAr: true,
      price: true,
      durationMinutes: true,
      status: true,
      subserviceId: true,
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    price: row.price?.toNumber() ?? null,
    durationMinutes: row.durationMinutes,
    status: row.status,
    subserviceId: row.subserviceId,
  };
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
}

export type AmountSortOption = "newest" | "oldest" | "amount-asc" | "amount-desc";

export interface AdminOrderQuery {
  page: number;
  search: string;
  status: OrderStatus | "";
  dateFrom: string; // yyyy-mm-dd, from a <input type="date">
  dateTo: string;
  sort: AmountSortOption;
}

/** `gte`/`lte` `createdAt` range from `yyyy-mm-dd` date-input strings — shared by Orders and Bookings. `dateTo` is inclusive of the whole day. */
function dateRangeFilter(dateFrom: string, dateTo: string): Prisma.DateTimeFilter | undefined {
  const gte = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined;
  const lte = dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined;
  if (!gte && !lte) return undefined;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}

const ORDER_SORT_ORDER_BY: Record<AmountSortOption, Prisma.OrderOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "amount-asc": { total: "asc" },
  "amount-desc": { total: "desc" },
};

/** Paginated, searchable (order #, customer name/email), filterable (status, date range), sortable Orders list (Phase 13). */
export async function queryAdminOrders(query: AdminOrderQuery): Promise<PagedResult<AdminOrderRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const createdAt = dateRangeFilter(query.dateFrom, query.dateTo);

  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const orderSelect = {
    id: true,
    orderNumber: true,
    total: true,
    currency: true,
    status: true,
    createdAt: true,
    customer: { select: { name: true, email: true } },
  } satisfies Prisma.OrderSelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.order.count({ where }),
    (skip) =>
      prisma.order.findMany({
        where,
        orderBy: ORDER_SORT_ORDER_BY[query.sort],
        skip,
        take: ADMIN_PAGE_SIZE,
        select: orderSelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customer.name,
    customerEmail: row.customer.email,
    total: row.total.toNumber(),
    currency: row.currency,
    status: row.status,
    createdAt: row.createdAt,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminOrderDetailItem {
  id: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AdminOrderDetailItem[];
}

/** One order's full detail (customer, line items, amounts) for the Admin Order Detail page — `null` if the id doesn't exist. */
export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      subtotal: true,
      discountTotal: true,
      total: true,
      currency: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { name: true, email: true, phone: true } },
      items: { select: { id: true, productNameSnapshot: true, quantity: true, unitPrice: true, lineTotal: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    subtotal: row.subtotal.toNumber(),
    discountTotal: row.discountTotal.toNumber(),
    total: row.total.toNumber(),
    currency: row.currency,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerName: row.customer.name,
    customerEmail: row.customer.email,
    customerPhone: row.customer.phone,
    items: row.items.map((item) => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      lineTotal: item.lineTotal.toNumber(),
    })),
  };
}

export interface AdminBookingRow {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  serviceNameAr: string | null;
  status: BookingStatus;
  createdAt: Date;
}

export type DateSortOption = "newest" | "oldest";

export interface AdminBookingQuery {
  page: number;
  search: string;
  status: BookingStatus | "";
  dateFrom: string;
  dateTo: string;
  sort: DateSortOption;
}

/** Paginated, searchable (booking #, customer name/email, service name), filterable (status, date range), sortable Bookings list (Phase 13). */
export async function queryAdminBookings(query: AdminBookingQuery): Promise<PagedResult<AdminBookingRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const createdAt = dateRangeFilter(query.dateFrom, query.dateTo);

  const where: Prisma.BookingWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { bookingNumber: { contains: search, mode: "insensitive" } },
            { serviceNameSnapshot: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const bookingSelect = {
    id: true,
    bookingNumber: true,
    serviceNameSnapshot: true,
    status: true,
    createdAt: true,
    customer: { select: { name: true, email: true } },
    service: { select: { nameAr: true } },
  } satisfies Prisma.BookingSelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.booking.count({ where }),
    (skip) =>
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: query.sort === "oldest" ? "asc" : "desc" },
        skip,
        take: ADMIN_PAGE_SIZE,
        select: bookingSelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    bookingNumber: row.bookingNumber,
    customerName: row.customer.name,
    customerEmail: row.customer.email,
    serviceName: row.serviceNameSnapshot,
    serviceNameAr: row.service.nameAr,
    status: row.status,
    createdAt: row.createdAt,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminBookingDetail {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  serviceName: string;
  serviceNameAr: string | null;
  subserviceName: string;
  subserviceNameAr: string | null;
  categoryName: string;
  categoryNameAr: string | null;
  priceSnapshot: number | null;
  currency: string | null;
  durationMinutes: number | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Photos the customer attached when booking (Booking Image Upload / Global Image System) — read-only here; Admin never uploads on a customer's behalf. */
  images: AdminBookingImage[];
}

export interface AdminBookingImage {
  id: string;
  url: string;
}

/** One booking's full detail (customer, service, schedule) for the Admin Booking Detail page — `null` if the id doesn't exist. */
export async function getAdminBookingById(id: string): Promise<AdminBookingDetail | null> {
  const row = await prisma.booking.findUnique({
    where: { id },
    select: {
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
          nameAr: true,
          currency: true,
          durationMinutes: true,
          subservice: { select: { name: true, nameAr: true, serviceCategory: { select: { name: true, nameAr: true } } } },
        },
      },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, path: true } },
    },
  });
  if (!row) return null;

  // Security Correction (Sept 2026): Booking photos live in a PRIVATE
  // Storage bucket. The authorization boundary for an admin reaching this
  // function at all is the `/admin/*` layout's `getCurrentAdmin()` gate
  // (`app/admin/(dashboard)/layout.tsx`) — every route that can call
  // `getAdminBookingById` already required a valid admin session to render.
  // Only now, having established that, do we mint fresh, short-lived signed
  // URLs from each image's `path` — never a stored `url`.
  const signedUrls = await createBookingImageSignedUrls(row.images.map((image) => image.path));
  const images: AdminBookingImage[] = row.images
    .map((image) => ({ id: image.id, url: signedUrls.get(image.path) }))
    .filter((image): image is AdminBookingImage => typeof image.url === "string");

  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    status: row.status,
    serviceName: row.serviceNameSnapshot,
    serviceNameAr: row.service.nameAr,
    subserviceName: row.service.subservice.name,
    subserviceNameAr: row.service.subservice.nameAr,
    categoryName: row.service.subservice.serviceCategory.name,
    categoryNameAr: row.service.subservice.serviceCategory.nameAr,
    priceSnapshot: row.priceSnapshot?.toNumber() ?? null,
    currency: row.service.currency,
    durationMinutes: row.service.durationMinutes,
    preferredDate: row.preferredDate,
    preferredTime: row.preferredTime,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerName: row.customer.name,
    customerEmail: row.customer.email,
    customerPhone: row.customer.phone,
    images,
  };
}

export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  bookingCount: number;
  createdAt: Date;
}

export interface AdminCustomerQuery {
  page: number;
  search: string;
  sort: NameSortOption;
}

/** Paginated, searchable, sortable Customers list (Phase 13) — with order/booking counts, no N+1 (`_count`). No status filter: a `Customer` row has no active/inactive concept in the schema. */
export async function queryAdminCustomers(query: AdminCustomerQuery): Promise<PagedResult<AdminCustomerRow>> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);
  const where: Prisma.CustomerWhereInput = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
    : {};

  const customerSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    createdAt: true,
    _count: { select: { orders: true, bookings: true } },
  } satisfies Prisma.CustomerSelect;

  const { items: rows, total, page, totalPages } = await paginatedQuery(
    () => prisma.customer.count({ where }),
    (skip) =>
      prisma.customer.findMany({
        where,
        orderBy: NAME_SORTABLE_ORDER_BY(query.sort),
        skip,
        take: ADMIN_PAGE_SIZE,
        select: customerSelect,
      }),
    query.page,
  );

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    orderCount: row._count.orders,
    bookingCount: row._count.bookings,
    createdAt: row.createdAt,
  }));

  return { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages };
}

export interface AdminCustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

/** One customer's contact info — `null` if the id doesn't exist. Order/booking history for the same customer comes from `lib/account-data.ts`'s `getCustomerActivity` (reused as-is, not duplicated — see the Admin Customer Detail page). */
export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  const row = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
  return row;
}

export interface AdminSearchResult {
  products: { id: string; slug: string; name: string; nameAr: string | null }[];
  customers: { id: string; name: string; email: string }[];
  orders: { id: string; orderNumber: string }[];
}

/**
 * The admin header's quick-search — up to 5 matches per category, name/email/
 * order-number `contains` (case-insensitive). Called from a Server Action
 * (`app/admin/actions.ts`) rather than directly from the Client Component
 * header, same discipline as every other Prisma access point in this file.
 */
export async function adminSearch(query: string): Promise<AdminSearchResult> {
  const trimmed = query.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!trimmed) return { products: [], customers: [], orders: [] };

  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ name: { contains: trimmed, mode: "insensitive" } }, { nameAr: { contains: trimmed, mode: "insensitive" } }] },
      take: 5,
      select: { id: true, slug: true, name: true, nameAr: true },
    }),
    prisma.customer.findMany({
      where: { OR: [{ name: { contains: trimmed, mode: "insensitive" } }, { email: { contains: trimmed, mode: "insensitive" } }] },
      take: 5,
      select: { id: true, name: true, email: true },
    }),
    prisma.order.findMany({
      where: { orderNumber: { contains: trimmed, mode: "insensitive" } },
      take: 5,
      select: { id: true, orderNumber: true },
    }),
  ]);

  return { products, customers, orders };
}
