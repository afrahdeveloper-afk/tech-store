-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Speed Core',
    "storeNameAr" TEXT,
    "contactEmail" TEXT NOT NULL DEFAULT 'support@speedcore.example',
    "contactPhone" TEXT NOT NULL DEFAULT '+966 11 234 5678',
    "contactAddress" TEXT,
    "contactAddressAr" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
