/**
 * Pure slug formatting, shared by every Admin CRUD module's create action
 * (Products, Service Categories, Subservices, Services) — each module still
 * owns its own uniqueness-check loop against its own table (the query is
 * necessarily model-specific), but the string transform itself is one
 * function instead of four copies.
 */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}
