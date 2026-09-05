import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { getProductsForCartValidation } from "@/lib/products-data";

export const metadata: Metadata = {
  title: "Cart — Speed Core",
  description: "Review the items in your cart before checkout.",
};

/**
 * `CartView` is a Client Component (cart contents only exist in
 * `localStorage` — see `cart-provider.tsx`), so it can't call Prisma
 * itself. The catalog it revalidates cart items against is fetched here,
 * server-side (real Prisma query, Phase 12b.1), and passed down as a prop —
 * see `getProductsForCartValidation`'s doc comment in `lib/products-data.ts`
 * for why this stays one full up-front fetch instead of a client-side fetch
 * keyed to the cart's specific product ids.
 */
export default async function CartPage() {
  const products = await getProductsForCartValidation();
  return <CartView products={products} />;
}
