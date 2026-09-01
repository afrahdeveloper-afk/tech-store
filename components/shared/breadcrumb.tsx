import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Shared breadcrumb trail — same markup/behavior `product-detail-view.tsx`
 * inlines for `/products/[id]`, factored out here because Services needs it
 * in more than one place (category drill-down, service details) with a
 * variable number of segments. `rtl:rotate-180` on the separator keeps it
 * correct in Arabic without any extra logic.
 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="m-0 flex flex-wrap list-none items-center gap-1.5 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /> : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
