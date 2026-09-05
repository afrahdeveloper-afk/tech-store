import { cache } from "react";
import { unstable_cache } from "next/cache";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { Service, ServiceCategory, Subservice } from "@/types";
import { prisma } from "@/lib/db";

/**
 * Server-only Prisma data access for the public Services catalog (Phase
 * 12b — migrates `/services`, `/services/[id]`, the homepage's Services
 * Overview, and `/about`'s capabilities chip list off `lib/mock/*.ts`).
 * Never import this from a Client Component — same discipline as
 * `lib/products-data.ts`/`lib/db.ts`.
 *
 * `lib/mock/services.ts`/`subservices.ts`/`service-items.ts` stay in place,
 * untouched — Booking still reads them to resolve the service a booking
 * references (see CLAUDE.md "Current Project Status", Known Issues) until a
 * later phase migrates that too.
 *
 * Unlike Products, no listing here needs search/filter/sort/pagination —
 * `/services` is a synchronous client-side accordion (`ServiceCategoriesExplorer`)
 * over the *entire* catalog (8 categories / 26 subservices / 31 services,
 * small enough to load in full up front, exactly like the mock data it
 * replaces), so no Server Action is needed — every function here is called
 * once, server-side, by a route's `page.tsx`.
 */

const serviceCategorySelect = {
  id: true,
  slug: true,
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  icon: true,
} satisfies Prisma.ServiceCategorySelect;

const subserviceSelect = {
  id: true,
  slug: true,
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  serviceCategoryId: true,
} satisfies Prisma.SubserviceSelect;

const serviceSelect = {
  id: true,
  slug: true,
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  price: true,
  currency: true,
  durationMinutes: true,
  image: true,
  status: true,
  subserviceId: true,
} satisfies Prisma.ServiceSelect;

type ServiceCategoryRow = Prisma.ServiceCategoryGetPayload<{ select: typeof serviceCategorySelect }>;
type SubserviceRow = Prisma.SubserviceGetPayload<{ select: typeof subserviceSelect }>;
type ServiceRow = Prisma.ServiceGetPayload<{ select: typeof serviceSelect }>;

function toServiceCategory(row: ServiceCategoryRow): ServiceCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    description: row.description,
    descriptionAr: row.descriptionAr ?? undefined,
    icon: row.icon ?? undefined,
  };
}

function toSubservice(row: SubserviceRow): Subservice {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    serviceCategoryId: row.serviceCategoryId,
    description: row.description ?? undefined,
    descriptionAr: row.descriptionAr ?? undefined,
  };
}

/**
 * `price`/`currency`/`durationMinutes` are all nullable in the schema, but
 * only `price`/`currency` are required to render a service at all (a
 * bookable item with no price isn't meaningfully displayable/bookable).
 * `durationMinutes` is genuinely optional per CLAUDE.md's Service Details
 * spec ("Duration when available") and the Admin form doesn't require it —
 * it used to be included in this same null-check, which meant an admin
 * leaving Duration blank made the whole service silently vanish from
 * `/services`, `/services/[id]`, and the homepage (found and reported by
 * the user testing the Admin Service form). Every caller of `Service.
 * durationMinutes` now renders it conditionally instead of assuming it's set.
 */
function toService(row: ServiceRow): Service | null {
  if (row.price === null || row.currency === null) {
    return null;
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    description: row.description,
    descriptionAr: row.descriptionAr ?? undefined,
    price: row.price.toNumber(),
    currency: row.currency,
    durationMinutes: row.durationMinutes ?? undefined,
    subserviceId: row.subserviceId,
    image: row.image ?? undefined,
    available: row.status === "ACTIVE",
  };
}

/**
 * Every `ServiceCategory`, ordered for display — `/services`' top accordion
 * level, the homepage's Services Overview, and `/about`'s capabilities chips.
 * Cached (perf audit P0-1): this only changes through the Admin Service
 * Categories CRUD, which calls `updateTag("service-categories")` on every
 * create/update/delete (`app/admin/(dashboard)/service-categories/actions.ts`)
 * — the 60s `revalidate` window is just a safety net behind that, not the
 * primary invalidation path.
 */
export const getServiceCategories = unstable_cache(
  async (): Promise<ServiceCategory[]> => {
    const rows = await prisma.serviceCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: serviceCategorySelect,
    });
    return rows.map(toServiceCategory);
  },
  ["service-categories"],
  { revalidate: 60, tags: ["service-categories"] },
);

/** Every `Subservice`, ordered — `/services`' accordion filters this client-side by category, same as the old `mockSubservices` array. */
export async function getSubservices(): Promise<Subservice[]> {
  const rows = await prisma.subservice.findMany({
    orderBy: [{ serviceCategoryId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: subserviceSelect,
  });
  return rows.map(toSubservice);
}

/** Every bookable `Service` (both `ACTIVE` and `INACTIVE` — the UI shows unavailable services with a disabled Book button rather than hiding them, matching the mock data's `available` flag). */
export async function getServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    orderBy: [{ subserviceId: "asc" }, { name: "asc" }],
    select: serviceSelect,
  });
  return rows.map(toService).filter((service): service is Service => service !== null);
}

export interface ServiceDetail {
  service: Service;
  subservice: Subservice;
  category: ServiceCategory;
}

/**
 * A single service by slug, with its parent subservice/category — or `null`
 * if it doesn't exist or can't be displayed (→ `notFound()`).
 *
 * Wrapped in React's `cache()` (perf audit P1-1): `/services/[id]`'s
 * `generateMetadata` and the page component each call this once per request
 * for the same slug — same duplicate-query shape P1-1 found on
 * `getProductBySlug`, fixed the same way. Request-scoped only, never shared
 * across requests or users.
 */
export const getServiceBySlug = cache(async (slug: string): Promise<ServiceDetail | null> => {
  const row = await prisma.service.findFirst({
    where: { slug },
    select: {
      ...serviceSelect,
      subservice: {
        select: {
          ...subserviceSelect,
          serviceCategory: { select: serviceCategorySelect },
        },
      },
    },
  });
  if (!row) return null;

  const service = toService(row);
  if (!service) return null;

  return {
    service,
    subservice: toSubservice(row.subservice),
    category: toServiceCategory(row.subservice.serviceCategory),
  };
});

/**
 * A single service by id — regardless of `ACTIVE`/`INACTIVE` status, unlike
 * `getServiceBySlug` (public detail page). Booking's server-side
 * re-validation (Phase 12b.1, `app/(site)/booking/actions.ts`) needs to
 * distinguish "doesn't exist" (`invalid-service`) from "exists but not
 * bookable" (`unavailable`), so it checks `service.available` itself after
 * this returns — same two-step the mock version did. Returns `null` only if
 * the id doesn't exist or the row can't be displayed (missing price/
 * duration/currency).
 */
export async function getServiceById(id: string): Promise<Service | null> {
  const row = await prisma.service.findUnique({ where: { id }, select: serviceSelect });
  return row ? toService(row) : null;
}

/** Up to `limit` other services under the same subservice, excluding this one — for `/services/[id]`'s "Related services". */
export async function getRelatedServices(subserviceId: string, excludeServiceId: string, limit = 3): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: { subserviceId, id: { not: excludeServiceId } },
    orderBy: { name: "asc" },
    take: limit,
    select: serviceSelect,
  });
  return rows.map(toService).filter((service): service is Service => service !== null);
}

/** Every service's slug — for `generateStaticParams` and `sitemap.ts`. */
export async function getServiceSlugs(): Promise<string[]> {
  const rows = await prisma.service.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}
