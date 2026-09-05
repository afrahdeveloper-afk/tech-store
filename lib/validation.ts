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

/**
 * Maximum-length limits (Phase 2, Part A — production-hardening: an
 * unbounded text field is both a storage/DB-row-size concern and, for
 * `password` specifically, a CPU-cost concern since `lib/auth/password.ts`
 * hashes it with `scrypt` before this check ever runs — so the length guard
 * must run *before* hashing, not after. Applied to the customer-facing
 * free-text fields that flow into a Server Action (Checkout/Booking/
 * Register/Login/Admin Login's name/email/phone/password/notes).
 */
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254; // RFC 5321 §4.5.3.1.3 total-address limit
export const MAX_PHONE_LENGTH = 20;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NOTES_LENGTH = 2000;
/** Shared minimum password length — was a private constant duplicated only in `app/(site)/register/actions.ts`; centralized here (Admin Change Password feature) so `app/admin/(dashboard)/settings/actions.ts` can enforce the exact same policy instead of re-declaring it a second time. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Max-length limits for Admin CRUD / Settings free-text fields (security
 * audit A-03) — these mutations are Admin-only, but an unbounded field is
 * still a real DB-row-size/layout concern regardless of who's authorized to
 * submit it. Deliberately separate constants from the customer-facing ones
 * above, not reused: a product/service/store name can reasonably run longer
 * than a person's name (`MAX_NAME_LENGTH`), and a product/service
 * description is meant to hold a few sentences to a short paragraph, not a
 * single line — using the tighter customer-facing limits here would reject
 * genuinely legitimate catalog content.
 */
export const MAX_ADMIN_NAME_LENGTH = 200;
export const MAX_ADMIN_DESCRIPTION_LENGTH = 5000;
export const MAX_ADMIN_ADDRESS_LENGTH = 500;
export const MAX_CURRENCY_CODE_LENGTH = 10;

/** True when `value` (already trimmed by the caller) is longer than `max` characters. */
export function exceedsMaxLength(value: string, max: number): boolean {
  return value.length > max;
}

/**
 * Digits only — strips spaces/dashes/parens/`+` so two differently-formatted
 * renderings of the same number compare equal. Moved here (Database
 * Security Audit remediation, Sept 2026) from `app/(site)/register/actions.ts`,
 * where it was originally written for the F-01 fix, so
 * `lib/guest-customer.ts` can share the exact same comparison for the
 * Checkout/Booking customer-overwrite fix rather than duplicating it.
 */
function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** The minimum digit-suffix length either comparison below requires — matches `isValidPhone`'s own minimum, so this can never pass on a near-empty value. Applied to BOTH the plain suffix check and the trunk-zero-stripped one below, so the trunk-zero branch can't quietly accept a shorter effective match than the plain one already required. */
const MIN_MATCHABLE_PHONE_DIGITS = 7;

/**
 * True when `a`/`b` are plausibly the same phone number.
 *
 * Two tolerances, both digit-suffix comparisons, in order:
 *
 *  1. Plain suffix match — the shorter digit string is a suffix of the
 *     longer one (formatting-only differences: spaces, dashes, parens).
 *  2. **Local trunk-prefix ↔ international country-code** (Phone Match
 *     correctness fix, Sept 2026): a local Iraqi number's leading "0"
 *     ("0771 234 5678") is replaced by a country code when dialed
 *     internationally ("+964 771 234 5678") — the "0" itself never appears
 *     in the international form, so #1 alone can't match this shape (it
 *     was previously claimed to, in this doc comment, but didn't — see
 *     `app/(site)/register/actions.ts`'s F-01 history). Checked only when
 *     #1 fails, and only strips a single leading "0" from the shorter
 *     string before re-comparing — every other digit must still match
 *     exactly. Guarded by `MIN_MATCHABLE_PHONE_DIGITS` on the *stripped*
 *     length too (not just the original), so this can't accept a shorter
 *     effective match than #1 already required — without that guard, a
 *     7-digit number right at the minimum would drop to a 6-digit
 *     comparison and become more collision-prone than the plain suffix
 *     check ever was.
 *
 * Deliberately NOT a general "ignore leading digits" rule — only this one,
 * specific, well-understood convention is added, so this can't introduce a
 * broader false-positive class than the plain suffix rule already had.
 *
 * Used to decide whether a claim/refresh of an existing `Customer` row is
 * plausibly coming from that row's real owner (`register/actions.ts`'s F-01
 * fix; `lib/guest-customer.ts`'s Checkout/Booking fix) without any
 * email-verification infrastructure — see F-01's doc comment in
 * `app/(site)/register/actions.ts` for the full rationale. Fail-closed: any
 * case not covered by #1 or #2 returns `false`.
 */
export function phoneNumbersLikelyMatch(a: string, b: string): boolean {
  const digitsA = normalizePhoneDigits(a);
  const digitsB = normalizePhoneDigits(b);
  if (digitsA.length < MIN_MATCHABLE_PHONE_DIGITS || digitsB.length < MIN_MATCHABLE_PHONE_DIGITS) return false;

  const [shorter, longer] = digitsA.length <= digitsB.length ? [digitsA, digitsB] : [digitsB, digitsA];
  if (longer.endsWith(shorter)) return true;

  if (shorter.startsWith("0") && shorter.length - 1 >= MIN_MATCHABLE_PHONE_DIGITS) {
    return longer.endsWith(shorter.slice(1));
  }
  return false;
}
