import type { Product } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { ProductCard } from "@/components/products/product-card";

/**
 * `priorityFirst` (perf audit P1-3, default `false`): this grid is reused
 * for two very different positions on the page — the main `/products`
 * listing (near the top, its first card plausibly the LCP element) and
 * "Related products" on `/products/[id]` (near the bottom, well below the
 * fold). Only the caller knows which one it is, so only the caller opts in.
 */
export function ProductsGrid({
  products,
  lang,
  t,
  priorityFirst = false,
}: {
  products: Product[];
  lang: Lang;
  t: Dictionary;
  priorityFirst?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} lang={lang} t={t} priority={priorityFirst && index === 0} />
      ))}
    </div>
  );
}
