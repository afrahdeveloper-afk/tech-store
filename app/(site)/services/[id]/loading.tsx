import { Container } from "@/components/ui/container";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";

/** Route-level loading UI for `/services/[id]` (perf audit P1-4) — see `/products/[id]`'s identical rationale. */
export default function ServiceDetailLoading() {
  return (
    <Container className="py-10 sm:py-12 lg:py-14">
      <RouteLoadingSkeleton variant="detail" />
    </Container>
  );
}
