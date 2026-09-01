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
 */
export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const customerId = await getSessionCustomerId();
  if (!customerId) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true, phone: true },
  });

  return customer;
}
