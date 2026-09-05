"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Global 404 — rendered by Next.js for any unmatched route (`/foo`, etc.).
 * Client Component for the same reason as every other translated section —
 * see `language-provider.tsx`. Mirrors `app/products/[id]/not-found.tsx` /
 * `app/services/[id]/not-found.tsx`, plus a second CTA matching the
 * two-button pattern already used on `checkout-view.tsx`'s success state.
 */
export default function GlobalNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="py-16">
      <EmptyState icon={SearchX} title={t.notFoundPage.title} description={t.notFoundPage.description} />
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">{t.notFoundPage.backToHome}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">{t.notFoundPage.browseProducts}</Link>
        </Button>
      </div>
    </Container>
  );
}
