// Cached readers for the public shop pages.
//
// Why this exists: the shop layout and the product detail page used to be
// `force-dynamic`, so every visit — including every Googlebot crawl — ran the
// underlying queries again. Google throttles how much it crawls a site partly
// on how fast the server answers, which left most product pages sitting in
// "Discovered - currently not indexed". Caching these reads lets the pages be
// served from the ISR cache instead of the database.
//
// Freshness is handled by on-demand invalidation rather than a short TTL: the
// product write routes call revalidateTag(PRODUCTS_TAG, { expire: 0 }) and the
// settings route calls revalidateTag(SITE_SETTINGS_TAG, { expire: 0 }), so admin
// edits still show up right away. The one-hour revalidate below is only a
// backstop for changes that bypass those routes (a direct DB edit, say).
//
// The `{ expire: 0 }` argument matters and must not be changed to "max".
// Per node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md,
// profile="max" only marks the tag STALE, so the next visitor is served the old
// page while a fresh one renders in the background. For an admin un-publishing a
// retail price that is a leak: the stale page still shows the price, and still
// carries it in the Product JSON-LD, to whoever arrives next — possibly Googlebot.
// { expire: 0 } expires the entry outright, making the next request a blocking
// revalidate. (updateTag would be the other option but throws outside a Server
// Action, and these are Route Handlers.)
//
// NOTE: `unstable_cache` is superseded by the `use cache` directive in Next 16,
// but that requires enabling `cacheComponents` project-wide. Until that
// migration happens this is the documented approach — see
// node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { LISTING_PRODUCT_SELECT, withPublicPrice } from "@/lib/productSelect";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { productBrand } from "@/lib/brands";
import { withEditorialContent } from "@/content/productContent";

export const PRODUCTS_TAG = "products";
export const CATEGORIES_TAG = "categories";
export const SITE_SETTINGS_TAG = "site-settings";

const ONE_HOUR = 3600;

// Thrown when the database can't be reached. Deliberately NOT swallowed into a
// null on the product path: a null there means "no such product", which renders
// a 404, and a 404 cached by ISR for an hour would tell Google to drop a page
// that actually exists. Letting this propagate produces a 500 instead, which
// Google treats as "try again later" — and an errored render is not cached.
class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database unavailable");
    this.name = "DatabaseUnavailableError";
  }
}

const getCachedSiteSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    if (!prisma) throw new DatabaseUnavailableError();
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  },
  ["site-settings"],
  { tags: [SITE_SETTINGS_TAG], revalidate: ONE_HOUR }
);

/**
 * Site-wide settings for the header/footer. Falls back to an empty object when
 * the database is unreachable — the chrome has its own defaults, and a missing
 * phone number is not worth failing the whole page over.
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    return await getCachedSiteSettings();
  } catch {
    return {};
  }
}

/**
 * A single public product by slug, or null if no such product exists.
 * Throws if the database is unreachable — see DatabaseUnavailableError.
 *
 * withPublicPrice() is applied INSIDE the cache boundary on purpose. The query
 * uses LISTING_PRODUCT_SELECT, which includes the confidential retailPrice so
 * the helper can decide whether it may be shown. Stripping it after the cache
 * read would mean the raw price is what gets JSON-persisted into the Data Cache
 * on disk, for every product including unpublished ones. Stripping it here means
 * the confidential value never enters the cache at all.
 *
 * withEditorialContent() fills description/features/indications/specifications
 * from src/content/productContent.ts when the database leaves them empty, so a
 * product page always has text of its own. Admin-entered copy always wins; see
 * that file. It runs inside the cache boundary too, so the merge happens once
 * per cache entry rather than on every request.
 *
 * Tagged with CATEGORIES_TAG as well as PRODUCTS_TAG because the payload embeds
 * the whole category row — renaming a category must invalidate these entries.
 */
