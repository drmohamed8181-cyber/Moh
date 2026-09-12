import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandBySlug, getProductsByBrand, getPublicBrands, getPublicBrandSlugs } from "@/lib/publicData";
import { jsonLdScript } from "@/lib/jsonLd";
import { SITE_URL, brandDescription, brandTitle } from "@/lib/seo";
import ProductCard from "@/components/product/ProductCard";
import { ChevronRight } from "lucide-react";

// One landing page per manufacturer. "Alcon equipment", "Zeiss OCT for sale"
// and similar brand-led searches had nothing on this site to land on: the
// manufacturer was a line of small print on each product page. These pages
// are prerendered and served from the ISR cache like the category pages.
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublicBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

function uniqueCategoryNames(products: { category: { name: string } | null }[]): string[] {
  return [...new Set(products.map((product) => product.category?.name).filter((name): name is string => Boolean(name)))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const products = await getProductsByBrand(slug);
  const title = brandTitle(brand);
  const description = brandDescription(brand, uniqueCategoryNames(products));
  const image = products.find((product) => product.images.length > 0)?.images[0];
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const [products, allBrands] = await Promise.all([getProductsByBrand(slug), getPublicBrands()]);
  const categories = uniqueCategoryNames(products);
  const otherBrands = allBrands.filter((other) => other.slug !== slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${SITE_URL}/brands/${slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd) }} />

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-14">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/brands" className="hover:text-white transition-colors">Brands</Link>
            <ChevronRight size={14} />
            <span className="text-white">{brand.name}</span>
          </nav>
          <h1 className="text-4xl font-bold mb-3">{brand.name} Equipment</h1>
          <p className="text-blue-100 text-lg max-w-3xl">
            New and certified refurbished {brand.name} {categories.length > 0 ? categories.join(", ") : "equipment"} from MP MedPharma, with documented service history and warranty on every unit. Request pricing or a private demo on any product below.
          </p>
          <p className="text-blue-200 text-sm mt-3">
            {products.length} {products.length === 1 ? "product" : "products"} available
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">No {brand.name} products are listed right now.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {otherBrands.length > 0 && (
          <div className="mt-14 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Other brands we carry</h2>
            <div className="flex flex-wrap gap-2">
              {otherBrands.map((other) => (
                <Link
                  key={other.slug}
                  href={`/brands/${other.slug}`}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
                >
                  {other.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
