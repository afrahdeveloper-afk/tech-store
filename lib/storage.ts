import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/image-limits";

/**
 * Server-only Supabase Storage wrapper — Global Image System (Admin Product
 * Image Manager, Product Gallery, Booking Image Upload). `import "server-only"`
 * (same one-line guard Next.js's own docs recommend) makes this refuse to
 * bundle into client JS at build time. Never import this from a Client
 * Component; every caller is a `"use server"` Server Action.
 *
 * Uses the **service role key**, not the anon key — every mutation/read here
 * happens from trusted server code that has already validated the request
 * (admin session for Product images; the DB-scoped ownership check in
 * `lib/account-data.ts`/the admin layout gate for Booking images), so
 * Storage-level Row Level Security policies aren't the enforcement boundary
 * — this module, plus its callers' authorization checks, is.
 *
 * --- Security Correction (Sept 2026) ---
 * Product photos and Booking photos are NOT the same trust level: a product
 * photo is public marketing content; a booking photo is a customer's private
 * device/issue photo. They now live in two separate Supabase Storage
 * buckets, never mixed:
 *
 *   - `speedcore-products` (PUBLIC) — served via `getPublicUrl()`, exactly
 *     like the static illustrations under `public/images/` always were.
 *   - `speedcore-bookings` (PRIVATE) — NEVER uses `getPublicUrl()`. Every
 *     read goes through `createBookingImageSignedUrl(s)`, which mints a
 *     short-lived, single-purpose signed URL. Callers (`lib/account-data.ts`,
 *     `lib/admin-data.ts`, `app/(site)/booking/actions.ts`) are responsible
 *     for checking *who* is allowed to see a given booking's photos before
 *     ever calling this — this module has no concept of "customer" or
 *     "admin", it only knows storage paths.
 */

const ALLOWED_IMAGE_TYPES = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);
const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES };

/** How long a Booking image's signed URL stays valid — used both for the customer's immediate upload-time preview and for the (freshly re-signed, every render) Customer/Admin Booking Gallery. Short enough that a leaked link is only useful briefly; long enough that a slow page load or a customer taking their time on the booking form doesn't need mid-session re-signing. */
export const BOOKING_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export type ImageValidationError = "invalid-type" | "too-large" | "empty";

type DetectedImageFormat = "jpeg" | "png" | "webp";

/** The one real MIME type each detected on-disk format is allowed to declare — see `detectImageFormat` below. */
const MIME_TYPE_BY_DETECTED_FORMAT: Record<DetectedImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Reads only the first 12 bytes of `file` (one small `Blob.slice()` +
 * `arrayBuffer()` — never the whole file) and inspects them against the
 * fixed, well-known magic-number signatures for JPEG/PNG/WebP, the three
 * formats `ALLOWED_IMAGE_MIME_TYPES` permits. Returns `null` if the bytes
 * don't match any of them (including a truncated/empty read).
 *
 * Hand-written rather than a dependency (security audit F-03 remediation):
 * these three signatures are fixed, decades-stable byte sequences (the JPEG
 * SOI marker, the PNG file signature, the RIFF/WEBP FourCC) — a general
 * file-type-sniffing library would be pulling in a lot of machinery for
 * exactly three fully-known, fixed-width checks, and CLAUDE.md's own rule is
 * to verify the existing project already can't do this before adding a
 * dependency.
 */
