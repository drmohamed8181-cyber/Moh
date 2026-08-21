export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { safeDb } from "@/lib/prisma";
import { ADMIN_PRODUCT_SELECT } from "@/lib/productSelect";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Package } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata: Metadata = { title: "Products – Admin" };

export default async function AdminProductsPage() {
  const products = await safeDb((db) => db.product.findMany({ orderBy: { createdAt: "desc" }, select: { ...ADMIN_PRODUCT_SELECT, category: true } })) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No products yet.</p>
            <p className="text-gray-400 text-sm mb-4">Connect your database and run the seed to add sample products.</p>
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700">
              <Plus size={16} /> Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Product", "Category", "Price", "Reseller Price", "End-User Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-contain p-1" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.category?.name}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(p.discountPrice ?? p.price)}</p>
                      {p.discountPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.dealerPrice != null ? formatPrice(p.dealerPrice) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.retailPrice != null ? formatPrice(p.retailPrice) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        p.stockQty === 0 ? "bg-red-100 text-red-700"
                        : p.stockQty <= 5 ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}>
                        {p.stockQty === 0 ? "Out of Stock" : `${p.stockQty} in stock`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.isAvailable ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}`} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
