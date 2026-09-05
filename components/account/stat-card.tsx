import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Small } from "@/components/ui/typography";

/**
 * One Dashboard Overview stat tile. Server Component — takes already-
 * resolved, already-translated strings as props rather than calling
 * `useLanguage()` itself, same reasoning `category-card.tsx`/`product-card.tsx`
 * use to stay out of `"use client"`.
 *
 * Renders as a real `<Link>` when `href` is given (e.g. "Total Orders" →
 * `/account/orders`) so it's keyboard/screen-reader navigable like any other
 * link, never a `<div onClick>`; otherwise a plain labeled group, for the
 * "no upcoming appointment" case which has nothing to link to.
 * `accessibleLabel` pins the exact reading order ("Total Orders: 4")
 * independent of the visual label/value stacking.
 */
export function StatCard({
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
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      role="group"
      aria-label={accessibleLabel}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-5"
    >
      {content}
    </div>
  );
}
