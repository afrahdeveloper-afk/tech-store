"use client";

import { Wrench } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Rendered when `notFound()` is called in `app/services/[id]/page.tsx`
 * (unknown slug). Mirrors `app/products/[id]/not-found.tsx`.
 */
export default function ServiceNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="py-16">
      <EmptyState
        icon={Wrench}
        title={t.serviceDetails.notFoundTitle}
        description={t.serviceDetails.notFoundDescription}
        action={{ label: t.serviceDetails.backToServices, href: "/services" }}
      />
    </Container>
  );
}
