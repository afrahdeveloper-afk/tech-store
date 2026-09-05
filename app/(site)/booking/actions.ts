"use server";

import { getServiceById } from "@/lib/services-data";
import {
  isValidEmail,
  isValidPhone,
  exceedsMaxLength,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_NOTES_LENGTH,
} from "@/lib/validation";
import { getOrCreateStoreSettings } from "@/lib/settings-data";
import { uploadBookingImage, deleteBookingStorageObject, createBookingImageSignedUrl, validateImageFile } from "@/lib/storage";
import { MAX_BOOKING_IMAGES } from "@/lib/booking-limits";
import { resolveGuestCustomer } from "@/lib/guest-customer";
import { prisma } from "@/lib/db";

/**
 * Booking creation — the one place Prisma is touched for Booking (same
 * Server Action pattern as `app/checkout/actions.ts`; see the Step 10 note
 * there for why this is safe to import from a Client Component).
 *
 * Price/duration re-derivation (Phase 12b.1): `input` only ever carries
 * `serviceId` from the client — price/duration were never trusted from the
 * client even before this phase. What changed is the source of truth for
 * the server-side re-resolution: `getServiceById` now reads the real, live
 * `Service` row instead of the frozen `lib/mock/service-items.ts` snapshot,
 * so a price change or a service being deactivated (`status` no longer
 * `ACTIVE`) in the database is honored immediately at Booking.
 */

export interface BookingAttachmentInput {
  /** A short-lived signed preview URL from `uploadBookingAttachment` — display-only, never persisted (see `createBooking`'s Security Correction note below). */
  url: string;
  path: string;
}

export interface BookingInput {
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTime: string; // "HH:mm"
  notes?: string;
  /** Photos already uploaded via `uploadBookingAttachment` before submit (Booking Image Upload / Global Image System) — attached to the Booking row once it's created. */
  attachments?: BookingAttachmentInput[];
}

export type BookingErrorCode =
  | "invalid-service"
  | "unavailable"
  | "missing-fields"
  | "invalid-length"
  | "invalid-email"
  | "invalid-phone"
  | "invalid-date"
  | "past-date"
  | "invalid-time"
  | "invalid-attachments"
  | "maintenance"
  | "server-error";

export type BookingResult = { success: true; bookingNumber: string } | { success: false; error: BookingErrorCode };

function generateBookingNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${stamp}-${random}`;
}

/** Thrown inside the transaction when a submitted attachment `path` is already linked to a different `BookingImage` row (Stage 11) — caught outside and mapped to the existing `invalid-attachments` error, never leaked past `createBooking`. Mirrors `app/(site)/checkout/actions.ts`'s `InsufficientStockError` pattern for aborting a transaction with a specific, known reason. */
class AttachmentAlreadyClaimedError extends Error {}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  // Defense-in-depth for `StoreSettings.maintenanceMode` — see the identical
  // comment in `app/(site)/checkout/actions.ts`'s `createOrder`: `proxy.ts`
  // rewrites page loads, but a Server Action is directly callable regardless
  // of what page rendered its trigger.
  const settings = await getOrCreateStoreSettings();
  if (settings.maintenanceMode) {
    return { success: false, error: "maintenance" };
  }

  // Re-resolve the service server-side rather than trusting the client —
  // the database is the one source of truth for service data (the same
  // `available` flag `/services/[id]` gates its own CTA on).
  const service = await getServiceById(input.serviceId);
  if (!service) {
    return { success: false, error: "invalid-service" };
  }
  if (!service.available) {
    return { success: false, error: "unavailable" };
  }

  const name = input.customerName?.trim();
  const email = input.customerEmail?.trim();
  const phone = input.customerPhone?.trim();
  const notes = input.notes?.trim() ?? "";
  if (!name || !email || !phone) {
    return { success: false, error: "missing-fields" };
  }
  // Maximum-length validation (Phase 2, Part A) — checked before format
  // validation, same placement/rationale as `app/(site)/checkout/actions.ts`.
  if (
    exceedsMaxLength(name, MAX_NAME_LENGTH) ||
    exceedsMaxLength(email, MAX_EMAIL_LENGTH) ||
    exceedsMaxLength(phone, MAX_PHONE_LENGTH) ||
    exceedsMaxLength(notes, MAX_NOTES_LENGTH)
  ) {
    return { success: false, error: "invalid-length" };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "invalid-email" };
  }
  if (!isValidPhone(phone)) {
    return { success: false, error: "invalid-phone" };
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.preferredDate ?? "");
  if (!dateMatch) {
    return { success: false, error: "invalid-date" };
  }
  const preferredDate = new Date(`${input.preferredDate}T00:00:00`);
  // Stage 8 — API & Input Security: `new Date()` rejects an out-of-range
  // month (13+) or day-of-month too large for ANY month (32+) as Invalid
  // Date, but silently *rolls over* a day that's merely invalid for its
  // specific month — "2026-02-30" (February has no 30th) becomes March 2nd
  // instead of being rejected. Re-deriving the year/month/day from the
  // constructed Date and comparing back against what was actually submitted
  // catches that rollover; a real, valid date always round-trips exactly.
  const [, yearStr, monthStr, dayStr] = dateMatch;
  const roundTrips =
    preferredDate.getFullYear() === Number(yearStr) &&
    preferredDate.getMonth() === Number(monthStr) - 1 &&
    preferredDate.getDate() === Number(dayStr);
  if (Number.isNaN(preferredDate.getTime()) || !roundTrips) {
    return { success: false, error: "invalid-date" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preferredDate < today) {
    return { success: false, error: "past-date" };
  }

  // Stage 8 — API & Input Security: the previous check only validated the
  // "\d\d:\d\d" *shape* — "99:99" passed it. A booking's HTML <input
  // type="time"> already constrains this in normal browser use, but a
  // direct Server Action call bypasses the browser entirely (same rule this
  // file's other re-derivations already follow), so the actual hour/minute
  // range has to be checked here too, not just the format.
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(input.preferredTime ?? "");
  if (!timeMatch) {
    return { success: false, error: "invalid-time" };
  }
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { success: false, error: "invalid-time" };
  }

  // `attachments` are already-uploaded files (see `uploadBookingAttachment`
  // below) — re-validate the array itself here (never trust client-supplied
  // shape/count), but the files themselves were already validated at
  // upload time. Only `path` matters for persistence — see the Security
  // Correction note on the `BookingImage.createMany` write below.
  const attachments = (input.attachments ?? []).filter(
    (attachment): attachment is BookingAttachmentInput => typeof attachment?.path === "string" && attachment.path.length > 0
  );
  if (attachments.length > MAX_BOOKING_IMAGES) {
    return { success: false, error: "invalid-attachments" };
  }

  try {
    const bookingNumber = generateBookingNumber();

    await prisma.$transaction(async (tx) => {
      // Database Security Audit remediation (Sept 2026): was an unconditional
      // `tx.customer.upsert` — see `lib/guest-customer.ts`'s doc comment for
      // why that let anyone overwrite a registered customer's name/phone by
      // email alone, and exactly what this now does instead.
      const customer = await resolveGuestCustomer(tx, { name, email, phone });

      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          serviceNameSnapshot: service.name,
          priceSnapshot: service.price,
          status: "PENDING",
          preferredDate,
          preferredTime: input.preferredTime,
          notes: notes || null,
          customerId: customer.id,
          serviceId: service.id,
        },
      });

      if (attachments.length > 0) {
        // Security Correction (Sept 2026): only `path` is persisted — the
        // client's `attachment.url` was a signed preview URL scoped to the
        // upload step and is never written to the DB (`BookingImage.url` is
        // left null; see its schema doc comment). Every future read
        // re-derives a fresh signed URL from `path` after checking the
        // viewer is authorized.
        //
        // Security Correction (Stage 11 — File Upload/Storage audit):
        // `BookingImage.path` has no `@unique` constraint, and
        // `uploadBookingAttachment` returns its randomUUID-based path
        // directly to the browser with no ownership binding of its own — by
        // design, since the booking it will belong to doesn't exist yet at
        // upload time. Without this check, a `path` value obtained any way
        // other than the normal one-upload-per-submission flow (e.g. an
        // already-compromised browser/network path, or simply replaying a
        // previous request) could be claimed into an unrelated booking,
        // second customer's photo attributed to a first customer's booking.
        // Rejecting any path that's already attached to an existing
        // `BookingImage` row closes the "claim the same path twice" angle —
        // each uploaded object can only ever be linked to one booking, ever.
        const alreadyClaimed = await tx.bookingImage.findFirst({
          where: { path: { in: attachments.map((a) => a.path) } },
          select: { id: true },
        });
        if (alreadyClaimed) {
          throw new AttachmentAlreadyClaimedError();
        }

        await tx.bookingImage.createMany({
          data: attachments.map((attachment, index) => ({
            bookingId: booking.id,
            path: attachment.path,
            sortOrder: index,
          })),
        });
      }
    });

    return { success: true, bookingNumber };
  } catch (err) {
    if (err instanceof AttachmentAlreadyClaimedError) {
      return { success: false, error: "invalid-attachments" };
    }
    console.error("createBooking failed:", err);
    return { success: false, error: "server-error" };
  }
}

// ---------------------------------------------------------------------------
// Booking Image Upload (Global Image System) — uploads happen immediately as
// the customer picks files, *before* the Booking row exists (booking is a
// guest-first flow — see the module note above; no customer session is
// required to attempt this, matching Checkout/Booking's existing guest
// posture). The path travels with the form and is only tied to a real
// `Booking` row once `createBooking` above succeeds.
//
// Security Correction (Sept 2026): booking photos go to the PRIVATE
// `speedcore-bookings` bucket now — `uploadBookingAttachment` mints a
// short-lived signed URL (server-side, via `createBookingImageSignedUrl`)
// purely so the customer can see their own just-uploaded thumbnail while
// filling out the form. That URL is never persisted (see `createBooking`
// above); it's fine to hand it straight back to the uploader here because
// they are, by construction, the one person who could have picked that exact
// file a moment ago — nobody else ever sees this response.
// ---------------------------------------------------------------------------

export type BookingAttachmentErrorCode = "invalid-file" | "file-too-large" | "server-error";
export type BookingAttachmentResult =
  | { success: true; url: string; path: string }
  | { success: false; error: BookingAttachmentErrorCode };

export async function uploadBookingAttachment(formData: FormData): Promise<BookingAttachmentResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "invalid-file" };
  }

  const validationError = await validateImageFile(file);
  if (validationError === "too-large") return { success: false, error: "file-too-large" };
  if (validationError) return { success: false, error: "invalid-file" };

  let uploadedPath: string | null = null;
  try {
    const uploaded = await uploadBookingImage(file);
    uploadedPath = uploaded.path;

    const signedUrl = await createBookingImageSignedUrl(uploaded.path);
    if (!signedUrl) {
      // Uploaded but couldn't mint a preview URL — don't leave an orphaned,
      // unreferenced object sitting in the private bucket.
      await deleteBookingStorageObject(uploaded.path);
      return { success: false, error: "server-error" };
    }

    return { success: true, url: signedUrl, path: uploaded.path };
  } catch (err) {
    console.error("uploadBookingAttachment failed:", err);
    if (uploadedPath) await deleteBookingStorageObject(uploadedPath);
    return { success: false, error: "server-error" };
  }
}

/** Deletes a not-yet-submitted attachment (the customer removed the thumbnail, or the booking form submission ultimately failed) — never tied to a Booking row, so this is a plain storage cleanup, not a DB mutation. `deleteBookingStorageObject` itself refuses any path that doesn't match this app's own generated object-key shape, so a tampered/arbitrary `path` from the client can't be used to delete an unrelated object. */
export async function removeBookingAttachment(path: string): Promise<{ success: boolean }> {
  if (!path) return { success: true };
  await deleteBookingStorageObject(path);
  return { success: true };
}
