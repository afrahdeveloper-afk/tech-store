import type { Metadata } from "next";

import { MaintenanceView } from "@/components/maintenance/maintenance-view";

export const metadata: Metadata = {
  title: "Under Maintenance — Speed Core",
  robots: { index: false, follow: false },
};

/**
 * Reached only via `proxy.ts`'s rewrite while `StoreSettings.maintenanceMode`
 * is on — see `app/maintenance/layout.tsx`'s header comment. No data
 * fetching here on purpose: the page itself must render even if the reason
 * for maintenance is database trouble.
 *
 * `force-dynamic` (Stage 9 — CSP hardening): this page has no data fetch, so
 * it would otherwise be statically prerendered at build time — confirmed
 * live that a statically-generated page's `<script>` tags carry no `nonce`
 * attribute at all (Next only stamps the per-request nonce onto scripts it
 * actually renders fresh for that request), which a strict `'strict-dynamic'`
 * CSP then blocks outright, leaving the page inert. Forcing dynamic
 * rendering costs nothing here (there's no data to fetch either way) and is
 * what makes `proxy.ts`'s per-request nonce actually reach this page's HTML.
 */
export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return <MaintenanceView />;
}
