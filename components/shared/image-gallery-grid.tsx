"use client";

import * as React from "react";
import Image from "next/image";

import { ImagePreviewDialog, type PreviewableImage } from "@/components/shared/image-preview-dialog";

/**
 * Read-only thumbnail grid + click-to-preview — the Customer/Admin Booking
 * Gallery (Global Image System). Renders nothing when there are no images,
 * so callers can render it unconditionally without their own empty-state
 * branching.
 */
export function ImageGalleryGrid({ images, altPrefix, groupLabel }: { images: PreviewableImage[]; altPrefix: string; groupLabel: string }) {
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setPreviewIndex(index)}
            aria-label={`${altPrefix} ${index + 1}`}
            className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-muted-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-20"
          >
            <Image src={image.url} alt="" fill sizes="80px" className="object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      <ImagePreviewDialog
        images={images}
        index={previewIndex ?? 0}
        onIndexChange={setPreviewIndex}
        open={previewIndex !== null}
        onOpenChange={(open) => setPreviewIndex(open ? (previewIndex ?? 0) : null)}
        altPrefix={altPrefix}
      />
    </>
  );
}
