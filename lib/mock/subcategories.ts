import type { Subcategory } from "@/types";

/**
 * Frontend-only mock data (see "Mock Data" in CLAUDE.md) — typed against
 * `Subcategory`. Powers the `/products` subcategory filter, which is scoped
 * to whichever category is currently selected (see `categoryId`).
 */
export const mockSubcategories: Subcategory[] = [
  { id: "sub-laptops-ultrabooks", slug: "ultrabooks", name: "Ultrabooks", nameAr: "أجهزة ألترابوك", categoryId: "cat-laptops" },
  { id: "sub-laptops-gaming", slug: "gaming-laptops", name: "Gaming Laptops", nameAr: "لابتوبات الألعاب", categoryId: "cat-laptops" },
  { id: "sub-desktops-workstations", slug: "workstations", name: "Workstations", nameAr: "محطات العمل", categoryId: "cat-desktops" },
  { id: "sub-desktops-mini-pcs", slug: "mini-pcs", name: "Mini PCs", nameAr: "أجهزة مصغّرة", categoryId: "cat-desktops" },
  { id: "sub-monitors-qhd", slug: "qhd-monitors", name: "QHD Monitors", nameAr: "شاشات QHD", categoryId: "cat-monitors" },
  { id: "sub-monitors-4k", slug: "4k-monitors", name: "4K Monitors", nameAr: "شاشات 4K", categoryId: "cat-monitors" },
  { id: "sub-storage-ssd", slug: "ssd", name: "SSDs", nameAr: "أقراص SSD", categoryId: "cat-storage" },
  { id: "sub-storage-hdd", slug: "hdd", name: "HDDs & External Drives", nameAr: "أقراص HDD وخارجية", categoryId: "cat-storage" },
  { id: "sub-networking-routers", slug: "routers", name: "Routers", nameAr: "أجهزة راوتر", categoryId: "cat-networking" },
  { id: "sub-networking-switches", slug: "switches", name: "Switches & Access Points", nameAr: "مبدلات ونقاط وصول", categoryId: "cat-networking" },
  { id: "sub-peripherals-keyboards", slug: "keyboards", name: "Keyboards", nameAr: "لوحات مفاتيح", categoryId: "cat-peripherals" },
  { id: "sub-peripherals-mice", slug: "mice", name: "Mice", nameAr: "فأرات", categoryId: "cat-peripherals" },
];
