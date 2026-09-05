"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Error boundary for every route under `(dashboard)` (every authenticated
 * `/admin/*` page except `/admin/login`) — one shared boundary rather than
 * one per module, since a data-fetch failure (e.g. a transient DB
 * connection error — `lib/db.ts`'s own comment documents Supabase's
 * session-pooler connection cap) looks the same everywhere. Next.js
 * requires this to be a Client Component. Never shows `error.message` to
 * the admin — logged to the console for diagnosis, matching the storefront's
 * "never expose raw technical errors" rule.
 */
export default function AdminDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <Container className="flex flex-1 items-center py-16">
      <EmptyState
        icon={AlertTriangle}
        tone="error"
        title={t.adminCommon.errorTitle}
        description={t.adminCommon.errorDescription}
        action={{ label: t.adminCommon.retryLabel, onClick: reset }}
      />
    </Container>
  );
}
