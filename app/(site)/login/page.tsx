import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Log In — Speed Core",
  description: "Log in to your Speed Core account to view your orders and service bookings.",
};

/**
 * The route shell is a Server Component so the already-signed-in redirect
 * happens before any HTML ships (never trust client-side state for this —
 * see the Customer Account phase's Security rules). `LoginView` owns the
 * form itself. `?next=` lets a protected page (e.g. `/account/orders`) send
 * an unauthenticated visitor here and land them back where they started —
 * restricted to same-site relative paths, never used as an open redirect.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const customer = await getCurrentCustomer();
  if (customer) {
    redirect("/account");
  }

  const params = await searchParams;
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  return <LoginView next={next} />;
}
