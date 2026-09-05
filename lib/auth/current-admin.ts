import { cache } from "react";

import { prisma } from "@/lib/db";
import { getSessionAdminId } from "@/lib/auth/admin-session";

/** Safe, public-facing shape — never includes `passwordHash`. */
export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
}

/**
 * Resolves the signed admin session cookie to a real, currently-existing
 * `Admin` row. Returns null for a missing/invalid/expired cookie, or one
 * whose `Admin` no longer exists — callers treat that as "not signed in as
 * admin". This is the one function every `/admin/*` page AND every admin
 * Server Action must call to find "the authenticated admin" — per CLAUDE.md's
 * Phase 12 Security rules, a Server Action is directly callable and must
 * never trust that the page which rendered its trigger was itself gated, so
 * this is called again inside every mutation, not just at the page/layout
 * level.
 *
 * Wrapped in React's `cache()` (matches `lib/auth/current-customer.ts`'s
 * Phase 11 optimization) — request-scoped memoization only, never shared
 * across requests or users.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const adminId = await getSessionAdminId();
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true },
  });

  return admin;
});
