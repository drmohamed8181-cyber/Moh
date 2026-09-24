"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "orders", label: "Most orders" },
  { value: "sales", label: "Highest total sales" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "BUYER", label: "Buyers" },
  { value: "SELLER", label: "Sellers" },
  { value: "BOTH", label: "Buyer & Seller" },
];

const selectClass =
  "px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function CustomerListControls({ sortValue, type }: { sortValue: string; type: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <label className="flex items-center gap-2 text-sm text-slate-500">
        Sort by
        <select
          value={sortValue}
          // The preset replaces any column-header sort.
          onChange={(e) => update({ sort: e.target.value, order: "" })}
          className={selectClass}
        >
          {!SORT_OPTIONS.some((o) => o.value === sortValue) && <option value={sortValue}>Custom (column)</option>}
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-500">
        Show
        <select value={type} onChange={(e) => update({ type: e.target.value })} className={selectClass}>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
