"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Caption, Display, Body } from "@/components/ui/typography";

/**
 * `/products`' page heading — a small Client Component (per the Architecture
 * Rules) purely because its copy must react to the language toggle; the
 * route shell around it (`app/products/page.tsx`) stays a Server Component.
 */
export function ProductsPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <Caption className="text-accent">{t.products.pageEyebrow}</Caption>
      <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
        {t.products.pageHeading}
      </Display>
      <Body className="text-muted-foreground">{t.products.pageDescription}</Body>
    </div>
  );
}
