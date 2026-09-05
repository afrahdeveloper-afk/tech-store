import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminCustomerById } from "@/lib/admin-data";
import { getCustomerActivity } from "@/lib/account-data";
import { CustomerDetailView } from "@/components/admin/customers/customer-detail-view";

export const metadata: Metadata = {
  title: "Customer Detail",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  // `getCustomerActivity` is the same customer-scoped query the Customer
  // Account phase already built (`lib/account-data.ts`) — reused here
  // rather than re-implemented, since an admin viewing one customer's
  // history is the same query as that customer viewing their own.
  const activity = await getCustomerActivity(customer.id);

  return <CustomerDetailView customer={customer} activity={activity} />;
}
