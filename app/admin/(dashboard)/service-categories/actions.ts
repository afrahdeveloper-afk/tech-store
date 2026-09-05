"use server";

import { revalidatePath, updateTag } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { slugify } from "@/lib/slug";
import { exceedsMaxLength, MAX_ADMIN_NAME_LENGTH, MAX_ADMIN_DESCRIPTION_LENGTH } from "@/lib/validation";

/** Service Categories CRUD — same shape as `app/admin/(dashboard)/products/actions.ts`; see that file's header comment for the shared conventions (re-check `getCurrentAdmin()` per action, coarse error codes, `revalidatePath` on every mutation). */

export interface ServiceCategoryFormInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
}

export type ServiceCategoryMutationErrorCode = "unauthorized" | "missing-fields" | "invalid-length" | "not-found" | "server-error";
export type ServiceCategoryMutationResult = { success: true; id: string } | { success: false; error: ServiceCategoryMutationErrorCode };

interface ValidatedServiceCategory {
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  icon: string | null;
}

function validate(input: ServiceCategoryFormInput): { ok: true; value: ValidatedServiceCategory } | { ok: false; error: "missing-fields" | "invalid-length" } {
  const name = input.name?.trim();
  const description = input.description?.trim();
  if (!name || !description) return { ok: false, error: "missing-fields" };
  // Max-length guard (A-03) — see lib/validation.ts's MAX_ADMIN_* doc comment.
  if (
    exceedsMaxLength(name, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(input.nameAr ?? "", MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(description, MAX_ADMIN_DESCRIPTION_LENGTH) ||
    exceedsMaxLength(input.descriptionAr ?? "", MAX_ADMIN_DESCRIPTION_LENGTH) ||
    exceedsMaxLength(input.icon ?? "", MAX_ADMIN_NAME_LENGTH)
  ) {
    return { ok: false, error: "invalid-length" };
  }
  return {
    ok: true,
    value: {
      name,
      nameAr: input.nameAr?.trim() || null,
      description,
      descriptionAr: input.descriptionAr?.trim() || null,
      icon: input.icon?.trim() || null,
    },
  };
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await prisma.serviceCategory.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createServiceCategory(input: ServiceCategoryFormInput): Promise<ServiceCategoryMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    const slug = await uniqueSlug(value.name);
    const category = await prisma.serviceCategory.create({ data: { ...value, slug }, select: { id: true } });
    revalidateServiceCategoryPaths(category.id);
    return { success: true, id: category.id };
  } catch (err) {
    console.error("createServiceCategory failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function updateServiceCategory(id: string, input: ServiceCategoryFormInput): Promise<ServiceCategoryMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = validate(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    await prisma.serviceCategory.update({ where: { id }, data: value });
    revalidateServiceCategoryPaths(id);
    return { success: true, id };
  } catch (err) {
    console.error("updateServiceCategory failed:", err);
    return { success: false, error: "not-found" };
  }
}

export async function deleteServiceCategory(
  id: string
): Promise<{ success: boolean; error?: "unauthorized" | "has-dependents" | "server-error" }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  // `Subservice.serviceCategoryId` cascades on delete, but each `Subservice`
  // itself is `onDelete: Restrict` from `Service` — so a category that still
  // has subservices-with-services would fail at the database layer with a
  // raw foreign-key error. Checked explicitly here instead, so the admin
  // gets a clear, translated reason rather than a raw constraint error (see
  // CLAUDE.md's "Never expose raw technical errors").
  const subserviceCount = await prisma.subservice.count({ where: { serviceCategoryId: id } });
  if (subserviceCount > 0) {
    return { success: false, error: "has-dependents" };
  }

  try {
    await prisma.serviceCategory.delete({ where: { id } });
    revalidateServiceCategoryPaths(id);
    return { success: true };
  } catch (err) {
    console.error("deleteServiceCategory failed:", err);
    return { success: false, error: "server-error" };
  }
}

function revalidateServiceCategoryPaths(id: string) {
  revalidatePath("/admin/service-categories");
  revalidatePath(`/admin/service-categories/${id}/edit`);
  revalidatePath("/services");
  revalidatePath("/");
  // `lib/services-data.ts`'s `getServiceCategories` is now cached (perf
  // audit P0-1) — without this, a create/edit/delete here wouldn't reach
  // `/services`, the homepage, or `/about` for up to the cache's 60s
  // revalidate window. `updateTag` gives immediate, read-your-own-writes
  // invalidation; this function already runs inside a Server Action.
  updateTag("service-categories");
}
