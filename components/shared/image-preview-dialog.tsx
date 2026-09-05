"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface PreviewableImage {
  id: string;
  url: string;
}

/**
 * Full-screen image lightbox — Global Image System. One shared component
 * behind the Admin Product Image Manager, the storefront Product Gallery,
 * and the Customer/Admin Booking Galleries, rather than four near-identical
 * dialogs. Wraps `components/ui/dialog.tsx` (Radix `Dialog` — Escape/
 * overlay-click-to-close and focus trapping come from the primitive; this
 * component only adds prev/next navigation). `motion-safe:` throughout
 * `dialog.tsx` already respects `prefers-reduced-motion`.
 */
export function ImagePreviewDialog({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  altPrefix,
}: {
  images: PreviewableImage[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefix for each image's alt text (e.g. the product/service name) — combined with a 1-based position. */
  altPrefix: string;
}) {
  const { t } = useLanguage();
  const hasMultiple = images.length > 1;
  const image = images[index];

  const goPrev = React.useCallback(() => onIndexChange((index - 1 + images.length) % images.length), [index, images.length, onIndexChange]);
  const goNext = React.useCallback(() => onIndexChange((index + 1) % images.length), [index, images.length, onIndexChange]);

  React.useEffect(() => {
    if (!open || !hasMultiple) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasMultiple, goPrev, goNext]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t.imageGallery.closeLabel}
        className="flex h-[80vh] w-[92vw] max-w-4xl flex-col items-center justify-center border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{`${altPrefix} ${index + 1}`}</DialogTitle>

        <div className="relative h-full w-full">
          <Image src={image.url} alt={`${altPrefix} ${index + 1}`} fill sizes="92vw" className="object-contain" priority />
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={t.imageGallery.previousImageLabel}
              className="absolute start-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t.imageGallery.nextImageLabel}
              className="absolute end-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <div
              className="absolute bottom-4 start-1/2 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 font-mono text-xs font-medium text-foreground shadow backdrop-blur"
              aria-hidden="true"
            >
              {index + 1} / {images.length}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
