import type { Category } from "@/types";

/**
 * Frontend-only mock data (see "Mock Data" in CLAUDE.md) — typed against
 * `Category` so it can be swapped for API data later without touching the
 * components that consume it.
 */
export const mockCategories: Category[] = [
  { id: "cat-laptops", slug: "laptops", name: "Laptops", nameAr: "أجهزة لابتوب", icon: "Laptop" },
  { id: "cat-desktops", slug: "desktops", name: "Desktops & PCs", nameAr: "أجهزة مكتبية", icon: "Cpu" },
  { id: "cat-monitors", slug: "monitors", name: "Monitors & Displays", nameAr: "الشاشات", icon: "Monitor" },
  {
    id: "cat-storage",
    slug: "storage",
    name: "Storage & Components",
    nameAr: "التخزين والمكونات",
    icon: "HardDrive",
  },
  {
    id: "cat-networking",
    slug: "networking",
    name: "Networking",
    nameAr: "معدات الشبكات",
    icon: "Wifi",
  },
  {
    id: "cat-peripherals",
    slug: "peripherals",
    name: "Peripherals & Accessories",
    nameAr: "الملحقات",
    icon: "Keyboard",
  },
];
