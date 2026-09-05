import type { Metadata } from "next";

import { getServiceCategories } from "@/lib/services-data";
import { NewSubserviceView } from "@/components/admin/subservices/new-subservice-view";

export const metadata: Metadata = {
  title: "Add Subservice",
};

export default async function NewSubservicePage() {
  const categories = await getServiceCategories();
  return <NewSubserviceView categories={categories} />;
}
