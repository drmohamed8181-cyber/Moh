"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X, MonitorPlay, GripVertical } from "lucide-react";
import { useDragReorder, moveItem } from "./useDragReorder";

interface HeroProduct {
  id: string;
  name: string;
  image: string | null;
}

// The products shown in the homepage slider, in order. Products are added with
// the "Homepage" button in Admin → Products; here they are reordered or removed.
export default function HeroProductsManager({ products: initial }: { products: HeroProduct[] }) {
  const [products, setProducts] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const save = async (next: HeroProduct[]) => {
    const previous = products;
    setProducts(next);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hero-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setProducts(previous);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const move = (from: number, to: number) => save(moveItem(products, from, to));
  const { rowProps, rowClass } = useDragReorder(products.map((p) => p.id), move, saving);

  return (
    <div className="bg-white rounded-2xl border mb-6">
      <div className="p-6 border-b">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><MonitorPlay size={18} className="text-primary-600" /> Products in the homepage slider</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add products with the <span className="font-medium text-gray-700">Homepage</span> button in{" "}
          <Link href="/admin/products" className="text-primary-600 hover:underline">Products</Link>. Each one shows its name, description, features and photos automatically. Drag to change the order.
        </p>
      </div>
      {products.length === 0 ? (
        <p className="p-6 text-sm text-gray-500">No products chosen yet, so the slider shows the hand-made slides below.</p>
      ) : (
        <ul className="divide-y">
          {products.map((p, i) => (
            <li key={p.id} {...rowProps(p.id)} className={`flex items-center gap-4 px-6 py-3 transition-colors ${rowClass(p.id)}`}>
              <GripVertical size={18} className="text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" aria-hidden />
              <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
              <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {p.image && <Image src={p.image} alt="" fill sizes="48px" draggable={false} className="object-contain p-1" />}
              </div>
              <Link href={`/admin/products/${p.id}`} draggable={false} className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate hover:text-primary-600">{p.name}</Link>
              <div className="flex items-center gap-1">
                <button type="button" disabled={saving || i === 0} onClick={() => move(i, i - 1)} aria-label="Move up" className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-30">
                  <ArrowUp size={15} />
                </button>
                <button type="button" disabled={saving || i === products.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down" className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-30">
                  <ArrowDown size={15} />
                </button>
                <button type="button" disabled={saving} onClick={() => save(products.filter((x) => x.id !== p.id))} aria-label="Remove from slider" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30">
                  <X size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
