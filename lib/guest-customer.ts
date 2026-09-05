import type { Prisma } from "@/lib/generated/prisma/client";
import { phoneNumbersLikelyMatch } from "@/lib/validation";

/**
 * Resolves the `Customer` row for an anonymous Checkout/Booking submission —
 * shared by both (`app/(site)/checkout/actions.ts`'s `createOrder`,
 * `app/(site)/booking/actions.ts`'s `createBooking`; both previously ran an
 * identical, unconditional `tx.customer.upsert({ where: { email }, update:
 * { name, phone } })`). Must run inside the same `$transaction` as the
 * Order/Booking row that follows it — takes `tx` rather than importing
 * `lib/db.ts`'s top-level `prisma` itself.
 *
 * **Database Security Audit remediation (Sept 2026) — Checkout/Booking
 * customer-overwrite finding**: the old unconditional upsert let anyone who
 * typed a real, already-registered customer's email into either form
 * silently overwrite that customer's `name`/`phone` — no password, no proof
 * of ownership. Same class of issue as F-01 (`app/(site)/register/actions.ts`'s
 * account-takeover fix), for this write path specifically; the residual gap
 * was already flagged, disclosed, and deliberately deferred when F-01
 * shipped (see that file's doc comment) — this closes it, reusing F-01's own
 * trust boundary rather than inventing a new one:
 *
 *  - No existing row for this email → create it. Ordinary new guest,
 *    unaffected.
 *  - An existing row with **no** `passwordHash` (a guest-only row, never
 *    registered) → always safe to refresh `name`/`phone` freely. That's the
 *    entire point of a repeat guest checking out again under the same
 *    email, and a passwordless row has no protected state to corrupt (F-01
 *    already governs the one action — Register — that would turn this row
 *    into a real account).
 *  - An existing row **with** a `passwordHash` (a real, registered account)
 *    and the submitted `phone` plausibly matches the one already on file
 *    (`phoneNumbersLikelyMatch` — same tolerant digit-suffix comparison
 *    F-01 uses) → refresh normally; this is very likely the real owner
 *    checking out as a guest without bothering to log in.
 *  - An existing row **with** a `passwordHash` and a **non-matching**
 *    `phone` → refuse the write, but do NOT fail the checkout/booking: the
 *    Order/Booking is still created against that real customer's id (an
 *    email that already resolves to a known, verified identity shouldn't
 *    be turned away), it's just attributed to that customer's real,
 *    already-on-file `name`/`phone` rather than whatever the anonymous
 *    submitter typed in — so no attacker-supplied data ever lands on a
 *    protected profile.
 *
 * Only `name`/`phone` are in scope — `email` is the lookup key (never
 * rewritten) and `passwordHash` is never touched here (only
 * `register`/`login` ever read or write it).
 */
export async function resolveGuestCustomer(
  tx: Prisma.TransactionClient,
  input: { name: string; email: string; phone: string }
): Promise<{ id: string }> {
  const { name, email, phone } = input;

  const existing = await tx.customer.findUnique({
    where: { email },
    select: { id: true, phone: true, passwordHash: true },
  });

  if (!existing) {
    const created = await tx.customer.create({ data: { name, email, phone } });
    return { id: created.id };
  }

  if (existing.passwordHash && !phoneNumbersLikelyMatch(phone, existing.phone)) {
    return { id: existing.id };
  }

  const updated = await tx.customer.update({ where: { id: existing.id }, data: { name, phone } });
  return { id: updated.id };
}
