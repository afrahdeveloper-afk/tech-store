-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "path" TEXT;

-- CreateTable
CREATE TABLE "booking_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "booking_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_images_bookingId_idx" ON "booking_images"("bookingId");

-- AddForeignKey
ALTER TABLE "booking_images" ADD CONSTRAINT "booking_images_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
