import { Container } from "@/components/ui/container";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";

/** Route-level loading UI for `/cart` (perf audit P1-4). */
export default function CartLoading() {
  return (
    <Container className="py-10 sm:py-12 lg:py-14">
      <RouteLoadingSkeleton variant="rows" />
    </Container>
  );
}
