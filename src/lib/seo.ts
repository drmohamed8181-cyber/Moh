// Search-facing titles and descriptions for the public catalogue.
//
// Why this exists: the pages used to publish the bare product or category name
// as their <title> ("Alcon Centurion", "OCT"). Nobody searching for equipment
// types that. Buyers type the model plus a purchase intent — "alcon centurion
// for sale", "used zeiss cirrus 5000 price", "ellex tango slt yag" — so the
// titles and descriptions here carry the manufacturer, the intent words and the
// category, while an admin-set seoTitle/seoDesc still wins when present.

export const SITE_URL = "https://www.mpmedpharma.com";
export const SITE_NAME = "MP MedPharma";

/** Google shows roughly this many characters of a title before truncating. */
const TITLE_BUDGET = 60;
/** Same for the snippet: descriptions beyond this are cut mid-sentence. */
const DESCRIPTION_BUDGET = 160;

export function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

/** Cut `text` to at most `max` characters on a word boundary, adding an ellipsis. */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

type SeoProduct = {
  name: string;
  manufacturer?: string | null;
  shortDesc?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  category?: { name: string } | null;
};

/**
 * "Alcon Centurion Vision System" — the product name with the manufacturer in
 * front unless the name already carries it. Brand + model is the phrase people
 * actually search for.
 */
export function productDisplayName(product: Pick<SeoProduct, "name" | "manufacturer">): string {
  const name = product.name.trim();
  const manufacturer = product.manufacturer?.trim();
  if (!manufacturer) return name;
  return name.toLowerCase().includes(manufacturer.toLowerCase()) ? name : `${manufacturer} ${name}`;
}

/** <title> for a product page, without the "| MP MedPharma" template suffix. */
export function productTitle(product: SeoProduct): string {
  if (product.seoTitle?.trim()) return product.seoTitle.trim();
  const base = `${productDisplayName(product)} for Sale`;
  const category = product.category?.name?.trim();
  if (category && `${base} – ${category}`.length <= TITLE_BUDGET) return `${base} – ${category}`;
  return base;
}

/** Meta description for a product page. */
export function productDescription(product: SeoProduct): string {
  if (product.seoDesc?.trim()) return product.seoDesc.trim();
  // Category names keep their casing: "OCT & Imaging" must not become "oct & imaging".
  const category = product.category?.name?.trim();
  const suffix = ` From ${SITE_NAME}, US supplier of new & refurbished ${category ?? "ophthalmic equipment"}. Request pricing or a demo.`;
  const core = product.shortDesc?.trim() || `${productDisplayName(product)}.`;
  // The product's own words come first and are never cut below a readable
  // length; a snippet that runs a little past the budget is better than one
  // that trails off mid-phrase.
  return `${truncate(core, Math.max(90, DESCRIPTION_BUDGET - suffix.length))}${suffix}`;
}

type SeoCategory = { name: string; description?: string | null };

/** <title> for a category page, without the template suffix. */
export function categoryTitle(category: SeoCategory): string {
  return `${category.name.trim()} for Sale – New & Refurbished`;
}

/** Meta description for a category page. */
export function categoryDescription(category: SeoCategory, productCount?: number): string {
  const count = productCount && productCount > 0 ? `Browse ${productCount} ${productCount === 1 ? "unit" : "units"} in stock.` : "";
  if (category.description?.trim()) {
    return truncate(`${category.description.trim()} ${count} Warranty on every unit — request a quote or a private demo.`, DESCRIPTION_BUDGET + 20);
  }
  return truncate(
    `${category.name.trim()} from ${SITE_NAME}: new and certified refurbished units from leading manufacturers, each with warranty. ${count} Request a quote or a private demo.`,
    DESCRIPTION_BUDGET + 20
  );
}

type SeoBrand = { name: string; productCount: number };

/** <title> for a brand page, without the template suffix. */
export function brandTitle(brand: SeoBrand): string {
  return `${brand.name} Equipment for Sale – New & Refurbished`;
}

/** Meta description for a brand page. `categories` are the category names the brand's products fall under. */
export function brandDescription(brand: SeoBrand, categories: string[]): string {
  const what = categories.length > 0 ? categories.slice(0, 4).join(", ") : "ophthalmic equipment";
  return truncate(
    `${brand.name} ${what} for sale at ${SITE_NAME}: ${brand.productCount} new and certified refurbished ${
      brand.productCount === 1 ? "unit" : "units"
    } with warranty, from a US supplier. Request a quote or a private demo.`,
    DESCRIPTION_BUDGET + 20
  );
}
