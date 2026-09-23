import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeDb } from "@/lib/prisma";
import { ADMIN_PRODUCT_SELECT } from "@/lib/productSelect";
import { withEditorialContent } from "@/content/productContent";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product – Admin" };

const isEmpty = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await safeDb((db) => db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })) ?? [];
  const stored = await safeDb((db) => db.product.findUnique({ where: { id }, select: ADMIN_PRODUCT_SELECT }));

  if (!stored) notFound();

  // Product pages fill empty editorial fields from src/content/productContent.ts.
  // Show the admin the same text, so what they edit is what visitors see; saving
  // the form writes it to the database.
  const product = withEditorialContent(stored);
  const storedSpecKeys = Object.keys((stored.specifications as Record<string, string> | null) ?? {});
  const prefilled = [
    isEmpty(stored.description) && !isEmpty(product.description) && "Full Description",
    isEmpty(stored.indications) && !isEmpty(product.indications) && "Indications",
    isEmpty(stored.features) && !isEmpty(product.features) && "Features",
    Object.keys((product.specifications as Record<string, string> | null) ?? {}).length > storedSpecKeys.length && "Specifications",
    isEmpty(stored.seoTitle) && !isEmpty(product.seoTitle) && "SEO Title",
    isEmpty(stored.seoDesc) && !isEmpty(product.seoDesc) && "SEO Description",
  ].filter((f): f is string => Boolean(f));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm categories={categories} product={product} prefilled={prefilled} />
    </div>
  );
}
