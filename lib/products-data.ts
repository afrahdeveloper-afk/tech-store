import { cache } from "react";
import { unstable_cache } from "next/cache";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { StockStatus } from "@/lib/generated/prisma/enums";
import type { Lang } from "@/lib/i18n/translations";
import type { Category, Product, Subcategory } from "@/types";
import { prisma } from "@/lib/db";
import { MAX_SEARCH_LENGTH } from "@/lib/search-limits";

/**
 * Server-only Prisma data access for the public Products catalog (Phase
 * 12b — migrates `/products`, `/products/[id]`, the homepage's Featured
 * Products, and Categories/Subcategories off `lib/mock/*.ts`). Never import
 * this from a Client Component — same discipline as `lib/db.ts`/
 * `lib/account-data.ts`; the one Client Component that needs a live query
 * (`ProductsExplorer`) goes through the Server Action in
 * `app/(site)/products/actions.ts` instead of importing this module directly.
 *
 * `lib/mock/products.ts`/`categories.ts`/`subcategories.ts` stay in place,
 * untouched — Checkout, Booking, and Cart re-validation still read them (see
 * CLAUDE.md "Current Project Status", Known Issues) until a later phase
 * migrates those too.
 */

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name-asc";

export const PRODUCTS_PAGE_SIZE = 8;

export interface ProductQuery {
  search: string;
  categorySlug: string;
  subcategorySlug: string;
  sort: ProductSort;
  page: number;
  lang: Lang;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

const STOCK_STATUS_TO_STATE: Record<StockStatus, Product["stockState"]> = {
  IN_STOCK: "in-stock",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
};

// Only the fields the storefront actually renders — no `stockQuantity`
// (internal inventory count) or timestamps (see CLAUDE.md "Do not expose
// sensitive database fields to Client Components").
const productSelect = {
  id: true,
  slug: true,
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
  highlights: true,
  highlightsAr: true,
  price: true,
  discountPrice: true,
  currency: true,
  stockStatus: true,
  categoryId: true,
  subcategoryId: true,
  category: { select: { name: true, nameAr: true } },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    description: row.description,
    descriptionAr: row.descriptionAr ?? undefined,
    highlights: row.highlights,
    highlightsAr: row.highlightsAr,
    image: row.images[0]?.url ?? null,
    price: row.price.toNumber(),
    discountPrice: row.discountPrice?.toNumber(),
    currency: row.currency,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId ?? undefined,
    stockState: STOCK_STATUS_TO_STATE[row.stockStatus],
    categoryName: row.category.name,
    categoryNameAr: row.category.nameAr ?? undefined,
  };
}

function displayName(product: Product, lang: Lang) {
  return lang === "ar" ? (product.nameAr ?? product.name) : product.name;
}

function effectivePrice(product: Product) {
  return product.discountPrice ?? product.price;
}

/**
 * Every `Category`, ordered for display (homepage grid, `/products` filter).
 * Cached (perf audit P0-1): there's no admin UI to create/edit/delete a
 * Category at all (see CLAUDE.md's Known Issues — categories are seed-only
 * today), so this data cannot change while the app is running. No
 * `revalidateTag` call site exists anywhere for the same reason — the
 * `revalidate` window is the only invalidation this needs, and it's
 * generous (5 min) precisely because there's nothing in the running app
 * that could make the cached value wrong sooner.
 */
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, nameAr: true, image: true, icon: true },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameAr: row.nameAr ?? undefined,
      image: row.image ?? undefined,
      icon: row.icon ?? undefined,
    }));
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] },
);

/**
 * Every `Subcategory`, ordered — `/products`' filter narrows this client-side
 * by the selected category, same as the old `mockSubcategories` array.
 * Cached for the same reason as `getCategories` above — no admin mutation
 * path exists for this table either.
 */
export const getSubcategories = unstable_cache(
  async (): Promise<Subcategory[]> => {
    const rows = await prisma.subcategory.findMany({
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, nameAr: true, categoryId: true },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameAr: row.nameAr ?? undefined,
      categoryId: row.categoryId,
    }));
  },
  ["subcategories"],
  { revalidate: 300, tags: ["subcategories"] },
);

