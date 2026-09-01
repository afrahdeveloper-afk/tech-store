import type { Product } from "@/types";
import type { Dictionary, Lang } from "@/lib/i18n/translations";
import { ProductCard } from "@/components/products/product-card";

export function ProductsGrid({ products, lang, t }: { products: Product[]; lang: Lang; t: Dictionary }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} lang={lang} t={t} />
      ))}
    </div>
  );
}
