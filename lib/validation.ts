/**
 * Small, dependency-free field validators shared by the Checkout and
 * Booking forms (client-side, for immediate feedback) and their matching
 * Server Actions (`app/checkout/actions.ts`, `app/booking/actions.ts`, for
 * authoritative re-validation — see CLAUDE.md Phase 7 Step 7/10). Kept in
 * one place so the two flows can't silently drift apart.
 */

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Accepts digits with optional leading `+` and interior spaces/dashes/parens; requires at least 7 digits. */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  const digitCount = trimmed.replace(/\D/g, "").length;
  return digitCount >= 7 && /^\+?[\d\s()-]+$/.test(trimmed);
}
