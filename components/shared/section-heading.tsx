import * as React from "react";

import { cn } from "@/lib/utils";
import { Caption, H2, Body } from "@/components/ui/typography";

/**
 * Eyebrow + heading + supporting description — the repeated header pattern
 * for Categories, Featured Products, Services, and Why Choose Us. `align`
 * covers the one real variation between sections (Final CTA centers its
 * heading; the rest start-align).
 */
export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "start",
  className,
}: {
  eyebrow: string;
  heading: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      <Caption className="text-accent">{eyebrow}</Caption>
      <H2>{heading}</H2>
      {description ? <Body className="text-muted-foreground">{description}</Body> : null}
    </div>
  );
}