/**
 * Every `ACTIVE` product, ordered by insertion (`createdAt asc`), matching
 * `mockProducts`' fixed array order. Two call sites share this one query,
 * exported under names that match each's intent:
 *  - `getFeaturedProducts` — the homepage's Featured Products section
 *    (`featured-products.tsx` has never sliced this down to a smaller
 *    curated subset — preserved as-is, not a redesign).
 *  - `getProductsForCartValidation` — `/cart`'s stock/existence revalidation
 *    (Phase 12b.1), replacing `mockProducts` in `findCartItemIssue`. Fetches
 *    the whole catalog rather than just the cart's product ids because the
 *    cart itself is `localStorage`-only (invisible to the server) — the old
 *    mock version cross-checked against the same full array, so this keeps
 *    `/cart` a synchronous render off one server-fetched prop instead of
 *    adding a client-side fetch/loading state (CLAUDE.md "do not redesign
 *    the cart"). The catalog is small (~18 rows), so this one query is not
 *    an efficiency concern.
 */
export async function getAllActiveProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: productSelect,
  });
  return rows.map(toProduct);
}
export const getFeaturedProducts = getAllActiveProducts;
export const getProductsForCartValidation = getAllActiveProducts;

/**
 * `ACTIVE` products matching the given ids, in one query — Checkout's
 * server-side price/availability re-derivation (Phase 12b.1). A requested id
 * that's missing, non-existent, or not `ACTIVE` simply isn't in the
 * returned array; the caller (`app/(site)/checkout/actions.ts`) treats that
 * as `invalid-product`. Never trust a client-supplied price — every field
 * here comes straight from this query.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    select: productSelect,
  });
  return rows.map(toProduct);
}

/**
 * A single `ACTIVE` product by slug, or `null` if it doesn't exist (→
 * `notFound()`) — including its full, ordered image gallery (Product Gallery
 * / Global Image System). A per-call `select` (not the shared `productSelect`
 * above) rather than a second query: every other caller of `productSelect`
 * (cards, related products, the paginated `/products` grid) only ever
 * renders one thumbnail, so fetching every image for every card in a grid
 * would be pure waste — only the detail page needs the full set, and
 * nesting it into this one `findFirst` (mirroring `getServiceBySlug`'s
 * already-correct nested-select pattern) gets it in the same round-trip
 * instead of a second one (perf audit P1-2).
 *
 * Wrapped in React's `cache()` (perf audit P1-1): `/products/[id]`'s
 * `generateMetadata` and the page component each call this once per
 * request for the same slug — without memoization that's two identical
 * queries, exactly the duplicate `getCurrentAdmin`/`getCurrentCustomer`
 * already guard against elsewhere in this codebase. Request-scoped only
 * (resets on the next request), so this never serves stale data across
 * requests or users.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const row = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      ...productSelect,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, isPrimary: true },
      },
    },
  });
  if (!row) return null;

  return { ...toProduct(row), images: row.images };
});

/** Up to `limit` other `ACTIVE` products in the same category, in catalog order — for `/products/[id]`'s "Related products". */
export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: excludeProductId } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: productSelect,
  });
  return rows.map(toProduct);
}

/** Every `ACTIVE` product's slug — for `generateStaticParams` and `sitemap.ts`. */
export async function getProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true } });
  return rows.map((row) => row.slug);
}

/**
 * The real search/filter/sort/paginate query behind `/products` — replaces
 * `lib/mock/fetch-products.ts`'s `fetchProducts`. Filtering (search/category/
 * subcategory/status) runs in the database in one query; sort/paginate stay
 * in-memory over that already-narrowed result set, exactly like the mock
 * version did over the full catalog — the catalog is small enough that this
 * is one query total, not a performance concern, and it avoids needing a SQL
 * `COALESCE(discountPrice, price)` expression for price sorting that Prisma's
 * query builder can't express directly.
 */
export async function queryProducts(query: ProductQuery): Promise<ProductQueryResult> {
  const search = query.search.trim().slice(0, MAX_SEARCH_LENGTH);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    ...(query.subcategorySlug ? { subcategory: { slug: query.subcategorySlug } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nameAr: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { descriptionAr: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // `orderBy: createdAt asc` gives "featured" (the no-op sort case below) a
  // deterministic, catalog-order result — matching `mockProducts`' fixed
  // array order, which a Postgres query has no equivalent of on its own.
  const rows = await prisma.product.findMany({ where, orderBy: { createdAt: "asc" }, select: productSelect });
  let items = rows.map(toProduct);

  items = [...items].sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return effectivePrice(a) - effectivePrice(b);
      case "price-desc":
        return effectivePrice(b) - effectivePrice(a);
      case "name-asc":
        return displayName(a, query.lang).localeCompare(displayName(b, query.lang), query.lang);
      case "featured":
      default:
        return 0;
    }
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * PRODUCTS_PAGE_SIZE;
  const pageItems = items.slice(start, start + PRODUCTS_PAGE_SIZE);

  return { items: pageItems, total, page, totalPages };
}
