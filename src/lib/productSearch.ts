export type ProductSuggestion = {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  category: string | null;
};

// Lower rank = better match: names that start with what was typed come first,
// then names with a word starting with it, then any other name/SKU/category
// match. -1 means no match. Shared by the admin search dropdown and the
// server-side table filter so both agree on what "matches" means.
export function productSearchRank(p: Pick<ProductSuggestion, "name" | "sku" | "category">, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = p.name.toLowerCase();
  if (name.startsWith(q)) return 0;
  if (name.split(/[\s\-/()]+/).some((w) => w.startsWith(q))) return 1;
  if (name.includes(q)) return 2;
  if (p.sku.toLowerCase().includes(q)) return 3;
  if (p.category?.toLowerCase().includes(q)) return 4;
  return -1;
}
