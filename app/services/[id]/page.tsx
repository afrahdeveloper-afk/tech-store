import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mockServiceCategories } from "@/lib/mock/services";
import { mockSubservices } from "@/lib/mock/subservices";
import { mockServiceItems } from "@/lib/mock/service-items";
import { ServiceDetailView } from "@/components/services/service-detail-view";
import { buildServiceJsonLd, jsonLdScript } from "@/lib/structured-data";

/**
 * Route segment is named `[id]` per CLAUDE.md's "Main Routes", matched
 * against each bookable `Service`'s `slug` — mirrors `/products/[id]`.
 *
 * Note: the Prisma schema only guarantees `Service.slug` uniqueness scoped
 * to its `Subservice` (`@@unique([subserviceId, slug])`), not globally.
 * Current seed data has no cross-subservice collisions, so a flat lookup by
 * slug works today; a real API-backed version of this route should confirm
 * that still holds (or resolve by `id` instead) before trusting it blindly.
 */
function findService(id: string) {
  return mockServiceItems.find((service) => service.slug === id);
}

export function generateStaticParams() {
  return mockServiceItems.map((service) => ({ id: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  const service = findService(id);
  if (!service) {
    return { title: "Service Not Found — Speed Core" };
  }

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
  const service = findService(id);

  if (!service) {
    notFound();
  }

  const subservice = mockSubservices.find((s) => s.id === service.subserviceId);
  const category = subservice
    ? mockServiceCategories.find((c) => c.id === subservice.serviceCategoryId)
    : undefined;

  if (!subservice || !category) {
    notFound();
  }

  const relatedServices = mockServiceItems
    .filter((item) => item.subserviceId === service.subserviceId && item.id !== service.id)
    .slice(0, 3);

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
