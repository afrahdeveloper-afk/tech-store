import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getCustomerActivity } from "@/lib/account-data";
import { Container } from "@/components/ui/container";
import { AccountActivityHeader } from "@/components/account/account-activity-header";
import { ActivityExplorer } from "@/components/account/activity-explorer";

export const metadata: Metadata = {
  title: "Orders & Bookings — Speed Core",
  description: "Your complete Speed Core product order and service booking history.",
};

/**
 * `/account/orders` — Step 3's combined "My Orders / Activity" page.
 * `getCurrentCustomer()` gates access (redirect if not signed in, same as
 * `/account`); `getCustomerActivity` then fetches this customer's *entire*
 * history in one server-side call — see CLAUDE.md Step 8: this must never
 * be filtered down to only active records, and Steps 6/7's search/tabs are
 * a client-side filter over that one fetch (`ActivityExplorer`), not a
 * paginated/re-fetched view.
 */
export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account/orders");
  }

  const activity = await getCustomerActivity(customer.id);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <AccountActivityHeader />
      <ActivityExplorer items={activity} />
    </Container>
  );
}
