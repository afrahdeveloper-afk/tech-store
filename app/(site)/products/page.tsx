import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { ProductsPageHeader } from "@/components/products/products-page-header";
import { ProductsExplorer } from "@/components/products/products-explorer";
import { ProductsSkeleton } from "@/components/products/products-skeleton";
import { getCategories, getSubcategories } from "@/lib/products-data";

export const metadata: Metadata = {
  title: "Shop Products — Speed Core",
  description:
    "Browse Speed Core's full catalog of laptops, desktops, monitors, storage, networking gear, and accessories.",
  // Always the clean, query-free URL — every filter/sort/page combination
  // on this route is a view of the same canonical listing, not a distinct
  // page (search engines shouldn't index `?category=`/`?page=` variants).
  alternates: {
    canonical: "/products",
  },
};

/**
 * The route shell is a Server Component (per the Architecture Rules'
 * default) with static metadata; both `ProductsPageHeader` (bilingual copy)
 * and `ProductsExplorer` (search/filter/sort/pagination, URL-state-driven)
 * are Client Components for the reasons documented on each. `Suspense` is
 * required here because `ProductsExplorer` reads `useSearchParams`.
 *
 * Categories/subcategories are real Prisma queries (Phase 12b), fetched here
 * and passed down as props — `ProductsExplorer` is a Client Component and
 * can't call Prisma directly (see `lib/products-data.ts`'s module note).
 */
export default async function ProductsPage() {
  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()]);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <ProductsPageHeader />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsExplorer categories={categories} subcategories={subcategories} />
      </Suspense>
    </Container>
  );
}
