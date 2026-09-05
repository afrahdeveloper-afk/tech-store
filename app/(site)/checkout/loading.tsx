import { Container } from "@/components/ui/container";
import { RouteLoadingSkeleton } from "@/components/shared/route-loading-skeleton";

/** Route-level loading UI for `/checkout` (perf audit P1-4). */
export default function CheckoutLoading() {
  return (
    <Container className="py-10 sm:py-12 lg:py-14">
      <RouteLoadingSkeleton variant="form" />
    </Container>
  );
}
