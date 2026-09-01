import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = {
  title: "My Account — Speed Core",
  description: "View your Speed Core account information and activity.",
};

/**
 * `/account` — the one place this phase checks "is someone signed in" via
 * `getCurrentCustomer()` (server-side, cookie-derived — never a client-
 * supplied id) and redirects to `/login` if not. `/account/orders` and the
 * detail routes repeat this same guard independently rather than sharing a
 * layout, so each route stays correct even if reached directly by URL.
 */
export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account");
  }

  return <AccountOverview customer={customer} />;
}
