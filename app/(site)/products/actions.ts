"use server";

import { queryProducts, type ProductQuery, type ProductQueryResult } from "@/lib/products-data";

/**
 * Server Action wrapper around `lib/products-data.ts`'s real Prisma query —
 * `ProductsExplorer` (a Client Component) calls this the same way it used to
 * call the mock `fetchProducts` (same name/signature), so Next.js compiles
 * this into an RPC call rather than bundling Prisma/`DATABASE_URL` into
 * client JS (same discipline as `app/checkout/actions.ts`).
 */
export async function fetchProducts(query: ProductQuery): Promise<ProductQueryResult> {
  return queryProducts(query);
}
