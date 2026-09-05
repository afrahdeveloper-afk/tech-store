"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { slugify } from "@/lib/slug";
import { MAX_PRODUCT_PRICE, MAX_PRODUCT_IMAGES } from "@/lib/product-limits";
import { computeStockStatus } from "@/lib/stock-status";
import { uploadProductImage, deleteProductStorageObject, validateImageFile } from "@/lib/storage";
import { exceedsMaxLength, MAX_ADMIN_NAME_LENGTH, MAX_ADMIN_DESCRIPTION_LENGTH } from "@/lib/validation";
import type { ProductStatus } from "@/lib/generated/prisma/enums";

/**
 * Products CRUD — the Admin Dashboard's first full create/update/delete
 * module (see CLAUDE.md's Admin Dashboard status notes: the read-only lists
 * built in the earlier session are being extended with real mutations,
 * module by module, starting here). Every export re-checks `getCurrentAdmin()`
 * itself — a Server Action is directly callable and must never assume the
 * page that rendered its trigger was itself gated (same rule `adminLogout`/
 * `adminSearchAction` already follow in `app/admin/actions.ts`).
 *
 * Image handling: real file uploads (Global Image System, below) are the
 * only way a product gets photos now. A-02 correction: this form used to
 * also accept a raw `imageUrl` text field (from before file uploads
 * existed) — removed here since `components/admin/products/product-form.tsx`
 * stopped rendering that input a while ago (dead server-side surface: an
 * unvalidated string accepted by a Server Action that nothing in the current
 * UI ever sends a non-empty value for).
 */

export interface ProductFormInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  status: ProductStatus;
  categoryId: string;
  subcategoryId: string;
}

export type ProductMutationErrorCode =
  | "unauthorized"
  | "missing-fields"
  | "invalid-length"
  | "invalid-price"
  | "invalid-discount"
  | "invalid-stock"
  | "invalid-category"
  | "invalid-subcategory"
  | "not-found"
  | "server-error";

export type ProductMutationResult = { success: true; id: string } | { success: false; error: ProductMutationErrorCode };

interface ValidatedProduct {
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string;
  subcategoryId: string | null;
}

/** Shared field validation for create + update — mirrors `app/(site)/checkout/actions.ts`'s "one coarse error code per problem" convention. */
async function validateProductInput(input: ProductFormInput): Promise<{ ok: true; value: ValidatedProduct } | { ok: false; error: ProductMutationErrorCode }> {
  const name = input.name?.trim();
  const description = input.description?.trim();
  const categoryId = input.categoryId?.trim();

  if (!name || !description || !categoryId) {
    return { ok: false, error: "missing-fields" };
  }
  // Max-length guard (A-03) — Admin CRUD text fields had no server-side cap
  // (unlike Checkout/Booking/Login), even though they're just as capable of
  // producing an oversized DB row / broken layout. Checked before the price/
  // category lookups below so an oversized value never reaches a DB query.
  if (
    exceedsMaxLength(name, MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(input.nameAr ?? "", MAX_ADMIN_NAME_LENGTH) ||
    exceedsMaxLength(description, MAX_ADMIN_DESCRIPTION_LENGTH) ||
    exceedsMaxLength(input.descriptionAr ?? "", MAX_ADMIN_DESCRIPTION_LENGTH)
  ) {
    return { ok: false, error: "invalid-length" };
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRODUCT_PRICE) {
    return { ok: false, error: "invalid-price" };
  }

  let discountPrice: number | null = null;
  if (input.discountPrice?.trim()) {
    discountPrice = Number(input.discountPrice);
    if (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price || discountPrice > MAX_PRODUCT_PRICE) {
      return { ok: false, error: "invalid-discount" };
    }
  }

  const stockQuantity = Number(input.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return { ok: false, error: "invalid-stock" };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) {
    return { ok: false, error: "invalid-category" };
  }

  let subcategoryId: string | null = null;
  if (input.subcategoryId?.trim()) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: input.subcategoryId.trim() },
      select: { id: true, categoryId: true },
    });
    if (!subcategory || subcategory.categoryId !== categoryId) {
      return { ok: false, error: "invalid-subcategory" };
    }
    subcategoryId = subcategory.id;
  }

  return {
    ok: true,
    value: {
      name,
      nameAr: input.nameAr?.trim() || null,
      description,
      descriptionAr: input.descriptionAr?.trim() || null,
      price,
      discountPrice,
      stockQuantity,
      status: input.status,
      categoryId,
      subcategoryId,
    },
  };
}

