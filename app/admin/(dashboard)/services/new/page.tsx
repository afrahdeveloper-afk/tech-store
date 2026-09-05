import type { Metadata } from "next";

import { getServiceCategories, getSubservices } from "@/lib/services-data";
import { NewServiceView } from "@/components/admin/services/new-service-view";

export const metadata: Metadata = {
  title: "Add Service",
};

export default async function NewServicePage() {
  const [categories, subservices] = await Promise.all([getServiceCategories(), getSubservices()]);
  return <NewServiceView categories={categories} subservices={subservices} />;
}