async function detectImageFormat(file: File): Promise<DetectedImageFormat | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  // JPEG: SOI marker (FFD8) immediately followed by another marker (FFxx) —
  // every valid JPEG starts this way regardless of which segment follows
  // (JFIF/EXIF/raw scan data/etc).
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return "jpeg";
  }

  // PNG: the 8-byte file signature every PNG begins with.
  if (
    head.length >= 8 &&
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  ) {
    return "png";
  }

  // WebP: a RIFF container ("RIFF" at byte 0, 4-byte chunk size, "WEBP"
  // FourCC at byte 8) — true for every WebP sub-format (VP8/VP8L/VP8X).
  if (
    head.length >= 12 &&
    head[0] === 0x52 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x46 &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

/**
 * Checked before ever touching Storage — same "validate before spending an
 * external call" discipline as the rate limiter checking before the DB.
 *
 * Security correction (F-03): also verifies the file's actual byte
 * signature (magic numbers) against its declared MIME type — the
 * browser-reported `file.type` header is client-supplied and trivially
 * spoofable (e.g. a non-image payload uploaded with a forced
 * `Content-Type: image/jpeg`), so it was never sufficient on its own. A
 * declared type that isn't in the allowlist is still rejected first (cheap,
 * no I/O); only a file that *claims* to be an allowed type is worth the
 * extra 12-byte read to confirm it actually is one. A mismatch (wrong
 * signature, or no recognized signature at all — corrupt/truncated/non-image
 * data) is rejected the same way an unsupported declared type already was,
 * so no caller/UI needed to change to handle a new error shape.
 */
export async function validateImageFile(file: File): Promise<ImageValidationError | null> {
  if (file.size === 0) return "empty";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "too-large";
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "invalid-type";

  const detected = await detectImageFormat(file);
  if (!detected || MIME_TYPE_BY_DETECTED_FORMAT[detected] !== file.type) {
    return "invalid-type";
  }

  return null;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — see .env.example.");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function getProductsBucket(): string {
  return process.env.SUPABASE_PRODUCTS_BUCKET || "speedcore-products";
}

function getBookingsBucket(): string {
  return process.env.SUPABASE_BOOKINGS_BUCKET || "speedcore-bookings";
}

function randomObjectPath(folder: "products" | "bookings", file: File): string {
  const extension = ALLOWED_EXTENSIONS[file.type] ?? "jpg";
  // Random, non-guessable filename (never the user's original filename) —
  // avoids path traversal/collisions and doesn't leak anything about the
  // source file.
  return `${folder}/${randomUUID()}.${extension}`;
}

// ---------------------------------------------------------------------------
// Products — PUBLIC bucket. Product photos are marketing content: anyone
// with the URL is meant to be able to view them, matching how every other
// storefront image (the static /public/images/* illustrations) already works.
// ---------------------------------------------------------------------------

export interface UploadedImage {
  url: string;
  /** Storage object key — pass back to `deleteProductStorageObject` to remove the file later. */
  path: string;
}

/** Uploads one already-validated product image. Returns its permanent public URL + storage path. */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  const path = randomObjectPath("products", file);

  const supabase = getClient();
  const { error } = await supabase.storage.from(getProductsBucket()).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000", // 1 year — object keys are random/unique, so a new upload never needs the old one invalidated
    upsert: false,
  });
  if (error) {
    throw new Error(`Product image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(getProductsBucket()).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Deletes a previously uploaded product image — best-effort, never throws (a
 * missing/already-deleted object, or even Storage being unconfigured, is
 * logged and swallowed). Every caller runs this *after* its own DB row is
 * already deleted, so a Storage-side failure here must never turn an
 * otherwise-successful deletion into a reported error.
 */
export async function deleteProductStorageObject(path: string): Promise<void> {
  try {
    const supabase = getClient();
    const { error } = await supabase.storage.from(getProductsBucket()).remove([path]);
    if (error) {
      console.error("deleteProductStorageObject failed:", error.message);
    }
  } catch (err) {
    console.error("deleteProductStorageObject failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Bookings — PRIVATE bucket. A booking photo is a customer's own device/
// issue photo, not public content. Uploading never returns a public URL;
// viewing always goes through a fresh, short-lived signed URL minted here,
// AFTER the caller has already verified the viewer is allowed to see it.
// ---------------------------------------------------------------------------

/** Only ever matches a path this module itself generated (see `randomObjectPath`) — rejects anything else before it reaches a Storage delete call, so a raw client-supplied string can never be used to delete an arbitrary object. */
const BOOKING_OBJECT_PATH_PATTERN = /^bookings\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

/** Uploads one already-validated booking image to the PRIVATE bucket. Returns only the storage path — deliberately no URL (there is no public URL for a private object); get one via `createBookingImageSignedUrl`. */
export async function uploadBookingImage(file: File): Promise<{ path: string }> {
  const path = randomObjectPath("bookings", file);

  const supabase = getClient();
  const { error } = await supabase.storage.from(getBookingsBucket()).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    throw new Error(`Booking image upload failed: ${error.message}`);
  }

  return { path };
}

/** Best-effort delete from the private bookings bucket — same non-throwing contract as `deleteProductStorageObject`. Silently refuses (logs, does nothing) any path that doesn't match this module's own generated shape, so a caller can never be tricked into deleting an arbitrary object by path string alone. */
export async function deleteBookingStorageObject(path: string): Promise<void> {
  if (!BOOKING_OBJECT_PATH_PATTERN.test(path)) {
    console.error("deleteBookingStorageObject: refused a malformed/unexpected path:", path);
    return;
  }
  try {
    const supabase = getClient();
    const { error } = await supabase.storage.from(getBookingsBucket()).remove([path]);
    if (error) {
      console.error("deleteBookingStorageObject failed:", error.message);
    }
  } catch (err) {
    console.error("deleteBookingStorageObject failed:", err);
  }
}

/**
 * Mints short-lived signed URLs for one or more booking-image storage paths
 * in a single Storage API call. Returns a `path -> signedUrl` map; a path
 * that fails to sign (transient Storage error, or an object that no longer
 * exists) is simply absent from the map — callers filter those out rather
 * than rendering a broken image.
 *
 * **This function does no authorization of its own** — it will happily sign
 * any path it's given. Every caller (`lib/account-data.ts`'s
 * `getCustomerBooking`, `lib/admin-data.ts`'s `getAdminBookingById`,
 * `app/(site)/booking/actions.ts`'s `uploadBookingAttachment`) must only
 * ever pass paths it has already confirmed the current viewer is allowed to
 * see — see each call site's own comment for how it establishes that.
 */
export async function createBookingImageSignedUrls(
  paths: string[],
  expiresInSeconds: number = BOOKING_SIGNED_URL_TTL_SECONDS
): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();

  try {
    const supabase = getClient();
    const { data, error } = await supabase.storage.from(getBookingsBucket()).createSignedUrls(paths, expiresInSeconds);
    if (error || !data) {
      console.error("createBookingImageSignedUrls failed:", error?.message);
      return new Map();
    }

    const result = new Map<string, string>();
    for (const entry of data) {
      if (entry.signedUrl && !entry.error && entry.path) {
        result.set(entry.path, entry.signedUrl);
      }
    }
    return result;
  } catch (err) {
    console.error("createBookingImageSignedUrls failed:", err);
    return new Map();
  }
}

/** Single-path convenience over `createBookingImageSignedUrls` — used for the one-photo-at-a-time upload preview. Returns `null` if signing failed. */
export async function createBookingImageSignedUrl(
  path: string,
  expiresInSeconds: number = BOOKING_SIGNED_URL_TTL_SECONDS
): Promise<string | null> {
  const urls = await createBookingImageSignedUrls([path], expiresInSeconds);
  return urls.get(path) ?? null;
}
