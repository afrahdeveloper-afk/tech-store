"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";

import { MAX_PRODUCT_IMAGES } from "@/lib/product-limits";
import {
  addProductImages,
  deleteProductImage,
  setPrimaryProductImage,
  reorderProductImages,
  type ProductImageMutationErrorCode,
  type ProductImageResult,
} from "@/app/admin/(dashboard)/products/actions";
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

interface ManagedImage extends ProductImageResult {
  /** Local-only, pre-server-confirmation state for a freshly picked file — never persisted. */
  pending?: boolean;
}

/**
 * Admin Product Image Manager (Global Image System) — upload, reorder
 * (drag on desktop, move-left/move-right buttons everywhere else), set
 * primary, and delete a product's real photos. Every mutation is its own
 * immediate Server Action call (not bundled into the surrounding
 * `ProductForm`'s submit), matching how `row-actions.tsx`'s delete
 * confirmation already works elsewhere in this admin — this component owns
 * its own optimistic local state, separate from the form around it.
 */
export function ProductImageManager({ productId, initialImages }: { productId: string; initialImages: ProductImageResult[] }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [images, setImages] = React.useState<ManagedImage[]>(initialImages);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ManagedImage | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  const atCapacity = images.length >= MAX_PRODUCT_IMAGES;

  const errorMessage: Record<ProductImageMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "not-found": t.adminForm.errorNotFound,
    "invalid-file": t.imageGallery.errorInvalidFile,
    "file-too-large": t.imageGallery.errorFileTooLarge,
    "too-many-images": t.imageGallery.errorTooManyImages,
    "server-error": t.imageGallery.errorUploadFailed,
  };

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const room = MAX_PRODUCT_IMAGES - images.length;
    if (room <= 0) {
      toast({ title: t.imageGallery.errorTooManyImages, variant: "error" });
      return;
    }
    const toUpload = files.slice(0, room);

    // One optimistic "uploading" tile per file, so each resolves independently
    // instead of the whole batch waiting on the slowest upload.
    const placeholders: ManagedImage[] = toUpload.map((file, index) => ({
      id: `pending-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isPrimary: false,
      sortOrder: images.length + index,
      pending: true,
    }));
    setImages((prev) => [...prev, ...placeholders]);

    await Promise.all(
      toUpload.map(async (file, index) => {
        const placeholder = placeholders[index];
        const formData = new FormData();
        formData.append("files", file);
        const result = await addProductImages(productId, formData);

        setImages((prev) => {
          if (!result.success) return prev.filter((image) => image.id !== placeholder.id);
          const [uploaded] = result.images;
          return prev.map((image) => (image.id === placeholder.id ? { ...uploaded } : image));
        });

        if (!result.success) {
          toast({ title: t.imageGallery.errorUploadFailed, description: errorMessage[result.error], variant: "error" });
        }
      })
    );
  }

  async function handleSetPrimary(image: ManagedImage) {
    if (image.pending || image.isPrimary) return;
    setImages((prev) => prev.map((item) => ({ ...item, isPrimary: item.id === image.id })));
    const result = await setPrimaryProductImage(image.id);
    if (!result.success) {
      toast({ title: t.imageGallery.errorUploadFailed, description: result.error ? errorMessage[result.error] : undefined, variant: "error" });
      setImages(initialImages);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProductImage(deleteTarget.id);
    setDeleting(false);

    if (result.success) {
      setImages((prev) => prev.filter((image) => image.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      toast({ title: t.imageGallery.errorUploadFailed, description: result.error ? errorMessage[result.error] : undefined, variant: "error" });
    }
  }

  async function commitReorder(nextOrder: ManagedImage[]) {
    setImages(nextOrder);
    const result = await reorderProductImages(productId, nextOrder.map((image) => image.id));
    if (!result.success) {
      setImages(initialImages);
    }
  }

  function moveImage(id: string, direction: -1 | 1) {
    const index = images.findIndex((image) => image.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    commitReorder(next);
  }

  function handleDrop(targetId: string) {
    setDragOverId(null);
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const fromIndex = images.findIndex((image) => image.id === dragId);
    const toIndex = images.findIndex((image) => image.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDragId(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDragId(null);
    commitReorder(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{t.adminForm.imagesHeading}</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={atCapacity}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:scale-[0.97]"
        >
          <ImagePlus className="size-3.5" aria-hidden="true" />
          {t.imageGallery.addPhotosLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            handleFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <Small className="text-muted-foreground">{t.adminForm.imagesHint}</Small>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 py-10 text-center transition-colors hover:border-muted-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
          <Small className="font-medium text-foreground">{t.imageGallery.noPhotosYet}</Small>
          <Small className="text-muted-foreground">{t.imageGallery.addPhotosLabel}</Small>
        </button>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{t.imageGallery.dragToReorderHint}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={!image.pending}
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
                  image.isPrimary ? "border-primary" : "border-border",
                  dragId === image.id && "opacity-40",
                  dragOverId === image.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !image.pending && "cursor-grab active:cursor-grabbing"
                )}
              >
                <button
                  type="button"
                  onClick={() => !image.pending && setPreviewIndex(index)}
                  disabled={image.pending}
                  aria-label={`${t.adminForm.imagesHeading} ${index + 1}`}
                  className="absolute inset-0"
                >
                  <Image src={image.url} alt="" fill sizes="120px" className="object-contain p-1.5" unoptimized={image.pending} />
                </button>

                {image.pending ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/70 backdrop-blur-sm">
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                    <span className="text-[10px] font-medium text-foreground">{t.imageGallery.uploadingLabel}</span>
                  </div>
                ) : (
                  <>
                    {image.isPrimary ? (
                      <Badge variant="accent" className="pointer-events-none absolute start-1.5 top-1.5 px-1.5 py-0 text-[10px]">
                        {t.imageGallery.primaryBadge}
                      </Badge>
                    ) : null}

                    {/*
                      Below `sm`, the action row is always visible (not
                      hover-gated) — hover has no touch equivalent, so a
                      hover-only reveal would make move/set-primary/delete
                      unreachable on a phone or tablet. `size-8` (32px) here,
                      not the full 44px touch-target guideline: matches this
                      admin's own existing density trade-off for per-row
                      icon actions (`row-actions.tsx` uses `size-9`/36px for
                      the same reason) — a dedicated 44px target per action
                      would need bigger tiles than a photo grid can offer.
                    */}
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-background/95 to-transparent p-1.5 opacity-100 transition-opacity duration-150 sm:pointer-events-none sm:opacity-0 sm:group-hover/tile:pointer-events-auto sm:group-hover/tile:opacity-100 sm:group-focus-within/tile:pointer-events-auto sm:group-focus-within/tile:opacity-100">
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-0.5">
                          <GripVertical className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => moveImage(image.id, -1)}
                            disabled={index === 0}
                            aria-label={t.imageGallery.moveEarlierLabel}
                            title={t.imageGallery.moveEarlierLabel}
                            className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                          >
                            <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(image.id, 1)}
                            disabled={index === images.length - 1}
                            aria-label={t.imageGallery.moveLaterLabel}
                            title={t.imageGallery.moveLaterLabel}
                            className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30 sm:size-6"
                          >
                            <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                          </button>
                        </span>
                        <span className="flex items-center gap-1">
                          {!image.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(image)}
                              aria-label={t.imageGallery.setPrimaryLabel}
                              title={t.imageGallery.setPrimaryLabel}
                              className="flex size-8 items-center justify-center rounded text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring sm:size-6"
                            >
                              <Star className="size-3.5" aria-hidden="true" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(image)}
                            aria-label={t.imageGallery.deletePhotoLabel}
                            title={t.imageGallery.deletePhotoLabel}
                            className="flex size-8 items-center justify-center rounded text-destructive transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring sm:size-6"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ImagePreviewDialog
        images={images.filter((image) => !image.pending)}
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
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                  {t.adminForm.deleting}
                </>
              ) : (
                t.adminForm.deleteConfirmAction
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
