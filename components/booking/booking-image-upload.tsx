"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

import { MAX_BOOKING_IMAGES } from "@/lib/booking-limits";
import { uploadBookingAttachment, removeBookingAttachment, type BookingAttachmentInput } from "@/app/(site)/booking/actions";
import { useLanguage } from "@/components/providers/language-provider";
import { createClientId } from "@/lib/client-id";
import { cn } from "@/lib/utils";

/**
 * Booking Image Upload (Global Image System) — lets a customer attach
 * photos of the device/issue while filling out the Booking form. Each file
 * uploads immediately on selection (its own thumbnail transitions from a
 * spinner to the real photo as soon as it resolves, independent of any
 * other file still uploading); the confirmed `{url, path}` list is fully
 * controlled by the parent (`BookingView`) via `onChange`, matching a plain
 * `useState` setter's functional-update form — correct even when multiple
 * uploads resolve close together (each update is applied against the
 * latest state, not a stale closure).
 */
export function BookingImageUpload({
  value,
  onChange,
  disabled,
}: {
  value: BookingAttachmentInput[];
  onChange: React.Dispatch<React.SetStateAction<BookingAttachmentInput[]>>;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState<{ id: string; previewUrl: string }[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const atCapacity = value.length + pending.length >= MAX_BOOKING_IMAGES;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    const room = MAX_BOOKING_IMAGES - value.length - pending.length;
    if (room <= 0) {
      setError(t.imageGallery.errorTooManyImages);
      return;
    }
    const toUpload = files.slice(0, room);
    const placeholders = toUpload.map((file) => ({ id: createClientId(), previewUrl: URL.createObjectURL(file) }));
    setPending((prev) => [...prev, ...placeholders]);

    await Promise.all(
      toUpload.map(async (file, index) => {
        const placeholder = placeholders[index];
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadBookingAttachment(formData);

        setPending((prev) => prev.filter((item) => item.id !== placeholder.id));
        URL.revokeObjectURL(placeholder.previewUrl);

        if (result.success) {
          onChange((prev) => [...prev, { url: result.url, path: result.path }]);
        } else {
          setError(
            result.error === "file-too-large"
              ? t.imageGallery.errorFileTooLarge
              : result.error === "invalid-file"
                ? t.imageGallery.errorInvalidFile
                : t.imageGallery.errorUploadFailed
          );
        }
      })
    );
  }

  function handleRemove(attachment: BookingAttachmentInput) {
    onChange((prev) => prev.filter((item) => item.path !== attachment.path));
    // Fire-and-forget storage cleanup — the UI has already updated; this
    // attachment was never tied to a Booking row (see the action's own
    // doc comment), so there's nothing else to reconcile.
    void removeBookingAttachment(attachment.path);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((attachment) => (
          <div key={attachment.path} className="group/thumb relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={attachment.url} alt="" fill sizes="64px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(attachment)}
              disabled={disabled}
              aria-label={t.imageGallery.removePhotoLabel}
              // Always visible below `sm` — hover has no touch equivalent, and
              // this form is at least as often filled out on a phone as a
              // desktop (same reasoning as the Admin Image Manager's tiles).
              className="absolute end-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 shadow transition-opacity duration-150 sm:opacity-0 sm:group-hover/thumb:opacity-100 sm:group-focus-within/thumb:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {pending.map((item) => (
          <div key={item.id} className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={item.previewUrl} alt="" fill sizes="64px" className="object-cover opacity-50" unoptimized />
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
            </div>
          </div>
        ))}

        {!atCapacity ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            aria-label={t.imageGallery.addPhotosLabel}
            className={cn(
              "flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <ImagePlus className="size-4.5" aria-hidden="true" />
          </button>
        ) : null}

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

      {error ? (
        <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
