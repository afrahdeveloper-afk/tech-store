import type { Metadata } from "next";

import { Hero } from "@/components/hero/hero";
import { CategoryGrid } from "@/components/categories/category-grid";
import { FeaturedProducts } from "@/components/products/featured-products";
import { ServicesOverview } from "@/components/services/services-overview";
import { WhyChooseUs } from "@/components/homepage/why-choose-us";
import { AboutPreview } from "@/components/homepage/about-preview";
import { FinalCta } from "@/components/homepage/final-cta";
import { getCategories, getFeaturedProducts } from "@/lib/products-data";
import { getServiceCategories } from "@/lib/services-data";

// Title/description/openGraph/twitter are already set on the root layout
// (see app/layout.tsx) and apply to "/" as-is; this only adds the canonical,
// scoped to this route so it doesn't get inherited by every other page.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [categories, products, serviceCategories] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getServiceCategories(),
  ]);

  return (
    <>
      <Hero />
      <div className="rule-calibration" aria-hidden="true" />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={products} />
      <ServicesOverview serviceCategories={serviceCategories} />
      <WhyChooseUs />
      <AboutPreview />
      <FinalCta />
    </>
  );
}
