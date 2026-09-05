import type { Metadata } from "next";

import { getServiceBySlug } from "@/lib/services-data";
import { BookingView, type BookingResolution } from "@/components/booking/booking-view";

export const metadata: Metadata = {
  title: "Book a Service — Speed Core",
  description: "Book a certified IT repair or maintenance service.",
};

/**
 * Resolves `?service=<slug>` against the real database (Phase 12b.1 —
 * previously `lib/mock/*`), the same `getServiceBySlug` query
 * `/services/[id]` uses (see the "service exists / is active" validation in
 * CLAUDE.md Phase 7 Step 7) — done here, server-side, before any form
 * renders, rather than inside `BookingView` itself.
 */
async function resolveBooking(slug: string | undefined): Promise<BookingResolution> {
  if (!slug) return { status: "none" };

  const detail = await getServiceBySlug(slug);
  if (!detail) return { status: "not-found" };

  const { service, subservice, category } = detail;
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

  const resolution = await resolveBooking(slug);

  return <BookingView resolution={resolution} />;
}
