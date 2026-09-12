// The canonical list of public URLs, shared by the XML sitemap and the
// IndexNow submission so the two cannot drift apart.

import { getPublicBrands, getSitemapEntries } from "@/lib/publicData";
import { GUIDES } from "@/content/guides";
import { SITE_URL } from "@/lib/seo";

/**
 * Fixed pages, with the sitemap's own hints. The sitemap maps these to
 * <changefreq>/<priority>; IndexNow uses only the paths.
 */
export const STATIC_PATHS: {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { path: "/guides", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/sell-your-product", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.3 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

/** Every public URL on the site, absolute. Throws if the database is unreachable. */
export async function getAllPublicUrls(): Promise<string[]> {
  const [{ categories, products }, brands] = await Promise.all([getSitemapEntries(), getPublicBrands()]);

  return [
    ...STATIC_PATHS.map((route) => `${SITE_URL}${route.path}`),
    ...categories.map((category) => `${SITE_URL}/categories/${category.slug}`),
    ...brands.map((brand) => `${SITE_URL}/brands/${brand.slug}`),
    ...GUIDES.map((guide) => `${SITE_URL}/guides/${guide.slug}`),
    ...products.map((product) => `${SITE_URL}/products/${product.slug}`),
  ];
}
