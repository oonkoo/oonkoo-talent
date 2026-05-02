import { db } from "@/lib/db";

// Slugs that would collide with top-level routes or static files.
// Keep this in sync with app/ directory routes.
export const RESERVED_SLUGS = new Set([
  "api",
  "auth",
  "dashboard",
  "onboard",
  "admin",
  "login",
  "logout",
  "signup",
  "contact",
  "leads",
  "settings",
  "billing",
  "account",
  "profile",
  "_next",
  "static",
  "public",
]);

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slugify a name and append -2, -3, ... until the result is unique against
 * Company.slug AND not in the reserved list. Used at Lead → Company
 * conversion time.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  if (!base) {
    throw new Error("Cannot generate slug from empty name");
  }

  let candidate = base;
  let suffix = 1;

  while (
    RESERVED_SLUGS.has(candidate) ||
    (await db.company.findUnique({ where: { slug: candidate }, select: { id: true } }))
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
