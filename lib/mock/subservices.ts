import type { Subservice } from "@/types";

/**
 * Frontend-only mock data (see "Mock Data" in CLAUDE.md) — typed against
 * `Subservice`, the grouping node between `ServiceCategory` and the bookable
 * `Service` leaf (see "Services" hierarchy in CLAUDE.md and `types/index.ts`).
 * Sourced from the same data `prisma/seed.ts` seeds into the database, so the
 * frontend and DB stay in sync — see `lib/mock/service-items.ts` for the
 * bookable services under each of these.
 */
export const mockSubservices: Subservice[] = [
  {
    id: "subsvc-laptop-boot-power",
    slug: "boot-power-issues",
    name: "Boot / Power Issues",
    nameAr: "مشاكل التشغيل والطاقة",
    serviceCategoryId: "svc-laptop",
  },
  {
    id: "subsvc-laptop-slowness-overheating",
    slug: "slowness-overheating",
    name: "Slowness & Overheating",
    nameAr: "البطء وارتفاع الحرارة",
    serviceCategoryId: "svc-laptop",
  },
  {
    id: "subsvc-laptop-screen-keyboard",
    slug: "screen-keyboard-repair",
    name: "Screen & Keyboard",
    nameAr: "إصلاح الشاشة ولوحة المفاتيح",
    serviceCategoryId: "svc-laptop",
  },
  {
    id: "subsvc-laptop-battery-charger",
    slug: "battery-charger-service",
    name: "Battery & Charger",
    nameAr: "خدمة البطارية والشاحن",
    serviceCategoryId: "svc-laptop",
  },
  {
    id: "subsvc-laptop-ram-ssd-upgrade",
    slug: "ram-ssd-upgrade",
    name: "RAM & SSD Upgrade",
    nameAr: "ترقية الرام والتخزين",
    serviceCategoryId: "svc-laptop",
  },
  {
    id: "subsvc-pc-hardware-diagnostics",
    slug: "hardware-diagnostics",
    name: "Hardware Diagnostics",
    nameAr: "تشخيص الأعطال",
    serviceCategoryId: "svc-pc",
  },
  {
    id: "subsvc-pc-component-upgrade",
    slug: "component-upgrade",
    name: "Component Upgrade",
    nameAr: "ترقية المكونات",
    serviceCategoryId: "svc-pc",
  },
  {
    id: "subsvc-pc-cooling-dust-cleaning",
    slug: "cooling-dust-cleaning",
    name: "Cooling & Dust Cleaning",
    nameAr: "التبريد وتنظيف الغبار",
    serviceCategoryId: "svc-pc",
  },
  {
    id: "subsvc-printer-cleaning-calibration",
    slug: "cleaning-calibration",
    name: "Cleaning & Calibration",
    nameAr: "التنظيف والمعايرة",
    serviceCategoryId: "svc-printer",
  },
  {
    id: "subsvc-printer-cartridge-toner",
    slug: "cartridge-toner-replacement",
    name: "Cartridge & Toner Replacement",
    nameAr: "استبدال الحبر والتونر",
    serviceCategoryId: "svc-printer",
  },
  {
    id: "subsvc-printer-paper-jam-feed",
    slug: "paper-jam-feed-repair",
    name: "Paper Jam & Feed Repair",
    nameAr: "إصلاح انحشار الورق والتغذية",
    serviceCategoryId: "svc-printer",
  },
  {
    id: "subsvc-network-router-wifi-setup",
    slug: "router-wifi-setup",
    name: "Router & Wi-Fi Setup",
    nameAr: "إعداد الراوتر والواي فاي",
    serviceCategoryId: "svc-network",
  },
  {
    id: "subsvc-network-structured-cabling",
    slug: "structured-cabling",
    name: "Structured Cabling",
    nameAr: "تمديد الكابلات المنظمة",
    serviceCategoryId: "svc-network",
  },
  {
    id: "subsvc-network-troubleshooting",
    slug: "network-troubleshooting",
    name: "Network Troubleshooting",
    nameAr: "إصلاح مشاكل الشبكة",
    serviceCategoryId: "svc-network",
  },
  {
    id: "subsvc-software-os-installation-recovery",
    slug: "os-installation-recovery",
    name: "OS Installation & Recovery",
    nameAr: "تثبيت واسترجاع نظام التشغيل",
    serviceCategoryId: "svc-software",
  },
  {
    id: "subsvc-software-virus-malware-removal",
    slug: "virus-malware-removal",
    name: "Virus & Malware Removal",
    nameAr: "إزالة الفيروسات والبرمجيات الخبيثة",
    serviceCategoryId: "svc-software",
  },
  {
    id: "subsvc-software-driver-performance-tuning",
    slug: "driver-performance-tuning",
    name: "Driver & Performance Tuning",
    nameAr: "تحديث التعريفات وضبط الأداء",
    serviceCategoryId: "svc-software",
  },
  {
    id: "subsvc-data-recovery-hard-drive",
    slug: "hard-drive-recovery",
    name: "Hard Drive Recovery",
    nameAr: "استرجاع بيانات القرص الصلب",
    serviceCategoryId: "svc-data-recovery",
  },
  {
    id: "subsvc-data-recovery-ssd-flash",
    slug: "ssd-flash-recovery",
    name: "SSD & Flash Recovery",
    nameAr: "استرجاع بيانات SSD والفلاش",
    serviceCategoryId: "svc-data-recovery",
  },
  {
    id: "subsvc-data-recovery-deleted-files",
    slug: "deleted-file-recovery",
    name: "Deleted File Recovery",
    nameAr: "استرجاع الملفات المحذوفة",
    serviceCategoryId: "svc-data-recovery",
  },
  {
    id: "subsvc-cameras-cctv-installation",
    slug: "cctv-installation",
    name: "CCTV Installation",
    nameAr: "تركيب كاميرات المراقبة",
    serviceCategoryId: "svc-cameras",
  },
  {
    id: "subsvc-cameras-smart-camera-setup",
    slug: "smart-camera-setup",
    name: "Smart Camera Setup",
    nameAr: "إعداد الكاميرات الذكية",
    serviceCategoryId: "svc-cameras",
  },
  {
    id: "subsvc-cameras-access-control",
    slug: "access-control-systems",
    name: "Access Control Systems",
    nameAr: "أنظمة التحكم بالدخول",
    serviceCategoryId: "svc-cameras",
  },
  {
    id: "subsvc-server-setup-configuration",
    slug: "server-setup-configuration",
    name: "Server Setup & Configuration",
    nameAr: "إعداد وتهيئة السيرفر",
    serviceCategoryId: "svc-server",
  },
  {
    id: "subsvc-server-nas-backup",
    slug: "nas-backup-solutions",
    name: "NAS & Backup Solutions",
    nameAr: "حلول NAS والنسخ الاحتياطي",
    serviceCategoryId: "svc-server",
  },
  {
    id: "subsvc-server-troubleshooting",
    slug: "server-troubleshooting",
    name: "Server Troubleshooting",
    nameAr: "إصلاح أعطال السيرفر",
    serviceCategoryId: "svc-server",
  },
];
