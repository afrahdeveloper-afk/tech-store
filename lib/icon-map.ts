import {
  Camera,
  Cpu,
  HardDrive,
  Keyboard,
  Laptop,
  Monitor,
  Printer,
  Server,
  Settings2,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolves the `icon` string on `Category`/`ServiceCategory` mock data
 * (see `lib/mock/categories.ts`, `lib/mock/services.ts`) to an actual
 * `lucide-react` component. Mock data stores icon names as plain strings
 * so it stays serializable JSON-shaped data rather than importing
 * components — this is the one place that bridges the two.
 */
export const iconMap: Record<string, LucideIcon> = {
  Laptop,
  Cpu,
  Monitor,
  HardDrive,
  Wifi,
  Keyboard,
  Printer,
  Settings2,
  Camera,
  Server,
};
