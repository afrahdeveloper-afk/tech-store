/**
 * Shared Admin page-size constant, factored out of `lib/admin-data.ts` so it
 * can be imported from a Client Component. `lib/admin-data.ts` is
 * server-only (imports `lib/db.ts` → `pg`/`@prisma/adapter-pg`) and its own
 * doc comment says never to import it from a Client Component — a runtime
 * (non-`import type`) import of anything from it, even one constant, pulls
 * the whole module (and `pg`) into the client bundle and breaks the build
 * ("Module not found: Can't resolve 'util/types'"), confirmed via a real
 * `next build` when `components/admin/customers/customer-detail-view.tsx`
 * first imported `ADMIN_PAGE_SIZE` directly from there. Same fix pattern as
 * `lib/product-limits.ts`. `lib/admin-data.ts` re-exports this value so
 * every existing server-side `queryAdminX` call site is unaffected.
 */
export const ADMIN_PAGE_SIZE = 20;
