import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Text input matching `button.tsx`'s border/radius/focus-ring language.
 * Hand-written (no shadcn `input` block existed yet in `components/ui`),
 * same reasoning as `badge.tsx`.
 */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-1 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
