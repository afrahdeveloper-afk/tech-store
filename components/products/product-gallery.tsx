"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

import type { ProductImageRef } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog";
import { Badge } from "@/components/ui/badge";

/**
 * `/products/[id]`'s image gallery — main image + thumbnail strip + a
 * full-screen preview dialog (Global Image System / Product Detail
 * Gallery). Degrades gracefully to a single static image with none of the
 * gallery chrome (no thumbnails, no arrows) when there's only one image —
 * most of the catalog, until real photos are uploaded through the new Admin
 * Product Image Manager.
 */
export function ProductGallery({
  images,
  productName,
  isOutOfStock,
  discountBadgeLabel,
}: {
  images: ProductImageRef[];
  productName: string;
  isOutOfStock: boolean;
  discountBadgeLabel?: string;
}) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const hasMultiple = images.length > 1;
  const active = images[activeIndex] ?? images[0];

  function goPrev() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }
  function goNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  if (!active) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-label={t.productDetails.viewLargerLabel}
          className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <Image
            src={active.url}
            alt={`${productName} ${activeIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            priority
            className={cn("object-contain p-10 transition-opacity", isOutOfStock && "opacity-60 grayscale-[0.3]")}
          />
        </button>

        {discountBadgeLabel && !isOutOfStock ? (
          <Badge variant="accent" className="pointer-events-none absolute start-4 top-4 z-20">
            {discountBadgeLabel}
          </Badge>
        ) : null}

        {/* Expand affordance — decorative, the whole image is already a button; only shown on hover/focus so it doesn't compete with the discount badge on small screens. */}
        <span className="pointer-events-none absolute bottom-4 end-4 z-20 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <Expand className="size-4" aria-hidden="true" />
        </span>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={t.imageGallery.previousImageLabel}
              className="absolute start-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100"
            >
              <ChevronLeft className="size-4.5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t.imageGallery.nextImageLabel}
              className="absolute end-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 hover:bg-card focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100"
            >
              <ChevronRight className="size-4.5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div role="group" aria-label={t.productDetails.galleryLabel} className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${productName} ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-18",
                index === activeIndex ? "border-primary" : "border-border hover:border-muted-foreground/40"
              )}
            >
              <Image src={image.url} alt="" fill sizes="72px" className="object-contain p-1.5" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}

      <ImagePreviewDialog
        images={images}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        altPrefix={productName}
      />
    </div>
  );
}
