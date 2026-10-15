import type { MetadataRoute } from "next";
import { getPublicBrands, getSitemapEntries } from "@/lib/publicData";
import { GUIDES } from "@/content/guides";
import { STATIC_PATHS } from "@/lib/siteUrls";

const BASE_URL = "https://www.mpmedpharma.com";

// Static paths whose content is the product catalogue itself.
const CATALOGUE_PATHS = new Set(["", "/products", "/categories", "/catalogs", "/brands"]);

// The entries come from a tagged cached read, so the product and category write
// routes expire this the moment the admin changes the catalogue. This TTL is
// only a backstop for changes that bypass those routes.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories, products }, brands] = await Promise.all([getSitemapEntries(), getPublicBrands()]);

  // lastmod must be truthful or Google stops trusting it for the whole site.
  // Pages that list the catalogue change when a product does; the rest have no
  // tracked edit date, so they carry no lastmod rather than a made-up one.
  const catalogueUpdated = products.reduce<Date | undefined>((latest, product) => {
    const date = new Date(product.updatedAt);
    return !latest || date > latest ? date : latest;
  }, undefined);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    ...(CATALOGUE_PATHS.has(route.path) && catalogueUpdated ? { lastModified: catalogueUpdated } : {}),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // updatedAt is typed Date but comes back as a string on a cache hit, since the
  // cached value round-trips through JSON. Normalising here keeps both shapes valid.
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
    ...(product.images.length > 0
      ? { images: product.images.map((img) => (img.startsWith("http") ? img : `${BASE_URL}${img}`)) }
      : {}),
  }));

  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${BASE_URL}/brands/${brand.slug}`,
    lastModified: new Date(brand.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...guideEntries, ...productEntries];
}
