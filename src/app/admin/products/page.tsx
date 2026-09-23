export const dynamic = "force-dynamic";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { safeDb } from "@/lib/prisma";
import { ADMIN_PRODUCT_SELECT } from "@/lib/productSelect";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Package } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import PublishPriceToggle from "@/components/admin/PublishPriceToggle";
import EditableRetailPrice from "@/components/admin/EditableRetailPrice";
import ProductSearchBar from "@/components/admin/ProductSearchBar";
import { productSearchRank } from "@/lib/productSearch";
import { PARTNER_STOCK_UPDATED } from "@/content/partnerStock";
import { partnerListLoaded, partnerStockStatus } from "@/lib/partnerStock";

export const metadata: Metadata = { title: "Products – Admin" };

// Ophthalmology stock follows the partner's weekly list (src/lib/partnerStock.ts);
// everything else follows the quantity typed in the product form.
function StockBadge({ product }: { product: { slug: string; stockQty: number; category: { slug: string } | null } }) {
  const badge = (className: string, label: string, title?: string) => (
    <span title={title} className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}>{label}</span>
  );
  switch (partnerStockStatus(product)) {
    case "sold":
      return badge("bg-red-100 text-red-700", "Sold", "Not in the partner's current list; shown as \"Sold – inquire for similar\"");
    case "listed":
      return badge("bg-green-100 text-green-700", "In stock", "In the partner's current list");
    case "unchecked":
      return badge("bg-gray-100 text-gray-600", "Awaiting list", "No partner list provided yet");
  }
  if (product.stockQty === 0) return badge("bg-red-100 text-red-700", "Out of Stock");
  return badge(product.stockQty <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700", `${product.stockQty} in stock`);
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";
  const products = await safeDb((db) => db.product.findMany({ orderBy: { createdAt: "desc" }, select: { ...ADMIN_PRODUCT_SELECT, category: true } })) ?? [];
  const suggestions = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, image: p.images[0] ?? null, category: p.category?.name ?? null }));
  const shown = q ? products.filter((p) => productSearchRank({ name: p.name, sku: p.sku, category: p.category?.name ?? null }, q) >= 0) : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">
            {q ? `${shown.length} of ${products.length} products matching "${q}"` : `${products.length} products total`}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {partnerListLoaded
              ? `Ophthalmology stock from the partner list${PARTNER_STOCK_UPDATED ? ` of ${PARTNER_STOCK_UPDATED}` : ""}: ${products.filter((p) => partnerStockStatus(p) === "sold").length} sold`
              : "Ophthalmology stock: awaiting the partner's weekly list"}
          </p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {products.length > 0 && <ProductSearchBar products={suggestions} />}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {products.length > 0 && shown.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No products match &ldquo;{q}&rdquo;.</div>
        ) : products.length === 0 ? (
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
                {shown.map((p) => (
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
                      <div className="flex flex-col items-start">
                        <EditableRetailPrice id={p.id} price={p.retailPrice} />
                        <PublishPriceToggle id={p.id} published={p.retailPricePublic} hasPrice={p.retailPrice != null} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StockBadge product={p} />
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
