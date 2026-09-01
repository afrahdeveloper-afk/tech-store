import type { ServiceCategory } from "@/types";

/**
 * Frontend-only mock data (see "Mock Data" in CLAUDE.md) — typed against
 * `ServiceCategory`. `icon` names a `lucide-react` export, resolved by the
 * consuming component (see `components/services/service-card.tsx`).
 */
export const mockServiceCategories: ServiceCategory[] = [
  {
    id: "svc-laptop",
    slug: "laptop-maintenance",
    name: "Laptop Maintenance",
    nameAr: "صيانة أجهزة اللابتوب",
    description: "Screen, battery, keyboard, and performance repairs for all major laptop brands.",
    descriptionAr: "إصلاح الشاشة والبطارية ولوحة المفاتيح وتحسين الأداء لجميع ماركات اللابتوب الرئيسية.",
    icon: "Laptop",
  },
  {
    id: "svc-pc",
    slug: "pc-maintenance",
    name: "PC Maintenance",
    nameAr: "صيانة الأجهزة المكتبية",
    description: "Diagnostics, upgrades, and hardware repair for desktop towers and all-in-ones.",
    descriptionAr: "تشخيص وترقية وإصلاح الأجهزة للحواسيب المكتبية وأجهزة All-in-One.",
    icon: "Cpu",
  },
  {
    id: "svc-printer",
    slug: "printer-maintenance",
    name: "Printer Maintenance",
    nameAr: "صيانة الطابعات",
    description: "Cleaning, calibration, and repair for inkjet, laser, and multifunction printers.",
    descriptionAr: "تنظيف ومعايرة وإصلاح للطابعات النافثة للحبر والليزر والمتعددة الوظائف.",
    icon: "Printer",
  },
  {
    id: "svc-network",
    slug: "network-maintenance",
    name: "Network Maintenance",
    nameAr: "صيانة الشبكات",
    description: "Router setup, Wi-Fi optimization, and structured cabling for home and office.",
    descriptionAr: "إعداد الراوتر وتحسين الواي فاي وتمديد الكابلات المنظمة للمنزل والمكتب.",
    icon: "Wifi",
  },
  {
    id: "svc-software",
    slug: "software-and-os",
    name: "Software & OS",
    nameAr: "البرمجيات وأنظمة التشغيل",
    description: "OS installation, driver updates, virus removal, and performance tuning.",
    descriptionAr: "تثبيت نظام التشغيل وتحديث التعريفات وإزالة الفيروسات وضبط الأداء.",
    icon: "Settings2",
  },
  {
    id: "svc-data-recovery",
    slug: "data-recovery",
    name: "Data Recovery",
    nameAr: "استرجاع البيانات",
    description: "Safe recovery of lost or corrupted files from drives, SSDs, and memory cards.",
    descriptionAr: "استرجاع آمن للملفات المفقودة أو التالفة من الأقراص وبطاقات الذاكرة.",
    icon: "HardDrive",
  },
  {
    id: "svc-cameras",
    slug: "cameras-and-security",
    name: "Cameras & Security Systems",
    nameAr: "كاميرات وأنظمة المراقبة",
    description: "Installation and maintenance of CCTV, smart cameras, and access systems.",
    descriptionAr: "تركيب وصيانة كاميرات المراقبة والكاميرات الذكية وأنظمة الدخول.",
    icon: "Camera",
  },
  {
    id: "svc-server",
    slug: "server-services",
    name: "Server Services",
    nameAr: "خدمات السيرفرات",
    description: "Setup, maintenance, and troubleshooting for small business servers and NAS.",
    descriptionAr: "إعداد وصيانة وإصلاح سيرفرات الشركات الصغيرة وأجهزة NAS.",
    icon: "Server",
  },
];
