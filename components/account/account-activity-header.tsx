"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Caption, Display, Body } from "@/components/ui/typography";

/** `/account/orders`'s page heading — mirrors `services-page-header.tsx`. */
export function AccountActivityHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <Caption className="text-accent">{t.accountActivity.pageEyebrow}</Caption>
      <Display as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
        {t.accountActivity.pageHeading}
      </Display>
      <Body className="text-muted-foreground">{t.accountActivity.pageDescription}</Body>
    </div>
  );
}
