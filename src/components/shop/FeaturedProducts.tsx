import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  stockQty: number;
  isAvailable: boolean;
  shortDesc?: string | null;
  category?: { name: string; slug: string } | null;
}

interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  // Hidden rather than padded with placeholders when nothing is featured.
  const items = products ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Top Picks</p>
            <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
