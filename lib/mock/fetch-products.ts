import type { Lang } from "@/lib/i18n/translations";
import type { Product } from "@/types";
import { mockCategories } from "@/lib/mock/categories";
import { mockProducts } from "@/lib/mock/products";
import { mockSubcategories } from "@/lib/mock/subcategories";

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

function displayName(product: Product, lang: Lang) {
  return lang === "ar" ? product.nameAr ?? product.name : product.name;
}

function effectivePrice(product: Product) {
  return product.discountPrice ?? product.price;
}

/**
 * Simulates a network-backed product search/filter/sort/paginate endpoint
 * over the mock catalog. Kept as a real async boundary (delay + try/catch)
 * so the `/products` page's loading/error states are genuine now and this
 * function is the one place to swap for a real API call later.
 */
export function fetchProducts(query: ProductQuery): Promise<ProductQueryResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const category = query.categorySlug
          ? mockCategories.find((c) => c.slug === query.categorySlug)
          : undefined;
        const subcategory = query.subcategorySlug
          ? mockSubcategories.find((s) => s.slug === query.subcategorySlug)
          : undefined;
        const search = query.search.trim().toLowerCase();

        let items = mockProducts.filter((product) => {
          if (category && product.categoryId !== category.id) return false;
          if (subcategory && product.subcategoryId !== subcategory.id) return false;
          if (search) {
            const haystack = [product.name, product.nameAr, product.description, product.descriptionAr]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            if (!haystack.includes(search)) return false;
          }
          return true;
        });

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

        resolve({ items: pageItems, total, page, totalPages });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to load products"));
      }
    }, 350);
  });
}
