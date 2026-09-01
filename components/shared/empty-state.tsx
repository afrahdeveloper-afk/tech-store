import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";

/**
 * Shared "nothing to show" block — empty results, load errors, not-found
 * pages. Per CLAUDE.md's Empty/Error States rules: explain what happened and
 * what the user can do next, and (for errors) offer a retry action.
 * Currently used by `/products`; written generically so cart/search/services
 * empty states can reuse it later instead of re-inventing the pattern.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void; href?: string };
  tone?: "neutral" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center"
    >
      <span
        className={
          tone === "error"
            ? "flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
            : "flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        }
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <H3 as="h3" className="text-base font-semibold">
        {title}
      </H3>
      <Body className="max-w-sm text-sm text-muted-foreground">{description}</Body>
      {action ? (
        <Button
          className="mt-2"
          variant={tone === "error" ? "default" : "outline"}
          onClick={action.onClick}
          asChild={Boolean(action.href)}
        >
          {action.href ? <Link href={action.href}>{action.label}</Link> : action.label}
        </Button>
      ) : null}
    </div>
  );
}
