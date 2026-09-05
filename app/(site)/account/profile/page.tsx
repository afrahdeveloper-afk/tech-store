import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = {
  title: "Profile — Speed Core",
  description: "Your Speed Core account information.",
};

/**
 * `/account/profile` — read-only account information + logout, split out of
 * the old `/account` page now that `/account` itself is the Dashboard
 * Overview (see CLAUDE.md's Dashboard phase). Same independent
 * `getCurrentCustomer()` guard as every other `/account/*` page.
 */
export default async function AccountProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account/profile");
  }

  return <ProfileView customer={customer} />;
}
