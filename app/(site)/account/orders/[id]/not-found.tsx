"use client";

import { PackageX } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Rendered when `notFound()` is called in `app/account/orders/[id]/page.tsx`
 * — an unknown order id, or one that belongs to a different customer (see
 * the ownership note there). Mirrors `app/services/[id]/not-found.tsx`.
 */
export default function AccountOrderNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="py-16">
      <EmptyState
        icon={PackageX}
        title={t.accountOrderDetails.notFoundTitle}
        description={t.accountOrderDetails.notFoundDescription}
        action={{ label: t.accountOrderDetails.backToOrders, href: "/account/orders" }}
      />
    </Container>
  );
}
