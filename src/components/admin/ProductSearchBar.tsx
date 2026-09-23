"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, X, Package } from "lucide-react";
import { productSearchRank as rank, type ProductSuggestion } from "@/lib/productSearch";

const MAX_SUGGESTIONS = 8;

export default function ProductSearchBar({ products }: { products: ProductSuggestion[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Resync the box when the URL query changes (e.g. browser back/forward).
  const [syncedQ, setSyncedQ] = useState(initialQ);
  if (syncedQ !== initialQ) {
    setSyncedQ(initialQ);
    setValue(initialQ);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return products
      .map((p) => ({ p, r: rank(p, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.p.name.localeCompare(b.p.name))
      .slice(0, MAX_SUGGESTIONS)
      .map((x) => x.p);
  }, [products, value]);

  const totalMatches = useMemo(() => {
    const q = value.trim().toLowerCase();
    return q ? products.filter((p) => rank(p, q) >= 0).length : 0;
  }, [products, value]);

  const applyFilter = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const openProduct = (p: ProductSuggestion) => {
    setOpen(false);
    router.push(`/admin/products/${p.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (open && active >= 0 && suggestions[active]) return openProduct(suggestions[active]);
    setOpen(false);
    applyFilter(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setValue("");
    setOpen(false);
    applyFilter("");
  };

  const showDropdown = open && value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <div ref={wrapperRef} className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="product-search-list"
          aria-autocomplete="list"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products by name, SKU or category..."
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {showDropdown && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No products match &ldquo;{value.trim()}&rdquo;</p>
            ) : (
              <ul id="product-search-list" role="listbox" className="max-h-96 overflow-y-auto divide-y">
                {suggestions.map((p, i) => (
                  <li
                    key={p.id}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => openProduct(p)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${i === active ? "bg-primary-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.image ? (
                        <Image src={p.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                      ) : (
                        <Package size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        SKU: {p.sku}{p.category && ` · ${p.category}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {totalMatches > suggestions.length && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  applyFilter(value.trim());
                }}
                className="w-full px-4 py-2 text-xs font-medium text-primary-600 bg-gray-50 hover:bg-gray-100 border-t text-left"
              >
                Show all {totalMatches} matches in the table
              </button>
            )}
          </div>
        )}
      </div>
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
