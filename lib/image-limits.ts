/**
 * Shared image-upload constants — dependency-free (no `server-only`), so
 * both `lib/storage.ts` (server) and client-side upload UI (the Admin
 * Product Image Manager, the new Add Product image picker) can import the
 * exact same values instead of each hand-maintaining a copy. Same "factor
 * the one small constant a Client Component needs out of the server-only
 * module" pattern as `lib/product-limits.ts`/`lib/booking-limits.ts` — see
 * those files' own doc comments for why this has to be a separate module.
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
