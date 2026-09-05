import type { Metadata } from "next";

import { NewServiceCategoryView } from "@/components/admin/service-categories/new-service-category-view";

export const metadata: Metadata = {
  title: "Add Service Category",
};

export default function NewServiceCategoryPage() {
  return <NewServiceCategoryView />;
}
