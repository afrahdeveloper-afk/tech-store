"use client";

import { PackageX } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * The `not-found` boundary for the whole `/admin/*` root layout (Next.js
 * requires one per root layout — see `app/admin/layout.tsx`'s "multiple
 * root layouts" note). Rendered for both an unmatched `/admin/*` URL and
 * every in-app `notFound()` call (e.g. an unknown product id on the Edit
 * Product route). Deliberately outside `(dashboard)`'s sidebar/header shell
 * — a 404 doesn't need it — but still gets the admin root layout's
 * `LanguageProvider`/`ToastProvider`/fonts/dark styling.
 */
export default function AdminNotFound() {
  const { t } = useLanguage();

  return (
    <Container className="flex flex-1 items-center py-16">
      <EmptyState
        icon={PackageX}
        title={t.adminForm.notFoundTitle}
        description={t.adminForm.notFoundDescription}
        action={{ label: t.adminForm.backToDashboard, href: "/admin" }}
      />
    </Container>
  );
}
