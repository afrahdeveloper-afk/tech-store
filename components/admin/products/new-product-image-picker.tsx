"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";

import { MAX_PRODUCT_IMAGES } from "@/lib/product-limits";
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/image-limits";
import { createClientId } from "@/lib/client-id";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";
import { Label, Small } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface StagedProductImage {
  /** Client-only tracking id — never sent to the server, never a Storage path (see `lib/client-id.ts`). */
  id: string;
  file: File;
  /** `URL.createObjectURL(file)` — revoked when the image is removed or once the picker unmounts. */
  previewUrl: string;
}

/**
 * Add Product's image picker (Global Image System) — the pre-creation
 * counterpart to `ProductImageManager`. A brand-new product has no id yet,
 * so nothing here can call `addProductImages`/`deleteProductImage`/etc.
 * (all of which take a `productId`); files just stay as local `File`
 * objects + object-URL previews until the surrounding `ProductForm` submits
 * them via one `addProductImages` call right after `createProduct` succeeds
 * (see `product-form.tsx`). Deliberately mirrors `ProductImageManager`'s
 * visual language and interactions (grid, drag-to-reorder + move buttons,
 * primary badge, delete-with-confirm, empty state) rather than sharing code
 * with it — the two operate on genuinely different data (local `File`s vs.
 * server-confirmed `ProductImageResult` rows) and `ProductImageManager`
 * itself is left untouched per the Edit flow's own existing contract.
 *
 * "Primary" here is positional, not a stored flag: the first image in the
 * list is primary, exactly matching `addProductImages`'s own behavior (it
 * marks the first-created row primary when a product has none yet) — so
 * "set as primary" just moves an image to the front, and the eventual
 * server-side result is identical whether the admin thinks of it as
 * "reordered" or "set primary".
 */
export function NewProductImagePicker({
  value,
  onChange,
  disabled,
}: {
  value: StagedProductImage[];
  onChange: React.Dispatch<React.SetStateAction<StagedProductImage[]>>;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<StagedProductImage | null>(null);
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  const atCapacity = value.length >= MAX_PRODUCT_IMAGES;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const room = MAX_PRODUCT_IMAGES - value.length;
    if (room <= 0) {
      toast({ title: t.imageGallery.errorTooManyImages, variant: "error" });
      return;
    }
    if (files.length > room) {
      toast({ title: t.imageGallery.errorTooManyImages, variant: "error" });
    }
    const toStage = files.slice(0, room);

    const accepted: StagedProductImage[] = [];
    for (const file of toStage) {
      // Mirrors the cheap, client-checkable part of `lib/storage.ts`'s
      // `validateImageFile` (declared MIME type + size, via
      // `lib/image-limits.ts`) — catches an obviously-bad file immediately
      // instead of only after the product is already created. The
      // authoritative check also verifies the file's actual byte signature
      // (F-03) — that part is server-only by design (a client-side "check"
      // of bytes the client itself controls would prove nothing) and runs
      // again, for real, inside `addProductImages` when this file is
      // actually uploaded.
      if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
        toast({ title: t.imageGallery.errorUploadFailed, description: t.imageGallery.errorInvalidFile, variant: "error" });
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast({ title: t.imageGallery.errorUploadFailed, description: t.imageGallery.errorFileTooLarge, variant: "error" });
        continue;
      }
      accepted.push({ id: createClientId(), file, previewUrl: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      onChange((prev) => [...prev, ...accepted]);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    URL.revokeObjectURL(deleteTarget.previewUrl);
    onChange((prev) => prev.filter((image) => image.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleSetPrimary(image: StagedProductImage) {
    onChange((prev) => [image, ...prev.filter((item) => item.id !== image.id)]);
  }

  function moveImage(id: string, direction: -1 | 1) {
    onChange((prev) => {
      const index = prev.findIndex((image) => image.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function handleDrop(targetId: string) {
    setDragOverId(null);
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    onChange((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === dragId);
      const toIndex = prev.findIndex((image) => image.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDragId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{t.adminForm.imagesHeading}</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={atCapacity || disabled}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:scale-[0.97]"
        >
          <ImagePlus className="size-3.5" aria-hidden="true" />
          {t.imageGallery.addPhotosLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            handleFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <Small className="text-muted-foreground">{t.adminForm.newProductImagesHint}</Small>

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 py-10 text-center transition-colors hover:border-muted-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
          <Small className="font-medium text-foreground">{t.imageGallery.noPhotosYet}</Small>
          <Small className="text-muted-foreground">{t.imageGallery.addPhotosLabel}</Small>
        </button>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{t.imageGallery.dragToReorderHint}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {value.map((image, index) => (
              <div
                key={image.id}
                draggable={!disabled}
                onDragStart={() => setDragId(image.id)}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragId && dragId !== image.id) setDragOverId(image.id);
                }}
                onDragLeave={() => setDragOverId((current) => (current === image.id ? null : current))}
                onDrop={() => handleDrop(image.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOverId(null);
                }}
                className={cn(
                  "group/tile relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all motion-safe:duration-150",
                  index === 0 ? "border-primary" : "border-border",
                  dragId === image.id && "opacity-40",
                  dragOverId === image.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !disabled && "cursor-grab active:cursor-grabbing"
                )}
              >
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  aria-label={`${t.adminForm.imagesHeading} ${index + 1}`}
                  className="absolute inset-0"
                >
                  <Image src={image.previewUrl} alt="" fill sizes="120px" className="object-contain p-1.5" unoptimized />
                </button>

                {index === 0 ? (
                  <Badge variant="accent" className="pointer-events-none absolute start-1.5 top-1.5 px-1.5 py-0 text-[10px]">
                    {t.imageGallery.primaryBadge}
                  </Badge>
                ) : null}

                {/* Always visible below `sm` — same reasoning as `ProductImageManager`'s own tiles (hover has no touch equivalent). */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-background/95 to-transparent p-1.5 opacity-100 transition-opacity duration-150 sm:pointer-events-none sm:opacity-0 sm:group-hover/tile:pointer-events-auto sm:group-hover/tile:opacity-100 sm:group-focus-within/tile:pointer-events-auto sm:group-focus-within/tile:opacity-100">
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      <GripVertical className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, -1)}
                        disabled={index === 0 || disabled}
                        aria-label={t.imageGallery.moveEarlierLabel}
                        title={t.imageGallery.moveEarlierLabel}
                        className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                      >
                        <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 1)}
                        disabled={index === value.length - 1 || disabled}
                        aria-label={t.imageGallery.moveLaterLabel}
                        title={t.imageGallery.moveLaterLabel}
                        className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                      >
                        <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                      </button>
                    </span>
                    <span className="flex items-center gap-1">
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(image)}
                          disabled={disabled}
                          aria-label={t.imageGallery.setPrimaryLabel}
                          title={t.imageGallery.setPrimaryLabel}
                          className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                        >
                          <Star className="size-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(image)}
                        disabled={disabled}
                        aria-label={t.imageGallery.deletePhotoLabel}
                        title={t.imageGallery.deletePhotoLabel}
                        className="flex size-8 items-center justify-center rounded text-destructive transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ImagePreviewDialog
        images={value.map((image) => ({ id: image.id, url: image.previewUrl }))}
        index={previewIndex ?? 0}
        onIndexChange={setPreviewIndex}
        open={previewIndex !== null}
        onOpenChange={(open) => setPreviewIndex(open ? (previewIndex ?? 0) : null)}
        altPrefix={t.adminForm.imagesHeading}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.imageGallery.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.imageGallery.deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.adminForm.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.adminForm.deleteConfirmAction}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
