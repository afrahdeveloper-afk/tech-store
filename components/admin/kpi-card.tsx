import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Small } from "@/components/ui/typography";

/**
 * One Dashboard Overview KPI tile. Plain Server Component (takes already-
 * resolved, already-translated strings as props) rather than `"use client"`
 * — same reasoning `category-card.tsx`/`components/account/stat-card.tsx`
 * use to stay out of the client bundle. Visually identical to
 * `components/account/stat-card.tsx` (one consistent tile pattern across
 * the whole app) but kept as its own file rather than importing the account
 * one directly — the two features shouldn't share an implementation just
 * because they currently look alike.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  href,
  accessibleLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href?: string;
  accessibleLabel: string;
}) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Small className="text-muted-foreground">{label}</Small>
        <span className="truncate font-display text-lg font-semibold text-foreground sm:text-xl">{value}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={accessibleLabel}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div role="group" aria-label={accessibleLabel} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
      {content}
    </div>
  );
}