/** Appends `-2`, `-3`, … until the slug is free — the catalog is small, so a handful of `findUnique` calls is not a performance concern (same reasoning `lib/products-data.ts` documents for its own in-memory sort/paginate). */
async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createProduct(input: ProductFormInput): Promise<ProductMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const validated = await validateProductInput(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    const slug = await uniqueSlug(value.name);
    const product = await prisma.product.create({
      data: {
        slug,
        name: value.name,
        nameAr: value.nameAr,
        description: value.description,
        descriptionAr: value.descriptionAr,
        price: value.price,
        discountPrice: value.discountPrice,
        stockQuantity: value.stockQuantity,
        stockStatus: computeStockStatus(value.stockQuantity),
        status: value.status,
        categoryId: value.categoryId,
        subcategoryId: value.subcategoryId,
      },
      select: { id: true },
    });

    revalidateProductPaths(product.id);
    return { success: true, id: product.id };
  } catch (err) {
    console.error("createProduct failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { success: false, error: "not-found" };

  const validated = await validateProductInput(input);
  if (!validated.ok) return { success: false, error: validated.error };
  const value = validated.value;

  try {
    // Product photos are managed exclusively by the Product Image Manager's
    // own immediate Server Actions (`addProductImages`/`deleteProductImage`/
    // `setPrimaryProductImage`/`reorderProductImages`, below) — this update
    // no longer touches `ProductImage` rows at all (A-02: the old "upsert
    // the primary image from a raw imageUrl string" path was removed as
    // dead/unvalidated input).
    await prisma.product.update({
      where: { id },
      data: {
        name: value.name,
        nameAr: value.nameAr,
        description: value.description,
        descriptionAr: value.descriptionAr,
        price: value.price,
        discountPrice: value.discountPrice,
        stockQuantity: value.stockQuantity,
        stockStatus: computeStockStatus(value.stockQuantity),
        status: value.status,
        categoryId: value.categoryId,
        subcategoryId: value.subcategoryId,
      },
    });

    revalidateProductPaths(id);
    return { success: true, id };
  } catch (err) {
    console.error("updateProduct failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: "unauthorized" | "not-found" | "server-error" }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  try {
    // Fetch storage paths before the row (and its images, via cascade) is
    // gone — the DB delete only removes the `ProductImage` rows, not the
    // underlying Supabase Storage objects (Global Image System); those are
    // cleaned up separately, after the DB delete succeeds.
    const imagesToDelete = await prisma.productImage.findMany({ where: { productId: id }, select: { path: true } });

    // `ProductImage` cascades on delete (`onDelete: Cascade`); `OrderItem`
    // keeps its row via `onDelete: SetNull` (its `productNameSnapshot`
    // already preserves order history independent of the catalog — see
    // `prisma/schema.prisma`), so a hard delete is schema-safe.
    await prisma.product.delete({ where: { id } });

    await Promise.all(imagesToDelete.filter((image) => image.path).map((image) => deleteProductStorageObject(image.path!)));

    revalidateProductPaths(id);
    return { success: true };
  } catch (err) {
    console.error("deleteProduct failed:", err);
    return { success: false, error: "server-error" };
  }
}

// ---------------------------------------------------------------------------
// Product Images — Admin Product Image Manager (Global Image System). A
// separate, immediate-effect action set (not bundled into
// createProduct/updateProduct's submit) — each mutation (upload/delete/set
// primary/reorder) happens the moment the admin does it in the manager UI,
// mirroring how `row-actions.tsx`'s delete confirmation works elsewhere in
// this admin: small, independent Server Actions, not a big form payload.
// ---------------------------------------------------------------------------

export type ProductImageMutationErrorCode =
  | "unauthorized"
  | "not-found"
  | "invalid-file"
  | "file-too-large"
  | "too-many-images"
  | "server-error";

export interface ProductImageResult {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export type ProductImageMutationResult =
  | { success: true; images: ProductImageResult[] }
  | { success: false; error: ProductImageMutationErrorCode };

/** Uploads one or more images for `productId` (the `formData`'s repeated `"files"` field) — the first image ever added to a product becomes primary automatically. */
export async function addProductImages(productId: string, formData: FormData): Promise<ProductImageMutationResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { success: false, error: "not-found" };

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { success: false, error: "invalid-file" };

  const existingCount = await prisma.productImage.count({ where: { productId } });
  if (existingCount + files.length > MAX_PRODUCT_IMAGES) return { success: false, error: "too-many-images" };

  for (const file of files) {
    const validationError = await validateImageFile(file);
    if (validationError === "too-large") return { success: false, error: "file-too-large" };
    if (validationError) return { success: false, error: "invalid-file" };
  }

  try {
    const maxSortOrder = await prisma.productImage.aggregate({ where: { productId }, _max: { sortOrder: true } });
    let nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const created: ProductImageResult[] = [];
    for (const file of files) {
      const uploaded = await uploadProductImage(file);
      const row = await prisma.productImage.create({
        data: {
          productId,
          url: uploaded.url,
          path: uploaded.path,
          isPrimary: existingCount === 0 && created.length === 0,
          sortOrder: nextSortOrder,
        },
        select: { id: true, url: true, isPrimary: true, sortOrder: true },
      });
      created.push(row);
      nextSortOrder += 1;
    }

    revalidateProductPaths(productId);
    return { success: true, images: created };
  } catch (err) {
    console.error("addProductImages failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: ProductImageMutationErrorCode }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const image = await prisma.productImage.findUnique({ where: { id: imageId }, select: { id: true, productId: true, path: true, isPrimary: true } });
  if (!image) return { success: false, error: "not-found" };

  try {
    await prisma.productImage.delete({ where: { id: imageId } });
    if (image.path) await deleteProductStorageObject(image.path);

    // The deleted image was the primary one — promote the next-lowest
    // `sortOrder` remaining image (if any) so a product never silently ends
    // up with zero primary images while it still has photos.
    if (image.isPrimary) {
      const next = await prisma.productImage.findFirst({ where: { productId: image.productId }, orderBy: { sortOrder: "asc" } });
      if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }

    revalidateProductPaths(image.productId);
    return { success: true };
  } catch (err) {
    console.error("deleteProductImage failed:", err);
    return { success: false, error: "server-error" };
  }
}

export async function setPrimaryProductImage(imageId: string): Promise<{ success: boolean; error?: ProductImageMutationErrorCode }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const image = await prisma.productImage.findUnique({ where: { id: imageId }, select: { id: true, productId: true } });
  if (!image) return { success: false, error: "not-found" };

  try {
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId: image.productId, isPrimary: true }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);
    revalidateProductPaths(image.productId);
    return { success: true };
  } catch (err) {
    console.error("setPrimaryProductImage failed:", err);
    return { success: false, error: "server-error" };
  }
}

/** Persists a new display order after a drag-reorder in the Image Manager — `orderedImageIds` is the complete, final id order. */
export async function reorderProductImages(productId: string, orderedImageIds: string[]): Promise<{ success: boolean; error?: ProductImageMutationErrorCode }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, error: "unauthorized" };

  const existing = await prisma.productImage.findMany({ where: { productId }, select: { id: true } });
  const existingIds = new Set(existing.map((image) => image.id));
  const isValidReorder = orderedImageIds.length === existing.length && orderedImageIds.every((id) => existingIds.has(id));
  if (!isValidReorder) return { success: false, error: "not-found" };

  try {
    await prisma.$transaction(
      orderedImageIds.map((id, index) => prisma.productImage.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidateProductPaths(productId);
    return { success: true };
  } catch (err) {
    console.error("reorderProductImages failed:", err);
    return { success: false, error: "server-error" };
  }
}

function revalidateProductPaths(id: string) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  // The public catalog reads live from the same table (`lib/products-data.ts`,
  // Phase 12b) — an admin mutation must be reflected there too.
  revalidatePath("/products");
  revalidatePath("/");
}
