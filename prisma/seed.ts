/**
 * Database seed — populates Categories, Subcategories, Products,
 * ServiceCategories, Subservices, and Services (see CLAUDE.md "Mock Data" /
 * the approved database design). Run via `npx prisma db seed`.
 *
 * All of it is sourced directly from the frontend mock data (`lib/mock/*.ts`)
 * so the two stay in sync and the same ids can be reused as stable primary
 * keys (idempotent re-runs via upsert). Subservice/Service data used to be
 * hand-authored here directly (Phase 5 hadn't built the frontend mock data
 * yet); Phase 5 extracted it into `lib/mock/subservices.ts` /
 * `lib/mock/service-items.ts` so there's one Service domain model, not two.
 */
import "dotenv/config";
import { prisma } from "../lib/db";
import { mockCategories } from "../lib/mock/categories";
import { mockSubcategories } from "../lib/mock/subcategories";
import { mockProducts } from "../lib/mock/products";
import { mockServiceCategories } from "../lib/mock/services";
import { mockSubservices } from "../lib/mock/subservices";
import { mockServiceItems } from "../lib/mock/service-items";
import type { StockState } from "../types";

// `lib/mock/products.ts` prices used to be legacy SAR-scale numbers,
// converted to IQD only here at seed time via a `SAR_TO_IQD_RATE` (350,
// rounded to the nearest 1,000). That conversion has since been applied
// directly to the mock data (see the currency-consistency note at the top
// of that file) so the frontend and the database agree on one real IQD
// value per product — `seedProducts()` below now inserts `product.price`/
// `product.discountPrice` as-is, no conversion. Kept as a comment (not
// dead code) purely as a record of the original rate, in case a future
// price needs to be reverse-checked against it: 1 legacy unit ≈ 350 IQD.

const STOCK_STATUS_MAP: Record<StockState, "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"> = {
  "in-stock": "IN_STOCK",
  "low-stock": "LOW_STOCK",
  "out-of-stock": "OUT_OF_STOCK",
};

// Mock data has no real inventory count — derive a plausible one from the
// existing stockState so `stockQuantity` isn't left meaninglessly at 0.
const STOCK_QUANTITY_MAP: Record<StockState, number> = {
  "in-stock": 25,
  "low-stock": 4,
  "out-of-stock": 0,
};

async function seedCategories() {
  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        slug: category.slug,
        name: category.name,
        nameAr: category.nameAr,
        image: category.image,
        icon: category.icon,
      },
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        nameAr: category.nameAr,
        image: category.image,
        icon: category.icon,
      },
    });
  }
  console.log(`Seeded ${mockCategories.length} categories`);
}

async function seedSubcategories() {
  for (const subcategory of mockSubcategories) {
    await prisma.subcategory.upsert({
      where: { id: subcategory.id },
      update: {
        slug: subcategory.slug,
        name: subcategory.name,
        nameAr: subcategory.nameAr,
        categoryId: subcategory.categoryId,
      },
      create: {
        id: subcategory.id,
        slug: subcategory.slug,
        name: subcategory.name,
        nameAr: subcategory.nameAr,
        categoryId: subcategory.categoryId,
      },
    });
  }
  console.log(`Seeded ${mockSubcategories.length} subcategories`);
}

async function seedProducts() {
  for (const product of mockProducts) {
    const price = product.price;
    const discountPrice = product.discountPrice ?? null;

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        descriptionAr: product.descriptionAr,
        highlights: product.highlights ?? [],
        highlightsAr: product.highlightsAr ?? [],
        price,
        discountPrice,
        currency: "IQD",
        stockQuantity: STOCK_QUANTITY_MAP[product.stockState],
        stockStatus: STOCK_STATUS_MAP[product.stockState],
        status: "ACTIVE",
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        descriptionAr: product.descriptionAr,
        highlights: product.highlights ?? [],
        highlightsAr: product.highlightsAr ?? [],
        price,
        discountPrice,
        currency: "IQD",
        stockQuantity: STOCK_QUANTITY_MAP[product.stockState],
        stockStatus: STOCK_STATUS_MAP[product.stockState],
        status: "ACTIVE",
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
      },
    });

    await prisma.productImage.upsert({
      where: { id: `${product.id}-img-primary` },
      update: {
        url: product.image,
        altText: product.name,
        altTextAr: product.nameAr,
        isPrimary: true,
        sortOrder: 0,
        productId: product.id,
      },
      create: {
        id: `${product.id}-img-primary`,
        url: product.image,
        altText: product.name,
        altTextAr: product.nameAr,
        isPrimary: true,
        sortOrder: 0,
        productId: product.id,
      },
    });
  }
  console.log(`Seeded ${mockProducts.length} products (+ primary images)`);
}

async function seedServiceCategories() {
  for (const serviceCategory of mockServiceCategories) {
    await prisma.serviceCategory.upsert({
      where: { id: serviceCategory.id },
      update: {
        slug: serviceCategory.slug,
        name: serviceCategory.name,
        nameAr: serviceCategory.nameAr,
        description: serviceCategory.description,
        descriptionAr: serviceCategory.descriptionAr,
        icon: serviceCategory.icon,
      },
      create: {
        id: serviceCategory.id,
        slug: serviceCategory.slug,
        name: serviceCategory.name,
        nameAr: serviceCategory.nameAr,
        description: serviceCategory.description,
        descriptionAr: serviceCategory.descriptionAr,
        icon: serviceCategory.icon,
      },
    });
  }
  console.log(`Seeded ${mockServiceCategories.length} service categories`);
}

async function seedSubservicesAndServices() {
  let serviceCount = 0;
  for (const subservice of mockSubservices) {
    await prisma.subservice.upsert({
      where: { id: subservice.id },
      update: {
        slug: subservice.slug,
        name: subservice.name,
        nameAr: subservice.nameAr,
        serviceCategoryId: subservice.serviceCategoryId,
      },
      create: {
        id: subservice.id,
        slug: subservice.slug,
        name: subservice.name,
        nameAr: subservice.nameAr,
        serviceCategoryId: subservice.serviceCategoryId,
      },
    });

    const services = mockServiceItems.filter((item) => item.subserviceId === subservice.id);
    for (const service of services) {
      await prisma.service.upsert({
        where: { id: service.id },
        update: {
          slug: service.slug,
          name: service.name,
          nameAr: service.nameAr,
          description: service.description,
          descriptionAr: service.descriptionAr,
          price: service.price,
          currency: service.currency,
          durationMinutes: service.durationMinutes,
          status: service.available ? "ACTIVE" : "INACTIVE",
          subserviceId: subservice.id,
        },
        create: {
          id: service.id,
          slug: service.slug,
          name: service.name,
          nameAr: service.nameAr,
          description: service.description,
          descriptionAr: service.descriptionAr,
          price: service.price,
          currency: service.currency,
          durationMinutes: service.durationMinutes,
          status: service.available ? "ACTIVE" : "INACTIVE",
          subserviceId: subservice.id,
        },
      });
      serviceCount += 1;
    }
  }
  console.log(`Seeded ${mockSubservices.length} subservices and ${serviceCount} services`);
}

async function main() {
  await seedCategories();
  await seedSubcategories();
  await seedProducts();
  await seedServiceCategories();
  await seedSubservicesAndServices();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
