import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Multi-line text input matching `input.tsx`'s border/radius/focus-ring
 * language. Hand-written (no shadcn `textarea` block existed yet in
 * `components/ui`), same reasoning as `input.tsx`/`select.tsx`. First
 * needed by the Booking form's optional notes field.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
