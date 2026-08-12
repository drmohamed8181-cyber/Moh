import { safeDb } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await safeDb((db) => db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  })) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <Link href="/admin/categories/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Category", "Products", "Order", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No categories yet</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400">🏥</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                        <p className="text-xs text-slate-400">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{cat._count.products}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{cat.order}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={cat.isActive ? "green" : "gray"}>{cat.isActive ? "Active" : "Hidden"}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/categories/${cat.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteCategoryButton id={cat.id} name={cat.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
