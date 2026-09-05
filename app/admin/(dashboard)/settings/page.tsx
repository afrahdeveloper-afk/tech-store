import type { Metadata } from "next";

import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getOrCreateStoreSettings } from "@/lib/settings-data";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";

export const metadata: Metadata = {
  title: "Settings",
};

/**
 * `/admin/settings` — admin account info (real) + real, persisted store
 * settings (Phase 14 — `StoreSettings`, a singleton row; see
 * `lib/settings-data.ts`). `getCurrentAdmin()` is safe to call again here
 * even though the parent layout already gated the route — it's
 * `cache()`-wrapped, so this is a free request-scoped read, not a second query.
 */
export default async function AdminSettingsPage() {
  const [admin, settings] = await Promise.all([getCurrentAdmin(), getOrCreateStoreSettings()]);
  // The parent layout already redirects when signed out; this is only to
  // satisfy TypeScript's null-check, never actually reachable as null.
  if (!admin) return null;

  return <AdminSettingsView admin={admin} settings={settings} />;
}
