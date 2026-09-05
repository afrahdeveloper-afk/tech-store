import type { Metadata } from "next";

import { AboutHero } from "@/components/about/about-hero";
import { AboutOverview } from "@/components/about/about-overview";
import { AboutWhatWeDo } from "@/components/about/about-what-we-do";
import { WhyChooseUs } from "@/components/homepage/why-choose-us";
import { AboutValues } from "@/components/about/about-values";
import { AboutCapabilities } from "@/components/about/about-capabilities";
import { FinalCta } from "@/components/homepage/final-cta";
import { getServiceCategories } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "About Us — Speed Core",
  description:
    "Speed Core is a premium technology store and certified IT maintenance company — one team behind the products we sell and the repairs we carry out.",
  alternates: {
    canonical: "/about",
  },
};

/**
 * `/about` (Phase — About Page). A Server Component shell with static
 * metadata, same pattern as `/products`/`/services`; every section below is
 * a small Client Component for translated copy, matching the homepage's
 * section-per-file structure (`app/page.tsx`) rather than the Products/
 * Services single-Container-with-explorer pattern — About is a stack of
 * distinct, mostly-static sections, not one interactive data view.
 *
 * `WhyChooseUs` and `FinalCta` are reused as-is from the homepage rather
 * than rebuilt — their existing copy is already-vetted, unfabricated trust
 * content and real routes, so duplicating them under new names would add
 * nothing (see the About page audit notes on each new component).
 */
export default async function AboutPage() {
  const serviceCategories = await getServiceCategories();

  return (
    <>
      <AboutHero />
      <div className="rule-calibration" aria-hidden="true" />
      <AboutOverview />
      <AboutWhatWeDo />
      <WhyChooseUs />
      <AboutValues />
      <AboutCapabilities serviceCategories={serviceCategories} />
      <FinalCta />
    </>
  );
}
