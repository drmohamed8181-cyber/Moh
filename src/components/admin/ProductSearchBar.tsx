"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import SearchSuggestInput from "@/components/ui/SearchSuggestInput";
import { productSearchRank as rank, type ProductSuggestion } from "@/lib/productSearch";

const MAX_SUGGESTIONS = 8;

export default function ProductSearchBar({ products }: { products: ProductSuggestion[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);

  // Resync the box when the URL query changes (e.g. browser back/forward).
  const [syncedQ, setSyncedQ] = useState(initialQ);
  if (syncedQ !== initialQ) {
    setSyncedQ(initialQ);
    setValue(initialQ);
  }

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return products
      .map((p) => ({ p, r: rank(p, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.p.name.localeCompare(b.p.name))
      .map((x) => x.p);
  }, [products, value]);

  const suggestions = matches.slice(0, MAX_SUGGESTIONS).map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: `SKU: ${p.sku}${p.category ? ` · ${p.category}` : ""}`,
    image: p.image,
  }));

  const applyFilter = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter(value.trim());
  };

  const handleClear = () => {
    setValue("");
    applyFilter("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <SearchSuggestInput
        className="flex-1 max-w-md"
        value={value}
        onChange={setValue}
        suggestions={suggestions}
        onSelect={(s) => router.push(`/admin/products/${s.id}`)}
        totalMatches={matches.length}
        onShowAll={() => applyFilter(value.trim())}
        noun="products"
        placeholder="Search products by name, SKU or category..."
      />
      <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
        Search
      </button>
      {(value || initialQ) && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={14} /> Clear
        </button>
      )}
    </form>
  );
}
