"use client";

import * as React from "react";
import {
  BatteryCharging,
  Briefcase,
  Camera,
  Cctv,
  Check,
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Printer,
  Router,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/typography";
import { useLanguage } from "@/components/providers/language-provider";

export type ProductIconValue =
  | "laptop"
  | "desktop"
  | "monitor"
  | "smartphone"
  | "headphones"
  | "accessories"
  | "camera"
  | "keyboard"
  | "mouse"
  | "printer"
  | "network"
  | "server"
  | "harddrive"
  | "ups"
  | "bagscases"
  | "security";

const PRODUCT_ICON_OPTIONS: { value: ProductIconValue; icon: LucideIcon }[] = [
  { value: "laptop", icon: Laptop },
  { value: "desktop", icon: Cpu },
  { value: "monitor", icon: Monitor },
  { value: "smartphone", icon: Smartphone },
  { value: "headphones", icon: Headphones },
  { value: "accessories", icon: Package },
  { value: "camera", icon: Camera },
  { value: "keyboard", icon: Keyboard },
  { value: "mouse", icon: Mouse },
  { value: "printer", icon: Printer },
  { value: "network", icon: Router },
  { value: "server", icon: Server },
  { value: "harddrive", icon: HardDrive },
  { value: "ups", icon: BatteryCharging },
  { value: "bagscases", icon: Briefcase },
  { value: "security", icon: Cctv },
];

/**
 * Each icon's matching illustration under `public/images/products/` — same
 * dot-grid/corner-bracket/neutral-silhouette style as the homepage/product
 * illustrations (see CLAUDE.md's "Concept"). `laptop`/`desktop`/`monitor`/
 * `keyboard` reuse the illustrations that already existed; `network` reuses
 * `router.svg` (the existing Wi-Fi/router illustration — matches the
 * `Router` lucide icon used for this option above); `smartphone`/
 * `headphones`/`accessories`/`camera`/`mouse`/`printer`/`server`/
 * `harddrive`/`ups`/`bagscases`/`security` are new, generated to match.
 * The Admin Product form (`ProductForm`) uses this to
 * auto-fill the real `imageUrl` field when an icon is picked — there is
 * still no separate `Product.icon` column; this is the existing
 * `ProductImage.url` string, same as if the admin had typed the path in
 * themselves.
 */
export const PRODUCT_ICON_IMAGE_MAP: Record<ProductIconValue, string> = {
  laptop: "/images/products/laptop.svg",
  desktop: "/images/products/desktop.svg",
  monitor: "/images/products/monitor.svg",
  smartphone: "/images/products/smartphone.svg",
  headphones: "/images/products/headphones.svg",
  accessories: "/images/products/accessories.svg",
  camera: "/images/products/camera.svg",
  keyboard: "/images/products/keyboard.svg",
  mouse: "/images/products/mouse.svg",
  printer: "/images/products/printer.svg",
  network: "/images/products/router.svg",
  server: "/images/products/server.svg",
  harddrive: "/images/products/harddrive.svg",
  ups: "/images/products/ups.svg",
  bagscases: "/images/products/bagscases.svg",
  security: "/images/products/security.svg",
};

/**
 * Product-type icon picker for the Admin Product form. There is still no
 * `Product.icon` column anywhere in the schema — this component only ever
 * emits a `ProductIconValue` via `value`/`onChange`; it never talks to the
 * Server Action or the database itself. `ProductForm` is the one that
 * decides what to do with the choice: it looks the value up in
 * `PRODUCT_ICON_IMAGE_MAP` and writes that path into the existing
 * `imageUrl` field (only when that field is still empty or still holds a
 * path this map produced — a manually entered image URL is never
 * overwritten), so the selection is persisted through the image pipeline
 * that already exists rather than a new one.
 *
 * Implements the WAI-ARIA "radio group" pattern (single choice, roving
 * tabindex, arrow-key navigation) rather than a plain button row, since
 * exactly one of many icons is always selected/selectable — the same
 * semantics as a native radio group.
 */
export function ProductIconSelector({
  value,
  onChange,
}: {
  value: ProductIconValue | null;
  onChange: (value: ProductIconValue) => void;
}) {
  const { t, dir } = useLanguage();
  const groupRef = React.useRef<HTMLDivElement>(null);

  function focusAndSelect(index: number) {
    const options = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    const option = options?.[index];
    if (!option) return;
    option.focus();
    onChange(PRODUCT_ICON_OPTIONS[index].value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = PRODUCT_ICON_OPTIONS.length;
    const isRtl = dir === "rtl";
    let next: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        next = index + (isRtl ? -1 : 1);
        break;
      case "ArrowLeft":
        next = index + (isRtl ? 1 : -1);
        break;
      case "ArrowDown":
        next = index + 1;
        break;
      case "ArrowUp":
        next = index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusAndSelect((next + count) % count);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label id="product-icon-selector-label">{t.adminForm.productIconLabel}</Label>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby="product-icon-selector-label"
        className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12"
      >
        {PRODUCT_ICON_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const selected = value === option.value;
          const canTab = value === null ? index === 0 : selected;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t.adminForm.productIconOptions[option.value]}
              title={t.adminForm.productIconOptions[option.value]}
              tabIndex={canTab ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "group/icon-tile relative flex aspect-square items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.95]",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {selected ? (
                <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-150">
                  <Check className="size-2.5" aria-hidden="true" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t.adminForm.productIconHint}</p>
    </div>
  );
}
