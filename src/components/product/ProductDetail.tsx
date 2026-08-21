"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mail, Heart, Shield, Truck, RotateCcw, ChevronRight, ZoomIn, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import RequestDemoModal from "./RequestDemoModal";
import { buildInquiryHref, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  images: string[];
  publicPrice?: number | null;
  shortDesc?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  features: string[];
  accessories: string[];
  indications: string[];
  clinicalEvidence: string[];
  isAvailable: boolean;
  stockQty: number;
  manufacturer?: string | null;
  warranty?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  category?: { name: string; slug: string } | null;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "features" | "accessories" | "indications" | "evidence">("desc");
  const [demoOpen, setDemoOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const wishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const handleWishlistClick = () => {
    if (!session?.user) {
      toast.error("Please sign in to save items to your wishlist.");
      router.push("/login");
      return;
    }
    toggleWishlist(product.id);
  };

  const inquiryHref = buildInquiryHref({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category?.name,
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-primary-600">Products</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 group">
              <Image
                src={product.images[selectedImage] ?? "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
              <button className="absolute top-4 right-4 w-9 h-9 bg-white shadow rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={16} className="text-gray-600" />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-primary-600" : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`} className="text-sm text-primary-600 font-medium uppercase tracking-wide hover:underline">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>

            <span className={`inline-flex items-center gap-1.5 text-sm font-medium mb-4 ${product.isAvailable ? "text-green-600" : "text-gray-400"}`}>
              <CheckCircle2 size={15} />
              {product.isAvailable ? "In Inventory" : "Currently Unavailable"}
            </span>

            {product.shortDesc && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.shortDesc}</p>
            )}

            {/* SKU / Manufacturer */}
            <div className="text-xs text-gray-500 space-y-1 mb-6">
              <p>SKU: <span className="text-gray-700">{product.sku}</span></p>
              {product.manufacturer && <p>Manufacturer: <span className="text-gray-700">{product.manufacturer}</span></p>}
              {product.warranty && <p>Warranty: <span className="text-gray-700">{product.warranty}</span></p>}
            </div>

            {/* Pricing + Inquiry */}
            <div className="flex items-center gap-4 mb-5 p-5 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Pricing</p>
                {product.publicPrice != null ? (
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(product.publicPrice)}</p>
                ) : (
                  <p className="text-lg font-semibold text-gray-800 italic">Price on Request</p>
                )}
              </div>
              <Link
                href={inquiryHref}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
              >
                <Mail size={18} /> Inquire Now
              </Link>
              <button
                onClick={handleWishlistClick}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  wishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-500 hover:border-red-300"
                }`}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <button
              onClick={() => setDemoOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 mb-5 rounded-lg font-semibold text-sm tracking-wide border border-gold-500/60 text-gray-900 bg-white hover:bg-gold-50 hover:border-gold-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <Calendar size={16} className="text-gold-600" /> Request a Private Demo
            </button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
              {[
                { icon: Shield, text: "Certified Quality" },
                { icon: Truck, text: "White-Glove Delivery" },
                { icon: RotateCcw, text: "Factory Warranty" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1">
                  <Icon size={18} className="text-primary-600" />
                  <span className="text-xs text-gray-600 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 gap-1">
            {([
              ["desc", "Description"],
              ["features", "Features"],
              ["accessories", "Accessories"],
              ["specs", "Specifications"],
              ["indications", "Indications"],
              ["evidence", "Clinical Evidence"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-600 hover:text-primary-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "desc" && (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {product.description
                  ? product.description.split("\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)
                  : <p className="text-gray-500">No description available.</p>}
              </div>
            )}

            {activeTab === "specs" && product.specifications && (
              <table className="w-full max-w-2xl border-collapse">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 w-40">{key}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "features" && (
              <ul className="space-y-3 max-w-xl">
                {product.features.length > 0 ? product.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                )) : <p className="text-gray-500">No features listed.</p>}
              </ul>
            )}

            {activeTab === "accessories" && (
              <ul className="space-y-3 max-w-xl">
                {product.accessories.length > 0 ? product.accessories.map((a) => (
                  <li key={a} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{a}</span>
                  </li>
                )) : <p className="text-gray-500">No accessories listed.</p>}
              </ul>
            )}

            {activeTab === "indications" && (
              <ul className="space-y-3 max-w-xl">
                {product.indications.length > 0 ? product.indications.map((ind) => (
                  <li key={ind} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{ind}</span>
                  </li>
                )) : <p className="text-gray-500">No indications listed.</p>}
              </ul>
            )}

            {activeTab === "evidence" && (
              <ul className="space-y-4 max-w-2xl">
                {product.clinicalEvidence.length > 0 ? product.clinicalEvidence.map((c) => (
                  <li key={c} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">{c}</span>
                  </li>
                )) : <p className="text-gray-500">No clinical evidence listed.</p>}
              </ul>
            )}
          </div>
        </div>
      </div>

      <RequestDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        product={{ name: product.name, slug: product.slug, images: product.images, category: product.category?.name }}
      />
    </div>
  );
}
