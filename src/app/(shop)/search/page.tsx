export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import { safeDb } from "@/lib/prisma";
import { HIDDEN_CATEGORY_SLUGS } from "@/lib/specialties";
import { PUBLIC_PRODUCT_SELECT } from "@/lib/productSelect";
import ProductCard from "@/components/product/ProductCard";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Search Products" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: qRaw } = await searchParams;
  const q = qRaw ?? "";

  const products = q ? await safeDb((db) => db.product.findMany({
    where: {
      AND: [
        { OR: [
          { name: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
          { manufacturer: { contains: q, mode: "insensitive" } },
        ]},
        { category: { slug: { notIn: HIDDEN_CATEGORY_SLUGS } } },
      ],
    },
    select: { ...PUBLIC_PRODUCT_SELECT, category: true },
    take: 24,
  })) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {q ? `Results for "${q}"` : "Search Products"}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          {products && products.length > 0 ? `${products.length} products found` : q ? "No products found" : "Enter a search term"}
        </p>
        {(!products || products.length === 0) && q && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No products found for &quot;{q}&quot;</p>
            <p className="text-gray-400 text-sm">Try a different term or <Link href="/products" className="text-primary-600 hover:underline">browse all products</Link></p>
          </div>
        )}
        {products && products.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
