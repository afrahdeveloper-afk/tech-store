"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Caption, Display, Body } from "@/components/ui/typography";

/**
 * `/services`' page heading — a small Client Component (per the Architecture
 * Rules) purely because its copy must react to the language toggle, mirroring
 * `components/products/products-page-header.tsx`.
 */
export function ServicesPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <Caption className="text-accent">{t.services.pageEyebrow}</Caption>
      <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
        {t.services.pageHeading}
      </Display>
      <Body className="text-muted-foreground">{t.services.pageDescription}</Body>
    </div>
  );
}
