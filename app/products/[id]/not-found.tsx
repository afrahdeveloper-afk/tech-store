"use client";

import { PackageX } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Rendered when `notFound()` is called in `app/products/[id]/page.tsx`
 * (unknown slug). Client Component for the same reason as every other
 * translated section — see `language-provider.tsx`.
 */
export default function ProductNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="py-16">
      <EmptyState
        icon={PackageX}
        title={t.productDetails.notFoundTitle}
        description={t.productDetails.notFoundDescription}
        action={{ label: t.productDetails.backToProducts, href: "/products" }}
      />
    </Container>
  );
}
