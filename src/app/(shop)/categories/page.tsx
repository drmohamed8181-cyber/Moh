import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicCategories } from "@/lib/publicData";

// Cached rather than dynamic so crawlers get this from the ISR cache; admin
// category writes invalidate it via revalidateTag(CATEGORIES_TAG).
export const revalidate = 3600;

export const metadata: Metadata = { title: "Product Categories", alternates: { canonical: "/categories" } };

const defaults = [
  { id: "1", name: "Patient Monitoring", slug: "patient-monitoring", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&q=80", description: "ECG monitors, patient monitors, vital signs equipment" },
  { id: "2", name: "Diagnostic Equipment", slug: "diagnostic-equipment", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&q=80", description: "Blood pressure monitors, stethoscopes, diagnostic tools" },
  { id: "3", name: "Laboratory Equipment", slug: "laboratory-equipment", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&q=80", description: "Lab analyzers, centrifuges, microscopes" },
  { id: "4", name: "Surgical Instruments", slug: "surgical-instruments", image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=500&q=80", description: "Scalpels, forceps, retractors, surgical sets" },
  { id: "5", name: "Hospital Furniture", slug: "hospital-furniture", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&q=80", description: "Hospital beds, stretchers, medical carts" },
  { id: "6", name: "Home Healthcare", slug: "home-healthcare", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80", description: "Nebulizers, CPAP machines, home monitors" },
];

export default async function CategoriesPage() {
  // Deliberately NOT caught. This page is now cached, so swallowing a database
  // failure into `defaults` would bake six placeholder categories — none of
  // which exist in this catalogue — into the ISR entry for an hour, every one
  // of them linking to a slug that 404s. Letting the error propagate renders an
  // uncached 500 instead, which Google treats as "try again later". Same
  // reasoning as DatabaseUnavailableError in src/lib/publicData.ts.
  //
  // `defaults` is still used below, but only as a per-card image/description
  // fallback for real categories that lack one.
  const display = await getPublicCategories();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Product Categories</h1>
          <p className="text-blue-100">Explore our complete range of medical equipment</p>
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
          {display.map((cat, i) => {
            const def = defaults[i] ?? defaults[0];
            return (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border hover:border-primary-200 hover:shadow-card-hover transition-all duration-300">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image src={cat.image ?? def.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600">{cat.description ?? def.description}</p>
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
