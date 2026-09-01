/**
 * Shared frontend domain types.
 *
 * These describe the shape of data the UI renders — products, services,
 * cart contents — independent of where that data eventually comes from.
 * Per CLAUDE.md this project is frontend-only for now: mock data (typed
 * against these interfaces) stands in until a real backend/API exists.
 * Keep this file free of any fetching/business logic.
 */

export type StockState = "in-stock" | "low-stock" | "out-of-stock";

/**
 * Optional `*Ar` fields above hold the Arabic translation of the field they
 * follow. There is no locale-routing infrastructure yet (see "Main Routes"
 * in CLAUDE.md — no route is locale-prefixed), so the active language is a
 * client-side toggle (`components/providers/language-provider.tsx`); UI
 * copy that isn't domain data lives in `lib/i18n/translations.ts` instead.
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Arabic display name — see the i18n note below `StockState`. */
  nameAr?: string;
  image?: string;
  /** `lucide-react` export name, for categories displayed as icon tiles. */
  icon?: string;
}

export interface Subcategory {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  categoryId: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  /** Short bullet points shown on the product details page (e.g. key specs). */
  highlights?: string[];
  highlightsAr?: string[];
  image: string;
  price: number;
  discountPrice?: number;
  currency: string;
  categoryId: string;
  subcategoryId?: string;
  stockState: StockState;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  icon?: string;
}

/**
 * Grouping node under a `ServiceCategory` (e.g. "RAM & SSD Upgrade" under
 * "Laptop Maintenance") — mirrors the Prisma `Subservice` model. Not
 * bookable/priced itself; see `Service` for the actual bookable leaf below.
 * This used to double as the bookable item (price/duration lived here) —
 * corrected in Phase 5 to match the real 3-level DB hierarchy
 * (`ServiceCategory → Subservice → Service`).
 */
export interface Subservice {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  serviceCategoryId: string;
  description?: string;
  descriptionAr?: string;
}

/**
 * The actual bookable, priced leaf under a `Subservice` (e.g. "8GB RAM
 * Upgrade" under "RAM & SSD Upgrade") — mirrors the Prisma `Service` model.
 * Prices are in IQD (Iraqi dinar), matching the database default.
 */
export interface Service {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency: string;
  durationMinutes: number;
  subserviceId: string;
  /** `lucide-react` export name, for a details-page hero tile when no `image` exists. */
  image?: string;
  /** Mirrors the Prisma `ServiceStatus` enum (`ACTIVE`/`INACTIVE`). */
  available: boolean;
}

/**
 * A line item in the client-side cart (see `components/providers/cart-provider.tsx`).
 * Snapshots the product's display data at add-to-cart time — the same
 * "snapshot" idea `OrderItem`/`Booking` use in `prisma/schema.prisma` —
 * rather than re-reading `lib/mock/products.ts` on every render.
 */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  nameAr?: string;
  image: string;
  /** Unit price at add-to-cart time (the discounted price when one applies). */
  price: number;
  currency: string;
  quantity: number;
  /** Stock state at add-to-cart time — re-validated against current mock data on `/cart` (see `lib/cart.ts`). */
  stockState: StockState;
}

export interface BookingRequest {
  /** References the actual bookable `Service`, not the `Subservice` grouping node. */
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}
