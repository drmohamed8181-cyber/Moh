import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product – Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await safeDb((db) => db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })) ?? [];
  const product = await safeDb((db) => db.product.findUnique({ where: { id } }));

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
