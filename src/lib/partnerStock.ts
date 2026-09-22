// Decides which ophthalmology products are sold, from the partner's current
// list in src/content/partnerStock.ts. A product is sold when it belongs to
// an ophthalmology category and matches no entry of that list.
import { PARTNER_STOCK } from "@/content/partnerStock";
import { NON_OPHTHALMOLOGY_CATEGORY_SLUGS } from "@/lib/specialties";

// Below this the list is taken as not provided yet: see the note in
// src/content/partnerStock.ts.
export const MIN_PARTNER_ENTRIES = 10;

// Words that say what kind of listing it is rather than which model, and so
// cannot tell two units apart.
const GENERIC_WORDS = new Set([
  "refurbished", "used", "new", "system", "unit", "for", "sale", "the", "and", "with",
  "laser", "lasers", "ophthalmic", "equipment", "machine", "device",
]);

/** The distinctive words of a URL, slug or model name. */
function distinctiveWords(entry: string): string[] {
  let text = entry.trim();
  if (/^https?:\/\//i.test(text)) {
    try {
      const path = new URL(text).pathname.replace(/\/+$/, "");
      text = path.slice(path.lastIndexOf("/") + 1);
    } catch {
      // Not a valid URL after all; match on the text as typed.
    }
  }
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word && !GENERIC_WORDS.has(word));
  return [...new Set(words)];
}

const PARTNER_ENTRIES = PARTNER_STOCK.map(distinctiveWords).filter((words) => words.length > 0);

/** Whether the weekly list has been provided (see MIN_PARTNER_ENTRIES). */
export const partnerListLoaded = PARTNER_ENTRIES.length >= MIN_PARTNER_ENTRIES;

/**
 * Whether a product slug matches an entry of the partner list: the
 * distinctive words of one are all contained in the other (listings often add
 * or drop a word such as "excimer" or the brand), sharing at least two words,
 * or one for a one-word product, so an entry naming only a brand cannot claim
 * every product of that brand.
 */
function inPartnerList(productSlug: string): boolean {
  const ours = new Set(distinctiveWords(productSlug));
  if (ours.size === 0) return false;
  return PARTNER_ENTRIES.some((entry) => {
    const shared = entry.filter((word) => ours.has(word)).length;
    return shared >= Math.min(2, ours.size) && (shared === ours.size || shared === entry.length);
  });
}

export type PartnerStockStatus = "listed" | "sold" | "unchecked" | "not-applicable";

/**
 * Where a product stands against the partner list: "not-applicable" outside
 * ophthalmology, "unchecked" while no list has been provided, otherwise
 * "listed" or "sold".
 */
export function partnerStockStatus(product: { slug: string; category?: { slug: string } | null }): PartnerStockStatus {
  const categorySlug = product.category?.slug;
  if (!categorySlug || NON_OPHTHALMOLOGY_CATEGORY_SLUGS.includes(categorySlug)) return "not-applicable";
  if (!partnerListLoaded) return "unchecked";
  return inPartnerList(product.slug) ? "listed" : "sold";
}

export const isSold = (product: { slug: string; category?: { slug: string } | null }) =>
  partnerStockStatus(product) === "sold";
