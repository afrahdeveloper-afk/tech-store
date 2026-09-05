"use server";

import { revalidatePath, updateTag } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  isValidEmail,
  isValidPhone,
  exceedsMaxLength,
  MAX_ADMIN_NAME_LENGTH,
  MAX_ADMIN_ADDRESS_LENGTH,
  MAX_CURRENCY_CODE_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation";

/** Store Settings — a single mutation against the singleton `StoreSettings` row. Protected by the existing first-party admin session (`getCurrentAdmin()`), same as every other admin mutation — no new auth system. */

export interface StoreSettingsFormInput {
  storeName: string;
  storeNameAr: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressAr: string;
  currency: string;
  maintenanceMode: boolean;
}

export type StoreSettingsMutationErrorCode = "unauthorized" | "missing-fields" | "invalid-length" | "invalid-email" | "invalid-phone" | "server-error";
export type StoreSettingsMutationResult = { success: true } | { success: false; error: StoreSettingsMutationErrorCode };

export async function updateStoreSettings(input: StoreSettingsFormInput): Promise<StoreSettingsMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const storeName = input.storeName?.trim();
  const contactEmail = input.contactEmail?.trim();
  const contactPhone = input.contactPhone?.trim();
  const currency = input.currency?.trim().toUpperCase();
  const storeNameAr = input.storeNameAr?.trim() ?? "";
  const contactAddress = input.contactAddress?.trim() ?? "";
  const contactAddressAr = input.contactAddressAr?.trim() ?? "";

  if (!storeName || !contactEmail || !contactPhone || !currency) {
    return { success: false, error: "missing-fields" };
  }
  // Max-length guard (A-03) — see lib/validation.ts's MAX_ADMIN_*/MAX_CURRENCY_CODE_LENGTH doc comments.
  if (
    exceedsMaxLength(storeName, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(storeNameAr, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(contactEmail, MAX_EMAIL_LENGTH) ||
    exceedsMaxLength(contactPhone, MAX_PHONE_LENGTH) ||
    exceedsMaxLength(contactAddress, MAX_ADMIN_ADDRESS_LENGTH) ||
    exceedsMaxLength(contactAddressAr, MAX_ADMIN_ADDRESS_LENGTH) ||
    exceedsMaxLength(currency, MAX_CURRENCY_CODE_LENGTH)
  ) {
    return { success: false, error: "invalid-length" };
  }
  if (!isValidEmail(contactEmail)) {
    return { success: false, error: "invalid-email" };
  }
  if (!isValidPhone(contactPhone)) {
    return { success: false, error: "invalid-phone" };
  }

  try {
    const existing = await prisma.storeSettings.findFirst({ select: { id: true } });
    const data = {
      storeName,
      storeNameAr: storeNameAr || null,
      contactEmail,
      contactPhone,
      contactAddress: contactAddress || null,
      contactAddressAr: contactAddressAr || null,
      currency,
      maintenanceMode: input.maintenanceMode,
    };

    if (existing) {
      await prisma.storeSettings.update({ where: { id: existing.id }, data });
    } else {
      await prisma.storeSettings.create({ data });
    }

    revalidatePath("/admin/settings");
    // `lib/settings-data.ts`'s `getOrCreateStoreSettings` is now cached
    // (perf audit P0-1/P0-2) — without this, a maintenance-mode toggle or
    // contact-info edit here wouldn't reach the storefront (proxy.ts's
    // maintenance gate, the site layout's footer data) for up to the
    // cache's 60s revalidate window. `updateTag` (not `revalidateTag`) is
    // Next's documented primitive for immediate, read-your-own-writes
    // invalidation from inside a Server Action.
    updateTag("store-settings");
    return { success: true };
  } catch (err) {
    console.error("updateStoreSettings failed:", err);
    return { success: false, error: "server-error" };
  }
}

/**
 * Admin Change Password — the signed-in admin changing their own password.
 * Deliberately self-service only (current admin acting on their own row,
 * proven by the session cookie via `getCurrentAdmin()`), not an "edit any
 * admin" tool — there's still no admin-to-admin management surface in this
 * project (see the "no public admin self-registration" note on the `Admin`
 * model in `prisma/schema.prisma` — new `Admin` rows are still created only
 * via direct database access, e.g. Prisma Studio or a one-off script; this
 * action doesn't change that).
 *
 * Reuses `lib/auth/password.ts`'s `hashPassword`/`verifyPassword` — the same
 * scrypt-based utility `Customer` already uses (see `Admin.passwordHash`'s
 * own schema doc comment) — and `MIN_PASSWORD_LENGTH`/`MAX_PASSWORD_LENGTH`
 * from `lib/validation.ts`, the same policy `register/actions.ts` enforces
 * for Customer passwords, so the two account types can't silently drift
 * apart on password strength rules.
 *
 * The current session cookie is left untouched on success — a password
 * change doesn't need to force a re-login, since the session is a signed
 * identifier, not derived from the password itself.
 */
export interface AdminPasswordFormInput {
  currentPassword: string;
  newPassword: string;
}

export type AdminPasswordMutationErrorCode =
  | "unauthorized"
  | "missing-fields"
  | "invalid-length"
  | "weak-password"
  | "incorrect-current-password"
  | "server-error";

export type AdminPasswordMutationResult = { success: true } | { success: false; error: AdminPasswordMutationErrorCode };

export async function updateAdminPassword(input: AdminPasswordFormInput): Promise<AdminPasswordMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const currentPassword = input.currentPassword ?? "";
  const newPassword = input.newPassword ?? "";

  if (!currentPassword || !newPassword) {
    return { success: false, error: "missing-fields" };
  }
  // Length guard before hashing (matches register/actions.ts's own
  // ordering rationale) — an unbounded password is a real scrypt CPU-cost
  // concern, not just a UX one, so this must run before either hash call.
  if (exceedsMaxLength(currentPassword, MAX_PASSWORD_LENGTH) || exceedsMaxLength(newPassword, MAX_PASSWORD_LENGTH)) {
    return { success: false, error: "invalid-length" };
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: "weak-password" };
  }

  try {
    // getCurrentAdmin()'s CurrentAdmin shape deliberately never includes
    // passwordHash (see its own doc comment) — re-fetch it directly here,
    // scoped to this admin's own id only.
    const record = await prisma.admin.findUnique({ where: { id: admin.id }, select: { passwordHash: true } });
    if (!record || !verifyPassword(currentPassword, record.passwordHash)) {
      return { success: false, error: "incorrect-current-password" };
    }

    const passwordHash = hashPassword(newPassword);
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

    return { success: true };
  } catch (err) {
    console.error("updateAdminPassword failed:", err);
    return { success: false, error: "server-error" };
  }
}
