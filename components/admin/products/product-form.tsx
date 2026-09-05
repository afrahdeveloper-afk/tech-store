"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { Category, Subcategory } from "@/types";
import type { ProductStatus } from "@/lib/generated/prisma/enums";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  createProduct,
  updateProduct,
  addProductImages,
  type ProductFormInput,
  type ProductMutationErrorCode,
} from "@/app/admin/(dashboard)/products/actions";
import { MAX_PRODUCT_PRICE } from "@/lib/product-limits";
import { FormField } from "@/components/shared/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { NewProductImagePicker, type StagedProductImage } from "@/components/admin/products/new-product-image-picker";

export interface ProductFormValues {
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

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  discountPrice: "",
  stockQuantity: "0",
  status: "DRAFT",
  categoryId: "",
  subcategoryId: "",
};

/**
 * Create/Edit form for Products — one component for both modes (`productId`
 * present = edit), same shape as this project's other dual-purpose forms.
 * Client-side validation mirrors the Server Action's own re-validation
 * (`app/admin/(dashboard)/products/actions.ts`) so field errors surface
 * immediately; the server check is the authoritative one (never trust the
 * client), same discipline as Checkout/Booking.
 */
export function ProductForm({
  productId,
  initialValues,
  categories,
  subcategories,
}: {
  productId?: string;
  initialValues?: ProductFormValues;
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = React.useState<ProductFormValues>(initialValues ?? EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  // Create-mode only — the images an admin picks before the product exists
  // (see `NewProductImagePicker`'s own doc comment for why these can't
  // upload immediately like `ProductImageManager`'s do). Uploaded in one
  // batch right after `createProduct` succeeds, in `handleSubmit` below.
  const [staged, setStaged] = React.useState<StagedProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = React.useState(false);

  const availableSubcategories = subcategories.filter((subcategory) => subcategory.categoryId === values.categoryId);

  const errorMessage: Record<ProductMutationErrorCode, string> = {
    unauthorized: t.adminForm.errorUnauthorized,
    "missing-fields": t.adminForm.errorMissingFields,
    "invalid-length": t.adminForm.errorInvalidLength,
    "invalid-price": t.adminForm.errorInvalidPrice,
    "invalid-discount": t.adminForm.errorInvalidDiscount,
    "invalid-stock": t.adminForm.errorInvalidStock,
    "invalid-category": t.adminForm.errorInvalidCategory,
    "invalid-subcategory": t.adminForm.errorInvalidSubcategory,
    "not-found": t.adminForm.errorNotFound,
    "server-error": t.adminForm.errorServer,
  };

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): Partial<Record<keyof ProductFormValues, string>> {
    const errors: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!values.name.trim()) errors.name = t.adminForm.errorMissingFields;
    if (!values.description.trim()) errors.description = t.adminForm.errorMissingFields;
    if (!values.categoryId) errors.categoryId = t.adminForm.errorInvalidCategory;

    const price = Number(values.price);
    if (!Number.isFinite(price) || price <= 0 || price > MAX_PRODUCT_PRICE) errors.price = t.adminForm.errorInvalidPrice;

    if (values.discountPrice.trim()) {
      const discount = Number(values.discountPrice);
      if (!Number.isFinite(discount) || discount <= 0 || discount >= price || discount > MAX_PRODUCT_PRICE) {
        errors.discountPrice = t.adminForm.errorInvalidDiscount;
      }
    }

    const stock = Number(values.stockQuantity);
    if (!Number.isInteger(stock) || stock < 0) errors.stockQuantity = t.adminForm.errorInvalidStock;

    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: ProductFormInput = { ...values };
    const result = productId ? await updateProduct(productId, input) : await createProduct(input);

    if (!result.success) {
      setSubmitting(false);
      toast({ title: t.adminForm.mutationErrorTitle, description: errorMessage[result.error], variant: "error" });
      return;
    }

    // Preferred flow (Global Image System, Add Product upload): the Product
    // row didn't exist yet while the admin was picking photos, so nothing
    // could be uploaded until now — `createProduct` just succeeded, so
    // `result.id` is real. Upload every staged file in its current
    // (already reorder/set-primary-respecting) order in one call:
    // `addProductImages` marks the first file of the first call primary
    // when the product has no images yet, which is exactly the local
    // picker's own "first = primary" convention — no separate "set
    // primary" step needed server-side.
    let imagesFailed = false;
    if (!productId && staged.length > 0) {
      setUploadingImages(true);
      const formData = new FormData();
      for (const image of staged) formData.append("files", image.file);
      const uploadResult = await addProductImages(result.id, formData);
      imagesFailed = !uploadResult.success;
      for (const image of staged) URL.revokeObjectURL(image.previewUrl);
      setUploadingImages(false);
    }

    setSubmitting(false);

    if (imagesFailed) {
      // The product itself was created successfully — never lose that just
      // because photos failed (a Storage hiccup, say). Send the admin to
      // Edit, where the real Product Image Manager (unaffected by this
      // failure) is the natural place to retry.
      toast({
        title: t.adminForm.createSuccessImagesFailedTitle,
        description: t.adminForm.createSuccessImagesFailedDescription,
        variant: "error",
      });
    } else {
      toast({ title: productId ? t.adminForm.updateSuccessTitle : t.adminForm.createSuccessTitle, variant: "success" });
    }
    // A brand-new product lands on its Edit page (where the Product Image
    // Manager lives — showing the just-uploaded photos, or ready for a
    // retry) instead of the list. Editing an existing product keeps
    // returning to the list, unchanged from before.
    //
    // Deliberately no `router.refresh()` alongside this `push()` (removed —
    // it used to be here): `createProduct`/`updateProduct` already call
    // `revalidatePath()` server-side for every path this could possibly
    // stale (`/admin/products`, this product's own `/edit`, the public
    // `/products` + `/`), so a client-side refresh on top is redundant —
    // and for a brand-new product's `/edit` URL specifically (never visited
    // before this exact navigation, so there's no Router Cache entry to
    // invalidate in the first place), firing `refresh()` in the same tick
    // as `push()` sends two overlapping requests at the exact moment that
    // never-before-compiled dynamic route is being compiled for the first
    // time — which reproducibly corrupted Turbopack dev mode's route table
    // for the rest of that server process's life (every subsequent request
    // to `/admin/products/[id]/edit`, for *any* id, 404ing until the dev
    // server was restarted — not a data bug; `getAdminProductById` always
    // returned the real row when called directly).
    router.push(productId ? "/admin/products" : `/admin/products/${result.id}/edit`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="name" label={`${t.adminForm.nameLabel} *`} value={values.name} onChange={(value) => set("name", value)} error={fieldErrors.name} />
        <FormField id="nameAr" label={t.adminForm.nameArLabel} value={values.nameAr} onChange={(value) => set("nameAr", value)} dir="rtl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">{t.adminForm.descriptionLabel} *</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description ? (
            <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionAr">{t.adminForm.descriptionArLabel}</Label>
          <Textarea id="descriptionAr" dir="rtl" value={values.descriptionAr} onChange={(event) => set("descriptionAr", event.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="price" label={`${t.adminForm.priceLabel} *`} type="number" min="0" value={values.price} onChange={(value) => set("price", value)} error={fieldErrors.price} />
        <FormField
          id="discountPrice"
          label={t.adminForm.discountPriceLabel}
          type="number"
          min="0"
          value={values.discountPrice}
          onChange={(value) => set("discountPrice", value)}
          error={fieldErrors.discountPrice}
        />
        <FormField
          id="stockQuantity"
          label={`${t.adminForm.stockQuantityLabel} *`}
          type="number"
          min="0"
          value={values.stockQuantity}
          onChange={(value) => set("stockQuantity", value)}
          error={fieldErrors.stockQuantity}
        />
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">{t.adminForm.discountPriceHint}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">{t.adminForm.categoryLabel} *</Label>
          <Select
            id="categoryId"
            value={values.categoryId}
            onChange={(event) => {
              set("categoryId", event.target.value);
              set("subcategoryId", "");
            }}
            aria-invalid={Boolean(fieldErrors.categoryId)}
          >
            <option value="">{t.adminForm.categoryPlaceholder}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {fieldErrors.categoryId ? (
            <p role="alert" className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 text-xs text-destructive">
              {fieldErrors.categoryId}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subcategoryId">{t.adminForm.subcategoryLabel}</Label>
          <Select
            id="subcategoryId"
            value={values.subcategoryId}
            onChange={(event) => set("subcategoryId", event.target.value)}
            disabled={!values.categoryId}
          >
            <option value="">{t.adminForm.subcategoryNone}</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">{t.adminForm.statusLabel}</Label>
          <Select id="status" value={values.status} onChange={(event) => set("status", event.target.value as ProductStatus)}>
            <option value="DRAFT">{t.adminProducts.statusDraft}</option>
            <option value="ACTIVE">{t.adminProducts.statusActive}</option>
            <option value="ARCHIVED">{t.adminProducts.statusArchived}</option>
          </Select>
        </div>
      </div>

      {/* Once a product exists, the Product Image Manager (a separate card
          in `EditProductView`) is the sole authority over its real photos.
          Before that, this picker (Global Image System — Add Product
          upload) is the primary workflow: real files, uploaded right after
          creation — replaces the old manual "Image URL" text field +
          icon-illustration picker, which this form no longer renders. */}
      {!productId ? <NewProductImagePicker value={staged} onChange={setStaged} disabled={submitting} /> : null}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              {uploadingImages ? t.imageGallery.uploadingLabel : t.adminForm.saving}
            </>
          ) : (
            t.adminForm.save
          )}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/products">{t.adminForm.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
