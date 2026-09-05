import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shown in place of `next/image` wherever a product/cart item has no photo
 * yet — `next/image` logs a real console error ("An empty string was passed
 * to the src attribute" / "Image is missing required 'src' property") if
 * ever rendered with `src=""`/`src={null}`, which is exactly what used to
 * happen for any product with zero uploaded photos (`Product.image` used to
 * fall back to `""` in `lib/products-data.ts` instead of `null` — see that
 * file's fix). Meant to sit inside an `absolute`/`fill`-sized parent
 * (matches `next/image`'s own `fill` positioning), so it needs no size
 * props of its own — just drop it in wherever an `<Image fill .../>` would
 * have gone.
 */
export function ImagePlaceholder({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-muted", className)}>
      <ImageOff className={cn("size-6 text-muted-foreground", iconClassName)} aria-hidden="true" />
    </div>
  );
}
