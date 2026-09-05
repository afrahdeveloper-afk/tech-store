"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/providers/language-provider";
import { useDashboardNavLinks } from "@/components/account/use-dashboard-nav-links";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Mobile/tablet (<1024px) dashboard navigation — a horizontal, scrollable
 * strip of real `<Link>`s, not an off-canvas drawer (see the Dashboard
 * phase's Navigation rules).
 *
 * Deliberately NOT built as an ARIA `tablist`, even though `ActivityExplorer`
 * elsewhere in this codebase uses that pattern (roving tabindex + RTL-aware
 * arrow keys) for its All/Products/Services filter: tabs are for switching
 * panels *within one page*, and the ARIA Authoring Practices Guide is
 * explicit that the tabs pattern should not be used for navigating between
 * separate pages — which is exactly what this is (each item is its own
 * route/URL). Plain links keep native Tab order and Enter-to-activate;
 * custom arrow-key roving focus is a tablist-specific affordance, not a
 * general navigation requirement.
 */
export function DashboardMobileNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const links = useDashboardNavLinks();

  return (
    <div className="border-b border-border lg:hidden">
      <Container>
        <nav aria-label={t.dashboardNav.ariaLabel} className="flex gap-1 overflow-x-auto py-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-2 rounded-md border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive && "border-primary text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
