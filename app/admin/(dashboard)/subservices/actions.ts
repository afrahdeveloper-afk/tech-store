"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { slugify } from "@/lib/slug";
import { exceedsMaxLength, MAX_ADMIN_NAME_LENGTH, MAX_ADMIN_DESCRIPTION_LENGTH } from "@/lib/validation";

/** Subservices CRUD — same shape as `app/admin/(dashboard)/service-categories/actions.ts`. */

export interface SubserviceFormInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  serviceCategoryId: string;
}

export type SubserviceMutationErrorCode = "unauthorized" | "missing-fields" | "invalid-length" | "invalid-category" | "not-found" | "server-error";
export type SubserviceMutationResult = { success: true; id: string } | { success: false; error: SubserviceMutationErrorCode };

async function validate(input: SubserviceFormInput) {
  const name = input.name?.trim();
  const serviceCategoryId = input.serviceCategoryId?.trim();
  if (!name || !serviceCategoryId) return { ok: false as const, error: "missing-fields" as const };
  // Max-length guard (A-03) — see lib/validation.ts's MAX_ADMIN_* doc comment.
  if (
    exceedsMaxLength(name, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(input.nameAr ?? "", MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(input.description ?? "", MAX_ADMIN_DESCRIPTION_LENGTH) ||
    exceedsMaxLength(input.descriptionAr ?? "", MAX_ADMIN_DESCRIPTION_LENGTH)
  ) {
    return { ok: false as const, error: "invalid-length" as const };
  }

  const category = await prisma.serviceCategory.findUnique({ where: { id: serviceCategoryId }, select: { id: true } });
  if (!category) return { ok: false as const, error: "invalid-category" as const };

  return {
    ok: true as const,
    value: {
      name,
      nameAr: input.nameAr?.trim() || null,
      description: input.description?.trim() || null,
      descriptionAr: input.descriptionAr?.trim() || null,
      serviceCategoryId,
    },
  };
}

/** Slugs are only unique per-category (`@@unique([serviceCategoryId, slug])`) — see `prisma/schema.prisma`. */
async function uniqueSlug(serviceCategoryId: string, base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await prisma.subservice.findUnique({ where: { serviceCategoryId_slug: { serviceCategoryId, slug: candidate } }, select: { id: true } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createSubservice(input: SubserviceFormInput): Promise<SubserviceMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = await validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    const slug = await uniqueSlug(value.serviceCategoryId, value.name);
    const subservice = await prisma.subservice.create({ data: { ...value, slug }, select: { id: true } });
    revalidateSubservicePaths(subservice.id);
    return { success: true, id: subservice.id };
  } catch (err) {
    console.error("createSubservice failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function updateSubservice(id: string, input: SubserviceFormInput): Promise<SubserviceMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = await validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    await prisma.subservice.update({ where: { id }, data: value });
    revalidateSubservicePaths(id);
    return { success: true, id };
  } catch (err) {
    console.error("updateSubservice failed:", err);
    return { success: false, error: "not-found" };
  }
}

export async function deleteSubservice(
  id: string
): Promise<{ success: boolean; error?: "unauthorized" | "has-dependents" | "server-error" }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  // `Service.subserviceId` is `onDelete: Restrict` — same reasoning as
  // `deleteServiceCategory`'s guard.
  const serviceCount = await prisma.service.count({ where: { subserviceId: id } });
  if (serviceCount > 0) {
    return { success: false, error: "has-dependents" };
  }

  try {
    await prisma.subservice.delete({ where: { id } });
    revalidateSubservicePaths(id);
    return { success: true };
  } catch (err) {
    console.error("deleteSubservice failed:", err);
    return { success: false, error: "server-error" };
  }
}

function revalidateSubservicePaths(id: string) {
  revalidatePath("/admin/subservices");
  revalidatePath(`/admin/subservices/${id}/edit`);
  revalidatePath("/services");
}
