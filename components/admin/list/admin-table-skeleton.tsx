/**
 * Generic loading placeholder for an Admin list route (`loading.tsx`'s
 * default export renders this while the server re-fetches after a URL
 * change — no client fetch/loading-state machine needed, see
 * `lib/hooks/use-admin-list-params.ts`'s header comment). Shape mirrors the
 * toolbar + table every admin list already renders, so there's no layout
 * jump when real content swaps in. Plain Server Component — no translated
 * text, just pulsing placeholders.
 */
export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 pb-8" role="status" aria-busy="true">
      <div className="flex flex-col gap-3 p-4 pb-0 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-0 lg:p-8 lg:pb-0">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-9 w-32 shrink-0 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="flex flex-wrap gap-2 px-4 sm:px-6 lg:px-8">
        <div className="h-9 w-full max-w-xs animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
              <div className="h-4 w-1/4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-1/5 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-1/6 animate-pulse rounded-full bg-muted" />
              <div className="ms-auto h-4 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
