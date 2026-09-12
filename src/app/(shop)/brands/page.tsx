import type { Metadata } from "next";
import Link from "next/link";
import { getPublicBrands } from "@/lib/publicData";
import { jsonLdScript } from "@/lib/jsonLd";
import { SITE_URL } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

// Cached like the category index: crawlers get this from the ISR cache and
// admin product writes invalidate it through PRODUCTS_TAG.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Brands – Ophthalmic Equipment Manufacturers We Carry",
  description:
    "Shop ophthalmic equipment by manufacturer at MP MedPharma. New and certified refurbished lasers, phaco systems, OCT and microscopes from the brands eye surgeons trust, with warranty.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  // Not caught: a database failure must render an uncached 500, not an empty
  // "no brands" page that ISR would keep for an hour. Same reasoning as the
  // category index.
  const brands = await getPublicBrands();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: brands.map((brand, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/brands/${brand.slug}`,
      name: brand.name,
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd) }} />
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Shop by Brand</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            New and certified refurbished equipment from the manufacturers eye surgeons already trust, each unit with documented service history and warranty.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {brands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">Brand pages are being updated. Please check back shortly.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group bg-white rounded-2xl border p-6 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{brand.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {brand.productCount} {brand.productCount === 1 ? "product" : "products"} available
                  </p>
                </div>
                <ArrowRight size={18} className="text-primary-600 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
