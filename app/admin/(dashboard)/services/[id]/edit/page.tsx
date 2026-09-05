import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminServiceById } from "@/lib/admin-data";
import { getServiceCategories, getSubservices } from "@/lib/services-data";
import { EditServiceView } from "@/components/admin/services/edit-service-view";

export const metadata: Metadata = {
  title: "Edit Service",
};

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [service, categories, subservices] = await Promise.all([getAdminServiceById(id), getServiceCategories(), getSubservices()]);
  if (!service) notFound();

  return <EditServiceView service={service} categories={categories} subservices={subservices} />;
}
