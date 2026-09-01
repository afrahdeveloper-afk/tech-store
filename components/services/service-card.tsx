import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ServiceCategory } from "@/types";
import { iconMap } from "@/lib/icon-map";
import { H3 } from "@/components/ui/typography";

export function ServiceCard({
  service,
  name,
  description,
  learnMoreLabel,
}: {
  service: ServiceCategory;
  name: string;
  description: string;
  learnMoreLabel: string;
}) {
  const Icon = service.icon ? iconMap[service.icon] : undefined;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      </span>
      <H3 as="h3" className="text-base font-semibold">
        {name}
      </H3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
        {learnMoreLabel}
        <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
      </span>
    </Link>
  );
}
