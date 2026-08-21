"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export default function EditableRetailPrice({ id, price }: { id: string; price: number | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price != null ? String(price) : "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const save = async () => {
    const parsed = value.trim() === "" ? null : parseFloat(value);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) {
      toast.error("Enter a valid price");
      return;
    }
    if (parsed === price) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailPrice: parsed }),
      });
      if (res.ok) {
        toast.success("End-user price updated");
        setEditing(false);
        router.refresh();
      } else {
        toast.error("Failed to update price");
      }
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <input
        type="number"
        step="0.01"
        min="0"
        autoFocus
        value={value}
        disabled={loading}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") { setValue(price != null ? String(price) : ""); setEditing(false); }
        }}
        className="w-24 px-2 py-1 text-sm rounded-lg border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600"
    >
      {price != null ? formatPrice(price) : <span className="text-gray-300">—</span>}
      <Pencil size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
