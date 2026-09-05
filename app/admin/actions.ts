"use server";

import { redirect } from "next/navigation";

import { clearAdminSession } from "@/lib/auth/admin-session";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { adminSearch, type AdminSearchResult } from "@/lib/admin-data";

/**
 * Admin logout — mirrors `app/(site)/account/actions.ts`'s `logout` shape,
 * against the separate admin session cookie. Bound to a
 * `<form action={adminLogout}>` so it degrades to a plain form submission.
 */
export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

/**
 * `AdminHeader`'s quick-search box — a Client Component can't import
 * `lib/admin-data.ts` directly (server-only, touches Prisma), so this thin
 * Server Action is the bridge, same pattern as `app/(site)/products/actions.ts`.
 * Re-checks `getCurrentAdmin()` itself rather than trusting the page that
 * rendered the header: a Server Action is directly callable and must never
 * assume its trigger was gated (see CLAUDE.md's Admin Security rules).
 */
export async function adminSearchAction(query: string): Promise<AdminSearchResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { products: [], customers: [], orders: [] };
  return adminSearch(query);
}
