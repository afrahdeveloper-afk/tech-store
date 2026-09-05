import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminOrderById } from "@/lib/admin-data";
import { OrderDetailView } from "@/components/admin/orders/order-detail-view";

export const metadata: Metadata = {
  title: "Order Detail",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return <OrderDetailView order={order} />;
}
