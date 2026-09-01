import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Page-width wrapper enforcing one consistent max-width and gutter across
 * every route, per the Brand Consistency / Responsive Design rules in
 * CLAUDE.md. Every page section should sit inside a `Container` rather than
 * inventing its own max-width or horizontal padding.
 */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
