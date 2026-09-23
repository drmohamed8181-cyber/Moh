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

  // Product pages fall back to SEO copy from src/content/productContent.ts when
  // the database has none. Show the admin that copy so what they edit is what
  // search engines get; saving the form writes it. Only the SEO fields are
  // filled here; descriptions and the other editorial fields stay as stored.
  const editorial = withEditorialContent(stored);
  const product = {
    ...stored,
    seoTitle: isEmpty(stored.seoTitle) ? editorial.seoTitle : stored.seoTitle,
    seoDesc: isEmpty(stored.seoDesc) ? editorial.seoDesc : stored.seoDesc,
  };
  const prefilled = [
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
