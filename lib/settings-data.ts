import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

/**
 * Server-only data access for the singleton `StoreSettings` row (Admin
 * Dashboard Phase 14). Same discipline as `lib/admin-data.ts` — never
 * import from a Client Component.
 */

export interface StoreSettingsData {
  id: string;
  storeName: string;
  storeNameAr: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string | null;
  contactAddressAr: string | null;
  currency: string;
  maintenanceMode: boolean;
  updatedAt: Date;
}

/**
 * Perf audit (P0-1/P0-2): this row was being read twice on *every* single
 * storefront request — once in `proxy.ts`'s maintenance-mode gate, once
 * again in `app/(site)/layout.tsx` — with no caching at all in between, on
 * data (store contact info, maintenance flag) that only ever changes
 * through one admin form. Wrapped in `unstable_cache` with a short
 * `revalidate` safety net *and* an explicit `revalidateTag("store-settings")`
 * on every write (`app/admin/(dashboard)/settings/actions.ts`), so an admin
 * toggling maintenance mode takes effect immediately — the tag invalidation
 * is the real mechanism, the 60s window only covers the theoretical case
 * where a revalidation is somehow missed. Because `proxy.ts` and the site
 * layout run in the same Node.js process (see `proxy.ts`'s own doc comment)
 * and this is a process-wide cache, the layout's read — which fires only
 * milliseconds after the proxy's, for the same navigation — becomes a cache
 * hit instead of a second Postgres round-trip, without changing what either
 * call site does or removing the maintenance check itself.
 */
const getCachedStoreSettings = unstable_cache(
  async (): Promise<StoreSettingsData> => {
    const existing = await prisma.storeSettings.findFirst();
    if (existing) return existing;
    return prisma.storeSettings.create({ data: {} });
  },
  ["store-settings"],
  { revalidate: 60, tags: ["store-settings"] },
);

/**
 * Returns the one `StoreSettings` row, creating it with schema defaults if
 * it doesn't exist yet — avoids a separate seed step (this table has no
 * natural "empty" state the UI should ever show; there is always exactly
 * one row of store configuration). Safe to call repeatedly: a second
 * concurrent call while the row doesn't yet exist would race on `create`,
 * but this is an idempotent admin-configuration singleton read on a page
 * only admins reach, not a hot path — not worth a transaction/upsert-on-id
 * for that theoretical race.
 */
export async function getOrCreateStoreSettings(): Promise<StoreSettingsData> {
  const settings = await getCachedStoreSettings();
  // `unstable_cache` serializes its cached return value — on a cache HIT,
  // `updatedAt` comes back as a plain ISO string, not a real `Date` (a cache
  // MISS, straight from Prisma, is already a real `Date`). Every existing
  // caller (e.g. `admin-settings-view.tsx`'s
  // `dateFormatter.format(settings.updatedAt)`) expects a real `Date`, same
  // as before this function was cached — re-hydrated here so the exported
  // contract and return type never change regardless of hit or miss.
  return { ...settings, updatedAt: new Date(settings.updatedAt) };
}
