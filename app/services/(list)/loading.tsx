import { Container } from "@/components/ui/container";
import { ServicesSkeleton } from "@/components/services/services-skeleton";

/**
 * Next.js route-level loading UI for `/services`. Like `/products`' loading
 * state, this has no natural trigger against synchronous mock data (nothing
 * here can actually take long) — it becomes meaningfully visible once a real
 * API replaces `lib/mock/*`, same documented limitation as Products.
 *
 * Lives beside `page.tsx` in the `(list)` route group specifically so this
 * boundary stays scoped to `/services` and doesn't also wrap the sibling
 * `/services/[id]` route — see the comment on `page.tsx` in this folder.
 */
export default function ServicesLoading() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12 lg:py-14">
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
      </div>
      <ServicesSkeleton />
    </Container>
  );
}
