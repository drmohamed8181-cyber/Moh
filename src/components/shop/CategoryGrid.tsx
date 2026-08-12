import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  _count?: { products: number };
}

const defaultCategories = [
  { id: "1", name: "Patient Monitoring", slug: "patient-monitoring", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80", description: "Vital signs & monitoring" },
  { id: "2", name: "Diagnostic Equipment", slug: "diagnostic-equipment", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", description: "ECG, ultrasound & more" },
  { id: "3", name: "Laboratory Equipment", slug: "laboratory-equipment", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80", description: "Analysis & testing tools" },
  { id: "4", name: "Surgical Instruments", slug: "surgical-instruments", image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80", description: "Precision surgical tools" },
  { id: "5", name: "Hospital Furniture", slug: "hospital-furniture", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80", description: "Beds, chairs & cabinets" },
  { id: "6", name: "Home Healthcare", slug: "home-healthcare", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80", description: "Devices for home use" },
];

interface CategoryGridProps {
  categories?: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const items = (categories && categories.length > 0) ? categories : defaultCategories;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Browse By Category</p>
            <h2 className="text-3xl font-bold text-slate-900">Featured Categories</h2>
          </div>
          <Link href="/categories" className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-blue-50">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-400 text-3xl">🏥</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-slate-800 text-xs leading-tight group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden text-center mt-6">
          <Link href="/categories" className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
