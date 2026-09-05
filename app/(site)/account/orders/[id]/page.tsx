import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/current-customer";
import { getCustomerOrder } from "@/lib/account-data";
import { OrderDetailView } from "@/components/account/order-detail-view";

export const metadata: Metadata = {
  title: "Order Details — Speed Core",
};

/**
 * `/account/orders/[id]` — Step 9. `getCustomerOrder` folds `customer.id`
 * into the Prisma `where` clause (see `lib/account-data.ts`), so an id that
 * exists but belongs to a different customer comes back `null` here and
 * renders the same `notFound()` as a genuinely unknown id — the URL alone
 * can never disclose whether an order id exists. See CLAUDE.md's Security/
 * Authorization rules for this phase.
 */
export default async function AccountOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect(`/login?next=/account/orders/${id}`);
  }

  const order = await getCustomerOrder(customer.id, id);
  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
