import type { Metadata } from "next";

import { getCategories, getSubcategories } from "@/lib/products-data";
import { NewProductView } from "@/components/admin/products/new-product-view";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewProductPage() {
  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()]);

  return <NewProductView categories={categories} subcategories={subcategories} />;
}
