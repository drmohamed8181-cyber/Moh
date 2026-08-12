"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
}

export default function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>(category?.image ?? "");
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    order: category?.order ?? 0,
    isActive: category?.isActive ?? true,
  });

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: category ? f.slug : slugify(name) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const data = ev.target?.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, folder: "medpharma/categories" }),
        });
        if (res.ok) {
          const { url } = await res.json();
          setImage(url);
        } else {
          setImage(data);
        }
      } catch {
        setImage(data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Please fill in the name and slug");
      return;
    }
    setLoading(true);
    try {
      const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image }),
      });

      if (res.ok) {
        toast.success(category ? "Category updated!" : "Category created!");
        router.push("/admin/categories");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save category");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
          <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Diagnostic Equipment" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
          <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
          <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))} className={inputClass} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded text-primary-600" />
          <span className="text-sm text-gray-700">Active (visible on site)</span>
        </label>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Category Image</h2>
        <div className="flex items-center gap-4">
          {image && (
            <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={image} alt="Category" fill className="object-cover" />
              <button type="button" onClick={() => setImage("")} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          )}
          <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
            <Upload size={16} className="text-gray-400 mb-1" />
            <span className="text-[10px] text-gray-400">Upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
        {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}
