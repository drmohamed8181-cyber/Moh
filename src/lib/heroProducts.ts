// Products an admin has put on the homepage hero, stored in order as a JSON
// array of product ids under one SiteSetting key. A setting rather than a new
// column so no database migration is needed.
export const HERO_PRODUCTS_KEY = "heroProductIds";

export function parseHeroProductIds(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
