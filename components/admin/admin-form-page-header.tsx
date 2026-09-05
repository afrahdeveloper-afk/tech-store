"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";

/**
 * Shared heading for every Create/Edit form page across the CRUD modules
 * (Products, Service Categories, Subservices, Services) — a back link + the
 * page's own title, kept generic so each module supplies its own resolved
 * title string rather than this component owning a translation-key lookup.
 */
export function AdminFormPageHeader({ backHref, title }: { backHref: string; title: string }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={backHref}
        className="flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        {t.adminForm.backToList}
      </Link>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
    </div>
  );
}
