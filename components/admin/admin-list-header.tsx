import Link from "next/link";
import { Info, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Shared heading block for every Admin section index page (Products,
 * Service Categories, Subservices, Services, Orders, Bookings, Customers) —
 * heading/description/count are the one structurally identical piece across
 * all seven; each page still owns its own table, since the columns differ.
 * `addNew` is optional — only the four CRUD-complete modules (Products,
 * Service Categories, Subservices, Services) pass it; Orders/Bookings/
 * Customers have no "create" flow (see each module's own Server Actions for
 * why). Plain Server Component — takes already-resolved strings, same
 * reasoning as `KpiCard`.
 */
export function AdminListHeader({
  heading,
  description,
  count,
  addNew,
}: {
  heading: string;
  description: string;
  count: string;
  addNew?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3 p-4 pb-0 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-0 lg:p-8 lg:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{heading}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs font-medium text-muted-foreground">{count}</p>
      </div>
      {addNew ? (
        <Button asChild size="lg" className="w-full justify-center sm:w-auto sm:shrink-0">
          <Link href={addNew.href}>
            <Plus className="size-4" aria-hidden="true" />
            {addNew.label}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Honest "this section is read-only for now" notice — every list page
 * currently shows live database data with no Add/Edit/Delete forms yet (see
 * CLAUDE.md's Admin Dashboard status notes). Shown once per page rather than
 * disabling/hiding action buttons that don't exist yet.
 */
export function CrudComingSoonBanner({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-4 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:mx-6 lg:mx-8">
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
