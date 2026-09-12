import type { MetadataRoute } from "next";
import { getPublicBrands, getSitemapEntries } from "@/lib/publicData";

const BASE_URL = "https://www.mpmedpharma.com";

// The entries come from a tagged cached read, so the product and category write
// routes expire this the moment the admin changes the catalogue. This TTL is
// only a backstop for changes that bypass those routes.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/sell-your-product", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.3 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories, products }, brands] = await Promise.all([getSitemapEntries(), getPublicBrands()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
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
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries];
}
