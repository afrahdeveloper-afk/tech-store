import type { Metadata } from "next";

import { mockServiceCategories } from "@/lib/mock/services";
import { mockSubservices } from "@/lib/mock/subservices";
import { mockServiceItems } from "@/lib/mock/service-items";
import { BookingView, type BookingResolution } from "@/components/booking/booking-view";

export const metadata: Metadata = {
  title: "Book a Service — Speed Core",
  description: "Book a certified IT repair or maintenance service.",
};

/**
 * Resolves `?service=<slug>` against the same mock data `/services/[id]`
 * reads from (see the "service exists / is active" validation in CLAUDE.md
 * Phase 7 Step 7) — done here, server-side, before any form renders, rather
 * than inside `BookingView` itself.
 */
function resolveBooking(slug: string | undefined): BookingResolution {
  if (!slug) return { status: "none" };

  const service = mockServiceItems.find((candidate) => candidate.slug === slug);
  if (!service) return { status: "not-found" };

  const subservice = mockSubservices.find((candidate) => candidate.id === service.subserviceId);
  const category = subservice
    ? mockServiceCategories.find((candidate) => candidate.id === subservice.serviceCategoryId)
    : undefined;
  if (!subservice || !category) return { status: "not-found" };

  if (!service.available) return { status: "unavailable", service, subservice, category };
  return { status: "ok", service, subservice, category };
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const params = await searchParams;
  const slugParam = params.service;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const resolution = resolveBooking(slug);

  return <BookingView resolution={resolution} />;
}
