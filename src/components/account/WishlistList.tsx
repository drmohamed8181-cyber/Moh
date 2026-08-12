"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  isAvailable: boolean;
  category: { name: string } | null;
}

export default function WishlistList({ items }: { items: WishlistProduct[] }) {
  const [products, setProducts] = useState(items);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const handleRemove = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await toggleWishlist(productId);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-16 text-center">
        <Heart size={40} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">You haven&apos;t saved any products yet.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <div key={product.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <button
            onClick={() => handleRemove(product.id)}
            aria-label="Remove from wishlist"
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <X size={14} />
          </button>
          <Link href={`/products/${product.slug}`} className="contents">
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain p-6"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/50">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">No Image</span>
                </div>
              )}
              {!product.isAvailable && (
                <span className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-lg">
                  Unavailable
                </span>
              )}
            </div>
            <div className="p-4">
              {product.category && (
                <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">{product.category.name}</span>
              )}
              <h3 className="text-sm font-semibold text-gray-900 leading-snug mt-1 line-clamp-2">{product.name}</h3>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
