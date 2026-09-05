import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminSubserviceById } from "@/lib/admin-data";
import { getServiceCategories } from "@/lib/services-data";
import { EditSubserviceView } from "@/components/admin/subservices/edit-subservice-view";

export const metadata: Metadata = {
  title: "Edit Subservice",
};

export default async function EditSubservicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [subservice, categories] = await Promise.all([getAdminSubserviceById(id), getServiceCategories()]);
  if (!subservice) notFound();

  return <EditSubserviceView subservice={subservice} categories={categories} />;
}
