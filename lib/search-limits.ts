/**
 * Shared search-input length cap (Stage 8 — API & Input Security). Every
 * `contains`-based search filter in this project (`lib/products-data.ts`'s
 * `queryProducts`, every `queryAdminX` in `lib/admin-data.ts`, `adminSearch`)
 * already goes through Prisma's parameterized query builder — never raw SQL
 * — so an unbounded search string was never a SQL-injection risk. It was
 * still unbounded input reaching a database `ILIKE` scan on every keystroke
 * with no server-side ceiling, which is the kind of input this stage's audit
 * is about closing regardless of whether a concrete exploit was demonstrated.
 * Callers `.slice()` the trimmed search term to this length rather than
 * rejecting it outright — a search box has no "invalid" value, only a
 * usefully-bounded one, so silently capping preserves existing behavior for
 * every real search a person would ever type.
 */
export const MAX_SEARCH_LENGTH = 200;
