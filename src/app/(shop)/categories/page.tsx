import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicCategories } from "@/lib/publicData";

// Cached rather than dynamic so crawlers get this from the ISR cache; admin
// category writes invalidate it via revalidateTag(CATEGORIES_TAG).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ophthalmic Equipment Categories – Lasers, Phaco, OCT & More",
  description:
    "Ophthalmic equipment by category at MP MedPharma: surgical and refractive lasers, phaco systems, OCT and imaging, slit lamps and microscopes. New and certified refurbished, with warranty.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  // Deliberately NOT caught. This page is cached, so swallowing a database
  // failure into an empty list would bake "no categories" into the ISR entry
  // for an hour. Letting the error propagate renders an uncached 500 instead,
  // which Google treats as "try again later". Same reasoning as
  // DatabaseUnavailableError in src/lib/publicData.ts.
  const display = await getPublicCategories();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Product Categories</h1>
          <p className="text-blue-100">Explore our range of ophthalmic and dental equipment</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {display.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">Categories are being updated. Please check back shortly.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((cat) => {
            return (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border hover:border-primary-200 hover:shadow-card-hover transition-all duration-300">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  {cat.description && <p className="text-sm text-gray-600">{cat.description}</p>}
                  <span className="inline-block mt-4 text-sm text-primary-600 font-semibold group-hover:underline">Browse Products →</span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
