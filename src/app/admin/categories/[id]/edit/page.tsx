import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Edit Category – Admin" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await safeDb((db) => db.category.findUnique({ where: { id } }));

  if (!category) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  );
}
