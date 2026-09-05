import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { ServicesPageHeader } from "@/components/services/services-page-header";
import { ServiceCategoriesExplorer } from "@/components/services/service-categories-explorer";
import { getServiceCategories, getServices, getSubservices } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "IT Services — Speed Core",
  description:
    "Browse Speed Core's certified IT repair and maintenance services by category — laptops, PCs, printers, networking, software, data recovery, security systems, and servers.",
  alternates: {
    canonical: "/services",
  },
};

/**
 * The route shell is a Server Component (per the Architecture Rules'
 * default) with static metadata; both `ServicesPageHeader` and
 * `ServiceCategoriesExplorer` are Client Components for the reasons
 * documented on each. Data is synchronous mock data (no `useSearchParams`,
 * unlike `/products`), so no `Suspense` boundary is needed here.
 *
 * Lives in the `(list)` route group (URL unaffected — still `/services`)
 * so its sibling `loading.tsx` only wraps this page, not `/services/[id]`.
 * Previously this file and `loading.tsx` sat directly in `app/services/`,
 * where Next.js's route-level `loading.tsx` boundary also wrapped the
 * nested `[id]` detail route: on a fresh request, the loading fallback
 * flushed (committing a 200 status) before that route's async Server
 * Component could resolve, so an unknown slug's `notFound()` still
 * rendered the not-found UI but could never produce a real 404 response —
 * see the Phase 10 SEO audit (H1) this route group was introduced to fix.
 *
 * Categories/subservices/services are real Prisma queries (Phase 12b),
 * fetched here and passed down — `ServiceCategoriesExplorer` is a Client
 * Component and can't call Prisma directly (see `lib/services-data.ts`'s
 * module note on why this stays one full up-front fetch, not per-category).
 */
export default async function ServicesPage() {
  const [categories, subservices, services] = await Promise.all([
    getServiceCategories(),
    getSubservices(),
    getServices(),
  ]);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <ServicesPageHeader />
      <ServiceCategoriesExplorer categories={categories} subservices={subservices} services={services} />
    </Container>
  );
}
