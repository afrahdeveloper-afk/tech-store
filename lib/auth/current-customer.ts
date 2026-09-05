import { cache } from "react";

import { prisma } from "@/lib/db";
import { getSessionCustomerId } from "@/lib/auth/session";

/** Safe, public-facing shape — never includes `passwordHash`. */
export interface CurrentCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Resolves the signed session cookie to a real, currently-existing Customer
 * row. Returns null for a missing/invalid/expired cookie, or one whose
 * Customer no longer exists — callers (Server Components/Actions) treat
 * that as "not signed in". This is the one function `/account/*` pages and
 * the Checkout/Booking history reads should call to find "the authenticated
 * customer" — see the Security/Authorization rules for this phase (every
 * query must be scoped server-side to this id, never a client-supplied one).
 *
 * Wrapped in React's `cache()` (Phase 11 perf audit): `app/layout.tsx` calls
 * this on every request to resolve the Navbar's account icon, and every
 * `/account/*`, `/login`, `/register` page independently calls it again for
 * its own auth guard — without memoization that's two identical
 * `prisma.customer.findUnique` round-trips per request. `cache()` scopes the
 * memoization to a single request/render (reset on the next request), so
 * this never shares data across requests or users — it only dedupes repeat
 * calls within the one request that's already resolving the same cookie.
 */
export const getCurrentCustomer = cache(async (): Promise<CurrentCustomer | null> => {
  const customerId = await getSessionCustomerId();
  if (!customerId) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true, phone: true },
  });

  return customer;
});
