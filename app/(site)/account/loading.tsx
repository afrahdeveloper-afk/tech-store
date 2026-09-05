import { Container } from "@/components/ui/container";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";

/**
 * Route-level loading UI for the whole `/account/*` subtree (perf audit
 * P1-4) — placed beside `layout.tsx` at this segment, so it covers
 * `/account`, `/account/orders`, `/account/orders/[id]`,
 * `/account/bookings/[id]`, and `/account/profile` all at once via Next's
 * nested-Suspense semantics, rather than needing 4 separate files.
 */
export default function AccountLoading() {
  return (
    <Container className="py-10 sm:py-12 lg:py-14">
      <RouteLoadingSkeleton variant="rows" />
    </Container>
  );
}
