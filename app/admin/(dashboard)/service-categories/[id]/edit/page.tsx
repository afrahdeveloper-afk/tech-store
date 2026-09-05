import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminServiceCategoryById } from "@/lib/admin-data";
import { EditServiceCategoryView } from "@/components/admin/service-categories/edit-service-category-view";

export const metadata: Metadata = {
  title: "Edit Service Category",
};

export default async function EditServiceCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getAdminServiceCategoryById(id);
  if (!category) notFound();

  return <EditServiceCategoryView category={category} />;
}
