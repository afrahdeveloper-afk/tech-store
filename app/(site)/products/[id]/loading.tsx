import { Container } from "@/components/ui/container";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";

/** Route-level loading UI for `/products/[id]` (perf audit P1-4) — this and `/services/[id]` are the two routes the audit's own evidence pointed at directly (measured TTFB gap vs the list page), and previously had no loading state at all. */
export default function ProductDetailLoading() {
  return (
    <Container className="py-10 sm:py-12 lg:py-14">
      <RouteLoadingSkeleton variant="detail" />
    </Container>
  );
}
