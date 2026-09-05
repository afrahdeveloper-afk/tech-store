"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { slugify } from "@/lib/slug";
import { exceedsMaxLength, MAX_ADMIN_NAME_LENGTH, MAX_ADMIN_DESCRIPTION_LENGTH } from "@/lib/validation";
import type { ServiceStatus } from "@/lib/generated/prisma/enums";

/** Services CRUD — the bookable, priced leaf. Same shape as the other three CRUD modules' Server Actions. */

export interface ServiceFormInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  durationMinutes: string;
  status: ServiceStatus;
  subserviceId: string;
}

export type ServiceMutationErrorCode =
  | "unauthorized"
  | "missing-fields"
  | "invalid-length"
  | "invalid-price"
  | "invalid-duration"
  | "invalid-subservice"
  | "not-found"
  | "server-error";
export type ServiceMutationResult = { success: true; id: string } | { success: false; error: ServiceMutationErrorCode };

async function validate(input: ServiceFormInput) {
  const name = input.name?.trim();
  const description = input.description?.trim();
  const subserviceId = input.subserviceId?.trim();
  if (!name || !description || !subserviceId) return { ok: false as const, error: "missing-fields" as const };
  // Max-length guard (A-03) — see lib/validation.ts's MAX_ADMIN_* doc comment.
  if (
    exceedsMaxLength(name, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(input.nameAr ?? "", MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(description, MAX_ADMIN_DESCRIPTION_LENGTH) ||
    exceedsMaxLength(input.descriptionAr ?? "", MAX_ADMIN_DESCRIPTION_LENGTH)
  ) {
    return { ok: false as const, error: "invalid-length" as const };
  }

  const subservice = await prisma.subservice.findUnique({ where: { id: subserviceId }, select: { id: true } });
  if (!subservice) return { ok: false as const, error: "invalid-subservice" as const };

  let price: number | null = null;
  if (input.price?.trim()) {
    price = Number(input.price);
    if (!Number.isFinite(price) || price <= 0) return { ok: false as const, error: "invalid-price" as const };
  }

  let durationMinutes: number | null = null;
  if (input.durationMinutes?.trim()) {
    durationMinutes = Number(input.durationMinutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      return { ok: false as const, error: "invalid-duration" as const };
    }
  }

  return {
    ok: true as const,
    value: {
      name,
      nameAr: input.nameAr?.trim() || null,
      description,
      descriptionAr: input.descriptionAr?.trim() || null,
      price,
      currency: price !== null ? "IQD" : null,
      durationMinutes,
      status: input.status,
      subserviceId,
    },
  };
}

/** Slugs are only unique per-subservice (`@@unique([subserviceId, slug])`) — see `prisma/schema.prisma` and the cross-subservice-collision Known Issue in CLAUDE.md. */
async function uniqueSlug(subserviceId: string, base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await prisma.service.findUnique({ where: { subserviceId_slug: { subserviceId, slug: candidate } }, select: { id: true } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createService(input: ServiceFormInput): Promise<ServiceMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = await validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    const slug = await uniqueSlug(value.subserviceId, value.name);
    const service = await prisma.service.create({ data: { ...value, slug }, select: { id: true } });
    revalidateServicePaths(service.id);
    return { success: true, id: service.id };
  } catch (err) {
    console.error("createService failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function updateService(id: string, input: ServiceFormInput): Promise<ServiceMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = await validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    await prisma.service.update({ where: { id }, data: value });
    revalidateServicePaths(id);
    return { success: true, id };
  } catch (err) {
    console.error("updateService failed:", err);
    return { success: false, error: "not-found" };
  }
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: "unauthorized" | "has-dependents" | "server-error" }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  // `Booking.serviceId` is `onDelete: Restrict` — a service with booking
  // history can't be hard-deleted (it would orphan real customer bookings).
  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) {
    return { success: false, error: "has-dependents" };
  }

  try {
    await prisma.service.delete({ where: { id } });
    revalidateServicePaths(id);
    return { success: true };
  } catch (err) {
    console.error("deleteService failed:", err);
    return { success: false, error: "server-error" };
  }
}

function revalidateServicePaths(id: string) {
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}/edit`);
  revalidatePath("/services");
  revalidatePath("/");
}
