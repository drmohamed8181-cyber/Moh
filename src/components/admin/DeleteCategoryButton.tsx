"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete category "${name}"? Products in this category will be affected.`)) return;
    setLoading(true);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
