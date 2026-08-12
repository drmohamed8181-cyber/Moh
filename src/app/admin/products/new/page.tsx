import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product – Admin" };

export default async function NewProductPage() {
  const categories = await safeDb((db) => db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })) ?? [];
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
