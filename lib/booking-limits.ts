/**
 * Booking Image Upload (Global Image System) — a sane per-booking attachment
 * ceiling, same "dependency-free shared constant" reasoning as
 * `lib/product-limits.ts`: `app/(site)/booking/actions.ts` has `"use server"`
 * at the top, and a Server Actions file may only export async functions, so
 * a plain constant there would break the Client Component
 * (`BookingImageUpload`) that also needs it.
 */
export const MAX_BOOKING_IMAGES = 5;
