import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/types";
import { iconMap } from "@/lib/icon-map";
import { H3 } from "@/components/ui/typography";

/**
 * No `useLanguage()` here — the parent (`category-grid.tsx`) already reads
 * the dictionary and passes down the resolved `name`, so this stays a
 * plain, easily-reusable presentational component.
 */
export function CategoryCard({ category, name }: { category: Category; name: string }) {
  const Icon = category.icon ? iconMap[category.icon] : undefined;

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      </span>
      <H3 as="h3" className="text-base font-semibold">
        {name}
      </H3>
      <span className="mt-auto flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
        <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
      </span>
    </Link>
  );
}