export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    if (!prisma) throw new DatabaseUnavailableError();
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { ...LISTING_PRODUCT_SELECT, category: true },
    });
    return product ? withEditorialContent(withPublicPrice(product)) : null;
  },
  ["public-product-by-slug"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** Up to four other products in the same category, for the "Related" rail. */
export const getRelatedProducts = unstable_cache(
  async (categoryId: string, excludeProductId: string) => {
    if (!prisma) throw new DatabaseUnavailableError();
    const products = await prisma.product.findMany({
      where: { categoryId, id: { not: excludeProductId }, isAvailable: true },
      orderBy: { isFeatured: "desc" },
      take: 4,
      select: { ...LISTING_PRODUCT_SELECT, category: true },
    });
    return products.map(withPublicPrice);
  },
  ["public-related-products"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** Active, non-hidden categories for the /categories index. */
export const getPublicCategories = unstable_cache(
  async () => {
    if (!prisma) throw new DatabaseUnavailableError();
    return prisma.category.findMany({
      where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } },
      orderBy: { name: "asc" },
    });
  },
  ["public-categories"],
  { tags: [CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** A single category by slug, or null if there is no such category. */
export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    if (!prisma) throw new DatabaseUnavailableError();
    return prisma.category.findUnique({ where: { slug } });
  },
  ["public-category-by-slug"],
  { tags: [CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/**
 * In-stock products belonging to one category, for the category page grid.
 * withPublicPrice() is applied inside the cache boundary — see getProductBySlug.
 */
export const getProductsInCategory = unstable_cache(
  async (slug: string) => {
    if (!prisma) throw new DatabaseUnavailableError();
    const products = await prisma.product.findMany({
      where: { category: { slug }, isAvailable: true },
      orderBy: { isFeatured: "desc" },
      select: { ...LISTING_PRODUCT_SELECT, category: true },
    });
    return products.map(withPublicPrice);
  },
  ["public-products-in-category"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/**
 * Everything the XML sitemap lists, in one cached read.
 *
 * Tagged so the product/category write routes expire it the moment the admin
 * adds something. Before this existed the sitemap was a static route with no
 * revalidate, regenerated only by a deploy — so a product added through the
 * admin stayed absent from the sitemap until the next unrelated push. Eight
 * products were invisible to Google that way.
 *
 * Throws rather than degrading if the database is unreachable. A sitemap that
 * silently lists only the static routes is worse than no response at all: it
 * would be cached, and it tells Google the catalogue no longer exists.
 */
export const getSitemapEntries = unstable_cache(
  async () => {
    if (!prisma) throw new DatabaseUnavailableError();
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.product.findMany({
        where: { isAvailable: true, category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
        select: { slug: true, updatedAt: true, images: true },
      }),
    ]);
    return { categories, products };
  },
  ["sitemap-entries"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** Slugs of every publicly visible category, for generateStaticParams. */
export async function getPublicCategorySlugs(): Promise<string[]> {
  try {
    if (!prisma) return [];
    const categories = await prisma.category.findMany({
      where: { isActive: true, slug: { notIn: HIDDEN_CATEGORY_SLUGS } },
      select: { slug: true },
    });
    return categories.map((category) => category.slug);
  } catch {
    return [];
  }
}

/**
 * Slugs of every publicly visible product, for generateStaticParams.
 *
 * Returns [] rather than throwing when the database is unreachable: this runs
 * during `next build`, and a build that fails because the database happened to
 * be asleep is worse than a build that prerenders nothing. With dynamicParams
 * left at its default of true, any slug not listed here is still rendered on
 * first request and cached from then on.
 */
export async function getPublicProductSlugs(): Promise<string[]> {
  try {
    if (!prisma) return [];
    const products = await prisma.product.findMany({
      where: { category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
      select: { slug: true },
    });
    return products.map((product) => product.slug);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Brands
//
// There is no Brand table: the manufacturer is a free-text field on Product.
// The brand pages are derived from it so that "Alcon", "Zeiss", "Ellex" each
// get one crawlable, intent-matching landing page without a schema change.
//
// Every spelling of a company folds onto one page, and which page that is comes
// from canonicalBrand() in src/lib/brands.ts rather than from the spelling that
// happens to be read first.
// ---------------------------------------------------------------------------

export type PublicBrand = { name: string; slug: string; productCount: number };

const publicProductWhere = {
  isAvailable: true,
  category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } },
} as const;

/**
 * Brands with at least one visible product, alphabetically.
 *
 * Reads name alongside manufacturer, rather than grouping on manufacturer in
 * the database, because productBrand() needs the name to place a product whose
 * manufacturer field is blank. The visible catalogue is well under a hundred
 * rows, so counting them here costs nothing.
 */
export const getPublicBrands = unstable_cache(
  async (): Promise<PublicBrand[]> => {
    if (!prisma) throw new DatabaseUnavailableError();
    const rows = await prisma.product.findMany({
      where: publicProductWhere,
      select: { name: true, manufacturer: true },
    });
    const bySlug = new Map<string, PublicBrand>();
    for (const row of rows) {
      const brand = productBrand(row);
      if (!brand) continue;
      const existing = bySlug.get(brand.slug);
      if (existing) existing.productCount += 1;
      else bySlug.set(brand.slug, { ...brand, productCount: 1 });
    }
    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
  ["public-brands"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** One brand by slug, or null if no visible product carries that manufacturer. */
export async function getBrandBySlug(slug: string): Promise<PublicBrand | null> {
  const brands = await getPublicBrands();
  return brands.find((brand) => brand.slug === slug) ?? null;
}

/**
 * Visible products belonging to the brand `slug`, featured first. Filtered in
 * memory rather than by `manufacturer = name` because one brand covers several
 * spellings; the visible catalogue is small enough for that.
 * withPublicPrice() is applied inside the cache boundary — see getProductBySlug.
 */
export const getProductsByBrand = unstable_cache(
  async (slug: string) => {
    if (!prisma) throw new DatabaseUnavailableError();
    const products = await prisma.product.findMany({
      where: publicProductWhere,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      select: { ...LISTING_PRODUCT_SELECT, category: { select: { name: true, slug: true } } },
    });
    return products
      .filter((product) => productBrand(product)?.slug === slug)
      .map(withPublicPrice);
  },
  ["public-products-by-brand"],
  { tags: [PRODUCTS_TAG, CATEGORIES_TAG], revalidate: ONE_HOUR }
);

/** Slugs of every brand page, for generateStaticParams. Returns [] if the database is down (see getPublicProductSlugs). */
export async function getPublicBrandSlugs(): Promise<string[]> {
  try {
    const brands = await getPublicBrands();
    return brands.map((brand) => brand.slug);
  } catch {
    return [];
  }
}
