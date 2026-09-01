import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Filter/sort dropdown. Wraps a native `<select>` rather than a Radix
 * primitive — it gets correct keyboard, screen-reader, and RTL behavior for
 * free from the platform, which matters more here than custom styling of the
 * open listbox (see the Accessibility and RTL/LTR rules in CLAUDE.md).
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-border bg-background ps-3 pe-8 text-sm text-foreground outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export { Select };
