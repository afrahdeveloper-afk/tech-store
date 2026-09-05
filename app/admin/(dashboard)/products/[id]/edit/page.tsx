import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminProductById } from "@/lib/admin-data";
import { getCategories, getSubcategories } from "@/lib/products-data";
import { EditProductView } from "@/components/admin/products/edit-product-view";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, subcategories] = await Promise.all([getAdminProductById(id), getCategories(), getSubcategories()]);

  if (!product) notFound();

  return <EditProductView product={product} categories={categories} subcategories={subcategories} />;
}
