// Canonical brands.
//
// The manufacturer is free text typed per product, so one company reaches the
// catalogue under several spellings. In the live catalogue today:
//
//   "Alcon"                          "Alcon / Laserex"
//   "Zeiss"                          "Carl Zeiss Meditec"
//   "Johnson & Johnson"              "Johnson & Johnson (Intralase)"
//                                    "AMO / Johnson & Johnson Vision"
//
// Deriving a brand page per distinct spelling gave three companies seven pages
// between them, each holding a fraction of that company's equipment. That is
// the opposite of what a brand page is for: someone searching "zeiss oct for
// sale" should reach one page listing every Zeiss unit in stock, not two pages
// that each look like a near-empty catalogue.
//
// This table folds the spellings onto one brand. It deliberately covers only
// companies that appear under more than one name; anything else keeps its own
// name and a slug derived from it, so adding a new manufacturer in the admin
// needs no change here.

export type CanonicalBrand = { name: string; slug: string };

type BrandRule = CanonicalBrand & {
  /**
   * Matched against the manufacturer reduced to lowercase alphanumerics, so
   * punctuation, casing and spacing are all irrelevant: "Bausch & Lomb",
   * "Bausch + Lomb" and "bausch lomb" all normalise to "bauschlomb". A rule
   * matches when the manufacturer CONTAINS one of these, so keep each one
   * distinctive enough that it cannot appear inside an unrelated company name.
   */
  match: string[];
};

const BRAND_RULES: BrandRule[] = [
  // The company's own name, under the word buyers actually search for. Covers
  // "Zeiss" and "Carl Zeiss Meditec".
  { name: "Carl Zeiss Meditec", slug: "zeiss", match: ["zeiss"] },
  // J&J Vision absorbed both AMO and IntraLase, so their equipment belongs on
  // one page. Those words survive in the product names ("AMO VISX STAR S4 IR",
  // "IntraLase iFS"), so nothing becomes harder to find by merging the pages.
  {
    name: "Johnson & Johnson Vision",
    slug: "johnson-johnson-vision",
    match: ["johnsonjohnson", "jjvision"],
  },
  // Covers "Alcon" and "Alcon / Laserex".
  { name: "Alcon", slug: "alcon", match: ["alcon"] },
  // Both spellings already collapse to one slug; this pins which name is shown
  // rather than leaving it to whichever product the database returns first.
  { name: "Bausch + Lomb", slug: "bausch-lomb", match: ["bauschlomb"] },
];

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The rule matching `text`, or undefined. Only consults the table above. */
function matchRule(text: string): BrandRule | undefined {
  const key = normalise(text);
  if (!key) return undefined;
  return BRAND_RULES.find((candidate) => candidate.match.some((needle) => key.includes(needle)));
}

/**
 * The canonical brand for a manufacturer string, or null when the string is
 * empty or has no letters or digits at all. Manufacturers with no rule keep
 * their own name and a slug derived from it.
 */
export function canonicalBrand(manufacturer: string | null | undefined): CanonicalBrand | null {
  const name = manufacturer?.trim();
  if (!name) return null;
  const key = normalise(name);
  if (!key) return null;

  const rule = matchRule(name);
  if (rule) return { name: rule.name, slug: rule.slug };

  // Not slugify() from lib/utils: that strips "+" and "&" but leaves the
  // surrounding spaces to become separate hyphens, so "Bausch + Lomb" would
  // give "bausch-lomb" only by luck of the double-hyphen collapse. Going
  // through the same normalisation the rules use keeps the two consistent.
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? { name, slug } : null;
}

/**
 * The brand a product belongs to.
 *
 * Prefers the manufacturer field. When that is blank — two Zeiss OCT units in
 * the live catalogue have no manufacturer set, which kept them off every brand
 * page — falls back to reading a known company out of the product name, so
 * "Zeiss Cirrus OCT 5000" still reaches the Zeiss page.
 *
 * The fallback deliberately consults only the table above rather than treating
 * the first word of any name as a brand: that would invent a brand page from
 * whatever a product happens to be called. A product with no manufacturer and
 * no recognised company in its name simply has no brand, exactly as before.
 */
export function productBrand(product: { manufacturer?: string | null; name: string }): CanonicalBrand | null {
  const fromField = canonicalBrand(product.manufacturer);
  if (fromField) return fromField;

  const rule = matchRule(product.name);
  return rule ? { name: rule.name, slug: rule.slug } : null;
}
