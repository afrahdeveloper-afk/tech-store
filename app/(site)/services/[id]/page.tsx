import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getRelatedServices, getServiceBySlug, getServiceSlugs } from "@/lib/services-data";
import { ServiceDetailView } from "@/components/services/service-detail-view";
import { buildServiceJsonLd, jsonLdScript } from "@/lib/structured-data";

/**
 * Route segment is named `[id]` per CLAUDE.md's "Main Routes", matched
 * against each bookable `Service`'s `slug` — mirrors `/products/[id]`.
 * Resolved via a real Prisma query (Phase 12b) instead of `lib/mock/*`.
 *
 * Note: the Prisma schema only guarantees `Service.slug` uniqueness scoped
 * to its `Subservice` (`@@unique([subserviceId, slug])`), not globally.
 * `getServiceBySlug` does a flat lookup across all services (no
 * `subserviceId` disambiguation), same as the mock version — current data
 * has no cross-subservice collisions, so this works today; see the Known
 * Issues note in CLAUDE.md for the same caveat this carries forward.
 */
export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const detail = await getServiceBySlug(id);
  if (!detail) {
    return { title: "Service Not Found — Speed Core" };
  }

  const { service } = detail;
  const title = `${service.name} — Speed Core`;
  // English description only — matches the existing `description` field
  // (bilingual `nameAr`/`descriptionAr` remain UI-only via useLanguage()).
  const description = service.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/services/${service.slug}`,
      // No `images`: `Service.image` (see types/index.ts) is an optional
      // lucide-react icon name for a details-page hero tile, not an actual
      // image asset — no mock service item sets it, and CLAUDE.md's SEO
      // scope for this batch says not to add image assets just for SEO.
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ServiceDetailsPage({ params }: PageProps<"/services/[id]">) {
  const { id } = await params;
  const detail = await getServiceBySlug(id);

  if (!detail) {
    notFound();
  }

  const { service, subservice, category } = detail;
  const relatedServices = await getRelatedServices(service.subserviceId, service.id, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildServiceJsonLd(service)) }}
      />
      <ServiceDetailView
        service={service}
        subservice={subservice}
        category={category}
        relatedServices={relatedServices}
      />
    </>
  );
}
