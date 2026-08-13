"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function CustomerSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);
  const lastPushed = useRef(initialQ);

  // Only resync from the URL when the change didn't originate from this component
  // (e.g. browser back/forward). Otherwise a slow round-trip from an earlier
  // keystroke can land after newer typing and stomp it.
  useEffect(() => {
    if (initialQ !== lastPushed.current) {
      setValue(initialQ);
      lastPushed.current = initialQ;
    }
  }, [initialQ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === initialQ) return;
      const next = value.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("q", next);
      else params.delete("q");
      lastPushed.current = next;
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 250);
    return () => clearTimeout(timeout);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    lastPushed.current = next;
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setValue("");
    lastPushed.current = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search name, email, organization, phone, address..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
        Search
      </button>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={14} /> Clear
        </button>
      )}
    </form>
  );
}
