import { Metadata } from "next";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "New Category – Admin" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Category</h1>
      <CategoryForm />
    </div>
  );
}
