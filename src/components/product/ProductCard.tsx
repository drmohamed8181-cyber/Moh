"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mail, Heart } from "lucide-react";
import { toast } from "sonner";
import { buildInquiryHref, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  shortDesc?: string | null;
  category?: { name: string } | null;
  isAvailable: boolean;
  stockQty: number;
  publicPrice?: number | null;
  previousPublicPrice?: number | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const wishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [imgFailed, setImgFailed] = useState(false);
  const mainImage = product.images[0];

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      toast.error("Please sign in to save items to your wishlist.");
      router.push("/login");
      return;
    }
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="contents">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {mainImage && !imgFailed ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/50">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!product.isAvailable && (
              <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-lg">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {product.category && (
            <span className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
              {product.category.name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 flex-1">
            {product.name}
          </h3>
          {product.shortDesc && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
              {product.shortDesc}
            </p>
          )}
        </div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={handleWishlistClick}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
          wishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500"
        }`}
      >
        <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
      </button>

      {/* Pricing + inquiry */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-4 border-t border-gray-50 mt-auto">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Pricing</p>
          {product.publicPrice != null ? (
            <>
              {product.previousPublicPrice != null && (
                <p className="text-xs text-gray-400 line-through">{formatPrice(product.previousPublicPrice)}</p>
              )}
              <p className="text-sm font-semibold text-gray-900">{formatPrice(product.publicPrice)}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-gray-700 italic">Price on Request</p>
          )}
        </div>
        <Link
          href={buildInquiryHref({ name: product.name, slug: product.slug, category: product.category?.name })}
          className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-primary-700 active:scale-95 transition-all whitespace-nowrap"
        >
          <Mail size={12} /> Inquire
        </Link>
      </div>
    </div>
  );
}
