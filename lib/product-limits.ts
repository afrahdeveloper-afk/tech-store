/**
 * `Product.price`/`discountPrice` are `Decimal(10, 2)` in `prisma/schema.prisma`
 * — 8 digits before the decimal point, 2 after. Shared (not defined in
 * `app/admin/(dashboard)/products/actions.ts`) because that file has
 * `"use server"` at the top, and a Server Actions file may only export
 * async functions — a plain constant export there breaks every Client
 * Component that imports from it (confirmed via `next build`).
 */
export const MAX_PRODUCT_PRICE = 99_999_999.99;

/** Admin Product Image Manager / Add Product image upload (Global Image System) — a sane per-product gallery ceiling, same "shared constant" reasoning as `MAX_PRODUCT_PRICE` above (both the Edit-mode manager and the Add-mode picker need this, to disable "Add photos" once full). Was 8; raised to 10 per the explicit "maximum 10 images" spec. */
export const MAX_PRODUCT_IMAGES = 10;
